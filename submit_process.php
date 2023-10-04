<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>
        Annotation and Marking App
    </title>
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet" />
    <link rel="stylesheet" href="main.css">
</head>

<body>
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

    // Allowed tags and attributes for sanitization
    $Tags = '<p><span><div><br><strong><em>';
    $Attributes = 'style';

    // Check if POST parameter exists
    if (isset($_POST["annotatedtext"])) {
        if (isset($_POST["Level"])) {


            $annotatedText = $_POST["annotatedtext"];
            $sanitizedAnnotatedText = strip_tags($annotatedText, $Tags . $Attributes); // raw input

            # filling time stamp column in essay input
            $time_stamp = date("Y-m-d H:i:s");

            $level = $_POST["Level"];

            
            // Retrieve teacher_id from session, default to empty string if not set
            $teacher_id = isset($_SESSION['Teacher_id']) ? $_SESSION['Teacher_id'] : '';

            $student_id = $_POST["studid"];

            $sub_skill = "unspecified";

            $prefix_EI = "EII_";
            $select_id = "SELECT ID FROM `Scribii`.Essay_input";

            $select_id_result = @mysqli_query($conn, $select_id);

            while($IDs = mysqli_fetch_array($select_id_result)){
                $ID_arry[] = $IDs["ID"];
            }
            $last_EI_id = end($ID_arry);
            $EssayINPUTID = $prefix_EI .($last_EI_id + 1);


            $input_query = "insert into `Scribii`.Essay_input(Essay_input_id, Student_id, Time_stamp, Essay_input, Essay_level, Teacher_id) values(? ,? ,?, ?, ?, ?)";
            $Protected_query = $conn->prepare($input_query);
            $Protected_query->bind_param("ssssss", $EssayINPUTID, $student_id, $time_stamp, $sanitizedAnnotatedText, $level, $teacher_id);

            if ($Protected_query->execute()) {
                echo "<p>db connected and submitted a result</p>";

                // Retrieve the last inserted ID (essay_input_id)
                $essay_input_id = $conn->insert_id;

                // Remove opening and closing <p> tags
                $sanitizedAnnotatedText = preg_replace('/^<p>|<\/p>$/', '', $sanitizedAnnotatedText);

                // Match content within <span> tags with background color
                preg_match_all('/<span style="background-color: rgb\((\d{1,3}, \d{1,3}, \d{1,3})\);">(.*?)<\/span>/s', $sanitizedAnnotatedText, $matches);

                $ss_col = array(
                    "255, 182, 193" => "Propositional Phrase",
                    "255, 215, 0" => "Transition",
                    "173, 216, 230" => "Proper Noun",
                    "255, 99, 71" => "Sub Conjunction",
                    "152, 251, 152" => "Pronoun"
                );
            
                $annotatedSentences = $matches[2];
                $colors = $matches[1];

                if (isset($colors[0]) && isset($ss_col[$colors[0]])) {
                    $sub_skill = $ss_col[$colors[0]];
                }

                $prefix_AI = "ANI_";
                $select_Anno_id = "SELECT ID FROM `Scribii`.Annotation";
                $select_id_anno_result = @mysqli_query($conn, $select_Anno_id);

                while($anno_IDs = mysqli_fetch_array($select_id_anno_result)){
                    $ID_anno_arry[] = $anno_IDs["ID"];
                }
                $last_AII_id = end($ID_anno_arry);
                $AnnoINPUTID = $prefix_AI .($last_AII_id + 1);

                // Insert each annotated sentence into the Annotation table
                $annotationQuery = "INSERT INTO `Scribii`.Annotation(Essay_input_id, Annotation_id, Annotated_text, Sub_skill, Sub_skill_rgb_color) VALUES(?, ?, ?, ?, ?)";
                if ($annotationStmt = $conn->prepare($annotationQuery)) {
                    foreach ($annotatedSentences as $index => $sentence) {
                        $annotationStmt->bind_param("sssss", $essay_input_id, $AnnoINPUTID, $sentence, $sub_skill, $colors[$index]);
                        $annotationStmt->execute();
                    }
                    $annotationStmt->close();
                } else {
                    echo "Error: " . $conn->error;
                    error_log("Annotation Insertion Error: " . $conn->error);
                }
            } else {
                echo "Error: " . $Protected_query->error;
                error_log("Statement Error: " . $Protected_query->error);
            }
            $Protected_query->close();
        }
        else {
            echo "Error: POST parameter 'Entire level' is missing.";
            error_log("Error: POST parameter 'Level' is missing.");
        }
    }
    else {
        echo "Error: POST parameter 'annotatedtext' is missing.";
        error_log("Error: POST parameter 'annotatedtext' is missing.");
    }

    mysqli_close($conn);

    ?>

    <a href="annotation.html">Annotation page</a>
</body>

</html>
