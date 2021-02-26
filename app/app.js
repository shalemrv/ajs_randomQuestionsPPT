const app = angular.module("myApp", []);


const shuffleSwap = (arr) => {
	for (var i = arr.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		let temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
}

const _appCtrl = function($scope, $http, $timeout, $filter){
	
	$scope.imagesList		= [];
	$scope.studentsList		= [];
	$scope.questionsList	= [];

	$scope.imagesUploading	= false;

	$scope.pptList 			= [];

	$scope.qGroup	= -1;
	$scope.qIndex	= -1;
	$scope.qTitle	= "";
	$scope.qPath 	= "";

	$scope.downloading		= false;
	$scope.parsingStudents	= false;
	$scope.parsingQuestions	= false;

	$scope.downloadProgress	= 0;
	$scope.downloadingStudent = "";

	$scope.dateTimeNow = "";

	$scope.studentsListFiles	= [];
	$scope.questionsListFiles	= [];

	// Testing only

	// $scope.studentsList		= ["Jean King","Peter Ferguson","Janine Labrune","Jonas Bergulfsen","Susan Nelson","Zbyszek Piestrzeniewicz","Roland Keitel","Julie Murphy","Kwai Lee","Diego Freyre","Christina Berglund","Jytte Petersen","Mary Saveley","Eric Natividad","Jeff Young","Kelvin Leong","Juri Hashimoto","Wendy Victorino","Veysel Oeztan","Keith Franco","Isabel de","Martine Rance","Marie Bertrand","Jerry Tseng"];
	// $scope.imagesList		= ["uploads/test/20200712085444_0.jpg","uploads/test/20200712085444_1.gif","uploads/test/20200712085444_2.jpg","uploads/test/20200712085444_3.jpg","uploads/test/20200712085444_4.jpg","uploads/test/20200712085444_5.jpg"];
	
	$scope.resetPage = function(){
		$scope.studentsList		= [];
		$scope.questionsList	= [];
		$scope.pptList 			= [];
		$scope.downloading 		= false;
		$scope.downloadProgress	= 0;
		$scope.downloadingStudent = "";

		$scope.studentsListFiles	= [];
		$scope.questionsListFiles	= [];

		$scope.resetImageAssign();
	};

	$scope.resetImageAssign = function (){
		$scope.qGroup	= -1;
		$scope.qIndex	= -1;
		$scope.qTitle	= "";
		$scope.qPath 	= "";
	};

	$scope.clearJunk =  function(){
		$http.get("api/routes.php?action=clear").then(
			function(apiResponse){
				console.log("Old filed cleared");
			}
		);
	};

	$scope.clearJunk();

	$scope.uploadMultipleImage = function (){
		if(!qImageFiles){
			return;
		}

		$scope.imagesUploading	= true;

		var form_data = new FormData();
		var totalFiles = 0;

		angular.forEach(qImageFiles, function (file, ind) {
		    form_data.append(`fileToUpload${ind}`, file);
		    totalFiles++;
		});
		
		form_data.append(`totalFiles`, totalFiles);

		$http.post(
			"api/routes.php?action=image",
			form_data,
			{
			    transformRequest: angular.identity,
			    headers: {
			        'Content-Type': undefined,
			        'Process-Data': false
			    }
			}
		).then(
			function(httpResponse){
				var apiResponse = httpResponse.data;

				$scope.imagesUploading	= false;

				if(!apiResponse.complete){
					$scope.studentsList = [];
					swal({
						icon : "error",
						title: "Failed!",
						text: apiResponse.message,
						timer: 1500,
						showConfirmButton: false
					});
					return;
				}

				$("#closeImagesUploadModal").click();

				qImageFiles= [];

				apiResponse.result.forEach(function(image){
					$scope.imagesList.push(image);
				});


				swal({
					icon : "success",
					title: "Success",
					text: apiResponse.message,
					timer: 1000,
					showConfirmButton: false
				});
			},
			function (httpResponse) {
				$scope.studentsList = [];
				swal("Failed", `HTTP Code - ${httpResponse.status} : Error occured on server`, "error");
			}
		);
	};

	$scope.uploadStudentsCSV = function (){

		if(!studentsCSVFiles){
			return;
		}

		$scope.parsingStudents	= true;

		var form_data = new FormData();
		angular.forEach(studentsCSVFiles, function (file) {
		    form_data.append('fileToUpload', file);
		});
		$http.post(
			"api/routes.php?action=students",
			form_data,
			{
			    transformRequest: angular.identity,
			    headers: {
			        'Content-Type': undefined,
			        'Process-Data': false
			    }
			}
		).then(
			function(httpResponse){
				var apiResponse = httpResponse.data;

				$scope.parsingStudents	= false;

				if(!apiResponse.complete){
					$scope.studentsList = [];
					swal("Failed", apiResponse.message, "error");
					return;
				}

				$("#closeStudentsUploadModal").click();

				$scope.studentsList = apiResponse.result;
				swal("", apiResponse.message, "success");
			},
			function (httpResponse) {
				$scope.studentsList = [];
				swal("Failed", `HTTP Code - ${httpResponse.status} : Error occured on server`, "error");
			}
		);
	};

	$scope.uploadQuestionsCSV = function () {

		if(!questionsCSVFiles){
			return;
		}

		$scope.parsingQuestions	= true;
		
		var form_data = new FormData();
		angular.forEach(questionsCSVFiles, function (file) {
		    form_data.append('fileToUpload', file);
		});
		$http.post(
			"api/routes.php?action=questions",
			form_data,
			{
			    transformRequest: angular.identity,
			    headers: {
			        'Content-Type': undefined,
			        'Process-Data': false
			    }
			}
		).then(
			function (httpResponse) {
				var apiResponse = httpResponse.data;
				$scope.parsingQuestions	= false;
				if(!apiResponse.complete){
					swal("Failed", apiResponse.message, "error");
					return;
				}

				$scope.questionsList = apiResponse.result.questions;

				$scope.questionsCount = apiResponse.result.count; 

				swal("", apiResponse.message, "success");
			},
			function (httpResponse) {
				$scope.studentsList = [];
				swal("Failed", `HTTP Code - ${httpResponse.status} : Error occured on server`, "error");
			}
		);
	};

	$scope.assignQuestions = function(){
		$scope.pptList = [];
		
		var gKeysList = Object.keys($scope.questionsList);


		$scope.studentsList.forEach(function(student){

			console.log(`student - ${student}`);
			console.log("gKeysList");
			console.log(gKeysList);

			var pptObject = {
				name 		: student,
				questions	: []
			};

			gKeysList.forEach(function(gKey){
				var qKeysList = Object.keys($scope.questionsList[gKey]);
				var noQuestions = qKeysList.length;

				if(noQuestions){
					var randomKey = qKeysList[Math.floor(Math.random() * noQuestions)];
					var randomQuestion = $scope.questionsList[gKey][randomKey];
					pptObject.questions.push(randomQuestion);
				}
			});

			$scope.pptList.push(pptObject);
		});

		console.log($scope.pptList);
		if($scope.pptList.length){
			swal("", `Successfully assigned questions for ${$scope.pptList.length} students. Scroll Down to check and generate PPTs`, "success");
		}
	};

	$scope.initAssignImage = function(qGroup, qIndex, qTitle, qPath){
		console.log(`initAssignImage(${qGroup}, ${qIndex}, ${qTitle}, ${qPath})`);
		$scope.qGroup	= qGroup;
		$scope.qIndex	= qIndex;
		$scope.qTitle	= qTitle;
		$scope.qPath 	= qPath;
		console.log(`initAssignImage(${$scope.qGroup}, ${$scope.qIndex}, ${$scope.qTitle}, ${$scope.qPath})`);
	};

	$scope.assignImage = function(path){
		$scope.qPath = path;
		$scope.questionsList[`${$scope.qGroup}`][`${$scope.qIndex}`].image = path;

		console.log("assignImage");
		console.log($scope.questionsList[`${$scope.qGroup}`][`${$scope.qIndex}`]);
		console.log($scope.questionsList[`${$scope.qGroup}`]);
	};

	$scope.createDownloadIndPPTs = function(){

		$("#downloadModal").modal({
			backdrop: 'static',
			keyboard: false
		});

		$scope.dateTimeNow = $filter("date")(new Date(), 'yyyyMMdd_HHmmss');

		swal("", "If your broswer prompts to grant permission to download multiple files. Please click on ALLOW.", "info").then(
			function(){
				$scope.downloading = true;
				$scope.downloadProgress = 0;
				$scope.downloadCount = 0;
				$scope.totalDownloads = $scope.studentsList.length * $scope.questionsList.length;

				// $("#downloadModal").modal("show");
				
				var seconds = 1;
				$scope.pptList.forEach(function(ppt){
					$timeout(function(){
						$scope.generateIndPPT(ppt);	
					}, seconds*1000)
					seconds += 6;
				});
			}
		);
	};

	$scope.generateIndPPT = function(ppt){

		$scope.downloadingStudent = ppt.name;
		ppt.questions.forEach(function(question, index){
			let pptx = new PptxGenJS();
			let titleOpts = {
				x: 0.0,
				y: 0.25,
				w: '100%',
				h: 1.5,
				align: 'center',
				fontSize: 24,
				color: '0088CC',
				fill: 'F1F1F1'
			};
			pptx.addSlide().addText(
				question,
				titleOpts
			);

			pptx.writeFile(`${ppt.name} Q${index + 1} ${$scope.dateTimeNow}`);
			$scope.downloadCount++;

			$scope.downloadProgress = $scope.downloadCount * 100 / $scope.totalDownloads;
		});		

		if($scope.downloadCount==($scope.pptList.length*$scope.questionsList.length)){
			$("#downloadModal").modal("hide");
			swal("", `Downloaded ${$scope.downloadCount} PPTs. Check your Downloads Folder`);
		}
	}

	$scope.createDownloadPPTs = function(){		

		$scope.dateTimeNow = $filter("date")(new Date(), 'yyyyMMdd_HHmmss');

		swal("", "If your broswer prompts to grant permission to download multiple files. Please click on ALLOW.", "info").then(
			function(){
				$scope.downloading = true;
				$scope.downloadProgress = 0;
				$scope.downloadCount = 0;
				$scope.totalDownloads = $scope.studentsList.length;

				$("#downloadModal").modal({
					backdrop: 'static',
					keyboard: false
				});

				var seconds = 0;
				$scope.pptList.forEach(function(ppt){
					$timeout(function(){
						$scope.generatePPT(ppt);	
					}, seconds*1000)
					seconds += 2;
				});
			}
		);
	};

	$scope.generatePPT = function(ppt){
		
		let pptx		= new PptxGenJS();
		let titleOpts 	= {
			x			: 0,
			y			: 0.25,
			w			: '100%',
			h			: 1.5,
			align		: 'center',
			fontSize	: 24,
			color		: '000000',
			fill		: 'F1F1F1'
		};

		let subQuesOpts	= {
			x			: 4,
			y			: 2,
			w			: 5.5,
			h			: 3.3,
			fontSize	: 12,
			color		: '000000',
			fill		: 'FFFFFF'
		};

		let subQuestionsCombined = "";

		$scope.downloadingStudent = ppt.name;
		ppt.questions.forEach(function(question, index){
			let slide	= pptx.addSlide();
			

			slide.addText(
				question.title,
				titleOpts
			);

			if(question.image.length){
				slide.addImage({
					path	: question.image,
					x		: 0.25,
					y		: 2,
					w		: 3.3,
					h		: 3.3,
					sizing	: {
						type	: 'contain',
						w		: 3.3,
						h		: 3.3
					}
				});			
			}

			if(question.subQuestions.length){
				slide.addText(
					question.subQuestions.map(function(sQ, i){ return `${i+1}. ${sQ}`}).join("\n\n"),
					subQuesOpts
				);
			}
		});

		// pptx.writeFile(`${ppt.name}-${$scope.dateTimeNow}`);
		pptx.writeFile(ppt.name);
		$scope.downloadCount++;

		$scope.downloadProgress = $scope.downloadCount * 100 / $scope.totalDownloads;

		if($scope.downloadCount==($scope.pptList.length)){
			$("#downloadModal").modal("hide");
			swal("", `Downloaded ${$scope.downloadCount} PPTs. Check your Downloads Folder`);
		}
	}
};

app.controller(
	"appCtrl",
	[
		"$scope",
		"$http",
		"$timeout",
		"$filter",
		_appCtrl
	]
);

var studentsCSVFiles, questionsCSVFiles, qImageFiles;

app.directive("fileInput", function ($parse) {
	return {
		link: function ($scope, element, attrs) {
			element.on("change", function (event) {
				var files = event.target.files;				
				$parse(attrs.fileInput).assign($scope, files);

				files[attrs.fileInput] = files;

				switch(attrs.fileInput){
					case "qImages"		: qImageFiles		= files; break;
					case "studentsCSV"	: studentsCSVFiles 	= files; break;
					case "questionsCSV"	: questionsCSVFiles	= files; break;
				}

				$scope.$apply();
			});
		}
	}
});
