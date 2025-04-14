import FileUploader from './fileUploader.js';

const uploader = new FileUploader('upload-container', {
    allowedFileTypes: ['xlsx', 'xls', 'csv'],
    maxFileSize: 10,
    maxFiles: 10,
    autoProcessQueue: false,
    uploadUrl: 'controller/ajax.forms.php',
    deleteButtonText: '<i class="fas fa-times"></i>',
    showDetails: ['name', 'size'], // Detalles a mostrar
    thumbnails: true, // Activar thumbnails
    fileFieldName: 'fileStudent',
    iconMap: {
        xlsx: 'fas fa-file-excel',
        default: 'fas fa-file-excel',
    },
    language: 'es',
    translations: {
        es: {
            dragDropText: 'Suelta aquí tu archivo Excel o CSV (solo se permite uno), o',
            chooseFile: 'elige un archivo',
            uploadButton: 'Subir Archivos',
            deleteButton: '<i class="fal fa-times"></i>',
            maxFilesError: 'Solo puedes subir un máximo de {maxFiles} archivos.',
            fileSizeError: 'El archivo {fileName} excede el tamaño máximo de {maxFileSize} MB.',
            fileTypeError: 'Tipo de archivo no permitido: {fileType}.',
            successMessage: '¡Archivo {fileName} subido con éxito!',
            errorMessage: 'Error al subir el archivo {fileName}.',
            noFilesSelected: 'No se han seleccionado archivos.',
        }
    },

    onSuccess: (file) => {},
    onError: (file) => {},
    onProgress: (percent, file) => {},
    onDelete: (file) => {},
});

$('#send-files').on('click', function() {
    uploader.additionalData = { action: 'upload files student', user: 1};
    uploader.processQueue();
});