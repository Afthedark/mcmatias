# Plan de Implementación: Mejoras en Módulo Productos

Basado en tus requerimientos, implementaré las siguientes modificaciones para gestionar mejor las imágenes y la experiencia de usuario.

## 1. Backend: Eliminación de Imagen en Soft Delete
Actualmente, el sistema solo marca el producto como inactivo (`activo=False`) pero conserva la imagen en el servidor, ocupando espacio innecesariamente.

**Cambio en `backend/api/views.py`:**
*   Modificar el método `destroy` de `ProductoViewSet`.
*   Antes de desactivar el producto:
    1.  Verificar si tiene una imagen asociada.
    2.  Eliminar físicamente el archivo de imagen del sistema de archivos.
    3.  Establecer el campo `foto_producto` a `None` (null) en la base de datos para evitar referencias rotas.
    4.  Proceder con el `soft delete` (marcar como inactivo).

## 2. Frontend: Previsualización de Imagen al Editar
Actualmente, el modal de edición no muestra la imagen actual, lo que obliga al usuario a adivinar si necesita subir una nueva.

**Cambio en `frontend/productos.html`:**
*   Agregar un elemento `<img>` oculto por defecto (`d-none`) debajo del input de archivo (`#fotoProducto`).
*   Estilizarlo como `img-thumbnail` con altura máxima controlada (ej. 150px).

**Cambio en `frontend/js/pages/productos.js`:**
*   Actualizar la función `openEditModal`:
    *   Detectar si el producto tiene URL de imagen.
    *   Si tiene imagen: asignar el `src` al elemento `<img>` y mostrarlo.
    *   Si no tiene: ocultar el elemento.
*   Actualizar la función `openCreateModal`:
    *   Asegurar que la previsualización esté oculta y limpia al abrir el formulario para un nuevo producto.
