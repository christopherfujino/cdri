const gulp = require('gulp')
const rollup = require('rollup')
const babel = require('gulp-babel')
const shell = require('gulp-shell')
const rename = require('gulp-rename')

gulp.task('babel', ['rollup'], () => {
  gulp.src('lib/bundle.es6.js')
    .pipe(babel({presets: ['es2015']}))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('lib'))
})

//gulp.task('watch', () => {
//  gulp.watch('lib/index.es6.js', ['babel', 'install'])
//})

gulp.task('rollup', () => {
  return rollup.rollup({
    entry: "./lib/main.es6.js"
  }).then((bundle) => {
    bundle.write({
      format: "cjs",
      dest: "./lib/bundle.es6.js"
    })
  })
})

gulp.task('build', ['rollup', 'babel'])
