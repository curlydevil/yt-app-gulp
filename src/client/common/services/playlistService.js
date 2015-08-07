(function(){
    angular.module("ytApp").service("playlistService", ["playlistResource", "playlistitemsResource", playlistService]);

    function playlistService(playlistResource, playlistitemsResource){
        var svc = this;

        svc.playlists = [];
        svc.playlistsPromise;

        function loadPlaylists(){
            svc.playlistsPromise = playlistResource.query(function playlistsLoadedCallback(data){
                svc.playlists = data.items;
                for (var i = 0; i < svc.playlists.length; i++) {
                    svc.playlists[i].items = [];
                }
            }).$promise;
        }
        loadPlaylists();

        svc.addPlaylist = function (playlist) {
            var newitem = new playlistResource();
            newitem.snippet = playlist.snippet;

            return playlistResource.save(newitem).$promise
                .then(function playlistAdded(data){
                data.items = [];
                svc.playlists.splice(0, 0, data);
            }, function playlistNotAdded(data){

            });
        };

        svc.removePlaylist = function (playlist) {
            if(!confirm('Are you sure you want to remove playlist?'))
                return;

            var deletingItem = new playlistResource();
            deletingItem.id = playlist.id;

            return playlistResource.delete(deletingItem).$promise
                .then(function playlistRemoved(data){
                var indx = _.indexOf(svc.playlists, playlist);
                if(indx!== -1) svc.playlists.splice(indx, 1)
            }, function playlistNotRemoved(data){

            });
        }

        svc.updatePlaylist = function (playlist) {
            var updatingItem = new playlistResource();
            updatingItem.id = playlist.id;
            updatingItem.snippet = playlist.snippet;

            return playlistResource.update(updatingItem).$promise;
        };

        svc.addItemToPlaylist = function (playlist, item) {
            var newitem = new playlistitemsResource();
            newitem.snippet = {
                playlistId : playlist.id,
                resourceId : { kind: "youtube#video", videoId: item.id.videoId}
            };

            return playlistitemsResource.save(newitem, function itemAddedToPlaylist(data) {
                var indx = _.indexOf(svc.playlists, playlist);
                if(indx !== -1) svc.playlists[indx].items.splice(0, 0, data);
            },function itemNotAddedToPlaylist(data){

            }).$promise;
        };

        svc.removeItemFromPlaylist = function (playlist, item) {
            var deleteItem = new playlistitemsResource();
            deleteItem.id = item.id;

            return playlistitemsResource.delete(deleteItem, function itemRemovedFromPlaylist() {
                var playlistIndx = _.indexOf(svc.playlists, playlist);
                if(playlistIndx!== -1){
                    var itemIndx = _.findIndex(svc.playlists[playlistIndx].items,
                                               function (playlistItem) {
                        return playlistItem.id === deleteItem.id;
                    });
                    if(itemIndx !== -1) svc.playlists[playlistIndx].items.splice(itemIndx, 1);
                }
            },function itemNotRemovedFromPlaylist(data){

            }).$promise;
        };

        svc.fillPlaylistItems = function (playlist) {
            return playlistitemsResource.query({playlistId: playlist.id}, function (data) {
                var indx = getPlaylistIndex(playlist);
                svc.playlists[indx].items = data.items;
            }).$promise;
        }

        var getPlaylistIndex = function(searchItem){
            return _.findIndex(svc.playlists, function (playlist) {
                return playlist.id === searchItem.id;
            });
        };
    };
}());
