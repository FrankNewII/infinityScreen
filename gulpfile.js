var gulp = require( 'gulp' ),
    watch = require( 'gulp-watch' ),
    uglify = require( 'gulp-uglify' ),
    rename = require( 'gulp-rename' ),
    sourcemaps = require( 'gulp-sourcemaps' ),
    browserify = require( 'gulp-browserify' ),
    concat = require( 'gulp-concat' );

var gulpConfig = {
    src: 'src/infinity-screen.js',
    dist: 'dist/'
};


gulp.task( 'js:build', function () {
    gulp.src( gulpConfig.src )
        .pipe( sourcemaps.init() )
        .pipe( browserify() )
        .pipe( gulp.dest( gulpConfig.dist ) )
        .pipe( uglify() )
        .pipe( rename({suffix: '.min'}))
        .pipe( sourcemaps.write())
        .pipe( gulp.dest( gulpConfig.dist ) );
} );

gulp.task( 'watch', function () {
    watch( gulpConfig.src, function () {
        gulp.start( 'js:build' );
    } );
} );

gulp.task( 'default', [ 'js:build', 'watch' ] );