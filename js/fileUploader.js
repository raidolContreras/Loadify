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
            method: 'POST', // Only POST and GET are allowed
            language: 'es', // Idioma por defecto

            // Validate method in constructor
            set method(value) {
                if (value !== 'POST' && value !== 'GET') {
                throw new Error('Only POST and GET methods are allowed');
                }
                this._method = value;
            },
            get method() {
                return this._method;
            },

            // Rest of the options remain the same
            translations: {
                es: {
                    dragDropText: 'Arrastra y suelta los archivos aquí, o',
                    chooseFile: 'elige un archivo',
                    uploadButton: 'Subir Archivos',
                    deleteButton: '<i class="fal fa-times"></i>',
                    maxFilesError: 'Solo puedes subir un máximo de {maxFiles} archivos.',
                    fileSizeError: 'El archivo {fileName} excede el tamaño máximo de {maxFileSize} KB.',
                    fileTypeError: 'Tipo de archivo no permitido: {fileType}.',
                    successMessage: '¡Archivo {fileName} subido con éxito!',
                    errorMessage: 'Error al subir el archivo {fileName}.',
                    noFilesSelected: 'No se han seleccionado archivos.',
                    name: 'Nombre',
                    size: 'Tamaño',
                    type: 'Tipo',
                    fileDeleted: 'archivo eliminado',
                    filesDeleted: 'archivos eliminados',
                    deleteFilesSelected: 'Eliminar seleccionados',
                    dragFilesHere: '<i class="fas fa-cloud-upload-alt"></i> Suelta tus archivos aquí',
                    subtitleText: 'Puedes subir archivos de hasta 10 MB y un máximo de 5 archivos.',
                },
                en: {
                    dragDropText: 'Drag and drop files here, or',
                    chooseFile: 'choose a file',
                    uploadButton: 'Upload Files',
                    deleteButton: '<i class="fal fa-times"></i>',
                    maxFilesError: 'You can upload a maximum of {maxFiles} files.',
                    fileSizeError: 'File {fileName} exceeds the maximum size of {maxFileSize} KB.',
                    fileTypeError: 'File type not allowed: {fileType}.',
                    successMessage: 'File {fileName} uploaded successfully!',
                    errorMessage: 'Error uploading file {fileName}.',
                    noFilesSelected: 'No files selected.',
                    name: 'Name',
                    size: 'Size',
                    type: 'Type',
                    fileDeleted: 'file deleted',
                    filesDeleted: 'files deleted',
                    deleteFilesSelected: 'Delete selected',
                    dragFilesHere: '<i class="fas fa-cloud-upload-alt"></i> Drop your files here',
                    subtitleText: 'You can upload files up to 10 MB and a maximum of 5 files.',
                },
            },
            sendButton: true,
            autoProcessQueue: true,
            fileFieldName: 'file',
            allowedFileTypes: [],
            maxFileSize: 10,
            maxFiles: 5,
            uploadUrl: 'upload.php',
            deleteButtonText: '<i class="fal fa-times"></i>',
            showDetails: ['name', 'size', 'type'],
            thumbnails: true,
            iconMap: {
                pdf: 'fas fa-file-pdf',
                docx: 'fas fa-file-word',
                xlsx: 'fas fa-file-excel',
                default: 'fas fa-file-alt',
            },
            enableBulkDelete: true,

            onBulkDelete: () => {},
            onSuccess: () => {},
            onError: () => {},
            onProgress: () => {},
            onDelete: () => {},
            },
            options
        );

        // Validate method after merging options
        if (this.options.method !== 'POST' && this.options.method !== 'GET') {
            throw new Error('Only POST and GET methods are allowed');
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
                    <i class="fas fa-cloud-upload-alt"></i> ${this.getTranslation('dragDropText')}
                    <label for="file-upload" class="text-primary upload-link">
                        <i class="fas fa-folder-open"></i> ${this.getTranslation('chooseFile')}
                    </label>
                </p>
                <p class="subtitle">${this.getTranslation('subtitleText')}</p>
                <input type="file" id="file-upload" multiple accept="${this.options.allowedFileTypes.map((type) => `.${type}`).join(',')}">
                ${this.options.enableBulkDelete ? `
                    <button class="btn btn-danger mt-3 d-none" id="delete-selected" disabled>
                        <i class="fas fa-trash-alt"></i> ${this.getTranslation('deleteFilesSelected')}
                    </button>
                ` : ''}
                
                <div class="file-info" id="file-info"></div>
                <div class="progress mt-3" id="progress-bar" style="display: none;">
                    <div class="progress-bar progress-bar-fill" id="progress-bar-fill" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                ${this.options.sendButton ? `<button class="btn btn-primary mt-3 d-none" id="send-files" disabled>${this.getTranslation('uploadButton')}</button>` : ''}
            </div>
        `;
    }

    // Añade los listeners para drag & drop, selección de archivos y envío
    addEventListeners(containerId) {
        const fileInput = this.container.querySelector('#file-upload');
        const uploadContainer = this.container.querySelector('.' + containerId);
        const label = this.container.querySelector('label[for="file-upload"]');
        const originalText = uploadContainer.querySelector('p').innerHTML; // Guarda el contenido original
    
        // Dragover - Añade clase visual y cambia el texto
        uploadContainer.addEventListener('dragover', (event) => {
            event.preventDefault();
            uploadContainer.classList.add('dragover');
            // Actualizar el mensaje mientras se está arrastrando
            const p = uploadContainer.querySelector('p');
            p.innerHTML = `${this.getTranslation('dragFilesHere')}`;
        });
    
        // Dragleave - Restaura el texto original
        uploadContainer.addEventListener('dragleave', () => {
            uploadContainer.classList.remove('dragover');
            const p = uploadContainer.querySelector('p');
            p.innerHTML = originalText;
        });
    
        // Drop - Procesa la selección y restaura el texto si lo deseas
        uploadContainer.addEventListener('drop', (event) => {
            event.preventDefault();
            uploadContainer.classList.remove('dragover');
            const p = uploadContainer.querySelector('p');
            // Puedes restaurar el texto original o dejar otro mensaje
            p.innerHTML = originalText;
    
            const newFiles = Array.from(event.dataTransfer.files);
            this.handleFileSelection(newFiles);
    
            if (this.options.autoProcessQueue) {
                this.uploadFiles();
            }
        });
    
        // Prevent default en el label para evitar comportamientos no deseados
        label.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    
        // Change - Archivos seleccionados manualmente
        fileInput.addEventListener('change', (event) => {
            const newFiles = Array.from(event.target.files);
            this.handleFileSelection(newFiles);
        });
    
        // Evento del botón de envío si esta opción está activada
        if (this.options.sendButton) {
            const sendFilesButton = this.container.querySelector('#send-files');
            if (sendFilesButton) {
                sendFilesButton.addEventListener('click', () => {
                    this.processQueue();
                });
            }
        }
    }    

    // Procesa los archivos seleccionados, validando tipo, tamaño y duplicados
    handleFileSelection(newFiles) {
        const fileInfo = this.container.querySelector('#file-info');
        const sendFilesButton = this.container.querySelector('#send-files');

        if (this.filesToUpload.length + newFiles.length > this.options.maxFiles) {
            toastr.error(this.getTranslation('maxFilesError', { maxFiles: this.options.maxFiles }));
            return;
        }

        newFiles.forEach((file) => {
            if (this.filesToUpload.some((existingFile) => existingFile.name === file.name)) {
                toastr.warning(`El archivo ${file.name} ya fue seleccionado.`);
                return;
            }

            const fileType = file.name.split('.').pop().toLowerCase();
            if (this.options.allowedFileTypes.length > 0 && !this.options.allowedFileTypes.includes(fileType)) {
                toastr.error(this.getTranslation('fileTypeError', { fileType }));
                return;
            }

            if (file.size / (1024 * 1024) > this.options.maxFileSize) {
                toastr.error(this.getTranslation('fileSizeError', {
                    fileName: file.name,
                    maxFileSize: this.options.maxFileSize
                }));
                return;
            }

            this.filesToUpload.push(file);
        });

        this.displayFileInfo(fileInfo);
        if (sendFilesButton) {
            sendFilesButton.disabled = this.filesToUpload.length === 0;
            sendFilesButton.classList.remove('d-none');
        }
    }

    // Muestra los archivos seleccionados con miniaturas e íconos
    displayFileInfo(fileInfo) {
        fileInfo.innerHTML = '';

        const sendFilesButton = this.container.querySelector('#send-files');
        const deleteSelectedButton = this.container.querySelector('#delete-selected');

        // Mostrar barra de progreso solo si hay archivos
        this.container.querySelector('#progress-bar').style.display =
            this.filesToUpload.length > 0 ? 'block' : 'none';

        this.filesToUpload.forEach((file, index) => {
            const filePreview = document.createElement('div');
            filePreview.classList.add('file-preview');
            filePreview.setAttribute('data-index', index);

            // Checkbox de selección múltiple
            if (this.options.enableBulkDelete) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('bulk-checkbox');
                checkbox.style.position = 'absolute';
                checkbox.style.left = '10px';
                checkbox.style.top = '10px';
                checkbox.addEventListener('change', () => {
                    const anyChecked = !!this.container.querySelector('.bulk-checkbox:checked');
                    if (deleteSelectedButton) {
                        deleteSelectedButton.disabled = !anyChecked;
                    }
                });
                filePreview.appendChild(checkbox);
            }

            // Miniatura PDF o imagen o ícono genérico
            if (file.type === 'application/pdf') {
                const iframe = document.createElement('iframe');
                iframe.src = URL.createObjectURL(file);
                iframe.style.width = '100%';
                iframe.style.height = '100px';
                filePreview.appendChild(iframe);
            } else if (this.options.thumbnails && file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.style = 'width: 100%; height: 100px; object-fit: cover;';
                filePreview.appendChild(img);
            } else {
                const fileType = file.name.split('.').pop().toLowerCase();
                const iconClass = this.options.iconMap[fileType] || this.options.iconMap.default;
                const fileIcon = document.createElement('div');
                fileIcon.classList.add('file-icon');
                fileIcon.innerHTML = `<i class="${iconClass}"></i>`;
                filePreview.appendChild(fileIcon);
            }

            // Muestra detalles configurables (nombre, tamaño, tipo)
            const detailsContainer = document.createElement('div');
            detailsContainer.classList.add('file-details');
            this.options.showDetails.forEach((detail) => {
                const detailElement = document.createElement('div');
                if (detail === 'name') detailElement.textContent = `${this.getTranslation('name')}: ${file.name}`;
                if (detail === 'size') detailElement.textContent = `${this.getTranslation('size')}: ${this.formatFileSize(file.size)}`;
                if (detail === 'type') detailElement.textContent = `${this.getTranslation('type')}: ${file.type}`;
                detailsContainer.appendChild(detailElement);
            });

            // Botón de eliminación de archivo individual
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-file');
            deleteButton.innerHTML = this.getTranslation('deleteButton');
            deleteButton.addEventListener('click', () => {
                this.filesToUpload.splice(index, 1);
                this.displayFileInfo(fileInfo);
                this.options.onDelete(file);
                if (sendFilesButton) {
                    sendFilesButton.disabled = this.filesToUpload.length === 0;
                    sendFilesButton.classList.toggle('d-none', this.filesToUpload.length === 0);
                }
                if (deleteSelectedButton) {
                    deleteSelectedButton.disabled = true;
                    deleteSelectedButton.classList.toggle('d-none', this.filesToUpload.length === 0);
                }
                // Reiniciar el valor del input file para permitir la selección del mismo archivo nuevamente
                const fileInput = this.container.querySelector('#file-upload');
                fileInput.value = '';
            });

            if (deleteSelectedButton) {
                deleteSelectedButton.classList.toggle('d-none', this.filesToUpload.length === 0);
                deleteSelectedButton.disabled = true;
            }

            filePreview.append(detailsContainer, deleteButton);
            fileInfo.appendChild(filePreview);
        });

        if (this.options.enableBulkDelete && deleteSelectedButton) {
            deleteSelectedButton.onclick = () => {
                const selectedIndexes = Array.from(this.container.querySelectorAll('.bulk-checkbox:checked'))
                    .map(cb => parseInt(cb.closest('.file-preview').dataset.index));
                
                const filesToDelete = selectedIndexes.map(i => this.filesToUpload[i]);
        
                this.filesToUpload = this.filesToUpload.filter((_, i) => !selectedIndexes.includes(i));
        
                this.displayFileInfo(fileInfo); // Refrescar
                this.options.onBulkDelete(filesToDelete); // Callback
                if (sendFilesButton) {
                    sendFilesButton.disabled = this.filesToUpload.length === 0;
                    sendFilesButton.classList.toggle('d-none', this.filesToUpload.length === 0);
                }
                deleteSelectedButton.disabled = true;
                deleteSelectedButton.classList.toggle('d-none', this.filesToUpload.length === 0);
                const message = filesToDelete.length === 1 
                    ? `${filesToDelete.length}  ${this.getTranslation('fileDeleted')}` 
                    : `${filesToDelete.length} ${this.getTranslation('filesDeleted')}`;
                toastr.info(message);
                
                // Reiniciar el valor del input file para permitir la selección del mismo archivo nuevamente
                const fileInput = this.container.querySelector('#file-upload');
                fileInput.value = '';
            };
        }
    }

    // Convierte el tamaño del archivo a KB, MB o GB
    formatFileSize(sizeInBytes) {
        if (sizeInBytes >= 1024 ** 3) return `${(sizeInBytes / (1024 ** 3)).toFixed(2)} GB`;
        if (sizeInBytes >= 1024 ** 2) return `${(sizeInBytes / (1024 ** 2)).toFixed(2)} MB`;
        return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    }

    // Procesamiento manual de la cola
    processQueue() {
        this.uploadFiles();
    }

    // Carga todos los archivos en cola al servidor usando XMLHttpRequest
    uploadFiles() {
        if (this.filesToUpload.length === 0) {
            toastr.error(this.getTranslation('noFilesSelected'));
            return;
        }
    
        const progressBarFill = this.container.querySelector('#progress-bar-fill');
        const fileInfo = this.container.querySelector('#file-info');
        const sendFilesButton = this.container.querySelector('#send-files');
        const deleteSelectedButton = this.container.querySelector('#delete-selected');
    
        progressBarFill.style.width = '0%';
        progressBarFill.setAttribute('aria-valuenow', '0');
    
        // UI: Desactivar botones y mostrar spinner
        if (sendFilesButton) {
            sendFilesButton.disabled = true;
            sendFilesButton.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> ${this.getTranslation('uploadButton')}`;
        }
        if (deleteSelectedButton) deleteSelectedButton.disabled = true;
    
        const filePreviews = this.container.querySelectorAll('.file-preview');
    
        this.filesToUpload.forEach((file, index) => {
            const xhr = new XMLHttpRequest();
            xhr.open(this.options.method, this.options.uploadUrl, true);
    
            // Overlay de "subiendo"
            const currentPreview = filePreviews[index];
            currentPreview.classList.add('uploading');
    
            // Evento de progreso
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    progressBarFill.style.transition = 'width 0.5s ease';
                    progressBarFill.style.width = `${percentComplete}%`;
                    progressBarFill.setAttribute('aria-valuenow', percentComplete.toString());
                    this.options.onProgress(percentComplete, file);
                }
            });
    
            xhr.addEventListener('load', () => {
                const statusIcon = document.createElement('div');
                statusIcon.classList.add('file-status-icon');
    
                if (xhr.status === 200) {
                    toastr.success(this.getTranslation('successMessage', { fileName: file.name }));
                    statusIcon.innerHTML = `<i class="fas fa-check-circle text-success"></i>`;
                    this.options.onSuccess(file);
                } else {
                    toastr.error(this.getTranslation('errorMessage', { fileName: file.name }));
                    statusIcon.innerHTML = `<i class="fas fa-times-circle text-danger"></i>`;
                    this.options.onError(file);
                }
    
                currentPreview.appendChild(statusIcon);
                currentPreview.classList.remove('uploading');
    
                // Al finalizar el último archivo, restaurar interfaz
                if (index === this.filesToUpload.length - 1) {
                    this.filesToUpload = [];
                    this.displayFileInfo(fileInfo);
                    if (sendFilesButton) {
                        sendFilesButton.disabled = false;
                        sendFilesButton.innerHTML = this.getTranslation('uploadButton');
                        sendFilesButton.classList.toggle('d-none', this.filesToUpload.length === 0);
                    }
                    if (deleteSelectedButton) {
                        deleteSelectedButton.disabled = false;
                        deleteSelectedButton.classList.toggle('d-none', this.filesToUpload.length === 0);
                    }
                    progressBarFill.style.width = '0%';
                    progressBarFill.setAttribute('aria-valuenow', '0');
                    this.container.querySelector('#progress-bar').style.display = 'none';
                }
            });
    
            // FormData con soporte para `additionalData`
            const formData = new FormData();
            const fieldName = this.options.fileFieldName || 'file';
            formData.append(fieldName, file);
    
            const extraData = typeof this.additionalData === 'function' ? this.additionalData() : this.additionalData;
            if (typeof extraData === 'object') {
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
        const translation = this.options.translations[this.options.language][key] || key;
        return translation.replace(/{(\w+)}/g, (_, placeholder) => placeholders[placeholder] || '');
    }

    // Permite añadir o sobrescribir un idioma
    addLanguage(languageCode, translations) {
        if (this.options.translations[languageCode]) {
            console.warn(`El idioma '${languageCode}' ya existe. Las traducciones serán actualizadas.`);
        }
        this.options.translations[languageCode] = translations;
    }
}

// Exportar clase para usarla como módulo
export default FileUploader;
