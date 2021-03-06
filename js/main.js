var app = angular.module('myApp', ['ngRoute']);

app.config(function ($routeProvider) {
   $routeProvider
       .when('/', {
       templateUrl : 'templates/home.html',
       controller: 'HomeController'
   })
       .when('/settings', {
           templateUrl : 'templates/settings.html',
           controller: 'SettingsController'
       })
       .otherwise({
           redirectTo: '/'
       })
});

app.service('mailService', ['$http', '$q', function($http, $q) {
    var getMail = function() {
        return $http({
            method: 'GET',
            url: 'bin/data/mail.json'
        });
    };

    var sendEmail = function(mail) {
        var d = $q.defer();
        $http({
            method: 'POST',
            data: mail,
            url: 'api/send'
        }).success(function (data) {
            d.resolve(data);
        })
        .error(function (data) {
            d.reject(data);
        });
        return d.promise;
    };

    return {
        getMail: getMail,
        sendEmail : sendEmail
    }
}]);

app.controller('HomeController', function($scope) {
    $scope.selectedMail;

    $scope.setSelectedMail = function(mail) {
        $scope.selectedMail = mail;
    };

    $scope.isSelected = function(mail) {
        if($scope.selectedMail) {
            return $scope.selectedMail === mail;
        }
    };
});

app.directive('emailListing', function() {
    var imageUrl = "https://gravatar.com/avatar";
    return {
        restrict: 'EA',
        replace: false,
        scope: {
            email: '=',
            action: '&',
            gravatarSize: '@'

        },
        templateUrl: 'templates/emailListing.html',
        controller: ['$scope', '$element', '$attrs', '$transclude',
            function($scope, $element, $attrs, $transclude) {
                $scope.handleClick = function() {
                    $scope.action({selectedMail: $scope.email})
                };
            }
        ],
        link: function(scope, iElement, iAttrs, controller) {
            scope.gravatarImage = imageUrl;
            iElement.bind('click', function() {
                iElement.parent().children().removeClass('selected');
               iElement.addClass('selected');
            });
        }
    }
});

app.controller('MailListingController', ['$scope', 'mailService', function($scope, mailService) {
    $scope.email = [];

    mailService.getMail()
        .success(function(data, status, headers) {
            $scope.email = data;
        })
        .error(function() {

        })

}]);

app.controller('ContentController',['$scope', '$rootScope', 'mailService', function($scope, $rootScope, mailService) {
    $scope.showingReply = false;
    $scope.reply= {};

    $scope.toggleReplyForm = function() {
        $scope.showingReply = !$scope.showingReply;
        $scope.reply= {};
        $scope.reply.to = $scope.selectedMail.from;
        $scope.reply.body = "\n\n------------\n\n" + $scope.selectedMail.body;
    };

    $scope.sendReply = function() {
        $scope.showingReply = false;
        $rootScope.loading = true;
        mailService.sendEmail($scope.reply)
           .then(function(status) {
                $rootScope.loading = false;
           }, function(err) {
                $rootScope.loading = false ;
           })
    };

    $scope.$watch("selectedMail", function(evt) {
        $scope.showingReply = false;
        $scope.reply = {};
    });

}]);

app.controller('SettingsController', function ($scope) {
    $scope.settings = {
        name : 'Name',
        email: 'hello@example.com'
    };
    $scope.updateSettings = function() {
        console.log('updateSettings was called');
    }
});
