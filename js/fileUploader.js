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
                allowedFileTypes: ['jpg', 'png', 'pdf'], // Tipos de archivo permitidos
                maxFileSize: 2048, // Tamaño máximo del archivo (KB)
                maxFiles: 5, // Número máximo de archivos
                autoUpload: false, // Subida automática al seleccionar
                uploadUrl: 'upload.php', // URL para subir archivos
                deleteButtonText: '<i class="fas fa-trash"></i> Eliminar', // Botón de eliminar (editable)
                showDetails: ['name', 'size', 'type'], // Detalles a mostrar
                thumbnails: true, // Mostrar thumbnails para imágenes
                iconMap: { // Mapear tipos de archivo a iconos
                    pdf: 'fas fa-file-pdf',
                    docx: 'fas fa-file-word',
                    xlsx: 'fas fa-file-excel',
                    default: 'fas fa-file-alt',
                },
                onSuccess: () => {}, // Callback al subir un archivo correctamente
                onError: () => {}, // Callback al ocurrir un error
                onProgress: () => {}, // Callback para progreso
                onDelete: () => {}, // Callback al eliminar un archivo
            },
            options
        );

        this.filesToUpload = [];
        this.init();
    }

    init() {
        // Renderiza la interfaz del uploader
        this.renderUploader();
        this.addEventListeners();
    }

    renderUploader() {
        this.container.innerHTML = `
            <div class="upload-container">
                <p><i class="fas fa-cloud-upload-alt"></i> Arrastra y suelta los archivos aquí, o 
                    <label for="file-upload" class="text-primary">
                        <i class="fas fa-folder-open"></i> elige un archivo
                    </label>
                </p>
                <input type="file" id="file-upload" multiple accept="${this.options.allowedFileTypes
                    .map((type) => `.${type}`)
                    .join(',')}">
                <button id="upload-button" class="btn btn-primary" style="display: none;"><i class="fas fa-upload"></i> Subir Archivos</button>
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
            toastr.error(`Solo puedes subir un máximo de ${this.options.maxFiles} archivos.`);
            return;
        }

        newFiles.forEach((file) => {
            const fileType = file.name.split('.').pop().toLowerCase();
            if (!this.options.allowedFileTypes.includes(fileType)) {
                toastr.error(`Tipo de archivo no permitido: ${fileType}`);
                return;
            }
            if (file.size / 1024 > this.options.maxFileSize) {
                toastr.error(`El archivo ${file.name} excede el tamaño máximo de ${this.options.maxFileSize} KB.`);
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

            if (this.options.thumbnails && file.type.startsWith('image/')) {
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
                    detailElement.textContent = `Tamaño: ${(file.size / 1024).toFixed(2)} KB`;
                } else if (detail === 'type') {
                    detailElement.textContent = `Tipo: ${file.type}`;
                }
                detailsContainer.appendChild(detailElement);
            });

            // Botón de eliminar
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-file');
            deleteButton.innerHTML = this.options.deleteButtonText;
            deleteButton.addEventListener('click', () => {
                this.filesToUpload.splice(index, 1);
                this.displayFileInfo(fileInfo);
                this.options.onDelete(file); // Callback al eliminar
            });

            filePreview.append(detailsContainer, deleteButton);
            fileInfo.appendChild(filePreview);
        });
    }

    uploadFiles() {
        if (this.filesToUpload.length === 0) {
            toastr.error('No se han seleccionado archivos.');
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
                    toastr.success(`¡Archivo ${file.name} subido con éxito!`);
                    this.options.onSuccess(file);
                } else {
                    toastr.error(`Error al subir el archivo ${file.name}.`);
                    this.options.onError(file);
                }
                if (index === this.filesToUpload.length - 1) {
                    this.filesToUpload = [];
                    this.displayFileInfo(this.container.querySelector('#file-info'));
                }
            });

            const formData = new FormData();
            formData.append('file', file);
            xhr.send(formData);
        });
    }
}

export default FileUploader;
