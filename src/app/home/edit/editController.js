(function () {
    'use strict';
    angular.module('ytApp').controller('EditController', ['playlistService', EditController]);

    function EditController(playlistService) {
        var vm = this;
        vm.newPlaylist = {
            snippet: {
                title: '',
                description: ''
            },
            addMode: false
        };

        vm.playlistService = playlistService;

        vm.addNewPlaylistAccept = function () {
            playlistService.addPlaylist(vm.newPlaylist);
            vm.toggleAddPlaylist();
        };

        vm.addNewPlaylistReject = function () {
            vm.toggleAddPlaylist();
        };

        vm.removePlaylist = function (playlist) {
            playlistService.removePlaylist(playlist);
        };

        vm.toggleAddPlaylist = function () {
            if (!vm.newPlaylist.addMode) {
                vm.newPlaylist.snippet.title = '';
                vm.newPlaylist.snippet.description = '';
                vm.newPlaylist.addMode = true;
            } else {
                vm.newPlaylist.addMode = false;
            }
        };

        vm.togglePlaylistEdit = function (playlist) {
            if (!playlist.editMode) {
                playlist.snippet.originTitle = playlist.snippet.title;
                playlist.snippet.originDescription = playlist.snippet.description;
                playlist.editMode = true;
            } else {
                playlist.editMode = false;
            }
        };

        vm.playlistChangesAccept = function (playlist) {
            playlistService.updatePlaylist(playlist)
                .then(function playlistUpdated(data) {
                    vm.togglePlaylistEdit(playlist);
                }, function playlistNotUpdated(data) {
                    vm.playlistChangesReject();
                });
        };

        vm.playlistChangesReject = function (playlist) {
            playlist.snippet.title = playlist.snippet.originTitle;
            playlist.snippet.description = playlist.snippet.originDescription;
            vm.togglePlaylistEdit(playlist);
        };

    }
}());
