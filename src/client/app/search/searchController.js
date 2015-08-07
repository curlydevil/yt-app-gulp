(function(){
    "use strict";

    angular
        .module("ytApp")
        .controller("SearchController", ["$q", "playlistService", "$scope", "searchResource", "$stateParams", SearchController]);

    function SearchController($q, playlistService, $scope, searchResource, $stateParams){
        var vm = this;
        vm.playlistService = playlistService;
        vm.searchResult =[];
        vm.searchText = $stateParams.searchText;

        var performSearch = function(){
            searchResource.query({q: vm.searchText}, function (data) {
                vm.searchResult = $.map(data.items, function(searchResultItem){return searchResultItem.id.kind === "youtube#channel" ? null : searchResultItem});
                var promise = $scope.selectedPlaylist.items.length ? $q.when([]) : playlistService.fillPlaylistItems($scope.selectedPlaylist);
                promise.then(function(playlistWithItems){
                    if(!$scope.selectedPlaylist.items.length)
                        $scope.selectedPlaylist.items = playlistWithItems.items;
                    for (var i = 0; i < vm.searchResult.length; i++) {
                        vm.searchResult[i].alreadyInList = isVideoInList(vm.searchResult[i]);
                    }
                });
            });
        };

        function isVideoInList(searchItem){
            return itemIndexInPlaylist(searchItem) !== -1;
        }

        vm.addToPlayList = function(searchItem){
            var index = itemIndexInPlaylist(searchItem);

            if(index === -1){
                playlistService.addItemToPlaylist($scope.selectedPlaylist, searchItem)
                    .then(function(){
                    searchItem.alreadyInList = isVideoInList(searchItem);
                });
            }
        };

        var itemIndexInPlaylist = function(searchItem){
            return _.findIndex($scope.selectedPlaylist.items, function (item) {
                return item.snippet.resourceId.videoId === searchItem.id.videoId;
            });
        };

        vm.removeFromPlayList = function(searchItem){
            var index = itemIndexInPlaylist(searchItem);

            if(index !== -1 && searchItem.alreadyInList){
                playlistService.removeItemFromPlaylist($scope.selectedPlaylist, $scope.selectedPlaylist.items[index])
                    .then(function videoRemovedFromPlaylist(data){
                    searchItem.alreadyInList = isVideoInList(searchItem);
                });
            }
        };

        playlistService.playlistsPromise.then(function(){
            performSearch();
        });
    }
}());
