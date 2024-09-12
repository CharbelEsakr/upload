<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$servername = "localhost";
$username = "menathrc_sakr";
$password = "JesusisLord470";
$dbname = "menathrc_office";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$conn->set_charset('utf8');

$request_method = $_SERVER["REQUEST_METHOD"];
switch ($request_method) {
    case 'GET':
        if (!empty($_GET["action"])) {
            $action = $_GET["action"];
            if ($action == "get") {
                $sql = "SELECT * FROM Upload";
                $result = $conn->query($sql);
                $response = array();
                if ($result->num_rows > 0) {
                    while ($row = $result->fetch_assoc()) {
                        array_push($response, $row);
                    }
                }
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
            }
        }
        break;
    

    case 'POST':
        if (!empty($_POST["action"])) {
            $action = $_POST["action"];
            if ($action == "insert") {
                $answer1 = $_POST["answer1"];
                $answer2 = $_POST["answer2"];
                $answer3 = $_POST["answer3"];
                $answer4 = $_POST["answer4"];
                

                // Add other POST variables here

                // Handling file upload
                if (isset($_FILES['attachments'])) {
                    $uploads_dir = 'uploads'; // Make sure this directory exists and is writable
                    $uploaded_files = array();

                    for ($i = 0; $i < count($_FILES['attachments']['tmp_name']); $i++) {
                        if ($_FILES['attachments']['error'][$i] == UPLOAD_ERR_OK) {
                            $tmp_name = $_FILES['attachments']['tmp_name'][$i];
                            $name = basename($_FILES['attachments']['name'][$i]);
                            $uploaded_file_path = $uploads_dir . '/' . $name;

                            if (move_uploaded_file($tmp_name, $uploaded_file_path)) {
                                $uploaded_files[] = $name;
                            } else {
                                echo json_encode(array("status" => "error", "message" => "Failed to move uploaded file from {$tmp_name} to {$uploaded_file_path}. Error code: " . $_FILES['attachments']['error'][$i] . ". Check write permissions for the 'uploads' directory and ensure the file is valid."), JSON_UNESCAPED_UNICODE);
                                exit;
                            }
                        } else {
                            if ($_FILES['attachments']['error'][$i] != UPLOAD_ERR_NO_FILE) {
                                echo json_encode(array("status" => "error", "message" => "Error in uploading file. Error code: " . $_FILES['attachments']['error'][$i]), JSON_UNESCAPED_UNICODE);
                                exit;
                            }
                        }
                    }
                    $attachments = implode(',', $uploaded_files);
                } else {
                    $attachments = "";
                }

                $sql = "INSERT INTO Upload (answer1, answer2, answer3, answer4) VALUES (?, ?, ?, ?)"; //4
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ssss",$answer1, $answer2, $answer3, $answer4); //4 Bind other parameters here
                // Bind other parameters here
                $stmt->execute();
                ob_start();
                    
require '../vendor/autoload.php';

$mail = new PHPMailer(true);

try {
    //Server settings
    $email="charbel.sakr@menathrc.org";
    $FullName = "Sakr";
    $mail->SMTPDebug = 0;
    $mail->isSMTP();
    $mail->CharSet = 'UTF-8';
    $mail->Host       = 'smtp.gmail.com'; // Specify main and backup SMTP servers
    $mail->SMTPAuth   = true;
    $mail->Username   = 'menathrchost@gmail.com';
    $mail->Password   = 'psaryusrmsbovwmt';
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    //Recipients
    $mail->setFrom('menathrchost@gmail.com', 'Mena THRC');
    $mail->addAddress($email);

    //Content
    $mail->isHTML(true);
    $mail->Subject = 'THRC form submitted - Reference #'.$answer1; //.$id;
    $mail->Body    = 'Dear Admins, <br><br>
a form concerning مجموعة الشفاء has been submitted now<br>
<br>
 MENA THRC Host <br><br>'.'<img src="./THRC.jpeg" alt="logo icon" />';
    
    $mail->AltBody = 'Dear Admins, 
    \na form concerning مجموعة الشفاء has been submitted now<br>
<br>
 MENA THRC Host '.'<img src="./THRC.jpeg" alt="logo icon" />';

    $mail->send();
    echo 'Message has been sent';
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
$email_message = ob_get_clean();
                    
                    
                    echo json_encode(array("status" => "success", "message" => "Data submitted successfully!", "redirect" => "./thank.png"));

                $stmt->close();

            }
        }
        break;


    default:
        header("HTTP/1.0 405 Method Not Allowed");
        break;
    
}


$conn->close();

?>