const gulp = require('gulp')
const babel = require('gulp-babel')
const shell = require('gulp-shell')
const rename = require('gulp-rename')

gulp.task('babel', () => {
  gulp.src('lib/index.es6.js')
    .pipe(babel({presets: ['es2015']}))
    .pipe(rename('index.js'))
    .pipe(gulp.dest('lib'))
})

gulp.task('install', shell.task('npm install -g .'))

gulp.task('watch', () => {
  gulp.watch('lib/index.es6.js', ['babel', 'install'])
})

gulp.task('default', ['babel', 'watch'])
