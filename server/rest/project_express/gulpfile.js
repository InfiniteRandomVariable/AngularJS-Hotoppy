//http://www.2ality.com/2015/04/node-es6-transpiled.html
// var gulp = require('gulp');
// var sourcemaps = require('gulp-sourcemaps');
// var babel = require('gulp-babel');
    
// var path = require('path');
    
// var paths = {
//         es6: ['es6/**/*.js'],
//         es5: 'es5',
//         // Must be absolute or relative to source map
//         sourceRoot: path.join(__dirname, 'es6'),
//  };

// gulp.task('babel', function () { // (A)
//         return gulp.src(paths.es6)
//             .pipe(sourcemaps.init()) // (B)
//             .pipe(babel())
//             .pipe(sourcemaps.write('.', // (C)
//                       { sourceRoot: paths.sourceRoot }))
//             .pipe(gulp.dest(paths.es5));
//     });
//     gulp.task('watch', function() { // (D)
//         gulp.watch(paths.es6, ['babel']);
//     });
//    gulp.task('default', ['watch']); // (E)


