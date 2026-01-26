from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate, ExtractHour
from django.utils import timezone
from django.http import HttpResponse
from datetime import datetime, time
import openpyxl
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import io

from .models import Venta, ServicioTecnico, Sucursal

class ReporteBaseView(APIView):
    permission_classes = [IsAuthenticated]

    def get_fechas_filtro(self, request):
        fecha_desde = request.query_params.get('fecha_desde')
        fecha_hasta = request.query_params.get('fecha_hasta')
        
        # Default: Hoy si no se especifica
        if not fecha_desde:
            fecha_desde = timezone.now().date()
        else:
            fecha_desde = datetime.strptime(str(fecha_desde), '%Y-%m-%d').date()
            
        if not fecha_hasta:
            fecha_hasta = timezone.now().date()
        else:
            fecha_hasta = datetime.strptime(str(fecha_hasta), '%Y-%m-%d').date()
            
        # Ajustar horas para cubrir todo el día
        fecha_desde_dt = timezone.make_aware(datetime.combine(fecha_desde, time.min))
        fecha_hasta_dt = timezone.make_aware(datetime.combine(fecha_hasta, time.max))
        
        return fecha_desde_dt, fecha_hasta_dt

    def get_sucursal_filtro(self, request):
        user = request.user
        # Super Admin: puede filtrar por id_sucursal recibido
        if user.id_rol.numero_rol == 1:
            sucursal_id = request.query_params.get('id_sucursal')
            if sucursal_id:
                return sucursal_id
            return None # Todas las sucursales
        else:
            # Otros roles: forzados a su sucursal
            return user.id_sucursal.id_sucursal

class ReporteVentasDashboardView(ReporteBaseView):
    def get(self, request):
        fecha_desde, fecha_hasta = self.get_fechas_filtro(request)
        sucursal_id = self.get_sucursal_filtro(request)
        
        queryset = Venta.objects.filter(
            fecha_venta__range=(fecha_desde, fecha_hasta),
            estado='Completada' # Solo ventas validas
        )
        
        if sucursal_id:
            queryset = queryset.filter(id_sucursal_id=sucursal_id)
            
        # Agrupación por día (Manual sin Pandas)
        # Usamos TruncDate de Django
        ventas_por_dia = queryset.annotate(
            dia=TruncDate('fecha_venta')
        ).values('dia').annotate(
            total=Sum('total_venta'),
            cantidad=Count('id_venta')
        ).order_by('dia')
        
        # Preparar datos para Chart.js
        labels = []
        data_monto = []
        data_cantidad = []
        
        for item in ventas_por_dia:
            labels.append(item['dia'].strftime('%d/%m/%Y'))
            data_monto.append(float(item['total']) if item['total'] else 0)
            data_cantidad.append(item['cantidad'])
            
        # Totales Generales y por Tipo de Pago
        total_acumulado = queryset.aggregate(Sum('total_venta'))['total_venta__sum'] or 0
        total_transacciones = queryset.count()
        
        por_tipo_pago = queryset.values('tipo_pago').annotate(
            total=Count('tipo_pago'),
            monto=Sum('total_venta')
        )
        
        data_tipo_pago = {
            'labels': [item['tipo_pago'] for item in por_tipo_pago],
            'data': [item['monto'] for item in por_tipo_pago] # O count segun preferencia
        }
        
        
        # Productos Más Vendidos (Top 10)
        from api.models import DetalleVenta
        
        # Obtener los IDs de ventas válidas del queryset
        ventas_ids = queryset.values_list('id_venta', flat=True)
        
        productos_vendidos = DetalleVenta.objects.filter(
            id_venta__in=ventas_ids
        ).values(
            'id_producto__nombre_producto'
        ).annotate(
            cantidad_total=Sum('cantidad'),
            monto_total=Sum(F('cantidad') * F('precio_venta'))
        ).order_by('-cantidad_total')[:10]  # Top 10
        
        data_productos = {
            'labels': [item['id_producto__nombre_producto'] for item in productos_vendidos],
            'data': [item['cantidad_total'] for item in productos_vendidos],
            'monto': [float(item['monto_total']) for item in productos_vendidos]
        }
        
        # Ventas por Hora del Día
        from django.db.models.functions import ExtractHour
        
        ventas_por_hora = queryset.annotate(
            hora=ExtractHour('fecha_venta')
        ).values('hora').annotate(
            cantidad=Count('id_venta')
        ).order_by('hora')
        
        # Rellenar horas faltantes con 0
        horas_dict = {i: 0 for i in range(24)}
        for item in ventas_por_hora:
            horas_dict[item['hora']] = item['cantidad']
        
        data_por_hora = {
            'labels': [f"{h:02d}:00" for h in range(24)],
            'data': [horas_dict[h] for h in range(24)]
        }

        return Response({
            'grafico_dias': {
                'labels': labels,
                'datasets': [
                    {'label': 'Monto Vendido (Bs)', 'data': data_monto},
                    {'label': 'Cantidad Ventas', 'data': data_cantidad}
                ]
            },
            'grafico_pago': data_tipo_pago,
            'grafico_productos': data_productos,
            'grafico_hora': data_por_hora,
            'kpis': {
                'total_monto': total_acumulado,
                'total_transacciones': total_transacciones
            }
        })

