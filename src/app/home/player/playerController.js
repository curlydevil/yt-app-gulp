(function () {
    'use strict';

    angular
        .module('ytApp')
        .controller('PlayerController', ['playlistService', PlayerController]);

    function PlayerController(playlistService) {
        var vm = this;
        vm.playlistService = playlistService;
        vm.removeFromPlaylist = removeFromPlaylist;
        vm.addToPlaylist = addToPlaylist;
        vm.checkIsVideoInCurrentPlaylist = checkIsVideoInCurrentPlaylist;

        function removeFromPlaylist() {
            playlistService.removeItemFromPlaylist(playlistService.selectedPlaylist(), {
                id: playlistService.selectedPlaylistitem().id
            });
        }

        function addToPlaylist() {
            var videoId = playlistService.selectedPlaylistitem().snippet.resourceId.videoId;

            playlistService.addItemToPlaylist(playlistService.selectedPlaylist(), videoId)
                .then(function () {
                    playlistService.selectPlaylistitem(playlistService.selectedPlaylist().items[0]);
                });
        }

        function checkIsVideoInCurrentPlaylist() {
            var selectedPl = playlistService.selectedPlaylist();
            var selectedPlItem = playlistService.selectedPlaylistitem();
            if (selectedPl && selectedPlItem) {
                return playlistService.isItemInPlayList(
                    selectedPl,
                    selectedPlItem.snippet.resourceId.videoId
                );
            }
        }
    }
}());
