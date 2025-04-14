import FileUploader from './fileUploader.js';

const uploader = new FileUploader('loadify', {
    method: 'POST',
    maxFileSize: 10,
    maxFiles: 10,
    autoProcessQueue: false,
    showDetails: ['name', 'size', 'type'],
    thumbnails: true,
    language: 'en',
});