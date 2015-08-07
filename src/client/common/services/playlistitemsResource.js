/**
 * Created by a.ovsiannikov on 7/10/2015.
 */
(function(){
    "use strict";

    angular
        .module("common.services")
        .factory("playlistitemsResource", ["$resource",playlistitemsResource]);

    function playlistitemsResource($resource) {
        return $resource(
            "https://www.googleapis.com/youtube/v3/playlistItems",null
            ,
            {
                'get':    {method:'GET',params:{id:'@id'}},
                'save':   {method:'POST', params:{part: 'snippet'}},
                'query':  {method:'GET', params:{part: 'snippet', playlistId: '@playlistId', mine: 'true', maxResults : 50}},
                'remove': {method:'DELETE'},
                'delete': {method:'DELETE'}
            }
        );
    }
}());



