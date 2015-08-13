! function () {
    "use strict";
    var t = angular.module("ytApp", ["common.services", "ui.router", "ui.bootstrap", "directives"]);
    t.config(["$stateProvider", "$urlRouterProvider", "$sceDelegateProvider", function (t, e, l) {
        l.resourceUrlWhitelist(["self", "https://www.youtube.com/**", "https://youtu.be/**", "https://accounts.google.com/**"]), e.otherwise("/home/player"), t.state("welcome", {
            url: "/",
            templateUrl: "src/app/welcome/welcomeView.html",
            controller: "WelcomeController",
            controllerAs: "vm"
        }).state("home", {
            "abstract": !0,
            url: "/home",
            templateUrl: "src/app/home/homeView.html",
            controller: "HomeController",
            controllerAs: "vm",
            resolve: {
                authCheck: function (t, e) {
                    return t.checkAuth().then(function () {
                        t.setAuthToken()
                    }, function () {
                        e.go("welcome")
                    })
                }
            }
        }).state("home.player", {
            url: "/player",
            templateUrl: "src/app/home/player/playerView.html",
            controller: "PlayerController",
            controllerAs: "vm"
        }).state("home.search", {
            url: "/search/:searchText",
            templateUrl: "src/app/home/search/searchView.html",
            controller: "SearchController",
            controllerAs: "vm"
        }).state("home.edit", {
            url: "/edit",
            templateUrl: "src/app/home/edit/editView.html",
            controller: "EditController",
            controllerAs: "vm"
        })
    }])
}(),
function () {
    "use strict";
    angular.module("common.services", ["angular-google-gapi", "ngResource"])
}(),
function () {
    "use strict";

    function t(t, e, l) {
        function i() {
            return e.login().then(r)
        }

        function s() {
            return l.getUser()
        }

        function n() {
            return l.isLogin()
        }

        function o() {
            return e.checkAuth()
        }

        function a() {
            var i = e.getToken().$$state.value.access_token;
            return l.isLogin(!1), t.jsonp(d.replace("{token}", i), {
                headers: {
                    "content-type": "application/json",
                    Accept: "application/json"
                }
            })
        }

        function r() {
            var l = e.getToken().$$state.value.access_token;
            t.defaults.headers.common.Authorization = "Bearer " + l
        }
        var c = "277572490754-mv9uu31naka02tfef9cv7kv6ntfqvioa.apps.googleusercontent.com",
            u = "https://www.googleapis.com/auth/youtube",
            d = "https://accounts.google.com/o/oauth2/revoke?token={token}";
        return e.setClient(c), e.setScope(u), {
            login: i,
            getUser: s,
            isLoggedIn: n,
            checkAuth: o,
            logOut: a,
            setAuthToken: r
        }
    }
    angular.module("common.services").factory("authorizationService", ["$http", "GAuth", "GData", t])
}(),
function () {
    function t(t, e, l) {
        function i(t) {
            null === t ? f.selectPlaylistitem(null) : t.items.length || v(t), P = t, l.publish("playlist.selected", t)
        }

        function s(t) {
            null === t || t.src || (t.src = "https://www.youtube.com/embed/" + t.snippet.resourceId.videoId + "?list=" + t.snippet.playlistId), b = t, l.publish("playlistitem.selected")
        }

        function n() {
            return t.query(function (t) {
                f.playlists = t.items;
                for (var e = 0; e < f.playlists.length; e++) f.playlists[e].items = [];
                f.playlists.length && f.selectPlaylist(f.playlists[0]), l.publish("playlists.loaded", f.playlists)
            }).$promise
        }

        function o(e) {
            var i = new t({
                snippet: e.snippet
            });
            return t.save(i).$promise.then(function (t) {
                t.items = [], f.playlists.splice(0, 0, t), l.publish("playlist.added", t)
            }, function (t) {
                humane.log("Error adding playlist"), console.log(t)
            })
        }

        function a(e) {
            if (confirm("Are you sure you want to remove playlist?")) {
                var i = new t({
                    id: e.id
                });
                return t["delete"](i).$promise.then(function (t) {
                    var i = _.indexOf(f.playlists, e); - 1 !== i && f.playlists.splice(i, 1), e === P && h(i), l.publish("playlist.removed", e)
                }, function (t) {
                    humane.log("Error deleting playlist"), console.log(t)
                })
            }
        }

        function r(e) {
            var i = new t({
                id: e.id,
                snippet: e.snippet
            });
            return t.update(i, function (t) {
                l.publish("playlist.updated", t)
            }, function (t) {
                humane.log("Error updating playlist"), console.log(t)
            }).$promise
        }

        function c(t, i) {
            var s = new e({
                snippet: {
                    playlistId: t.id,
                    resourceId: {
                        kind: "youtube#video",
                        videoId: i
                    }
                }
            });
            return e.save(s, function (e) {
                var i = _.indexOf(f.playlists, t); - 1 !== i && f.playlists[i].items.splice(0, 0, e), l.publish("playlistitem.added", e)
            }, function (t) {
                humane.log("Error adding item to playlist"), console.log(t)
            }).$promise
        }

        function u(t, i) {
            var s = new e({
                id: i.id
            });
            return e["delete"](s, function (e) {
                var n = _.indexOf(f.playlists, t);
                if (-1 !== n) {
                    var o = _.findIndex(f.playlists[n].items, function (t) {
                        return t.id === s.id
                    }); - 1 !== o && f.playlists[n].items.splice(o, 1)
                }
                l.publish("playlistitem.removed", {
                    playlist: t,
                    item: i
                })
            }, function (t) {
                humane.log("Error removing item from playlist"), console.log(t)
            }).$promise
        }

        function d(t) {
            return e.query({
                playlistId: t.id
            }, function (e) {
                var i = g(t);
                f.playlists[i].items = e.items, l.publish("playlist.filled", t)
            }, function (t) {
                humane.log("Error filling the playlist"), console.log(t)
            }).$promise
        }

        function p(t, e) {
            return _.any(t.items, function (t) {
                return t.snippet.resourceId.videoId === e
            })
        }

        function m() {
            return b
        }

        function y() {
            return P
        }

        function v(t) {
            f.fillPlaylist(t).then(function () {
                t.items.length && f.selectPlaylistitem(t.items[0])
            })
        }

        function h(t) {
            for (; !f.playlists[t] && t >= 0;) t--;
            f.selectPlaylist(t >= 0 ? f.playlists[t] : null)
        }

        function g(t) {
            return _.findIndex(f.playlists, function (e) {
                return e.id === t.id
            })
        }
        var f = this,
            b = null,
            P = null;
        f.playlists = [], f.playlistsPromise = n(), f.selectPlaylist = i, f.selectPlaylistitem = s, f.selectedPlaylistitem = m, f.selectedPlaylist = y, f.addPlaylist = o, f.removePlaylist = a, f.updatePlaylist = r, f.fillPlaylist = d, f.addItemToPlaylist = c, f.removeItemFromPlaylist = u, f.isItemInPlayList = p
    }
    angular.module("ytApp").service("playlistService", t), t.$inject = ["PlaylistResource", "PlaylistItemsResource", "PubSub"]
}(),
function () {
    "use strict";

    function t(t) {
        var e = 50,
            l = "https://content.googleapis.com/youtube/v3/playlists";
        return t(l, null, {
            get: {
                method: "GET",
                params: {
                    id: "@id"
                }
            },
            save: {
                method: "POST",
                params: {
                    part: "snippet"
                }
            },
            query: {
                method: "GET",
                params: {
                    part: "snippet",
                    mine: "true",
                    maxResults: e
                }
            },
            remove: {
                method: "DELETE"
            },
            "delete": {
                method: "DELETE"
            },
            update: {
                method: "PUT",
                params: {
                    part: "snippet"
                }
            }
        })
    }
    angular.module("common.services").factory("PlaylistResource", ["$resource", t])
}(),
function () {
    "use strict";

    function t(t) {
        var e = 50,
            l = "https://www.googleapis.com/youtube/v3/playlistItems";
        return t(l, null, {
            get: {
                method: "GET",
                params: {
                    id: "@id"
                }
            },
            save: {
                method: "POST",
                params: {
                    part: "snippet"
                }
            },
            query: {
                method: "GET",
                params: {
                    part: "snippet",
                    playlistId: "@playlistId",
                    mine: "true",
                    maxResults: e
                }
            },
            remove: {
                method: "DELETE"
            },
            "delete": {
                method: "DELETE"
            }
        })
    }
    angular.module("common.services").factory("PlaylistItemsResource", ["$resource", t])
}(),
function () {
    "use strict";

    function t(t) {
        var e = 50,
            l = "https://www.googleapis.com/youtube/v3/search";
        return t(l, null, {
            query: {
                method: "GET",
                params: {
                    part: "snippet",
                    maxResults: e,
                    q: "@q"
                }
            }
        })
    }
    angular.module("common.services").factory("SearchResource", ["$resource", t])
}(),
function () {
    "use strict";

    function t(t) {
        function e(e, l) {
            var i = t.$on(e, function (t, e) {
                l(e)
            });
            return i
        }

        function l(e, l) {
            t.$emit(e, l)
        }
        return {
            subscribe: e,
            publish: l
        };
    }
    angular.module("ytApp").factory("PubSub", ["$rootScope", t])
}(),
function () {
    "use strict";

    function t(t, e, l, i) {
        function s() {
            "" !== p.searchText && i.go("home.search", {
                searchText: p.searchText
            })
        }

        function n(t) {
            return 404 === t.code && _.any(t.errors, function (t) {
                return "channelId" === t.location && "channelNotFound" === t.reason
            })
        }

        function o(t) {
            l.removeItemFromPlaylist(l.selectedPlaylist(), {
                id: t.id
            })
        }

        function a(t) {
            l.selectPlaylist(t)
        }

        function r(t) {
            l.selectPlaylistitem(t)
        }

        function c() {
            return i.current.name
        }

        function u() {
            p.isEditMode() ? i.go(m && "home.edit" !== m ? m : "home.player") : (m = p.currentView(), i.go("home.edit"))
        }

        function d() {
            return "home.edit" === p.currentView()
        }
        var p = this;
        p.searchText = "", p.playlistService = l, p.getSearchResult = s, p.removeFromPlaylist = o, p.setCurrentPlaylist = a, p.setCurrentPlaylistItem = r, p.currentView = c, p.toggleEdit = u, p.isEditMode = d, l.playlistsPromise.then(function () {
            p.playlistService.playlists.length ? p.setCurrentPlaylist(l.playlists[0]) : humane.log("For a start - add at least one playlist")
        }, function (e) {
            n(e.data.error) && humane.log("You don't have a YouTube channel! Click here to create.", {
                timeout: 0,
                clickToClose: !0,
                addnCls: "humane-flatty-error"
            }, function () {
                t.open("https://www.youtube.com/create_channel")
            })
        });
        var m = null
    }
    angular.module("ytApp").controller("HomeController", ["$window", "$scope", "playlistService", "$state", t])
}(),
function () {
    "use strict";

    function t(t, e, l, i, s) {
        function n(t) {
            y.searchResult = o(t.items), i.selectedPlaylist() ? r() : i.playlists.length && humane.log("Select a playlist first")
        }

        function o(t) {
            var e = [];
            return t.forEach(function (t) {
                "youtube#video" === t.id.kind && e.push(t)
            }), e
        }

        function a() {
            y.searchResult && _.any(y.searchResult, function (t) {
                return !t.alreadyInList
            }) && r()
        }

        function r() {
            y.searchResult.forEach(function (t) {
                t.alreadyInList = d(t)
            })
        }

        function c(t) {
            return i.isItemInPlayList(i.selectedPlaylist(), t.id.videoId)
        }

        function u(t) {
            i.selectedPlaylist() ? c(t) || i.addItemToPlaylist(i.selectedPlaylist(), t.id.videoId) : humane.log(i.playlists.length ? "Select a playlist first" : "For a start - add at least one playlist")
        }

        function d(t) {
            return function () {
                return c(t)
            }
        }

        function p(t) {
            return _.findIndex(i.selectedPlaylist().items, function (e) {
                return e.snippet.resourceId.videoId === t.id.videoId
            })
        }

        function m(t) {
            var e = p(t); - 1 !== e && t.alreadyInList() && i.removeItemFromPlaylist(i.selectedPlaylist(), i.selectedPlaylist().items[e])
        }
        var y = this;
        y.searchResult = [], y.playlistService = i, y.searchText = e.searchText, y.addToPlayList = u, y.removeFromPlayList = m, l.subscribe("playlist.selected", a);
        var v = function () {
            s.query({
                q: y.searchText
            }, n)
        };
        i.playlistsPromise.then(function () {
            v()
        })
    }
    angular.module("ytApp").controller("SearchController", t), t.$inject = ["$q", "$stateParams", "PubSub", "playlistService", "SearchResource"]
}(),
function () {
    "use strict";

    function t(t) {
        var e = this;
        e.newPlaylist = {
            snippet: {
                title: "",
                description: ""
            },
            addMode: !1
        }, e.playlistService = t, e.addNewPlaylistAccept = function () {
            t.addPlaylist(e.newPlaylist), e.toggleAddPlaylist()
        }, e.addNewPlaylistReject = function () {
            e.toggleAddPlaylist()
        }, e.removePlaylist = function (e) {
            t.removePlaylist(e)
        }, e.toggleAddPlaylist = function () {
            e.newPlaylist.addMode ? e.newPlaylist.addMode = !1 : (e.newPlaylist.snippet.title = "", e.newPlaylist.snippet.description = "", e.newPlaylist.addMode = !0)
        }, e.togglePlaylistEdit = function (t) {
            t.editMode ? t.editMode = !1 : (t.snippet.originTitle = t.snippet.title, t.snippet.originDescription = t.snippet.description, t.editMode = !0)
        }, e.playlistChangesAccept = function (l) {
            t.updatePlaylist(l).then(function (t) {
                e.togglePlaylistEdit(l)
            }, function (t) {
                e.playlistChangesReject()
            })
        }, e.playlistChangesReject = function (t) {
            t.snippet.title = t.snippet.originTitle, t.snippet.description = t.snippet.originDescription, e.togglePlaylistEdit(t)
        }
    }
    angular.module("ytApp").controller("EditController", ["playlistService", t])
}(),
function () {
    "use strict";

    function t(t) {
        function e() {
            t.removeItemFromPlaylist(t.selectedPlaylist(), {
                id: t.selectedPlaylistitem().id
            })
        }

        function l() {
            var e = t.selectedPlaylistitem().snippet.resourceId.videoId;
            t.addItemToPlaylist(t.selectedPlaylist(), e).then(function () {
                t.selectPlaylistitem(t.selectedPlaylist().items[0])
            })
        }

        function i() {
            var e = t.selectedPlaylist(),
                l = t.selectedPlaylistitem();
            return e && l ? t.isItemInPlayList(e, l.snippet.resourceId.videoId) : void 0
        }
        var s = this;
        s.playlistService = t, s.removeFromPlaylist = e, s.addToPlaylist = l, s.checkIsVideoInCurrentPlaylist = i
    }
    angular.module("ytApp").controller("PlayerController", ["playlistService", t])
}(),
function () {
    "use strict";

    function t(t, e, l, i) {
        var s = this;
        s.isLoggedIn = !1, s.userInfo = {}, s.isCollapsed = !0, l.checkAuth().then(function () {
            i.publish("loggedIn", !0), o()
        });
        var n = function () {
                l.isLoggedIn() ? (i.publish("loggedIn", !0), e.go("home.player")) : e.go("welcome")
            },
            o = function () {
                if (!s.userInfo.fullName) {
                    var t = l.getUser();
                    s.userInfo.fullName = t.name, s.userInfo.picture = t.picture
                }
            };
        s.logIn = function () {
            l.login().then(o).then(n)
        }, s.logOut = function () {
            l.logOut().error(function (t) {
                i.publish("loggedIn", !1), e.go("welcome")
            }), i.publish("loggedIn", !0)
        }, s.isActive = function (t) {
            return e.current.name === t
        };
        var a = i.subscribe("loggedIn", function (t) {
            s.isLoggedIn = t
        });
        t.$on("$destroy", function () {
            a()
        })
    }
    angular.module("ytApp").controller("AuthenticationController", ["$scope", "$state", "authorizationService", "PubSub", t])
}(),
function () {
    "use strict";

    function t(t, e) {
        var l = this;
        l.isLoggedIn = e.isLoggedIn()
    }
    angular.module("ytApp").controller("WelcomeController", ["$scope", "authorizationService", t])
}(),
function () {
    "use strict";
    angular.module("directives", [])
}(),
function () {
    "use strict";

    function t() {
        var t = 13;
        return {
            restrict: "A",
            link: function (e, l, i) {
                l.bind("keydown", function (l) {
                    l instanceof KeyboardEvent && l.keyCode === t && e.$apply(i.enterPress)
                })
            }
        }
    }
    angular.module("directives").directive("enterPress", t)
}(), angular.module("ytApp").run(["$templateCache", function (t) {
    t.put("src/app/home/homeView.html", '<div class=jumbotron><div class=row><div class=col-md-9><div class=input-group ng-if=!vm.isEditMode()><input type=text ng-model=vm.searchText class=form-control enter-press=vm.getSearchResult() placeholder="Search for..."> <span class=input-group-btn><button class="btn btn-default" ng-click=vm.getSearchResult() type=button><span class="glyphicon glyphicon-search"></span></button></span></div></div><div class=col-md-3><div class=row><div class=col-md-9><div dropdown class=btn-group><button dropdown-toggle class="btn btn-default" type=button id=playlistDropdown aria-haspopup=true aria-expanded=true>{{vm.playlistService.selectedPlaylist().snippet.title}} <span class=caret></span></button><ul class=dropdown-menu role=menu aria-labelledby=playlistDropdown><li ng-repeat="playlist in vm.playlistService.playlists"><a ng-click=vm.setCurrentPlaylist(playlist)>{{playlist.snippet.title}}</a></li></ul></div><button class="btn btn-default pull-right visible-sm visible-xs" ng-click=vm.toggleEdit() title="Edit mode"><i class="glyphicon glyphicon-list"></i></button></div><div class="col-md-3 visible-md visible-lg"><button class="btn btn-default" ng-click=vm.toggleEdit() title="Edit mode"><i class="glyphicon glyphicon-list"></i></button></div></div></div></div><div class=row><div class=col-md-9><div ui-view></div></div><div class=col-md-3><div class="list-group playlist-control"><div ng-repeat="item in vm.playlistService.selectedPlaylist().items"><div class="list-group-item playlist-item"><span ng-click=vm.setCurrentPlaylistItem(item) class=clickable>{{item.snippet.title}}</span> <button type=button class="close-button pull-right top-right-corner" ng-if=vm.isEditMode() title="Remove playlist" ng-click=vm.removeFromPlaylist(item)><i class="glyphicon glyphicon-remove"></i></button></div></div></div></div></div></div>'), t.put("src/app/welcome/welcomeView.html", "<div class=well><div class=welcome-text>Welcome to the Youtube API Application!</div><div ng-hide=vm.isLoggedIn>Please log in to continue...</div></div>"), t.put("src/app/home/edit/editView.html", '<div class><table class="table table-hover table-responsive"><tbody><tr><td></td><td><div ng-if=vm.newPlaylist.addMode><div><label>Title:</label> <input type=text class=full-width ng-minlength=1 ng-model=vm.newPlaylist.snippet.title></div><div><label>Description:</label> <input type=text class=full-width ng-model=vm.newPlaylist.snippet.description></div><br><div><button class="btn btn-warning pull-left" ng-click=vm.addNewPlaylistReject()><i class="glyphicon glyphicon-remove"></i></button> <button class="btn btn-success pull-right" ng-click=vm.addNewPlaylistAccept()><i class="glyphicon glyphicon-ok"></i></button></div></div></td><td><div><button type=button class=close-button title="Add new playlist" ng-click=vm.toggleAddPlaylist()><i class="glyphicon glyphicon-plus"></i></button></div></td></tr><tr ng-repeat="playlist in vm.playlistService.playlists"><td class=horizontal-center><img ng-src="{{playlist.snippet.thumbnails[\'default\'].url}}"></td><td><div class><label>Title:</label><div ng-if=playlist.editMode><input type=text class=full-width ng-minlength=1 ng-model=playlist.snippet.title></div><span ng-if=!playlist.editMode>{{playlist.snippet.title}}</span></div><div class=hidden-xs><label>Description:</label><div ng-if=playlist.editMode><input type=text class=full-width ng-model=playlist.snippet.description></div><span ng-if=!playlist.editMode>{{playlist.snippet.description || \'none\'}}</span></div><br><div ng-if=playlist.editMode><div class><button class="btn btn-warning pull-left" ng-click=vm.playlistChangesReject(playlist)><i class="glyphicon glyphicon-remove"></i></button> <button class="btn btn-success pull-right" ng-click=vm.playlistChangesAccept(playlist)><i class="glyphicon glyphicon-ok"></i></button></div></div></td><td><div><button type=button class=close-button title="Remove playlist" ng-click=vm.removePlaylist(playlist)><i class="glyphicon glyphicon-remove"></i></button></div><div><button type=button class=close-button title="Edit playlist" ng-click=vm.togglePlaylistEdit(playlist)><i class="glyphicon glyphicon-pencil"></i></button></div></td></tr></tbody></table></div>'), t.put("src/app/home/player/playerView.html", '<div class=player-container><div ng-if="vm.playlistService.selectedPlaylistitem() !== null"><div class=video-container><div><iframe ng-src={{vm.playlistService.selectedPlaylistitem().src}} frameborder=0 allowfullscreen></iframe></div></div><div class=player-info><div class=player-info-header><div class=player-video-title ng-if="vm.playlistService.selectedPlaylistitem() !== null">{{vm.playlistService.selectedPlaylistitem().snippet.title}}</div></div><div class=player-add-btn ng-hide="vm.playlistService.selectedPlaylistitem() === null || vm.checkIsVideoInCurrentPlaylist()"><button class="btn btn-primary" ng-click=vm.addToPlaylist()>Add to current playlist <span class="glyphicon glyphicon-plus" aria-hidden=true></span></button></div><div class=player-rmv-btn ng-show="vm.playlistService.selectedPlaylistitem() !== null && vm.checkIsVideoInCurrentPlaylist()"><button class="btn btn-danger" ng-click=vm.removeFromPlaylist()>Remove from current playlist <span class="glyphicon glyphicon-minus" aria-hidden=true></span></button></div></div></div><div ng-if="vm.playlistService.selectedPlaylistitem() === null" class=no-video-available>No video selected</div></div>'), t.put("src/app/home/search/searchView.html", '<div class><table class="table table-hover table-responsive"><tbody><tr ng-repeat="searchItem in vm.searchResult"><td class=horizontal-center><img class=yt-thumbnail ng-src="{{searchItem.snippet.thumbnails[\'default\'].url}}"></td><td><div class><label>Title:</label> <span>{{searchItem.snippet.title}}</span></div><div class=hidden-xs><label>Description:</label> <span>{{searchItem.snippet.description || \'none\'}}</span></div></td><td><div><button class="btn btn-success" ng-disabled=searchItem.alreadyInList() title="Add to current playlist" ng-click=vm.addToPlayList(searchItem)><i class="glyphicon glyphicon-plus"></i></button></div><div><button class="btn btn-error" ng-disabled=!searchItem.alreadyInList() title="Remove from current playlist" ng-click=vm.removeFromPlayList(searchItem)><i class="glyphicon glyphicon-remove"></i></button></div></td></tr></tbody></table></div>')
}]);
