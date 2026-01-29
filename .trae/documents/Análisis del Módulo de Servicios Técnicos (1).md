## 1. Corrección de IDs en JS
- En `servicios_tecnicos.js`, actualizar `handleImagePreview` para usar `preview_foto_${num}` en lugar de `preview_${num}`.

## 2. Actualización de `mostrarEditarServicio`
- Añadir lógica para iterar sobre `foto_1`, `foto_2` y `foto_3`.
- Si la foto existe, obtener la URL con `getImageUrl(foto)` y mostrarla en su contenedor de preview.

## 3. Refuerzo de `resetFormulario`
- Asegurar que al resetear, se limpie el `src` y se oculten los contenedores de las 3 fotos.

## 4. Verificación
- Abrir un servicio existente con fotos y validar que se visualicen.
- Tomar una foto con la cámara y validar que reemplace el preview.