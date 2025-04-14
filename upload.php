<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file'])) {
        $file = $_FILES['file'];
        $uploadDir = 'uploads/';

        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $destination = $uploadDir . basename($file['name']);
        if (move_uploaded_file($file['tmp_name'], $destination)) {
            echo "File uploaded successfully.";
        } else {
            echo "Error uploading file.";
        }
    }
}