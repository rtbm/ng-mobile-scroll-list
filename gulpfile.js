const gulp = require('gulp');
const concat = require('gulp-concat');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const del = require('del');
const gulpif = require('gulp-if');
const args = require('yargs').argv;
const merge = require('merge-stream');
const browserify = require('browserify');
const vinylSourceStream = require('vinyl-source-stream');
const vinylBuffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const ngAnnotate = require('gulp-ng-annotate');
const ngConstant = require('gulp-ng-constant');
const angularTranslate = require('gulp-angular-translate');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cssNano = require('gulp-cssnano');
const imagemin = require('gulp-imagemin');
const jpegtran = require('imagemin-jpegtran');
const templateCache = require('gulp-angular-templatecache');

const ENV_PRODUCTION = args.env === 'production';
const TARGET_DIR = './www';

gulp.task('clean', () => del(['www']));

gulp.task('build:scripts', () => browserify({
    entries: './src',
    debug: true,
  }).transform('babelify', { presets: ['es2015'] })
  .bundle()
  .pipe(vinylSourceStream('app.js'))
  .pipe(vinylBuffer())
  .pipe(ngAnnotate())
  .pipe(gulpif(ENV_PRODUCTION, uglify()))
  .pipe(gulp.dest(TARGET_DIR))
);

gulp.task('build:strings', () => gulp.src('./src/components/**/res/strings/*.json')
  .pipe(angularTranslate({
    module: 'ngApp.strings',
    standalone: true,
  }))
  .pipe(gulpif(ENV_PRODUCTION, uglify()))
  .pipe(rename('strings.js'))
  .pipe(gulp.dest(TARGET_DIR))
);

gulp.task('build:layouts', () => gulp.src('./src/components/**/res/layout/*.html')
  .pipe(templateCache('layouts.js', {
    module: 'ngApp.layouts',
    standalone: true,
  }))
  .pipe(gulpif(ENV_PRODUCTION, uglify()))
  .pipe(gulp.dest(TARGET_DIR))
);

gulp.task('build:index', () => gulp.src('./src/index.html')
  .pipe(gulp.dest(TARGET_DIR))
);

gulp.task('build:styles', () => gulp.src([
  './src/assets/*.less',
  './src/components/**/res/styles/*.less'
])
  .pipe(less())
  .pipe(autoprefixer())
  .pipe(gulpif(ENV_PRODUCTION, cssNano({
    zindex: false,
  })))
  .pipe(concat('styles.css'))
  .pipe(gulp.dest(TARGET_DIR))
);

gulp.task('build:config', () => {
  const filename = ENV_PRODUCTION ? 'production' : 'development';

  gulp.src(`./config/${filename}.json`)
    .pipe(ngConstant({
      name: 'ngApp.config',
    }))
    .pipe(rename('config.js'))
    .pipe(gulpif(ENV_PRODUCTION, uglify()))
    .pipe(gulp.dest(TARGET_DIR));
});

gulp.task('build:copy', () => {
  const fonts = gulp.src([
      './bower_components/roboto-fontface/fonts/*.{eot,ijmap,ttf,woff,woff2,svg}',
      './bower_components/material-design-icons/iconfont/*.{eot,svg,ttf,woff,woff2}',
    ])
    .pipe(gulp.dest(`${TARGET_DIR}/fonts`));

  const styles = gulp.src([
      './bower_components/roboto-fontface/css/roboto-fontface.css',
      './bower_components/material-design-icons/iconfont/material-icons.css',
    ])
    .pipe(replace('url(\'../', 'url(\''))
    .pipe(replace('url(MaterialIcons', 'url(./fonts/MaterialIcons'))
    .pipe(concat('fonts.css'))
    .pipe(gulp.dest(TARGET_DIR));

  const scripts = gulp.src([
      './bower_components/angular/angular.js',
      './bower_components/angular-animate/angular-animate.js',
      './bower_components/angular-jwt/dist/angular-jwt.js',
      './bower_components/angular-mocks/angular-mocks.js',
      './bower_components/angular-resource/angular-resource.js',
      './bower_components/angular-sanitize/angular-sanitize.js',
      './bower_components/angular-translate/angular-translate.js',
      './bower_components/angular-ui-router/release/angular-ui-router.js',
      './bower_components/a0-angular-storage/dist/angular-storage.js',
      './bower_components/hammerjs/hammer.js',
      './bower_components/hammer-time/hammer-time.js',
      './bower_components/lawnchair/src/Lawnchair.js',
      './bower_components/lawnchair/src/adapters/dom.js',
      './bower_components/lawnchair/src/plugins/query.js',
      './src/vendors/winstore-jscompat.js',
    ])
    .pipe(gulpif(ENV_PRODUCTION, uglify()))
    .pipe(gulp.dest(`${TARGET_DIR}/vendors`));

  return merge(fonts, styles, scripts);
});

gulp.task('build:images', () => gulp.src('./src/images/*.jpg')
  .pipe(gulpif(ENV_PRODUCTION, imagemin({
    progressive: true,
    use: [jpegtran()],
  })))
  .pipe(gulp.dest(`${TARGET_DIR}/images`))
);

gulp.task('build', ['build:scripts', 'build:strings', 'build:layouts',
  'build:index', 'build:styles', 'build:config', 'build:copy', 'build:images']);

gulp.task('watch', () => {
  gulp.watch([
    './src/index.js',
    './src/components/**/*.js',
    '!./src/components/**/*-test.js',
  ], ['build:scripts']);
  gulp.watch('./src/components/**/res/strings/*.json', ['build:strings']);
  gulp.watch('./src/components/**/res/layout/*.html', ['build:layouts']);
  gulp.watch('./src/index.html', ['build:index']);
  gulp.watch('./src/components/**/res/styles/*.less', ['build:styles']);
  gulp.watch('./src/config/*.json', ['build:config']);
});

gulp.task('default', ['build', 'watch']);
