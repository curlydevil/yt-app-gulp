var gulp = require('gulp');
var config = require('./gulp.config')();
var $ = require('gulp-load-plugins')({
    lazy: true
});

gulp.task('help', $.taskListing);
