class FileUploader {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID '${containerId}' not found.`);
            return;
        }

        // Configuración predeterminada
        this.options = Object.assign(
            {
                language: 'es', // Idioma predeterminado
                translations: {
                    es: {
                        dragDropText: 'Arrastra y suelta los archivos aquí, o',
                        chooseFile: 'elige un archivo',
                        uploadButton: 'Subir Archivos',
                        deleteButton: '<i class="fas fa-trash"></i> Eliminar',
                        maxFilesError: 'Solo puedes subir un máximo de {maxFiles} archivos.',
                        fileSizeError: 'El archivo {fileName} excede el tamaño máximo de {maxFileSize} KB.',
                        fileTypeError: 'Tipo de archivo no permitido: {fileType}.',
                        successMessage: '¡Archivo {fileName} subido con éxito!',
                        errorMessage: 'Error al subir el archivo {fileName}.',
                        noFilesSelected: 'No se han seleccionado archivos.',
                    },
                    en: {
                        dragDropText: 'Drag and drop files here, or',
                        chooseFile: 'choose a file',
                        uploadButton: 'Upload Files',
                        deleteButton: '<i class="fas fa-trash"></i> Delete',
                        maxFilesError: 'You can upload a maximum of {maxFiles} files.',
                        fileSizeError: 'File {fileName} exceeds the maximum size of {maxFileSize} KB.',
                        fileTypeError: 'File type not allowed: {fileType}.',
                        successMessage: 'File {fileName} uploaded successfully!',
                        errorMessage: 'Error uploading file {fileName}.',
                        noFilesSelected: 'No files selected.',
                    },
                },

                fileFieldName: 'file', // Nombre predeterminado del campo de archivo
                additionalData: {},   // Datos adicionales
                allowedFileTypes: ['jpg', 'png', 'pdf'],
                maxFileSize: 2048,
                maxFiles: 5,
                autoUpload: false,
                uploadUrl: 'upload.php',
                deleteButtonText: '<i class="fas fa-trash"></i> Eliminar',
                showDetails: ['name', 'size', 'type'],
                thumbnails: true,
                iconMap: {
                    pdf: 'fas fa-file-pdf',
                    docx: 'fas fa-file-word',
                    xlsx: 'fas fa-file-excel',
                    default: 'fas fa-file-alt',
                },
                onSuccess: () => {},
                onError: () => {},
                onProgress: () => {},
                onDelete: () => {},
            },
            options
        );

        this.filesToUpload = [];
        this.init();
    }

    init() {
        this.renderUploader();
        this.addEventListeners();
    }

    renderUploader() {
        this.container.innerHTML = `
            <div class="upload-container">
                <p>
                    <i class="fas fa-cloud-upload-alt"></i> ${this.getTranslation('dragDropText')}
                    <label for="file-upload" class="text-primary">
                        <i class="fas fa-folder-open"></i> ${this.getTranslation('chooseFile')}
                    </label>
                </p>
                <input type="file" id="file-upload" multiple accept="${this.options.allowedFileTypes
                    .map((type) => `.${type}`)
                    .join(',')}">
                <button id="upload-button" class="btn btn-primary" style="display: none;">
                    <i class="fas fa-upload"></i> ${this.getTranslation('uploadButton')}
                </button>
                <div class="progress mt-3" id="progress-bar" style="display: none;">
                    <div class="progress-bar progress-bar-fill" id="progress-bar-fill" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div class="file-info" id="file-info"></div>
            </div>
        `;
    }

    addEventListeners() {
        const fileInput = this.container.querySelector('#file-upload');
        const uploadContainer = this.container.querySelector('.upload-container');
        const uploadButton = this.container.querySelector('#upload-button');

        uploadContainer.addEventListener('dragover', (event) => {
            event.preventDefault();
            uploadContainer.classList.add('dragover');
        });

        uploadContainer.addEventListener('dragleave', () => {
            uploadContainer.classList.remove('dragover');
        });

        uploadContainer.addEventListener('drop', (event) => {
            event.preventDefault();
            uploadContainer.classList.remove('dragover');
            const newFiles = Array.from(event.dataTransfer.files);
            this.handleFileSelection(newFiles);
        });

        fileInput.addEventListener('change', (event) => {
            const newFiles = Array.from(event.target.files);
            this.handleFileSelection(newFiles);
        });

        uploadButton.addEventListener('click', () => this.uploadFiles());
    }

    handleFileSelection(newFiles) {
        const fileInfo = this.container.querySelector('#file-info');
    
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
            if (!this.options.allowedFileTypes.includes(fileType)) {
                toastr.error(this.getTranslation('fileTypeError', { fileType }));
                return;
            }
    
            // Convertir el tamaño máximo a megabytes para la comparación
            if (file.size / (1024 * 1024) > this.options.maxFileSize) {
                toastr.error(this.getTranslation('fileSizeError', { fileName: file.name, maxFileSize: this.options.maxFileSize }));
                return;
            }
    
            this.filesToUpload.push(file);
        });
    
        this.displayFileInfo(fileInfo);
    
        if (this.options.autoUpload) {
            this.uploadFiles();
        }
    }    

    displayFileInfo(fileInfo) {
        fileInfo.innerHTML = '';
        if (this.filesToUpload.length > 0) {
            this.container.querySelector('#upload-button').style.display = 'block';
            this.container.querySelector('#progress-bar').style.display = 'block';
        } else {
            this.container.querySelector('#upload-button').style.display = 'none';
            this.container.querySelector('#progress-bar').style.display = 'none';
        }

        this.filesToUpload.forEach((file, index) => {
            const filePreview = document.createElement('div');
            filePreview.classList.add('file-preview');
            filePreview.setAttribute('data-index', index);

            if (file.type === 'application/pdf') {
                const iframe = document.createElement('iframe');
                iframe.src = URL.createObjectURL(file);
                iframe.style.width = '100%';
                iframe.style.height = '100px';
                filePreview.appendChild(iframe);
            } else if (this.options.thumbnails && file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.alt = file.name;
                img.style.width = '100%';
                img.style.height = '100px';
                img.style.objectFit = 'cover';
                filePreview.appendChild(img);
            } else {
                const fileIcon = document.createElement('div');
                const fileType = file.name.split('.').pop().toLowerCase();
                const iconClass = this.options.iconMap[fileType] || this.options.iconMap.default;
                fileIcon.innerHTML = `<i class="${iconClass}"></i>`;
                fileIcon.classList.add('file-icon');
                filePreview.appendChild(fileIcon);
            }

            const detailsContainer = document.createElement('div');
            detailsContainer.classList.add('file-details');
            this.options.showDetails.forEach((detail) => {
                const detailElement = document.createElement('div');
                if (detail === 'name') {
                    detailElement.textContent = `Nombre: ${file.name}`;
                } else if (detail === 'size') {
                    detailElement.textContent = `Tamaño: ${this.formatFileSize(file.size)}`;
                } else if (detail === 'type') {
                    detailElement.textContent = `Tipo: ${file.type}`;
                }
                detailsContainer.appendChild(detailElement);
            });

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-file');
            deleteButton.innerHTML = this.getTranslation('deleteButton');
            deleteButton.addEventListener('click', () => {
                this.filesToUpload.splice(index, 1);
                this.displayFileInfo(fileInfo);
                this.options.onDelete(file);
            });

            filePreview.append(detailsContainer, deleteButton);
            fileInfo.appendChild(filePreview);
        });
    }
    
    formatFileSize(sizeInBytes) {
        if (sizeInBytes >= 1024 ** 3) {
            // Tamaño en GB
            return `${(sizeInBytes / (1024 ** 3)).toFixed(2)} GB`;
        } else if (sizeInBytes >= 1024 ** 2) {
            // Tamaño en MB
            return `${(sizeInBytes / (1024 ** 2)).toFixed(2)} MB`;
        } else {
            // Tamaño en KB
            return `${(sizeInBytes / 1024).toFixed(2)} KB`;
        }
    }
    
    uploadFiles() {
        if (this.filesToUpload.length === 0) {
            toastr.error(this.getTranslation('noFilesSelected'));
            return;
        }

        const progressBarFill = this.container.querySelector('#progress-bar-fill');
        progressBarFill.style.width = '0%';
        progressBarFill.setAttribute('aria-valuenow', '0');

        this.filesToUpload.forEach((file, index) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.options.uploadUrl, true);

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
                if (xhr.status === 200) {
                    toastr.success(this.getTranslation('successMessage', { fileName: file.name }));
                    this.options.onSuccess(file);
                } else {
                    toastr.error(this.getTranslation('errorMessage', { fileName: file.name }));
                    this.options.onError(file);
                }
                if (index === this.filesToUpload.length - 1) {
                    this.filesToUpload = [];
                    this.displayFileInfo(this.container.querySelector('#file-info'));
                }
            });

            const formData = new FormData();

            // Usa el nombre dinámico del campo
            const fieldName = this.options.fileFieldName || 'file';
            formData.append(fieldName, file);

            for (const key in this.options.additionalData) {
                if (this.options.additionalData.hasOwnProperty(key)) {
                    formData.append(key, this.options.additionalData[key]);
                }
            }
            
            xhr.send(formData);
        });
    }

    getTranslation(key, placeholders = {}) {
        const translation = this.options.translations[this.options.language][key] || key;
        return translation.replace(/{(\w+)}/g, (_, placeholder) => placeholders[placeholder] || '');
    }
    
    addLanguage(languageCode, translations) {
        if (this.options.translations[languageCode]) {
            console.warn(`El idioma '${languageCode}' ya existe. Las traducciones serán actualizadas.`);
        }
        this.options.translations[languageCode] = translations;
    }
    
}

export default FileUploader;
