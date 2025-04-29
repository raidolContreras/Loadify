// Clase principal para gestionar la carga de archivos
class FileUploader {
  // Constructor de la clase que recibe el ID del contenedor y un objeto de opciones personalizadas
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);

    // Validación de existencia del contenedor
    if (!this.container) {
      console.error(`Container with ID '${containerId}' not found.`);
      return;
    }

    // Configuración por defecto combinada con las opciones personalizadas
    this.options = Object.assign(
      {
        method: "POST", // Only POST and GET are allowed
        language: "es", // Idioma por defecto

        // Validate method in constructor
        set method(value) {
          if (value !== "POST" && value !== "GET") {
            throw new Error("Only POST and GET methods are allowed");
          }
          this._method = value;
        },
        get method() {
          return this._method;
        },

        // Rest of the options remain the same
        translations: {
          es: {
            dragDropText: "Arrastra y suelta los archivos aquí, o",
            chooseFile: "elige un archivo",
            uploadButton: "Subir Archivos",
            deleteButton: '<i class="fal fa-times"></i>',
            maxFilesError:
              "Solo puedes subir un máximo de {maxFiles} archivos.",
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
          en: {
            dragDropText: "Drag and drop files here, or",
            chooseFile: "choose a file",
            uploadButton: "Upload Files",
            deleteButton: '<i class="fal fa-times"></i>',
            maxFilesError: "You can upload a maximum of {maxFiles} files.",
            fileSizeError:
              "File {fileName} exceeds the maximum size of {maxFileSize} KB.",
            fileTypeError: "File type not allowed: {fileType}.",
            successMessage: "File {fileName} uploaded successfully!",
            errorMessage: "Error uploading file {fileName}.",
            noFilesSelected: "No files selected.",
            name: "Name",
            size: "Size",
            type: "Type",
            fileDeleted: "file deleted",
            filesDeleted: "files deleted",
            deleteFilesSelected: "Delete selected",
            dragFilesHere:
              '<i class="fas fa-cloud-upload-alt"></i> Drop your files here',
            subtitleText:
              "You can upload files up to 10 MB and a maximum of 5 files.",
          },
        },
        sendButton: true,
        autoProcessQueue: true,
        fileFieldName: "file",
        allowedFileTypes: [],
        maxFileSize: 10,
        maxFiles: 5,
        uploadUrl: "upload.php",
        deleteButtonText: '<i class="fal fa-times"></i>',
        showDetails: ["name", "size", "type"],
        thumbnails: true,
        iconMap: {
          pdf: "fas fa-file-pdf",
          docx: "fas fa-file-word",
          xlsx: "fas fa-file-excel",
          default: "fas fa-file-alt",
        },
        enableBulkDelete: true,
        additionalData: null,

        onBulkDelete: () => {},
        onSuccess: () => {},
        onError: () => {},
        onProgress: () => {},
        onDelete: () => {},
      },
      options
    );

    // si el dev pasó función en opciones, la enlazas
    if (typeof this.options.additionalData === "function") {
      this.additionalData = this.options.additionalData;
    }

    // Validate method after merging options
    if (this.options.method !== "POST" && this.options.method !== "GET") {
      throw new Error("Only POST and GET methods are allowed");
    }

    this.filesToUpload = []; // Lista de archivos seleccionados
    this.init(); // Inicialización de la interfaz y eventos
  }

  // Método que inicializa el renderizado y listeners
  init() {
    this.renderUploader(this.container.id);
    this.addEventListeners(this.container.id);
  }

  // Método opcional para añadir datos adicionales al FormData
  additionalData() {
    // Extendible por el desarrollador
  }

  // Método para renderizar el HTML del uploader
  renderUploader(containerId) {
    this.container.innerHTML = `
            <div class="${containerId}">
                <p>
                    <i class="fas fa-cloud-upload-alt"></i> ${this.getTranslation(
                      "dragDropText"
                    )}
                    <label for="file-upload" class="text-primary upload-link">
                        <i class="fas fa-folder-open"></i> ${this.getTranslation(
                          "chooseFile"
                        )}
                    </label>
                </p>
                <p class="subtitle">${this.getTranslation("subtitleText")}</p>
                <input type="file" id="file-upload" multiple accept="${this.options.allowedFileTypes
                  .map((type) => `.${type}`)
                  .join(",")}">
                ${
                  this.options.enableBulkDelete
                    ? `
                    <button class="btn btn-danger mt-3 d-none" id="delete-selected" disabled>
                        <i class="fas fa-trash-alt"></i> ${this.getTranslation(
                          "deleteFilesSelected"
                        )}
                    </button>
                `
                    : ""
                }
                
                <div class="file-info" id="file-info"></div>
                <div class="progress mt-3" id="progress-bar" style="display: none;">
                    <div class="progress-bar progress-bar-fill" id="progress-bar-fill" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                ${
                  this.options.sendButton
                    ? `<button class="btn btn-primary mt-3 d-none" id="send-files" disabled>${this.getTranslation(
                        "uploadButton"
                      )}</button>`
                    : ""
                }
            </div>
        `;
  }

  // Añade los listeners para drag & drop, selección de archivos y envío
  addEventListeners(containerId) {
    const fileInput = this.container.querySelector("#file-upload");
    const uploadContainer = this.container.querySelector("." + containerId);
    const label = this.container.querySelector('label[for="file-upload"]');
    const originalText = uploadContainer.querySelector("p").innerHTML; // Guarda el contenido original

    // Dragover - Añade clase visual y cambia el texto
    uploadContainer.addEventListener("dragover", (event) => {
      event.preventDefault();
      uploadContainer.classList.add("dragover");
      // Actualizar el mensaje mientras se está arrastrando
      const p = uploadContainer.querySelector("p");
      p.innerHTML = `${this.getTranslation("dragFilesHere")}`;
    });

    // Dragleave - Restaura el texto original
    uploadContainer.addEventListener("dragleave", () => {
      uploadContainer.classList.remove("dragover");
      const p = uploadContainer.querySelector("p");
      p.innerHTML = originalText;
    });

    // Drop - Procesa la selección y restaura el texto si lo deseas
    uploadContainer.addEventListener("drop", (event) => {
      event.preventDefault();
      uploadContainer.classList.remove("dragover");
      const p = uploadContainer.querySelector("p");
      // Puedes restaurar el texto original o dejar otro mensaje
      p.innerHTML = originalText;

      const newFiles = Array.from(event.dataTransfer.files);
      this.handleFileSelection(newFiles);

      if (this.options.autoProcessQueue) {
        this.uploadFiles();
      }
    });

    // Prevent default en el label para evitar comportamientos no deseados
    label.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    // Change - Archivos seleccionados manualmente
    fileInput.addEventListener("change", (event) => {
      const newFiles = Array.from(event.target.files);
      this.handleFileSelection(newFiles);
    });

    // Evento del botón de envío si esta opción está activada
    if (this.options.sendButton) {
      const sendFilesButton = this.container.querySelector("#send-files");
      if (sendFilesButton) {
        sendFilesButton.addEventListener("click", () => {
          this.processQueue();
        });
      }
    }
  }

  // Procesa los archivos seleccionados, validando tipo, tamaño y duplicados
  handleFileSelection(newFiles) {
    const fileInfo = this.container.querySelector("#file-info");
    const sendFilesButton = this.container.querySelector("#send-files");

    if (this.filesToUpload.length + newFiles.length > this.options.maxFiles) {
      toastr.error(
        this.getTranslation("maxFilesError", {
          maxFiles: this.options.maxFiles,
        })
      );
      return;
    }

    newFiles.forEach((file) => {
      if (
        this.filesToUpload.some(
          (existingFile) => existingFile.name === file.name
        )
      ) {
        toastr.warning(`El archivo ${file.name} ya fue seleccionado.`);
        return;
      }

      const fileType = file.name.split(".").pop().toLowerCase();
      if (
        this.options.allowedFileTypes.length > 0 &&
        !this.options.allowedFileTypes.includes(fileType)
      ) {
        toastr.error(this.getTranslation("fileTypeError", { fileType }));
        return;
      }

      if (file.size / (1024 * 1024) > this.options.maxFileSize) {
        toastr.error(
          this.getTranslation("fileSizeError", {
            fileName: file.name,
            maxFileSize: this.options.maxFileSize,
          })
        );
        return;
      }

      this.filesToUpload.push(file);
    });

    this.displayFileInfo(fileInfo);
    if (sendFilesButton) {
      sendFilesButton.disabled = this.filesToUpload.length === 0;
      sendFilesButton.classList.remove("d-none");
    }
  }

  // Muestra los archivos seleccionados con miniaturas e íconos
  displayFileInfo(fileInfo) {
    // Limpia el contenedor
    fileInfo.innerHTML = "";

    const sendFilesButton = this.container.querySelector("#send-files");
    const deleteSelectedButton =
      this.container.querySelector("#delete-selected");

    // Para cada archivo seleccionado...
    this.filesToUpload.forEach((file, index) => {
      // Contenedor de la vista previa
      const filePreview = document.createElement("div");
      filePreview.classList.add("file-preview");
      filePreview.dataset.index = index;

      // Checkbox de selección múltiple
      if (this.options.enableBulkDelete) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("bulk-checkbox");
        checkbox.style.position = "absolute";
        checkbox.style.left = "10px";
        checkbox.style.top = "10px";
        checkbox.addEventListener("change", () => {
          const anyChecked = !!this.container.querySelector(
            ".bulk-checkbox:checked"
          );
          deleteSelectedButton.disabled = !anyChecked;
        });
        filePreview.appendChild(checkbox);
      }

      // Miniatura o icono
      if (file.type === "application/pdf") {
        const iframe = document.createElement("iframe");
        iframe.src = URL.createObjectURL(file);
        iframe.style.width = "100%";
        iframe.style.height = "100px";
        filePreview.appendChild(iframe);
      } else if (this.options.thumbnails && file.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.width = "100%";
        img.style.height = "100px";
        img.style.objectFit = "cover";
        filePreview.appendChild(img);
      } else {
        const fileType = file.name.split(".").pop().toLowerCase();
        const iconClass =
          this.options.iconMap[fileType] || this.options.iconMap.default;
        const fileIcon = document.createElement("div");
        fileIcon.classList.add("file-icon");
        fileIcon.innerHTML = `<i class="${iconClass}"></i>`;
        filePreview.appendChild(fileIcon);
      }

      // Detalles configurables
      const detailsContainer = document.createElement("div");
      detailsContainer.classList.add("file-details");
      this.options.showDetails.forEach((detail) => {
        const detailEl = document.createElement("div");
        if (detail === "name") detailEl.textContent = `Nombre: ${file.name}`;
        if (detail === "size")
          detailEl.textContent = `Tamaño: ${this.formatFileSize(file.size)}`;
        if (detail === "type") detailEl.textContent = `Tipo: ${file.type}`;
        detailsContainer.appendChild(detailEl);
      });
      filePreview.appendChild(detailsContainer);

      // Botón de eliminar individual
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-file");
      deleteButton.innerHTML = this.getTranslation("deleteButton");
      deleteButton.addEventListener("click", () => {
        filePreview.classList.add("removing");
        filePreview.addEventListener(
          "animationend",
          () => {
            this.filesToUpload.splice(index, 1);
            filePreview.remove();
            this.options.onDelete(file);
            // Actualiza estado de botones
            if (sendFilesButton) {
              sendFilesButton.disabled = this.filesToUpload.length === 0;
              sendFilesButton.classList.toggle(
                "d-none",
                this.filesToUpload.length === 0
              );
            }
            if (deleteSelectedButton) {
              deleteSelectedButton.disabled = true;
              deleteSelectedButton.classList.toggle(
                "d-none",
                this.filesToUpload.length === 0
              );
            }
            this.container.querySelector("#file-upload").value = "";
          },
          { once: true }
        );
      });
      filePreview.appendChild(deleteButton);

      // ——— Aquí: agregamos el progress bar individual ———
      const progressContainer = document.createElement("div");
      progressContainer.classList.add("progress", "file-progress");
      const progressBar = document.createElement("div");
      progressBar.classList.add("progress-bar");
      progressBar.setAttribute("role", "progressbar");
      progressBar.setAttribute("aria-valuemin", "0");
      progressBar.setAttribute("aria-valuemax", "100");
      progressBar.style.width = "0%";
      progressContainer.appendChild(progressBar);
      filePreview.appendChild(progressContainer);
      // ————————————————————————————————————————————

      // Insertar preview en el contenedor
      fileInfo.appendChild(filePreview);
    });

    // Bulk delete
    if (this.options.enableBulkDelete && deleteSelectedButton) {
      deleteSelectedButton.onclick = () => {
        const selectedPreviews = Array.from(
          this.container.querySelectorAll(".bulk-checkbox:checked")
        ).map((cb) => cb.closest(".file-preview"));

        const filesToDelete = selectedPreviews.map(
          (p) => this.filesToUpload[p.dataset.index]
        );
        selectedPreviews.forEach((preview) => {
          preview.classList.add("removing");
          preview.addEventListener(
            "animationend",
            () => {
              this.filesToUpload.splice(preview.dataset.index, 1);
              preview.remove();
            },
            { once: true }
          );
        });

        this.options.onBulkDelete(filesToDelete);
        const msg =
          filesToDelete.length === 1
            ? `1 archivo eliminado`
            : `${filesToDelete.length} archivos eliminados`;
        toastr.info(msg);

        // Actualiza botones y resetea input
        if (sendFilesButton) {
          sendFilesButton.disabled = this.filesToUpload.length === 0;
          sendFilesButton.classList.toggle(
            "d-none",
            this.filesToUpload.length === 0
          );
        }
        deleteSelectedButton.disabled = true;
        deleteSelectedButton.classList.toggle(
          "d-none",
          this.filesToUpload.length === 0
        );
        this.container.querySelector("#file-upload").value = "";
      };
    }
  }

  // Convierte el tamaño del archivo a KB, MB o GB
  formatFileSize(sizeInBytes) {
    if (sizeInBytes >= 1024 ** 3)
      return `${(sizeInBytes / 1024 ** 3).toFixed(2)} GB`;
    if (sizeInBytes >= 1024 ** 2)
      return `${(sizeInBytes / 1024 ** 2).toFixed(2)} MB`;
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
  }

  // Procesamiento manual de la cola
  processQueue() {
    this.uploadFiles();
  }

  uploadFiles() {
    // 1) Validación
    if (this.filesToUpload.length === 0) {
      toastr.error(this.getTranslation("noFilesSelected"));
      return;
    }

    // 2) Referencias a botones
    const sendFilesButton = this.container.querySelector("#send-files");
    const deleteSelectedButton =
      this.container.querySelector("#delete-selected");

    // 3) Ocultamos la barra global si existiera
    const globalBar = this.container.querySelector("#progress-bar");
    if (globalBar) globalBar.style.display = "none";

    // 4) Preparamos el botón: deshabilitar + spinner
    if (sendFilesButton) {
      sendFilesButton.disabled = true;
      sendFilesButton.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> ${this.getTranslation(
        "uploadButton"
      )}`;
      sendFilesButton.classList.remove("d-none");
    }
    if (deleteSelectedButton) deleteSelectedButton.disabled = true;

    // 5) Previews y contador
    const filePreviews = this.container.querySelectorAll(".file-preview");
    const total = this.filesToUpload.length;
    let completed = 0;

    // 6) Envío individual
    this.filesToUpload.forEach((file, index) => {
      const xhr = new XMLHttpRequest();
      xhr.open(this.options.method, this.options.uploadUrl, true);

      const currentPreview = filePreviews[index];
      currentPreview.classList.add("uploading");

      const perFileBar = currentPreview.querySelector(
        ".file-progress .progress-bar"
      );

      // Progreso
      xhr.upload.addEventListener("progress", (event) => {
        if (!event.lengthComputable) return;
        const pct = Math.round((event.loaded / event.total) * 100);
        perFileBar.style.width = `${pct}%`;
        perFileBar.setAttribute("aria-valuenow", pct);
        this.options.onProgress(pct, file);
      });

      // Al terminar cada uno
      xhr.addEventListener("load", () => {
        currentPreview.classList.remove("uploading");

        const statusIcon = document.createElement("div");
        statusIcon.classList.add("file-status-icon");

        if (xhr.status === 200) {
          toastr.success(
            this.getTranslation("successMessage", { fileName: file.name })
          );
          statusIcon.innerHTML = `<i class="fas fa-check-circle text-success"></i>`;
          this.options.onSuccess(file);
        } else {
          toastr.error(
            this.getTranslation("errorMessage", { fileName: file.name })
          );
          statusIcon.innerHTML = `<i class="fas fa-times-circle text-danger"></i>`;
          this.options.onError(file);
        }

        // Fijar la barra al 100%
        perFileBar.style.width = "100%";
        currentPreview.appendChild(statusIcon);

        // Contamos uno más completado
        completed++;

        // Si todos terminaron...
        if (completed === total) {
          // 7) Limpiar lista y refrescar previews
          this.filesToUpload = [];
          this.displayFileInfo(this.container.querySelector("#file-info"));

          // 8) Resetear botón de envío
          if (sendFilesButton) {
            sendFilesButton.disabled = true;
            sendFilesButton.innerHTML = this.getTranslation("uploadButton");
            sendFilesButton.classList.add("d-none");
          }
          // 9) Resetear botón de borrar seleccionados
          if (deleteSelectedButton) {
            deleteSelectedButton.disabled = true;
            deleteSelectedButton.classList.add("d-none");
          }
        }
      });

      // 10) FormData y envío
      const formData = new FormData();
      const fieldName = this.options.fileFieldName || "file";
      formData.append(fieldName, file);

      const extraData =
        typeof this.additionalData === "function"
          ? this.additionalData()
          : this.additionalData;
      if (typeof extraData === "object") {
        for (const key in extraData) {
          if (Object.hasOwn(extraData, key)) {
            formData.append(key, extraData[key]);
          }
        }
      }

      xhr.send(formData);
    });
  }

  // Obtiene una traducción con reemplazo de variables
  getTranslation(key, placeholders = {}) {
    const translation =
      this.options.translations[this.options.language][key] || key;
    return translation.replace(
      /{(\w+)}/g,
      (_, placeholder) => placeholders[placeholder] || ""
    );
  }

  // Permite añadir o sobrescribir un idioma
  addLanguage(languageCode, translations) {
    if (this.options.translations[languageCode]) {
      console.warn(
        `El idioma '${languageCode}' ya existe. Las traducciones serán actualizadas.`
      );
    }
    this.options.translations[languageCode] = translations;
  }
}

// Exportar clase para usarla como módulo
export default FileUploader;
