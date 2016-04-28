/* Project Packages
==================================================================================================== */
// Include Gulp
var gulp = require('gulp-help')(require('gulp'), {'description': '', 'hideEmpty': true, 'hideDepsMessage': true});
var config = require('./config');
// CSS plugins
var sass = require('gulp-sass');
var rucksack = require('gulp-rucksack');
var sourcemaps = require('gulp-sourcemaps');
// JS plugins
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var newer = require('gulp-newer');
// Static HTML plugins
var preprocess = require('gulp-preprocess');
var htmlclean = require('gulp-htmlclean');
// NPM Packages
var del = require('del');
var cp = require('child_process');
var size = require('gulp-size');
var gutil = require('gulp-util');
var shell = require('gulp-shell');
var insert = require('gulp-insert');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var browserSync = require('browser-sync');
var sequence = require('run-sequence').use(gulp);

// CLI flags
// $ gulp [TASK] [--production] [--watch]

/* TASKS
==================================================================================================== */
// `help` will list available task(s)
// $ gulp help

/* Determine project type and start tasks
--------------------------------------------------------------------------- */
gulp.task('default', false, function() {
    sequence(config.buildType);
});

/* Task: Static HTML build
--------------------------------------------------------------------------- */
gulp.task('static', 'Build static HTML page(s) w/ includes', function(done) {
    sequence('clean', 'html:static', ['styles', 'copy:styles', 'scripts', 'copy:scripts']);
    if (config.flag.doWatch) { sequence('watch', done); }
}, {
    options: {
        'production': config.flag.message.production,
        'watch': config.flag.message.watch
    }
});

/* Task: Jekyll HTML build
--------------------------------------------------------------------------- */
gulp.task('jekyll', 'Build static HTML page(s) via Jekyll', function(done) {
    sequence('clean', 'html:jekyll', ['styles', 'copy:styles', 'scripts', 'copy:scripts']);
    if (config.flag.doWatch) { sequence('watch', done); }
}, {
    options: {
        'production': config.flag.message.production,
        'watch': config.flag.message.watch
    }
});

/* Task: Jekyll HTML build
--------------------------------------------------------------------------- */
gulp.task('drupal', 'Build PHP page(s) via Drupal', function(done) {
    sequence('drush', 'clean', ['styles', 'copy:styles', 'scripts', 'copy:scripts']);
    if (config.flag.doWatch) { sequence('watch', done); }
}, {
    options: {
        'production': config.flag.message.production,
        'watch': config.flag.message.watch
    }
});

/* SUB-TASKS
==================================================================================================== */
var reportError = function (error) {
    var lineNumber = (error.line) ? 'LINE ' + error.line + ' -- ' : '';

    notify({
        title: 'Task Failed [' + error.plugin + ']',
        message: lineNumber + 'See console.',
        sound: config.browsersync.sound
    }).write(error);

    // Pretty error reporting
    var report = '';
    var chalk = gutil.colors.white.bgRed;

    report += chalk('TASK:') + ' [' + error.plugin + ']\n';
    if (error.line) { report += chalk('LINE:') + ' ' + error.line + '\n'; }
    report += chalk('PROB:') + ' ' + error.messageFormatted + '\n';
    console.error(report);

    // Prevent the 'watch' task from stopping
    this.emit('end');
}

/* Clean
--------------------------------------------------------------------------- */
gulp.task('clean:assets', false, function(done) {
    return del([
        config.js.destination,
        config.scss.destination
    ], {force: true}, done);
});

gulp.task('clean:files', false, function(done) {
    if (/(static|jekyll)/.test(config.buildType)) {
        return del([
            config.build + '/!(assets)*'
        ], {force: true}, done);
    }
    done();
});

gulp.task('clean', false, function(done) {
    return sequence('clean:assets', 'clean:files', done);
});

/* Convert SCSS to CSS
--------------------------------------------------------------------------- */
gulp.task('styles', false, function() {
    return gulp
        .src(config.scss.files)
        .pipe(plumber({ errorHandler: reportError }))
        .pipe(config.flag.isDevelopment ? sourcemaps.init() : gutil.noop())
        .pipe(sass(config.scss.options))
        .pipe(config.flag.isDevelopment ? size({title: 'SCSS: '}) : gutil.noop())
        .pipe(rucksack({ fallbacks: true, autoprefixer: true }))
        .pipe(config.flag.isDevelopment ? size({title: 'PostCSS: '}) : gutil.noop())
        /*.pipe(config.flag.isDevelopment ? size({title: 'Compressed: ', gzip: true}) : gutil.noop())*/
        .pipe(config.flag.isDevelopment ? sourcemaps.write('.') : gutil.noop())
        .pipe(insert.transform(function(contents, file) {
            return config.meta.banner() + '\n\n' + contents;
        }))
        .pipe(gulp.dest(config.scss.destination))
        .pipe(config.flag.doWatch ? browserSync.reload({ stream: true }) : gutil.noop());
});

