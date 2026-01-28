## Objetivo

Corregir el error `400 Bad Request` en el login (`/api/token/`) causado por el `CustomTokenObtainPairSerializer`.

## Diagnóstico

El error 400 indica que la petición no cumple con la validación del serializer.
Revisando `CustomTokenObtainPairSerializer` en [serializers.py](file:///d:/myProjects/mcmatias/backend/api/serializers.py), este hereda de `TokenObtainPairSerializer` y llama a `super().validate(attrs)`.
El problema probable es que la petición que estás enviando desde el frontend (o Postman) no tiene los campos que espera `TokenObtainPairSerializer` (usualmente `username` y `password`, o el campo definido como `USERNAME_FIELD` en el modelo de usuario).

En [settings.py](file:///d:/myProjects/mcmatias/backend/config/settings.py) no veo configuración explícita de `USERNAME_FIELD` para SimpleJWT, pero en el modelo `Usuario` (que no puedo ver el código completo pero sí el serializer), el campo de login es `correo_electronico`.
Django por defecto usa `username`, pero tu modelo usa `correo_electronico`.
SimpleJWT usa el `USERNAME_FIELD` del modelo de usuario. Si tu modelo `Usuario` tiene `USERNAME_FIELD = 'correo_electronico'`, entonces SimpleJWT espera recibir un campo llamado `correo_electronico` (o `username` si no se configura diferente).

**Hipótesis**: Estás enviando `username` en el JSON del login, pero tu modelo espera `correo_electronico`, o viceversa. O SimpleJWT no está encontrando el campo correcto.

## Plan de Acción

1. **Revisar Modelo Usuario**: Confirmar cuál es el `USERNAME_FIELD` en `api/models.py`.
2. **Ajustar Serializer**: Si el frontend envía `username` pero el modelo usa `correo_electronico`, el serializer base de SimpleJWT podría fallar si no se mapea. O asegurarnos que el frontend envíe el campo correcto.
3. **Debug**: Como no puedo ver lo que envías, asumiré que el error está en la discrepancia de nombres de campos.

**Acción Inmediata**:
Verificar el modelo `Usuario` en `api/models.py` para ver `USERNAME_FIELD`.

## Pasos

1. Leer `api/models.py` para confirmar `USERNAME_FIELD`.
2. Si es `correo_electronico`, verificar que SimpleJWT lo use correctamente.
3. Si es necesario, ajustar `CustomTokenObtainPairSerializer` para aceptar `username` y mapearlo a `correo_electronico`, o confirmar que el cliente debe enviar `correo_electronico`.

