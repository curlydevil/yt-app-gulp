(function () {
    'use strict';
    var app = angular.module('ytApp', [
                                        'common.services',
                                        'ui.router',
                                        'ui.bootstrap',
                                        'directives'
                                    ]);

    app.config(['$stateProvider', '$urlRouterProvider', '$sceDelegateProvider',
        function ($stateProvider, $urlRouterProvider, $sceDelegateProvider) {

            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                'https://www.youtube.com/**',
                'https://youtu.be/**',
                'https://accounts.google.com/**'
            ]);

            $urlRouterProvider.otherwise('/home/player');

            $stateProvider
                .state('welcome', {
                    url: '/',
                    templateUrl: 'src/app/welcome/welcomeView.html',
                    controller: 'WelcomeController',
                    controllerAs: 'vm'
                })
                .state('home', {
                    abstract: true,
                    url: '/home',
                    templateUrl: 'src/app/home/homeView.html',
                    controller: 'HomeController',
                    controllerAs: 'vm',
                    resolve: {
                        authCheck: function (authorizationService, $state) {
                            return authorizationService
                                .checkAuth()
                                .then(function () {
                                        authorizationService
                                            .setAuthToken();
                                    },
                                    function () {
                                        $state.go('welcome');
                                    });
                        }
                    }
                })
                .state('home.player', {
                    url: '/player',
                    templateUrl: 'src/app/home/player/playerView.html',
                    controller: 'PlayerController',
                    controllerAs: 'vm'
                })
                .state('home.search', {
                    url: '/search/:searchText',
                    templateUrl: 'src/app/home/search/searchView.html',
                    controller: 'SearchController',
                    controllerAs: 'vm'
                })
                .state('home.edit', {
                    url: '/edit',
                    templateUrl: 'src/app/home/edit/editView.html',
                    controller: 'EditController',
                    controllerAs: 'vm'
                });
        }]);
}());
