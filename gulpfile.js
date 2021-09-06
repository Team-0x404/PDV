// GULP Plugins
const gulp = require('gulp');
const concat = require('gulp-concat');
const debug = require('gulp-debug');
const uglify = require('gulp-uglify');
const remember = require('gulp-remember');
const path = require('path');
const plumber = require('gulp-plumber');
const less = require('gulp-less');
const changed = require('gulp-changed');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const browserSync = require('browser-sync');
const rev = require('gulp-rev');
const cleanDir = require('gulp-clean-dir');
const babel = require('gulp-babel');

// SVG Min
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const svgo = require('gulp-svgo');

// SVG Inline CSS
const svgInline = require('gulp-svg-inline-css');

// ------------- Init Settings ------------- //

// Путь к файлам
let pathPrefix = '';

// Компиляция Less
let compileLess = true;

// ------------- JS Settings ------------- //

// Пути к JavaScript файлам
let jsPathSrc = [
    pathPrefix + 'js-dev/library.js',
    pathPrefix + 'js-dev/*.js'
];

// Путь наблюдения за измнениями
let jsPathWatch = pathPrefix + 'js-dev/*.js';

// Путь компиляции
let jsPathDest = pathPrefix + 'js';

// Название результирующего файла
let jsFileName = 'script.js';

// Название файла JS rev-js-manifest.json
let revManifestJsonJSFileName = 'rev-manifest-js.json';

// ------------- CSS Settings ------------- //

// Путь к LESS файлу
let cssPathSrc = pathPrefix + 'less/style.less';

// Путь за наблюдаемыми файлами
let cssPathWatch = [
    pathPrefix + 'less/style.less',
    pathPrefix + 'less/components/*.less',
    pathPrefix + 'less/pages/*.less'
];

// let cssPathWatch = pathPrefix + 'less/**/*.less';

// Путь компиляции
let cssPathDest = pathPrefix + 'css';

// Название результирующего файла
let cssFileName = 'style.css';

// Название файла JS rev-js-manifest.json
let revManifestJsonCSSFileName = 'rev-manifest-css.json';

// ------------- BrowserSync Settings ------------- //

let browserSyncSettings = {
    proxy: 'site_domain',
    //logLevel: "debug",
    //injectChanges: true,
};

// ------------- CSS Admin Settings ------------- //

// Путь к LESS файлу
let cssAdminPathSrc = 'C:/Z-VERST/admin/less/*.less';

// Путь за наблюдаемыми файлами
let cssAdminPathWatch = cssAdminPathSrc;

// Путь компиляции
let cssAdminPathDest = pathPrefix + '/admin/css';

// Название результирующего файла
let cssAdminFileName = 'style.css';

// ------------- CSS 3D Settings ------------- //

// Путь к LESS файлу
let css3DPathSrc = pathPrefix + 'less/3d/style.less';

// Путь за наблюдаемыми файлами
let css3DPathWatch = cssAdminPathSrc;

// Путь компиляции
let css3DPathDest = pathPrefix + '3d';

// Название результирующего файла
let css3DFileName = 'style.css';

// ------------- Notify onError ------------- //

let notifyOnError = {
    errorHandler: notify.onError("Error: <%= error.message %>")
};

// ------------- SVG Sprite ------------- //

let svgSpritePathSrc = pathPrefix + 'svg-sprite/*.svg';

let svgSpritePathDest = pathPrefix + '';

// ------------- SVGO Settings ------------- //

let svgoPlugins = {
    removeViewBox: false,
    removeDimensions: true
};

// https://npm.taobao.org/package/svgo

// ------------- SVG Inline ------------- //

let svgInlinePathSrc = pathPrefix + 'svg-css/*.svg';

let svgInlineOptions = {
    className: '.icon-%s',
    //style: {fill: '#ffffff'}
};

let svgInlinePathDest = pathPrefix + 'less/components';

let svgInlineFileName = 'svg-sprite.less';

// ------------- END Settings ------------- //

function makeCSS() {

    //let cssFileName = require(pathPrefix + revManifestJsonCSSFileName)['style.css'];

    return gulp.src(cssPathSrc)
        .pipe(changed(cssPathDest))
        .pipe(debug({title: 'src'}))
        .pipe(plumber(notifyOnError))
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(debug({title: 'less'}))
        .pipe(concat(cssFileName))
        .pipe(debug({title: 'concat'}))
        .pipe(cleanDir(cssPathDest))
        .pipe(debug({title: 'cleanDir'}))
        .pipe(gulp.dest(cssPathDest))
        .pipe(browserSync.stream());
}

function makeMinifiedCSS() {

    return gulp.src(cssPathSrc)
        .pipe(debug({title: 'src'}))
        .pipe(plumber(notifyOnError))
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(debug({title: 'less'}))
        .pipe(concat(cssFileName))
        .pipe(debug({title: 'concat'}))
        .pipe(autoprefixer({overrideBrowserslist: ['last 4 versions'], cascade: false}))
        .pipe(debug({title: 'autoprefixer'}))
        .pipe(cleanCSS())
        .pipe(debug({title: 'minify'}))
        //.pipe(rev())
        //.pipe(debug({title: 'rev'}))
        .pipe(cleanDir(cssPathDest))
        .pipe(debug({title: 'cleanDir'}))
        .pipe(gulp.dest(cssPathDest))
        //.pipe(rev.manifest(revManifestJsonCSSFileName))
        //.pipe(debug({title: 'rev-manifest'}))
        .pipe(gulp.dest(pathPrefix));
}

