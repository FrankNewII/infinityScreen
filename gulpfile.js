var gulp = require( 'gulp' ),
    watch = require( 'gulp-watch' ),
    uglify = require( 'gulp-uglify' ),
    rename = require( 'gulp-rename' ),
    concat = require( 'gulp-concat' );

var gulpConfig = {
    src: [
        'src/infinity-screen.js',
        'src/infinity-screen.config.js',
        'src/infinity-screen.overlay.js',
        'src/infinity-screen.map.js'
    ],
    dist: 'dist/'
};


gulp.task( 'js:build', function () {
    gulp.src( gulpConfig.src )
        .pipe( concat( 'main.js' ) )
        .pipe( uglify() )
        .pipe(rename('infinity-screen.js'))
        .pipe( gulp.dest( gulpConfig.dist ) );
} );

gulp.task( 'watch', function () {
    watch( gulpConfig.src, function ( event, cb ) {
        gulp.start( 'js:build' );
    } );
} );

gulp.task( 'default', [ 'js:build', 'watch' ] );