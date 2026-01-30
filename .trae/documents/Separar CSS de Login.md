## 1. Crear el nuevo archivo login.css
- **Ruta**: [login.css](file:///d:/myProjects/mcmatias/frontend/css/login.css)
- **Contenido**: Moveré todos los estilos específicos del login que se encuentran actualmente en `styles.css` (clases como `.login-page`, `.login-card`, `.particles-canvas`, etc.).

## 2. Limpiar styles.css
- **Archivo**: [styles.css](file:///d:/myProjects/mcmatias/frontend/css/styles.css)
- **Acción**: Eliminaré el bloque de código dedicado a la página de login para mantener el archivo limpio y enfocado en los estilos globales y del dashboard.

## 3. Actualizar la página de Login
- **Archivo**: [index.html](file:///d:/myProjects/mcmatias/frontend/index.html)
- **Acción**: Añadiré la referencia al nuevo archivo CSS:
  ```html
  <link href="css/login.css" rel="stylesheet">
  ```
- **Nota**: Mantendré la referencia a `styles.css` primero, ya que contiene las variables globales (colores, fuentes) que `login.css` necesita utilizar.

¿Deseas que proceda con la separación de los archivos ahora?