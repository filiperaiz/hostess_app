const gulp = require('gulp');
const sass = require('gulp-sass');

//task para o sass
function css() {
	return gulp
		.src('assets/scss/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('assets/css'));
}

function css() {
	return gulp
		.src('./assets/scss/**/*.scss')
		.pipe(sass({ outputStyle: 'compressed' }))
		.pipe(gulp.dest('./assets/css'));
}

function watchFiles() {
	gulp.watch('./assets/scss/**/*', css);
}

const watch = gulp.parallel(watchFiles, css);

exports.css = css;
exports.default = gulp.parallel(watch);
