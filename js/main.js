import FileUploader from './fileUploader.js';

const uploader = new FileUploader('upload-container', {
    allowedFileTypes: ['jpg', 'png', 'pdf', 'docx', 'xlsx'],
    maxFileSize: 4096,
    maxFiles: 10,
    autoUpload: false,
    uploadUrl: 'upload.php',
    deleteButtonText: '<i class="fas fa-times"></i>',
    showDetails: ['name', 'size', 'type'], // Detalles a mostrar
    thumbnails: true, // Activar thumbnails
    iconMap: {
        pdf: 'fas fa-file-pdf',
        docx: 'fas fa-file-word',
        xlsx: 'fas fa-file-excel',
        default: 'fas fa-file-alt',
    },
    onSuccess: (file) => console.log(`¡Archivo subido!: ${file.name}`),
    onError: (file) => console.error(`Error al subir ${file.name}`),
    onProgress: (percent, file) => console.log(`Subiendo ${file.name}: ${percent}%`),
    onDelete: (file) => console.log(`Archivo eliminado: ${file.name}`),
});
