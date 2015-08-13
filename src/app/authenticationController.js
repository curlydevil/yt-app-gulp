(function () {
    'use strict';

    angular
        .module('ytApp')
        .controller('AuthenticationController', ['$scope', '$state',
                                                 'authorizationService', 'PubSub',
                                                 AuthenticationController]);

    function AuthenticationController($scope, $state, authorizationService, PubSub) {
        var vm = this;
        vm.isLoggedIn = false;
        vm.userInfo = {};

        vm.isCollapsed = true;

        authorizationService.checkAuth().then(function () {
            PubSub.publish('loggedIn', true);
            loadUserInfo();
        });

        var redirectUser = function () {
            if (authorizationService.isLoggedIn()) {
                PubSub.publish('loggedIn', true);
                $state.go('home.player');
            } else {
                $state.go('welcome');
            }
        };

        var loadUserInfo = function () {
            if (!vm.userInfo.fullName) {
                var userData = authorizationService.getUser();
                vm.userInfo.fullName = userData.name;
                vm.userInfo.picture = userData.picture;
            }
        };

        vm.logIn = function () {
            authorizationService.login()
                .then(loadUserInfo)
                .then(redirectUser);
        };

        vm.logOut = function () {
            authorizationService.logOut()
                .error(function (data) {
                    PubSub.publish('loggedIn', false);
                    $state.go('welcome');

                });
            PubSub.publish('loggedIn', true);
        };

        vm.isActive = function (stateName) {
            return $state.current.name === stateName;
        };

        var cleanUpFunc = PubSub.subscribe('loggedIn', function (isLoggedIn) {
            vm.isLoggedIn = isLoggedIn;
        });

        $scope.$on('$destroy', function () {
            cleanUpFunc();
        });
    }
}());
