(function () {
    'use strict';
    module.exports = function () {
        var root = './';
        var build = './build/';
        var tmp = './tmp/';
        var clientApp = root + 'src/';
        var index = root + 'index.html';

        var config = {
            alljs: clientApp + '**/*.js',
            htmltemplates: clientApp + '**/*.html',
            fonts: root + 'vendor/bootstrap/fonts/**/*.*',
            origin: '../youtube-api-app/**/*.*',
            build: build,
            clientApp: clientApp,
            index: index,
            root: root,
            tmp: tmp,

            templateCache: {
                file: 'templates.js',
                options: {
                    module: 'ytApp',
                    standAlone: false,
                    root: 'src/'
                }
            }
        };

        return config;
    };
}());