class ReporteVentasPDFView(ReporteBaseView):
    def get(self, request):
        fecha_desde, fecha_hasta = self.get_fechas_filtro(request)
        sucursal_id = self.get_sucursal_filtro(request)
        
        queryset = Venta.objects.filter(
            fecha_venta__range=(fecha_desde, fecha_hasta)
        ).select_related('id_cliente', 'id_usuario', 'id_sucursal').order_by('-fecha_venta')
        
        if sucursal_id:
            queryset = queryset.filter(id_sucursal_id=sucursal_id)
            
        # Generar PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Titulo
        titulo = f"Reporte de Ventas"
        if sucursal_id:
            sucursal = Sucursal.objects.get(pk=sucursal_id)
            titulo += f" - {sucursal.nombre}"
        else:
            titulo += " - Todas las Sucursales"
            
        elements.append(Paragraph(titulo, styles['Title']))
        elements.append(Paragraph(f"Desde: {fecha_desde.strftime('%d/%m/%Y')} Hasta: {fecha_hasta.strftime('%d/%m/%Y')}", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Tabla
        data_tabla = [['#', 'Fecha', 'Boleta', 'Cliente', 'Estado', 'Monto (Bs)']]
        total_general = 0
        
        for idx, v in enumerate(queryset, start=1):
            estado = "ANULADA" if v.estado == 'Anulada' else "OK"
            monto = f"{v.total_venta:.2f}"
            if v.estado == 'Anulada':
                monto = f"({monto})" # Mostrar entre parentesis si es anulada
            else:
                total_general += v.total_venta
            
            row = [
                idx,
                v.fecha_venta.strftime('%d/%m/%Y %H:%M'),
                v.numero_boleta,
                v.id_cliente.nombre_apellido if v.id_cliente else 'S/N',
                estado,
                monto
            ]
            data_tabla.append(row)
            
        # Fila Total
        data_tabla.append(['', '', '', '', 'TOTAL VÁLIDO:', f"{total_general:.2f}"])
            
        t = Table(data_tabla)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(t)
        
        doc.build(elements)
        buffer.seek(0)
        return HttpResponse(buffer, content_type='application/pdf')

class ReporteVentasExcelView(ReporteBaseView):
    def get(self, request):
        fecha_desde, fecha_hasta = self.get_fechas_filtro(request)
        sucursal_id = self.get_sucursal_filtro(request)
        
        queryset = Venta.objects.filter(
            fecha_venta__range=(fecha_desde, fecha_hasta)
        ).select_related('id_cliente', 'id_usuario', 'id_sucursal').order_by('-fecha_venta')
        
        if sucursal_id:
            queryset = queryset.filter(id_sucursal_id=sucursal_id)
            
        # Crear Workbook
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Reporte Ventas"
        
        # Headers
        headers = ['#', 'Fecha', 'Boleta', 'Cliente', 'Usuario', 'Sucursal', 'Tipo Pago', 'Estado', 'Motivo Anulacion', 'Monto Total']
        ws.append(headers)
        
        for idx, v in enumerate(queryset, start=1):
            ws.append([
                idx,
                v.fecha_venta.strftime('%d/%m/%Y %H:%M'),
                v.numero_boleta,
                v.id_cliente.nombre_apellido if v.id_cliente else '',
                v.id_usuario.nombre_apellido if v.id_usuario else '',
                v.id_sucursal.nombre if v.id_sucursal else '',
                v.tipo_pago,
                v.estado,
                v.motivo_anulacion or '',
                float(v.total_venta)
            ])
            
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename=ventas_{timezone.now().strftime("%Y%m%d")}.xlsx'
        wb.save(response)
        return response

# --- SERVICIOS TÉCNICOS ---

class ReporteServiciosDashboardView(ReporteBaseView):
    def get(self, request):
        fecha_desde, fecha_hasta = self.get_fechas_filtro(request)
        sucursal_id = self.get_sucursal_filtro(request)
        
        queryset = ServicioTecnico.objects.filter(
            fecha_inicio__range=(fecha_desde, fecha_hasta)
        )
        
        if sucursal_id:
            queryset = queryset.filter(id_sucursal_id=sucursal_id)
            
        # Agrupación por Estado
        por_estado = queryset.values('estado').annotate(
            total=Count('estado')
        )
        
        # Agrupación por Marca
        por_marca = queryset.values('marca_dispositivo').annotate(
            total=Count('marca_dispositivo')
        ).order_by('-total')[:5] # Top 5
        
        # Datos cronológicos (opcional, por recepción)
        por_dia = queryset.annotate(
            dia=TruncDate('fecha_inicio')
        ).values('dia').annotate(
            cantidad=Count('id_servicio')
        ).order_by('dia')
        
        labels_dia = [item['dia'].strftime('%d/%m') for item in por_dia]
        data_dia = [item['cantidad'] for item in por_dia]

        # Agrupación por Técnico (Solo Entregados)
        por_tecnico = queryset.filter(estado='Entregado').values('id_tecnico_asignado__nombre_apellido').annotate(
                total=Count('id_servicio')
        ).order_by('-total')

        labels_tecnico = [item['id_tecnico_asignado__nombre_apellido'] or 'Sin Asignar' for item in por_tecnico]
        data_tecnico = [item['total'] for item in por_tecnico]

        # Distribución por Hora del Día
        servicios_por_hora = queryset.annotate(
            hora=ExtractHour('fecha_inicio')
        ).values('hora').annotate(
            cantidad=Count('id_servicio')
        ).order_by('hora')
        
        # Rellenar horas faltantes con 0
        horas_dict = {i: 0 for i in range(24)}
        for item in servicios_por_hora:
            horas_dict[item['hora']] = item['cantidad']
        
        data_por_hora = {
            'labels': [f"{h:02d}:00" for h in range(24)],
            'data': [horas_dict[h] for h in range(24)]
        }

        return Response({
            'grafico_estado': {
                'labels': [item['estado'] for item in por_estado],
                'data': [item['total'] for item in por_estado]
            },
            'grafico_marca': {
                'labels': [item['marca_dispositivo'] for item in por_marca],
                'data': [item['total'] for item in por_marca]
            },
            'grafico_evolucion': {
                'labels': labels_dia,
                'data': data_dia
            },
            'grafico_tecnicos': {
                'labels': labels_tecnico,
                'data': data_tecnico
            },
            'grafico_hora': {
                'labels': data_por_hora['labels'],
                'data': data_por_hora['data']
            },
            'kpis': {
                'total_servicios': queryset.count(),
                'pendientes': queryset.filter(estado='En Reparación').count(),
                'entregados': queryset.filter(estado='Entregado').count()
            }
        })

class ReporteServiciosPDFView(ReporteBaseView):
    def get(self, request):
        fecha_desde, fecha_hasta = self.get_fechas_filtro(request)
        sucursal_id = self.get_sucursal_filtro(request)
        
        queryset = ServicioTecnico.objects.filter(
            fecha_inicio__range=(fecha_desde, fecha_hasta)
        ).select_related('id_cliente', 'id_tecnico_asignado').order_by('-fecha_inicio')
        
        if sucursal_id:
            queryset = queryset.filter(id_sucursal_id=sucursal_id)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        elements.append(Paragraph("Reporte de Servicios Técnicos", styles['Title']))
        elements.append(Paragraph(f"Periodo: {fecha_desde.strftime('%d/%m/%Y')} - {fecha_hasta.strftime('%d/%m/%Y')}", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        data_tabla = [['#', 'Recepción', 'Entrega', 'Ticket', 'Cliente', 'Dispositivo', 'Estado', 'Tec. asignado', 'Costo']]
        total_estimado = 0
        
        for idx, s in enumerate(queryset, start=1):
            if s.estado != 'Anulado':
                total_estimado += s.costo_estimado
            
            row = [
                idx,
                s.fecha_inicio.strftime('%d/%m/%Y'),
                s.fecha_entrega.strftime('%d/%m/%Y') if s.fecha_entrega else '-',
                s.numero_servicio,
                s.id_cliente.nombre_apellido if s.id_cliente else '-',
                f"{s.marca_dispositivo} {s.modelo_dispositivo}",
                s.estado,
                s.id_tecnico_asignado.nombre_apellido if s.id_tecnico_asignado else '-',
                f"{s.costo_estimado:.2f}"
            ]
            data_tabla.append(row)
            
        data_tabla.append(['', '', '', '', '', '', '', 'TOTAL:', f"{total_estimado:.2f}"])
            
        t = Table(data_tabla)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.blue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
        ]))
        elements.append(t)
        
        doc.build(elements)
        buffer.seek(0)
        return HttpResponse(buffer, content_type='application/pdf')

class ReporteServiciosExcelView(ReporteBaseView):
    def get(self, request):
        fecha_desde, fecha_hasta = self.get_fechas_filtro(request)
        sucursal_id = self.get_sucursal_filtro(request)
        
        queryset = ServicioTecnico.objects.filter(
            fecha_inicio__range=(fecha_desde, fecha_hasta)
        ).order_by('-fecha_inicio')
        
        if sucursal_id:
            queryset = queryset.filter(id_sucursal_id=sucursal_id)
            
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Servicios"
        
        headers = ['#', 'Nro Servicio', 'Fecha Recepción', 'Fecha Entrega', 'Cliente', 'Dispositivo', 'Problema', 'Estado', 'Tec. asignado', 'Costo']
        ws.append(headers)
        
        for idx, s in enumerate(queryset, start=1):
            ws.append([
                idx,
                s.numero_servicio,
                s.fecha_inicio.strftime('%d/%m/%Y %H:%M') if s.fecha_inicio else '',
                s.fecha_entrega.strftime('%d/%m/%Y %H:%M') if s.fecha_entrega else '',
                s.id_cliente.nombre_apellido if s.id_cliente else '',
                f"{s.marca_dispositivo} {s.modelo_dispositivo}",
                s.descripcion_problema,
                s.estado,
                s.id_tecnico_asignado.nombre_apellido if s.id_tecnico_asignado else '',
                float(s.costo_estimado)
            ])
            
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename=servicios_{timezone.now().strftime("%Y%m%d")}.xlsx'
        wb.save(response)
        return response
