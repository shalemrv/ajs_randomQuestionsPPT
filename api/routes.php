<?php

	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	header("Access-Control-Allow-Methods: POST");
	header("Access-Control-Max-Age: 3600");
	header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

	date_default_timezone_set("Asia/Kolkata");

	error_reporting(0);

	$finalResponse = array(
		"complete"  => false,
		"message"   => "Invalid Request."
	);

	session_start();

	$actionType = (isset($_GET["action"]))? $_GET["action"] : "";

	$actionHandler = new ActionHandler();

	switch($actionType) {
		case 'image':
			$finalResponse = $actionHandler->uploadImages();
			break;

		case 'students':
			$finalResponse = $actionHandler->processStudents();
			break;

		case 'questions':
			$finalResponse = $actionHandler->processQuestions();
			break;

		case 'clear':
			$finalResponse = $actionHandler->deletePreviousUploads();
	}	

	exit(json_encode($finalResponse));

	class ActionHandler{

		function uploadImages(){
			$finalResponse = array(
				"complete"  => false,
				"message"   => "No File Received."
			);

			if(empty($_FILES)){
				return $finalResponse;
			}

			$totalFiles = $_POST['totalFiles'];

			$relativePathsList 	= array();
			
			$errorMessages 	= array();
			
			$errorsPresent 			= false;
			$anyUploadSuccessful	= false;

			$dateTimeNow = date("YmdHis");

			for($i=0; $i < $totalFiles; $i++){

				$currentFile = $_FILES["fileToUpload$i"];
				
				$filename	= $currentFile["tmp_name"];
				$fName		= $currentFile["name"];
				$cFileName	= $currentFile["name"];
				$fileType	= $currentFile["type"];
				
				if($currentFile["size"] == 0){
					$errorsPresent 	= true;
					array_push($errorMessages, "$fName : File seems to be empty.\n");
					continue;
				}

				if($currentFile["size"] > 2*1024*1024){
					$errorsPresent 	= true;
					array_push($errorMessages, "$fName : File size cannot be more 2MB.\n");
					continue;
				}

				$destination = session_id();
				$destination = "{$_SERVER['DOCUMENT_ROOT']}/uploads/{$destination}";

				if(!file_exists($destination)){
					mkdir($destination, 0777, true);
					$logTime = date("Y-m-d H:i:s");
					$logId = session_id();
					$cLog = fopen('created.log', 'a');
					fwrite($cLog, "$logTime - $logId\n");
					fclose($cLog);
				}

				$fType = array_pop(explode(".", $fName));

				$fName = "{$dateTimeNow}_{$i}.{$fType}"; 
				
				$destination = "{$destination}/{$fName}";

				if(!move_uploaded_file($filename, $destination)){
					$errorsPresent 	= true;
					array_push($errorMessages, "$fName : Could not be uploaded.\n");
					continue;
				}

				array_push(
					$relativePathsList,
					str_replace("{$_SERVER['DOCUMENT_ROOT']}/", "", $destination)
				);

				$anyUploadSuccessful = true;
			}

			$errorMessages = implode("", $errorMessages);

			if(!$anyUploadSuccessful){
				$finalResponse = array(
					"complete"  => false,
					"message"   => $errorMessages
				);
			}

			if(!$errorsPresent){
				$errorMessages = "All files were uploaded successfully.";
			}

			$finalResponse = array(
				"complete"  => true,
				"message"   => $errorMessages,
				"result"	=> $relativePathsList
			);

			return $finalResponse;
		}

		function uploadImagesSingle(){
			$finalResponse = array(
				"complete"  => false,
				"message"   => "No File Received."
			);

			if(empty($_FILES)){
				return $finalResponse;
			}

			if($_FILES["fileToUpload"]["size"] == 0){
				$finalResponse["message"] = "File seems to be empty.";
				return $finalResponse;
			}

			if($_FILES["fileToUpload"]["size"] > 2*1024*1024){
				$finalResponse["message"] = "File size cannot be more 2MB.";
				return $finalResponse;
			}

			$filename	= $_FILES["fileToUpload"]["tmp_name"];
			$fName		= $_FILES["fileToUpload"]["name"];
			$cFileName	= $_FILES["fileToUpload"]["name"];
			$fileType	= $_FILES["fileToUpload"]["type"];

			$destination = session_id();
			$destination = "{$_SERVER['DOCUMENT_ROOT']}/uploads/{$destination}";

			if(!file_exists($destination)){
				mkdir($destination, 0777, true);
				$logTime = date("Y-m-d H:i:s");
				$logId = session_id();
				$cLog = fopen('created.log', 'a');
				fwrite($cLog, "$logTime - $logId\n");
				fclose($cLog);
			}

			$fName = explode(".", $fName);

			$fName = date("YmdHis").".".$fName[sizeof($fName) - 1]; 
			
			$destination = "{$destination}/{$fName}";

			$relativePath = str_replace("{$_SERVER['DOCUMENT_ROOT']}/", "", $destination);

			if(move_uploaded_file($filename, $destination)){
				$finalResponse = array(
					"complete"  => true,
					"message"   => "$cFileName was uploaded successfully." ,
					"result"	=> $relativePath
				);				
			}
			else{
				$finalResponse["message"] = "Failed to upload image.";
			}

			return $finalResponse;
		}

		function processStudents(){
			$finalResponse = array(
				"complete"  => false,
				"message"   => "No File Received."
			);

			if(empty($_FILES)){
				return $finalResponse;
			}

			$filename = $_FILES["fileToUpload"]["tmp_name"];
			$fileType = $_FILES["fileToUpload"]["type"];

			$csvMimetypes = array(
				"text/csv",
				"text/plain",
				"application/csv",
				"text/comma-separated-values",
				"application/excel",
				"application/vnd.ms-excel",
				"application/vnd.msexcel",
				"text/anytext",
				"application/octet-stream",
				"application/txt"
			);

			if(!in_array($fileType, $csvMimetypes)) {
				$finalResponse["message"] = "File type must be csv format. Uploaded file type => $fileType";
				return $finalResponse;
			}

			if($_FILES["fileToUpload"]["size"] == 0){
				$finalResponse["message"] = "File seems to be empty.";
				return $finalResponse;
			}

			$csvFileObject = fopen($filename, "r");

			$students = array();

			$rowCount = -1;

			while(($rowArray = fgetcsv($csvFileObject, 10000, ",")) !== FALSE){
				$rowCount++;
				if($rowCount==0){
					continue;
				}

				$sName = explode(" ", $rowArray[1]);

				$sName = array_splice($sName, 0, 2);

				$sName = implode(" ", $sName);			

				array_push($students, $sName);
			}

			if($rowCount<=0){
				$finalResponse["message"] = "Unable to parse the uploaded file. Please check the CSV file and refer to the sample CSV file";
				return $finalResponse;
			}

			$finalResponse = array(
				"complete"  => true,
				"message"   => "File successfully parsed. ".sizeof($students)." students found." ,
				"result"	=> array_unique($students)
			);

			return $finalResponse;
		}

		function processQuestions(){
			$finalResponse = array(
				"complete"  => false,
				"message"   => "No File Received.",
				"files"		=> $_FILES
			);

			if(empty($_FILES)){
				return $finalResponse;
			}

			$filename = $_FILES["fileToUpload"]["tmp_name"];
			$fileType = $_FILES["fileToUpload"]["type"];

			$csvMimetypes = array(
				"text/csv",
				"text/plain",
				"application/csv",
				"text/comma-separated-values",
				"application/excel",
				"application/vnd.ms-excel",
				"application/vnd.msexcel",
				"text/anytext",
				"application/octet-stream",
				"application/txt"
			);

			if(!in_array($fileType, $csvMimetypes)) {
				$finalResponse["message"] = "File type must be csv format. Uploaded file type => $fileType";
				return $finalResponse;
			}

			if($_FILES["fileToUpload"]["size"] == 0){
				$finalResponse["message"] = "File seems to be empty.";
				return $finalResponse;
			}
			
			$csvFileObject = fopen($filename, "r");

			$questionsDataset = array();

			$rowCount = -1;

			while(($rowArray = fgetcsv($csvFileObject, 10000, ",")) !== FALSE){
				$rowCount++;

				$group = $rowArray[0];
				if(!isset($questionsDataset[$group])){
					$questionsDataset[$group] = array();
				}

				array_push(
					$questionsDataset[$group],
					array(
						"title"	=> $rowArray[1],
						"image"	=> ""	
					)
				);
			}

			if($rowCount<=0){
				$finalResponse["message"] = "Unable to parse the uploaded file. Please check the CSV file and refer to the sample CSV file";
				return $finalResponse;
			}

			$questions = array();
			$finalCount = 0;

			foreach ($questionsDataset as $key => $groupQuestions) {
				array_push($questions, $groupQuestions);
				$finalCount += sizeof($groupQuestions);
			}

			$finalResponse = array(
				"complete"  => true,
				"message"   => "File successfully parsed. ".sizeof($questions)." categories & $finalCount questions parsed." ,
				"result"	=> $questions
			);

			return $finalResponse;
		}

		function deletePreviousUploads(){

			$timeNow	= date_create(date("Y-m-d H:i:s"));

			$cLog = fopen('created.log', 'r');

			$result = array();
			
			while( ($line = fgets($cLog)) !== false ){
				$line		= explode(" - ", $line);
				$createdAt	= date_create($line[0]);
				$folderName	= trim($line[1]);

				$diff = $timeNow->diff($createdAt);

				$diff = (intval($diff->h) * 60) + intval($diff->i);

				if($diff > 30){
					array_map('unlink', glob("../uploads/{$folderName}/*.*"));

					if(rmdir("../uploads/{$folderName}/")){
						$cLog = fopen('deleted.log', 'a');
						fwrite($cLog, "{$line[0]} - $folderName\n");
						fclose($cLog);
					}
					array_push($result, "DELETE_{$folderName}_{$line[0]}__{$diff}min");
				}
				else{
					array_push($result, "KEEP_{$folderName}_{$line[0]}__{$diff}min");
				}
			}

			$finalResponse = $result;

			return $finalResponse;
		}
	}


	
?>