/* Javascript
--------------------------------------------------------------------------- */
gulp.task('scripts', false, function() {
    return gulp
        .src(config.js.concatFiles,  {base: config.source + '/js'})
        .pipe(plumber({ errorHandler: reportError }))
        .pipe(insert.transform(function(contents, file) {
            var divider = '// ' + Array(101).join('=') + '\n';
            var relative_file_path = file.path.substring(file.path.indexOf('/' + config.source.split('/').pop() + '/'));
            return divider + '// FILE: ' + relative_file_path + '\n' + divider + '\n' + contents;
        }))
        .pipe(concat(config.js.filename))
        .pipe(insert.transform(function(contents, file) {
            return config.meta.banner() + '\n\n' + contents;
        }))
        .pipe(config.flag.isDevelopment ? size({title: 'JS Files Merged: '}) : gutil.noop())
        .pipe(gulp.dest(config.js.destination))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(config.flag.isDevelopment ? size({title: 'JS Files Condensed: '}) : gutil.noop())
        /*.pipe(config.flag.isDevelopment ? size({title: 'JS Files Compressed: ', gzip: true}) : gutil.noop())*/
        .pipe(gulp.dest(config.js.destination));
});

/* Copy Files
--------------------------------------------------------------------------- */
gulp.task('copy:styles', false, function() {
    return gulp
        .src(config.scss.copyFiles,  {base: config.source + '/css'})
        .pipe(plumber({ errorHandler: reportError }))
        .pipe(newer(config.scss.destination))
        .pipe(gulp.dest(config.scss.destination));
});

gulp.task('copy:scripts', false, function() {
    return gulp
        .src(config.js.copyFiles,  {base: config.source + '/js'})
        .pipe(plumber({ errorHandler: reportError }))
        .pipe(newer(config.js.destination))
        .pipe(gulp.dest(config.js.destination));
});

/* Page Structure: Static
--------------------------------------------------------------------------- */
gulp.task('html:static', false, function() {
    return gulp
        .src(config.html.files)
        .pipe(plumber({ errorHandler: reportError }))
        .pipe(preprocess({ context: config.html.context }))
        .pipe(config.flag.isProduction ? htmlclean() : gutil.noop())
        .pipe(gulp.dest(config.html.destination));
});

/* Page Structure: Jekyll
--------------------------------------------------------------------------- */
gulp.task('html:jekyll', false, function(done) {
    // add '--profile' flag to analyze your site's build time, so you can see exactly where things can be sped up
    return cp.spawn('jekyll', [
        'build',
        /*'--profile',*/
        '--incremental',
        '--source=' + config.jekyll.source,
        '--destination=' + config.jekyll.destination,
        '--config=' + config.jekyll.config
    ], {stdio: 'inherit'}).on('close', done);
});

/* BrowserSync (local server)
--------------------------------------------------------------------------- */
gulp.task('browsersync', false, function() {
    browserSync(config.browsersync);
});

/* Run drush to clear the theme registry.
--------------------------------------------------------------------------- */
gulp.task('drush', function(done) {
    return gulp
        .src('', {read: false})
        .pipe(shell(['drush cache-clear theme-registry']));
});

/* Watch Files for Changes
--------------------------------------------------------------------------- */
gulp.task('watch', false, ['browsersync'], function() {
    gulp.watch([config.scss.watchFiles]).on('change', function() {
        sequence('styles', browserSync.reload);
    });
    gulp.watch([config.scss.copyFiles]).on('change', function() {
        sequence('copy:styles', browserSync.reload);
    });
    gulp.watch(config.js.watchFiles).on('change', function() {
        sequence('scripts', browserSync.reload);
    });
    gulp.watch(config.js.copyFiles).on('change', function() {
        sequence('copy:scripts', browserSync.reload);
    });

    // Watch specific set of files determined by "flag.buildType"
    var structure = {
        'static': function() {
            gulp.watch(config.html.watch).on('change', function() {
                sequence('html:static', browserSync.reload);
            });
        },
        'jekyll': function() {
            gulp.watch(config.jekyll.files).on('change', function() {
                sequence('html:jekyll', browserSync.reload);
            });
        },
        'drupal': function() {
            gulp.watch(config.build + '/**/*.{php,inc,info}').on('change', function() {
                sequence('drush', browserSync.reload);
            });
        }
    };
    structure[config.buildType]();
});
