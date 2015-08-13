(function () {
    'use strict';

    angular
        .module('ytApp')
        .controller('WelcomeController', ['$scope', 'authorizationService', WelcomeController]);

    function WelcomeController($scope, authorizationService) {
        var vm = this;
        vm.isLoggedIn = authorizationService.isLoggedIn();
    }
}());
