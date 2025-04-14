# Loadify

Loadify es una aplicación web moderna y modular para subir y gestionar archivos. Diseñada para ser fácil de usar y altamente personalizable, permite a los usuarios subir múltiples archivos con validaciones avanzadas, previsualización, y opciones de eliminación. Su diseño modular permite reutilizar la lógica de subida en otros proyectos.

## instalación

### Instalación con NPM

```bash
npm i loadifybyraidol
```

Para importar en tu proyecto:

```javascript
import { FileUploader } from "./fileUploader.js";
```

## Características

- **Interfaz amigable:** Arrastra y suelta archivos o selecciónalos desde tu dispositivo.
- **Previsualización:** Miniaturas para imágenes y detalles como nombre, tamaño y tipo para otros archivos.
- **Validaciones robustas:**
  - Tipos de archivo permitidos (`jpg`, `png`, `pdf`, `docx`, `xlsx`).
  - Tamaño máximo configurable para cada archivo.
  - Límite de archivos.
- **Subida modularizada:** Lógica reutilizable con la clase `FileUploader`.
- **Mensajes interactivos:** Uso de `toastr.js` para notificaciones en tiempo real.
- **Gestión de archivos:** Opciones para eliminar archivos antes de la subida.
- **Diseño moderno:** Construido con Bootstrap 5 y diseño responsivo.

## Tecnologías Utilizadas

- **Frontend:**

  - HTML5
  - CSS3 (Bootstrap 5, estilos personalizados)
  - JavaScript ES6 (Módulos)
  - Librerías:
    - [jQuery](https://jquery.com/)
    - [Toastr.js](https://codeseven.github.io/toastr/)
    - [FontAwesome](https://fontawesome.com/)

- **Backend:**
  - PHP para manejar la recepción y almacenamiento de archivos.

## Estructura del Proyecto

```plaintext
Loadify/
├── css/
│   └── styles.css                # Estilos personalizados del proyecto
├── js/
│   ├── fileUploader.js           # Lógica modular del uploader
│   └── main.js                   # Configuración y uso de FileUploader
├── uploads/                      # carpeta de archivos de subida
├── upload.php                    # Script PHP para manejar la subida de archivos
├── index.html                    # Archivo principal del proyecto
```

## Instalación

1. Clona este repositorio en tu máquina local:

   ```bash
   git clone https://github.com/tu-usuario/loadify.git
   cd loadify
   ```

2. Configura un servidor local (como XAMPP o WAMP) y coloca los archivos del proyecto en la carpeta del servidor (e.g., `htdocs`).

3. Asegúrate de que la carpeta `uploads/` tenga permisos de escritura.

---

## Uso

1. Abre el archivo `index.html` en tu navegador.
2. Arrastra y suelta archivos en el área indicada o haz clic para seleccionarlos.
3. Configura las opciones de subida en `js/main.js` si necesitas cambiar parámetros como:
   - **Tipos de archivo permitidos.**
   - **Tamaño máximo del archivo.**
   - **Límite de archivos.**
4. Haz clic en **"Subir Archivos"** para enviarlos al servidor.

---

## Configuración

Puedes personalizar los siguientes parámetros en el archivo `main.js` al instanciar el `FileUploader`:

```javascript
const uploader = new FileUploader("upload-container", {
  allowedFileTypes: ["jpg", "png", "pdf", "docx", "xlsx"], // Tipos permitidos
  maxFileSize: 4096, // Tamaño máximo del archivo (en KB)
  maxFiles: 10, // Cantidad máxima de archivos
  autoUpload: false, // Subida automática
  uploadUrl: "upload.php", // URL para la subida
  showDetails: ["name", "size", "type"], // Detalles a mostrar
  thumbnails: true, // Previsualización de imágenes
});
```

### Opciones configurables:

- **allowedFileTypes:** Extensiones permitidas para los archivos.
- **maxFileSize:** Tamaño máximo de cada archivo (en KB).
- **maxFiles:** Límite total de archivos.
- **autoUpload:** Activar/desactivar subida automática al arrastrar.
- **uploadUrl:** URL donde se procesan los archivos en el servidor.
- **showDetails:** Detalles visibles de los archivos (nombre, tamaño, tipo).
- **thumbnails:** Habilita/deshabilita previsualizaciones para imágenes.

---

## Captura de Pantalla

_Añade aquí una imagen representativa de la interfaz o el uso de la aplicación._

---

## Contribución

¡Las contribuciones son bienvenidas! Si encuentras un problema o tienes ideas para mejoras, por favor sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una rama para tu contribución:
   ```bash
   git checkout -b feature/nueva-caracteristica
   ```
3. Realiza tus cambios y asegúrate de realizar commits descriptivos.
4. Abre un **pull request** para revisión.

---

## Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](./LICENSE) para más detalles.

---

¡Gracias por usar **Loadify**! 🎉

## Authors

- [@raidolContreras](https://github.com/raidolContreras/)