function makeAdminCSS() {

    return gulp.src(cssAdminPathSrc)
        .pipe(debug({title: 'src'}))
        .pipe(plumber(notifyOnError))
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(debug({title: 'less'}))
        .pipe(concat(cssAdminFileName))
        .pipe(debug({title: 'concat'}))
        .pipe(gulp.dest(cssAdminPathDest));
}

function make3DCSS() {

    return gulp.src(css3DPathSrc)
        .pipe(debug({title: 'src'}))
        .pipe(plumber(notifyOnError))
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(debug({title: 'less'}))
        .pipe(concat(css3DFileName))
        .pipe(debug({title: 'concat'}))
        .pipe(gulp.dest(css3DPathDest));
}

function makeMinifiedJS() {

    return gulp.src(jsPathSrc/*, {since: gulp.lastRun('js')}*/)
        .pipe(debug({title: 'src'}))
        .pipe(plumber(notifyOnError))
        .pipe(babel())
        .pipe(debug({title: 'babel'}))
        .pipe(uglify())
        .pipe(debug({title: 'uglify'}))
        //.pipe(remember('js'))
        //.pipe(debug({title: 'remember'}))
        .pipe(concat(jsFileName))
        .pipe(debug({title: 'concat'}))
        //.pipe(rev())
        //.pipe(debug({title: 'rev'}))
        .pipe(cleanDir(jsPathDest))
        .pipe(debug({title: 'cleanDir'}))
        .pipe(gulp.dest(jsPathDest))
        //.pipe(rev.manifest(revManifestJsonJSFileName))
        //.pipe(debug({title: 'rev-manifest'}))
        .pipe(gulp.dest(pathPrefix));
}

function makeJS() {

    // let jsFileName = require(pathPrefix + revManifestJsonJSFileName)['script.js'];

    return gulp.src(jsPathSrc)
        .pipe(debug({title: 'src'}))
        .pipe(plumber(notifyOnError))
        .pipe(concat(jsFileName))
        .pipe(debug({title: 'concat'}))
        .pipe(cleanDir(jsPathDest))
        .pipe(debug({title: 'cleanDir'}))
        .pipe(gulp.dest(jsPathDest));
}

function browserSyncInit() {
    browserSync.init(browserSyncSettings);
}

function makeSvgSprite() {

    return gulp
        .src(svgSpritePathSrc)
        //.pipe(svgmin(svgMin))
        .pipe(svgo({plugins: [svgoPlugins]}))
        .pipe(svgstore())
        .pipe(gulp.dest(svgSpritePathDest))
        .pipe(notify('svgStore: done'));

    function svgMin(file) {

        let prefix = path.basename(file.relative, path.extname(file.relative));

        return {
            plugins: [{
                cleanupIDs: {
                    prefix: prefix + '-icon',
                    minify: true
                }
            }]
        }
    }
}

function makeSvgInlineCSS() {
    return gulp
        .src(svgInlinePathSrc)
        .pipe(svgInline(svgInlineOptions))
        .pipe(concat(svgInlineFileName))
        .pipe(gulp.dest(svgInlinePathDest));
}

// CSS
gulp.task('makeCSS', makeCSS);
gulp.task('makeMinifiedCSS', makeMinifiedCSS);
gulp.task('makeAdminCSS', makeAdminCSS);
gulp.task('make3DCSS', make3DCSS);

// JS
gulp.task('makeJS', makeJS);
gulp.task('makeMinifiedJS', makeMinifiedJS);

// browserSync
gulp.task('browserSync', browserSyncInit);

// SVG
gulp.task('makeSvgSprite', makeSvgSprite);
gulp.task('makeSvgInlineCSS', makeSvgInlineCSS);

// Default task
if (compileLess) {
    gulp.task('default', gulp.parallel('makeCSS', 'makeJS'));
} else {
    gulp.task('default', gulp.parallel('makeJS'));
}

// Production task
if (compileLess) {
    gulp.task('production', gulp.parallel('makeMinifiedCSS', 'makeMinifiedJS'));
} else {
    gulp.task('production', gulp.parallel('makeMinifiedJS'));
}

// Watch task
// gulp.task('watch', gulp.parallel('makeCSS', 'makeJS', 'browserSync', watchFiles));
gulp.task('watch', gulp.parallel('makeCSS', 'makeJS', watchFiles));

function watchFiles() {

    gulp.watch(jsPathWatch, gulp.series('makeJS'));
    gulp.watch(cssAdminPathWatch, gulp.series('makeAdminCSS'));

    if (compileLess) {
        gulp.watch(cssPathWatch, gulp.series('makeCSS'));
    }
}