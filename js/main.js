import FileUploader from './fileUploader.js';

const uploader = new FileUploader('upload-container', {
    allowedFileTypes: ['jpg', 'png', 'pdf', 'docx', 'xlsx'],
    maxFileSize: 4096,
    maxFiles: 10,
    autoUpload: false,
    uploadUrl: 'upload.php',
    deleteButtonText: '<i class="fas fa-times"></i>',
    showDetails: ['name', 'size', 'type'],
    thumbnails: true,
    iconMap: {
        pdf: 'fas fa-file-pdf',
        docx: 'fas fa-file-word',
        xlsx: 'fas fa-file-excel',
        default: 'fas fa-file-alt',
    },
    language: 'en',
    onSuccess: (file) => console.log(`¡Archivo subido!: ${file.name}`),
    onError: (file) => console.error(`Error al subir ${file.name}`),
    onProgress: (percent, file) => console.log(`Subiendo ${file.name}: ${percent}%`),
    onDelete: (file) => console.log(`Archivo eliminado: ${file.name}`),
});

// Agregar un nuevo idioma (ejemplo en francés)
uploader.addLanguage('fr', {
    dragDropText: 'Glissez et déposez vos fichiers ici, ou',
    chooseFile: 'choisissez un fichier',
    uploadButton: 'Télécharger les fichiers',
    deleteButton: '<i class="fas fa-trash"></i> Supprimer',
    maxFilesError: 'Vous ne pouvez télécharger qu’un maximum de {maxFiles} fichiers.',
    fileSizeError: 'Le fichier {fileName} dépasse la taille maximale de {maxFileSize} KB.',
    fileTypeError: 'Type de fichier non autorisé : {fileType}.',
    successMessage: 'Fichier {fileName} téléchargé avec succès!',
    errorMessage: 'Erreur lors du téléchargement du fichier {fileName}.',
    noFilesSelected: 'Aucun fichier sélectionné.',
});

// Cambiar al idioma recién agregado
uploader.options.language = 'fr';
uploader.renderUploader();
