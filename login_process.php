<?php
session_start(); // Start the session at the beginning of the file

// Establish a connection to the MySQL database
$servername = "marking-db.cccnwlhhyhlh.us-east-1.rds.amazonaws.com";
$username = "admin";
$password = "Marking123";
$dbname = "Scribii";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

try {
    // Create a new connection to the database
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Check if action is set in POST request
    if (isset($_POST['action']) && $_POST['action'] == 'create') {
        // SQL to insert the new teacher account
        $sql = "INSERT INTO Teacher (Teacher_id, Teacher_password) VALUES (:teacher_id, :teacher_password)";
        $stmt = $conn->prepare($sql);

        // Bind parameters
        $stmt->bindParam(':teacher_id', $_POST['teacher_id'], PDO::PARAM_STR);
        $stmt->bindParam(':teacher_password', $_POST['teacher_password'], PDO::PARAM_STR);

        $stmt->execute();

        // Redirect to the index page
        header("Location: index.html");
    } else {
        // SQL to check the credentials
        $sql = "SELECT * FROM Teacher WHERE Teacher_id = :username AND Teacher_password = :password";
        $stmt = $conn->prepare($sql);

        // Bind parameters
        $stmt->bindParam(':username', $_POST['username'], PDO::PARAM_STR);
        $stmt->bindParam(':password', $_POST['password'], PDO::PARAM_STR);

        $stmt->execute();

        // Check if any row is returned
        if ($stmt->rowCount() > 0) {
            // Start the session and set the username session variable
            session_start();
            $_SESSION['username'] = $_POST['username'];
            
            header("Location: annotation.html");
        } else {
            // error message
            session_start();
            $_SESSION['error'] = "Invalid ID or Password";
            header("Location: index.html");
        }
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
$conn = null;
?>
