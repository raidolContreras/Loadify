# Loadify

**Loadify** es una clase JavaScript moderna y modular que permite cargar, previsualizar y gestionar archivos desde cualquier interfaz web. Basada en JavaScript puro con soporte ESModules, ofrece una experiencia fluida de arrastrar y soltar, validaciones personalizadas, barra de progreso y eliminación masiva o individual.

---

### ✨ Características destacadas

- 🎯 **Arrastrar y soltar** con mensajes dinámicos y animaciones.
- 🌍 **Multi-idioma:** Español e Inglés listos para usar.
- 🧩 **Modularidad total:** integra tu lógica personalizada con `FormData`, callbacks y más.
- 🖼️ **Miniaturas inteligentes:** imágenes, PDFs y otros archivos con íconos representativos.
- 🛡️ **Validaciones personalizables:** tamaño, tipo, número máximo.
- 🚀 **Subida automática o manual:** tú decides cuándo enviar los archivos.
- 🧼 **Eliminación masiva o individual.**
- 🔧 **Opciones de configuración extensas** para adaptar la lógica a tus necesidades.
- ✅ **100% compatible con Bootstrap 5, jQuery, Toastr y FontAwesome.**

Loadify es una aplicación web moderna y modular para subir y gestionar archivos. Diseñada para ser fácil de usar y altamente personalizable, permite a los usuarios subir múltiples archivos con validaciones avanzadas, previsualización, y opciones de eliminación. Su diseño modular permite reutilizar la lógica de subida en otros proyectos.

## Instalación

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
const uploader = new FileUploader("loadify", {
  method: "POST",
  allowedFileTypes: ["jpg", "png", "pdf", "docx", "xlsx"], // Tipos permitidos
  maxFileSize: 4096, // Tamaño máximo del archivo (en KB)
  maxFiles: 10, // Cantidad máxima de archivos
  autoProcessQueue: false, // Subida automática
  uploadUrl: "upload.php", // URL para la subida
  showDetails: ["name", "size", "type"], // Detalles a mostrar
  thumbnails: true, // Previsualización de imágenes
  fileFieldName: "file",
  deleteButtonText: '<i class="fal fa-times"></i>',
  iconMap: {
    pdf: "fas fa-file-pdf",
    docx: "fas fa-file-word",
    xlsx: "fas fa-file-excel",
    default: "fas fa-file-alt",
  },
  enableBulkDelete: true,
  language: "es", // es: Español, en: Inglés
  translations: {
    es: {
      dragDropText: "Arrastra y suelta los archivos aquí, o",
      chooseFile: "elige un archivo",
      uploadButton: "Subir Archivos",
      deleteButton: '<i class="fal fa-times"></i>',
      maxFilesError: "Solo puedes subir un máximo de {maxFiles} archivos.",
      fileSizeError:
        "El archivo {fileName} excede el tamaño máximo de {maxFileSize} KB.",
      fileTypeError: "Tipo de archivo no permitido: {fileType}.",
      successMessage: "¡Archivo {fileName} subido con éxito!",
      errorMessage: "Error al subir el archivo {fileName}.",
      noFilesSelected: "No se han seleccionado archivos.",
      name: "Nombre",
      size: "Tamaño",
      type: "Tipo",
      fileDeleted: "archivo eliminado",
      filesDeleted: "archivos eliminados",
      deleteFilesSelected: "Eliminar seleccionados",
      dragFilesHere:
        '<i class="fas fa-cloud-upload-alt"></i> Suelta tus archivos aquí',
      subtitleText:
        "Puedes subir archivos de hasta 10 MB y un máximo de 5 archivos.",
    },
  },
});
```

### Opciones configurables:

### Opciones de configuración:

- **method** (string): Método HTTP para el envío de archivos. Valores permitidos: "POST" o "GET". Por defecto: "POST".

- **allowedFileTypes** (array): Lista de extensiones de archivo permitidas. Por seguridad, se recomienda validar también en el servidor. Ejemplo: ["jpg", "png", "pdf"].

- **maxFileSize** (number): Tamaño máximo permitido por archivo en KB. 1024KB = 1MB. Por defecto: 4096 (4MB).

- **maxFiles** (number): Número máximo de archivos que se pueden subir simultáneamente. Por defecto: 10.

- **autoProcessQueue** (boolean): Si es true, los archivos se subirán automáticamente al ser agregados. Si es false, esperará al clic en el botón de subida.

- **uploadUrl** (string): Ruta al script del servidor que procesará la subida de archivos. Ejemplo: "upload.php".

- **showDetails** (array): Especifica qué información del archivo mostrar. Valores posibles: ["name", "size", "type"].

- **thumbnails** (boolean): Activa/desactiva la generación de miniaturas para archivos de imagen.

- **fileFieldName** (string): Nombre del campo en el FormData para enviar los archivos. Por defecto: "file".

- **deleteButtonText** (string): HTML o texto para el botón de eliminar archivo. Admite iconos FontAwesome.

- **iconMap** (object): Asigna iconos FontAwesome a diferentes tipos de archivo. Ejemplo: { pdf: "fas fa-file-pdf" }.

- **enableBulkDelete** (boolean): Habilita la opción de eliminar múltiples archivos seleccionados.

- **language** (string): Define el idioma predeterminado. Valores: "es" (Español) o "en" (Inglés).

- **translations** (object): Objeto con todas las cadenas de texto traducibles organizadas por código de idioma.

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
