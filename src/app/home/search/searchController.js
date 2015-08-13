(function () {
    'use strict';

    angular
        .module('ytApp')
        .controller('SearchController', SearchController);

    SearchController.$inject = ['$q', '$stateParams', 'PubSub',
                                'playlistService', 'SearchResource'];

    function SearchController($q, $stateParams, PubSub, playlistService, SearchResource) {
        var vm = this;

        vm.searchResult = [];
        vm.playlistService = playlistService;
        vm.searchText = $stateParams.searchText;
        vm.addToPlayList = addToPlayList;
        vm.removeFromPlayList = removeFromPlayList;

        PubSub.subscribe('playlist.selected', onPlayListSelected);

        var performSearch = function () {
            SearchResource.query({
                q: vm.searchText
            }, onSearchResult);
        };

        function onSearchResult(data) {
            vm.searchResult = filterYoutubeChannelsAndPlaylists(data.items);
            if (playlistService.selectedPlaylist()) {
                addAlreadyInPlaylistProp();
            } else {
                if (playlistService.playlists.length) {
                    humane.log('Select a playlist first');
                }
            }
        }

        function filterYoutubeChannelsAndPlaylists(items) {
            var arr = [];
            items.forEach(function (item) {
                if (item.id.kind === 'youtube#video') {
                    arr.push(item);
                }
            });
            return arr;
        }

        function onPlayListSelected() {
            if (vm.searchResult && _.any(vm.searchResult, function (item) {
                    return !item.alreadyInList;
                })) {
                addAlreadyInPlaylistProp();
            }
        }

        function addAlreadyInPlaylistProp() {
            vm.searchResult.forEach(function (item) {
                item.alreadyInList = alreadyInListBinder(item);
            });
        }

        function isVideoInList(searchItem) {
            return playlistService.isItemInPlayList(
                playlistService.selectedPlaylist(),
                searchItem.id.videoId
            );
        }

        function addToPlayList(searchItem) {
            if (!playlistService.selectedPlaylist()) {
                if (playlistService.playlists.length) {
                    humane.log('Select a playlist first');
                } else {
                    humane.log('For a start - add at least one playlist');
                }
            } else {
                if (!isVideoInList(searchItem)) {
                    playlistService.addItemToPlaylist(
                        playlistService.selectedPlaylist(),
                        searchItem.id.videoId
                    );
                }
            }
        }

        function alreadyInListBinder(item) {
            return function () {
                return isVideoInList(item);
            };
        }

        function itemIndexInPlaylist(searchItem) {
            return _.findIndex(playlistService.selectedPlaylist().items, function (item) {
                return item.snippet.resourceId.videoId === searchItem.id.videoId;
            });
        }

        function removeFromPlayList(searchItem) {
            var index = itemIndexInPlaylist(searchItem);

            if (index !== -1 && searchItem.alreadyInList()) {
                playlistService.removeItemFromPlaylist(playlistService.selectedPlaylist(),
                    playlistService.selectedPlaylist().items[index]);
            }
        }

        playlistService.playlistsPromise.then(function () {
            performSearch();
        });
    }
}());
