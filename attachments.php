<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
header("Content-Type: application/json");

// Set the upload directory
$uploadDir = 'uploads/';

if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $chunk = isset($_FILES['chunk']) ? $_FILES['chunk'] : null;
    $filename = isset($_POST['filename']) ? $_POST['filename'] : null;
    $totalChunks = isset($_POST['totalChunks']) ? (int)$_POST['totalChunks'] : 0;
    $chunkIndex = isset($_POST['chunkIndex']) ? (int)$_POST['chunkIndex'] : 0;

    if (!$chunk || !$filename || $totalChunks <= 0 || $chunkIndex < 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request']);
        exit();
    }

    // Generate a unique identifier for the file
    $fileIdentifier = md5($filename);

    // Create a directory for the file if it doesn't exist
    $fileDir = $uploadDir . $fileIdentifier . '/';
    if (!file_exists($fileDir)) {
        mkdir($fileDir, 0777, true);
    }

    // Save the chunk directly to cloud storage (e.g., Amazon S3)
    $chunkPath = $fileDir . $chunkIndex;
    if (move_uploaded_file($chunk['tmp_name'], $chunkPath)) {
        // Handle successful chunk upload (e.g., log, update progress)
        // No need to buffer chunks in memory

        // Check if all chunks have been uploaded
        if ($chunkIndex === $totalChunks - 1) {
            // All chunks have been uploaded; assemble the file
            $finalFilePath = $fileDir . $filename;

            // Create the final file and write chunks to it
            $finalFile = fopen($finalFilePath, 'wb');
            for ($i = 0; $i < $totalChunks; $i++) {
                $chunkPath = $fileDir . $i;
                $chunkData = file_get_contents($chunkPath);
                fwrite($finalFile, $chunkData);
                unlink($chunkPath); // Remove the individual chunk files
            }
            fclose($finalFile);

            // Clean up the temporary directory
            if (is_dir($fileDir)) {
                $files = array_diff(scandir($fileDir), array('.', '..'));
                if (empty($files)) {
                    rmdir($fileDir);
                }
            }

            echo json_encode(['message' => 'File uploaded successfully']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save chunk']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
