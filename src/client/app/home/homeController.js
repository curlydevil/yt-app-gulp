(function () {
    "use strict";

    angular
        .module("ytApp")
        .controller("HomeController", ["$scope", "playlistService", "$state", HomeController]);

    function HomeController($scope, playlistService, $state) {
        var vm = this;
        vm.playlistService = playlistService;
        vm.selectedPlaylist = {};
        vm.selectedPlaylistItem = {};
        vm.isVideoInCurrentPlaylist = true;
        vm.searchText='';

        vm.getSearchResult = function(){
            if(vm.searchText !== ''){
                $state.go('home.search', {searchText: vm.searchText});
            }
        };

        playlistService.playlistsPromise.then(function(){
            if (vm.playlistService.playlists.length) {
                vm.setCurrentPlaylist(vm.playlistService.playlists[0]);
            }
        });

        vm.addToPlaylist = function () {
            var newItem = {id: vm.selectedPlaylistItem};

            playlistService.addItemToPlaylist(vm.selectedPlaylist, newItem)
                .then(checkIsVideoInCurrentPlaylist);
        };

        vm.removeFromPlaylist = function (item) {
            var itemToDelete = {id: item? item.id : vm.selectedPlaylistItem.id};

            playlistService.removeItemFromPlaylist(vm.selectedPlaylist, itemToDelete)
                .then(checkIsVideoInCurrentPlaylist);
        };

        var checkIsVideoInCurrentPlaylist = function () {
            var result = true;
            if(vm.selectedPlaylist){
                result = _.findIndex(vm.selectedPlaylist.items, function (item) {
                    return item.snippet.resourceId.videoId === vm.selectedPlaylistItem.videoId;
                }) !== -1 ;
            }
            vm.isVideoInCurrentPlaylist = result;
        };

        vm.setCurrentPlaylist = function (playlist) {
            if (!vm.selectedPlaylist || vm.selectedPlaylist.id !== playlist.id) {
                $scope.selectedPlaylist = playlist;
                vm.selectedPlaylist = playlist;
                if(!playlist.items.length){
                    playlistService.fillPlaylistItems(playlist)
                        .then(function () {
                            if(playlist.items.length)
                                vm.setCurrentPlaylistItem(playlist.items[0]);
                        }
                    );
                } else {
                    vm.setCurrentPlaylistItem(playlist.items[0]);
                }
            }
        };

        vm.setCurrentPlaylistItem = function(playlistItem){
            if(playlistItem){
                vm.selectedPlaylistItem.title = playlistItem.snippet.title;
                vm.selectedPlaylistItem.src = 'https://www.youtube.com/embed/' + playlistItem.snippet.resourceId.videoId + '?list=' + playlistItem.snippet.playlistId;
                vm.selectedPlaylistItem.videoId = playlistItem.snippet.resourceId.videoId;
                vm.selectedPlaylistItem.id = playlistItem.id;
            } else {
                vm.selectedPlaylistItem.title = 'video not found';
                vm.selectedPlaylistItem.src = '';
                vm.selectedPlaylistItem.videoId = '';
                vm.selectedPlaylistItem.id = '';
            }
            checkIsVideoInCurrentPlaylist();
        };

        vm.currentView = function(){
            return $state.current.name;
        };

        var prevView;

        vm.toggleEdit = function(){
            if(vm.isEditMode()){
                $state.go(!prevView || prevView == 'home.edit' ? 'home.player' : prevView);
            }
            else{
                prevView = vm.currentView();
                $state.go('home.edit');
            }
        };

        vm.isEditMode = function(){
            return vm.currentView() == 'home.edit';
        };
    }
}());
