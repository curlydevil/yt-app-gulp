var config = require('./gulp.config')();
var del = require('del');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
    lazy: true
});

gulp.task('help', $.taskListing);

gulp.task('default', ['help']);

gulp.task('cleanAll', ['azureCleanUp'], cleanAllTask);

gulp.task('azureCleanUp', azureCleanUpTask);

gulp.task('copyFonts', ['getSource'], copyFontsTask);

gulp.task('getSource', ['cleanAll'], getSourceTask);

gulp.task('templatecache', ['getSource'], templateCacheTask);

gulp.task('minify', ['templatecache', 'copyFonts'], minifyTask);

gulp.task('process', ['minify'], buildCleanUpTask);

gulp.task('azure', ['process'], azureTask);
///

var tempFiles = [
        config.tmp,
        config.root + 'index.html',
        config.root + 'favicon.ico',
        config.root + 'web.config',
        config.root + 'README.md',
        config.root + 'vendor/',
        config.root + 'src/'
    ];

function azureTask(done) {
    return gulp
        .src(config.build + '**/*.*')
        .pipe(gulp.dest(config.root));
}

function azureCleanUpTask(done) {
    var files = [
        config.root + 'fonts',
        config.root + 'js',
        config.root + 'styles',
        config.root + 'index.html'
    ];

    clean(files, done);
}

function copyFontsTask() {
    log('Copying fonts');

    return gulp
        .src(config.fonts)
        .pipe(gulp.dest(config.build + 'fonts'));
}

function templateCacheTask() {
    log('Creating AngularJS $templateCache');

    return gulp
        .src(config.htmltemplates)
        .pipe($.minifyHtml({
            empty: true
        }))
        .pipe($.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.tmp));
}

function minifyTask() {
    log('minifying app');
    var templateCache = config.tmp + config.templateCache.file;
    var assets = $.useref.assets({
        searchPath: './'
    });
    var cssFilter = $.filter(['**/app.css'], {
        restore: true
    });
    var jsFilter = $.filter(['**/app.js'], {
        restore: true
    });

    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe($.inject(gulp.src(templateCache, {
            read: false
        }), {
            starttag: '<!-- inject:templates:js -->'
        }))
        .pipe(assets)
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore)
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore)
        .pipe($.rev())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe(gulp.dest(config.build));
}

function cleanAllTask(done) {
    log('cleaning all files');

    clean(tempFiles.concat(config.build), done);
}

function buildCleanUpTask(done) {
    log('cleaning all temp files');
    clean(tempFiles, done);
}

function getSourceTask(done) {
    log('Copying source to build folder');

    return gulp
        .src(config.origin)
        .pipe(gulp.dest(config.root));
}

function log(msg) {
    if (typeof (msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.cyan(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.cyan(msg));
    }
}

function clean(path, done) {
    log('Cleaning ' + $.util.colors.cyan(path));
    del(path, done);
}
