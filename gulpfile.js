'use strict'

const
	gulp = require('gulp'),
	sourcemaps = require('gulp-sourcemaps'),
	postcss = require('gulp-postcss'),
	less = require('gulp-less'),
	imgmin = require('gulp-imagemin'),
	htmlmin = require('gulp-htmlmin'),
	jsmin = require('gulp-uglify'),
	// concat = require('gulp-concat'),
	// del = require('del'),
	rigger = require('gulp-rigger'),
	babel = require('gulp-babel'),
	bs = require('browser-sync').create(),
	newer = require('gulp-changed'),
	less_newer = require('gulp-less-changed'),
	// remember = require('gulp-remember'),
	svgOptions = {
		plugins: [
			{addAttributesToSVGElement: {attributes: [
				{preserveAspectRatio: 'none'},
			]}},
			{removeViewBox: false},
			// {removeDimensions: true},
		],
	}

function html() {
	return gulp.src('src/*.html')
		.pipe(rigger())
		.pipe(gulp.dest('dev'))
}

function min_html() {
	return gulp.src('dev/*.html')
		.pipe(htmlmin({
			collapseWhitespace: true,
			conservativeCollapse: true,
			removeComments: true,
			minifyCSS: true,
			minifyJS: true,
		}))
		.pipe(gulp.dest('docs'))
}

function css() {
	// return gulp.src('src/less/**/!(_*.less)*.less')
	return gulp.src('src/less/*.less')
		.pipe(less_newer())
		.pipe(sourcemaps.init({
			loadMaps: true,
			largeFile: true,
		}))
		.pipe(sourcemaps.identityMap())
		.pipe(less())
		.pipe(postcss([
			// require('postcss-font-magician'),
			require('postcss-inline-svg')({
				path: 'dev/img',
			}),
			require('postcss-svgo')(svgOptions),
			require('postcss-focus'),
		],
		// {syntax: require('postcss-less')},
		))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dev/css'))
}

function min_css() {
	return gulp.src('dev/css/*.css')
		.pipe(postcss([
			require('autoprefixer'),
			require('postcss-csso')({
				// restructure: false,
				debug: true,
				comments: false,
			}),
			require('css-mqpacker')({
				sort: true,
			}),
			require('postcss-mq-last'),
		]))
		.pipe(gulp.dest('docs/css'))
}

function js() {
	return gulp.src('src/js/*.js')
		.pipe(sourcemaps.init({
			loadMaps: true,
			largeFile: true
		}))
		.pipe(sourcemaps.identityMap())
		.pipe(rigger())
		// .pipe(concat('index.js'))
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dev/js'))
}

function min_js() {
	return gulp.src('dev/js/*.js')
		.pipe(jsmin())
		.pipe(gulp.dest('docs/js'))
}

function min_img() {
	return gulp.src('dev/img/*', {since: gulp.lastRun(min_img)})
		.pipe(newer('docs/img'))
		.pipe(imgmin([
			imgmin.gifsicle(),
			imgmin.jpegtran(),
			imgmin.optipng(),
			imgmin.svgo(svgOptions)
			]))
		.pipe(gulp.dest('docs/img'))
}

// watch
function watch_html() {
	return gulp.watch(['src/*.html', 'src/tpl/*.html'], html)
}

function watch_css() {
	return gulp.watch('src/less', css)
}

function watch_js() {
	return gulp.watch('src/js', js)
}

function refresh() {
	bs.init({
		server: 'dev',
		// tunnel: true,
		browser: "chrome",
		ghostMode: {
			scroll: false
		}
	})
	bs.watch('dev').on('change', bs.reload)
}

// tasks
gulp.task('default', gulp.parallel(refresh, watch_html, watch_css, watch_js))
gulp.task('try', gulp.parallel(html, css, js))

gulp.task('build', gulp.parallel(min_html, min_css, min_js, min_img))
