import gulp from 'gulp';
import { deleteAsync } from 'del';
import htmlmin from 'gulp-htmlmin';
import gulpIf from 'gulp-if';

import concat from 'gulp-concat';
import autoprefixer from 'gulp-autoprefixer';
import clean from 'gulp-clean-css';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import imagemin, { mozjpeg, optipng, svgo } from 'gulp-imagemin';
import gulpSquoosh from 'gulp-squoosh';
import gulpCache from 'gulp-cache';
import babel from 'gulp-babel';
import browserSync from 'browser-sync';
import gulpUglify from 'gulp-uglify-es';
import sourceMaps from 'gulp-sourcemaps';
const uglify = gulpUglify.default;
const sync = browserSync.create();
const sass = gulpSass(dartSass);
const DEV = process.argv.includes('--prod');

const del = async () => {
  !(await deleteAsync(['dist/**']));
};
const ico = () => {
  return gulp.src('src/favicon/*.ico').pipe(gulp.dest('dist/favicon'));
};
function htmlMinify() {
  return gulp
    .src('src/**/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))

    .pipe(gulp.dest('dist'))
    .pipe(gulpIf(!DEV, sync.stream()));
}

const styles = () => {
  return gulp
    .src('src/scss/**/*.scss')
    .pipe(gulpIf(!DEV, sourceMaps.init()))
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(concat('styles.min.css'))
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(gulpIf(!DEV, clean({ level: 2 })))
    .pipe(gulpIf(!DEV, sourceMaps.write()))
    .pipe(gulp.dest('dist/css'))
    .pipe(gulpIf(!DEV, sync.stream()));
};
const processImages = () => {
  return (
    gulp
      .src('src/img/**')
      //   .pipe(
      //     gulpCache(
      //       gulpSquoosh(() => ({
      //         encodeOptions: {
      //            mozjpeg: {},
      //            webp: {},
      //           oxipng: {},
      //         },
      //       }))
      //     )
      //   )
      .pipe(
        imagemin([
          imagemin.mozjpeg({ quality: 75, progressive: true }),
          imagemin.optipng({ optimizationLevel: 5 }),
          imagemin.svgo({
            plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
          }),
        ])
      )

      .pipe(gulp.dest('dist/images'))
      .pipe(gulpIf(!DEV, sync.stream()))
  );
};

const scripts = () => {
  return gulp
    .src('src/js/**/*.js')
    .pipe(gulpIf(!DEV, sourceMaps.init()))
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(concat('scripts.min.js'))
    .pipe(uglify())
    .pipe(gulpIf(!DEV, sourceMaps.write()))

    .pipe(gulp.dest('dist/js'))
    .pipe(gulpIf(!DEV, sync.stream()));
};

const watchFiles = () => {
  sync.init({
    server: {
      baseDir: 'dist',
    },
    port: 3000,
  });
};
gulp.watch('src/**/*.html', htmlMinify);
gulp.watch('src/scss/**/*.scss', styles);
gulp.watch('src/js/**/*.js', scripts);
gulp.watch('src/img**', processImages);

export default gulp.series(del, ico, htmlMinify, styles, scripts, processImages, watchFiles);
