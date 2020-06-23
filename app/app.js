const app = angular.module("myApp", []);


const _appCtrl = function($scope, $http, $timeout, $filter){

	$scope.studentsList		= [];
	$scope.questionsList	= [];
	$scope.pptList 			= [];

	$scope.dateTimeNow = $filter("date")(new Date(), 'yyyy-MM-dd HH_mm_ss');

	$scope.studentsListFiles	= [];
	$scope.questionsListFiles	= [];

	$scope.resetPage = function(){
		$scope.studentsList		= [];
		$scope.questionsList	= [];
		$scope.pptList 			= [];

		$scope.dateTimeNow = $filter("date")(new Date(), 'yyyy-MM-dd HH_mm_ss');

		$scope.studentsListFiles	= [];
		$scope.questionsListFiles	= [];
	};

	$scope.uploadStudentsCSV = function (){

		var form_data = new FormData();
		angular.forEach(studentsCSVFiles, function (file) {
		    form_data.append('fileToUpload', file);
		});
		$http.post(
			'api/routes.php?action=students',
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
				if(!apiResponse.complete){
					$scope.studentsList = [];
					swal("Failed", apiResponse.message, "error");
					return;
				}

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
		
		var form_data = new FormData();
		angular.forEach(questionsCSVFiles, function (file) {
		    form_data.append('fileToUpload', file);
		});
		$http.post(
			'api/routes.php?action=questions',
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
				if(!apiResponse.complete){
					$scope.studentsList = [];
					swal("Failed", apiResponse.message, "error");
					return;
				}

				$scope.questionsList = apiResponse.result;
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
		
		$scope.studentsList.forEach(function(student){

			var pptObject = {
				name 		: student,
				questions	: []
			};			

			$scope.questionsList.forEach(function(category){
				var noQuestions = category.length;

				if(noQuestions){
					var randomQuestion = category[Math.floor(Math.random() * noQuestions)];
					pptObject.questions.push(randomQuestion);
				}
			});

			$scope.pptList.push(pptObject);
		});

		if($scope.pptList.length){
			swal("", `Successfully assigned questions for ${$scope.pptList.length} students. Scroll Down to check and generate PPTs`, "success");
		}
	};

	$scope.createDownloadPPTs = function(){
		$scope.downloadCount = 0;
		var seconds = 1;
		$scope.pptList.forEach(function(ppt){
			$timeout(function(){
				$scope.createPPT(ppt);	
			}, seconds*1000)
			seconds += 3;
		});
	}

	$scope.createPPT = function(ppt){

		const pptx = new PptxGenJS();

		ppt.questions.forEach(function(question){
			let opts = {
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
				opts
			);
		});

		pptx.writeFile(`${$scope.dateTimeNow} ${ppt.name}`);

		$scope.downloadCount++;

		if($scope.downloadCount==$scope.pptList.length){
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

var studentsCSVFiles, questionsCSVFiles;

app.directive("fileInput", function ($parse) {
	return {
		link: function ($scope, element, attrs) {
			element.on("change", function (event) {
				var files = event.target.files;				
				$parse(attrs.fileInput).assign($scope, files);

				files[attrs.fileInput] = files;
				if(attrs.fileInput=="studentsCSV"){
					studentsCSVFiles = files;
				}
				else{
					questionsCSVFiles = files;
				}
				$scope.$apply();
			});
		}
	}
});