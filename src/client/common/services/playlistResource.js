/**
 * Created by a.ovsiannikov on 7/9/2015.
 */
(function(){
    "use strict";

    angular
        .module("common.services")
        .factory("playlistResource", ["$resource",playlistResource]);

    function playlistResource($resource) {
        return $resource(
                "https://content.googleapis.com/youtube/v3/playlists",null
                ,
                {
                    'get':    {method:'GET',params:{id:'@id'}},
                    'save':   {method:'POST', params:{part: 'snippet'}},
                    'query':  {method:'GET', params:{part: 'snippet', mine: 'true', maxResults : 50}},
                    'remove': {method:'DELETE'},
                    'delete': {method:'DELETE'},
                    'update': {method: 'PUT', params:{part: 'snippet'}}
                }
        );
    }
}());



