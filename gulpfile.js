// Less configuration
const gulp = require('gulp');
const less = require('gulp-less');
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const csswring = require('csswring')

gulp.task('less', function() {
    gulp.src('src/*.less')
        .pipe(less())
        .pipe(postcss([
            autoprefixer(),
            csswring()
        ]))
        .pipe(gulp.dest(function(f) {
            return f.base;
        }))
});

gulp.task('default', ['less'], function() {
    gulp.watch('**/*.less', ['less']);
})