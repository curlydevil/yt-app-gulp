(function () {
    'use strict';

    angular
        .module('ytApp')
        .factory('PubSub', ['$rootScope', PubSub]);

    function PubSub($rootScope) {
        function subscribe(topic, func) {
            var cleanUpFunc = $rootScope.$on(topic, function (e, args) {
                func(args);
            });

            //call this func to unsuscribe from event
            //      $scope.$on('$destroy', function() {
            //        cleanUpFunc();
            //      });
            return cleanUpFunc;
        }

        function publish(topic, args) {
            $rootScope.$emit(topic, args);
        }

        return {
            subscribe: subscribe,
            publish: publish
        };
    }
}());
