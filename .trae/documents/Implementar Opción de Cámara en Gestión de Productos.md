# Implementar Función de Cámara en el Módulo de Productos

## Cambios en el HTML ([productos.html](file:///d:/myProjects/mcmatias/frontend/productos.html))

1. **Botón de Cámara**: Modificar el campo de subida de imagen para incluir un botón con el icono de cámara, permitiendo al usuario elegir entre subir un archivo o tomar una foto.
2. **Modal de Cámara**: Insertar la estructura del modal de cámara (visor de video y controles) al final del archivo, reutilizando el diseño consistente de la aplicación.

## Cambios en el JavaScript ([productos.js](file:///d:/myProjects/mcmatias/frontend/js/pages/productos.js))

1. **Lógica de Cámara**:
   - Implementar `abrirCamara()`: Solicita permisos al navegador y activa el flujo de video (priorizando la cámara trasera en móviles).
   - Implementar `capturarFoto()`: Captura el frame actual del video, lo convierte en un archivo de imagen y lo asigna automáticamente al campo de producto.
   - Implementar `cerrarCamara()`: Detiene los sensores de la cámara y cierra el modal para optimizar recursos.
2. **Previsualización Inteligente**:
   - Implementar `handleImagePreview()`: Función para mostrar instantáneamente la imagen capturada o seleccionada en el formulario de edición.
   - Vincular esta función al evento de cambio del campo de imagen.
3. **Limpieza de Formulario**:
   - Asegurar que al abrir un nuevo producto, cualquier previsualización de cámara anterior se limpie correctamente.

## Verificación

- Confirmar que al presionar el icono de cámara se abra el visor.
- Validar que al capturar la foto, la imagen aparezca como vista previa en el formulario.
- Verificar que la foto capturada se guarde correctamente al procesar el producto (Crear/Editar).

¿Deseas que proceda con la implementación de esta funcionalidad?