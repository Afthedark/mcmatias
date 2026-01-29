## 1. Función de Compresión en utils.js
- Implementar `compressImage(file)` con parámetros optimizados para un objetivo de **1.5MB**.
- Lógica: Redimensión a 1920px (max) + Compresión JPEG calidad 0.7.

## 2. Integración en productos.js
- Actualizar `saveProducto` para comprimir la imagen del producto antes del `FormData`.

## 3. Integración en servicios_tecnicos.js
- Actualizar `guardarServicio` para comprimir las fotos 1, 2 y 3.
- Ajustar `capturarFoto` para usar calidad 0.7 en el `toBlob`.

## 4. Pruebas de peso
- Confirmar que cualquier imagen subida se mantenga bajo el umbral de **1.5MB**.