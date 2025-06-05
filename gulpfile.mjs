import { src, dest, watch, series, parallel } from "gulp";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";
import sourcemaps from "gulp-sourcemaps";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import terser from "gulp-terser";
import htmlmin from "gulp-htmlmin";
/* import newer from "gulp-newer"; */
import browserSyncLib from "browser-sync";
import { deleteAsync } from "del";
import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminOptipng from "imagemin-optipng";
import imageminSvgo from "imagemin-svgo";
import imageminPngquant from "imagemin-pngquant";
import gulpPug from "gulp-pug";

import { plural } from "./src/js/modules/plural.js";

const sass = gulpSass(dartSass);
const browserSync = browserSyncLib.create();

const paths = {
  pug: {
    src: "src/pug/pages/*.pug",
    dest: "dist/",
  },
  styles: {
    src: "src/scss/**/*.scss",
    dest: "dist/css/",
  },
  scripts: {
    src: "src/js/**/*.js",
    dest: "dist/js/",
  },
  images: {
    src: "src/images/**/*.{jpg,jpeg,png,svg}",
    dest: "dist/images/",
  },
};

export function clean() {
  return deleteAsync(["dist/**", "!dist"]);
}

export function fonts(){
  return src('src/fonts/**/*.{woff,woff2,ttf,otf,eot,svg}')
    .pipe(dest('dist/fonts'))
    .pipe(browserSync.stream());
};

export function swiper() {
  return src([
    'node_modules/swiper/swiper-bundle.min.js',
    'node_modules/swiper/swiper-bundle.min.css'
  ])
    .pipe(dest('dist/js'))
    .pipe(browserSync.stream());
};

export function styles() {
  return src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(cleanCSS({ level: 2 }))
    .pipe(sourcemaps.write("."))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

export function scripts() {
  return src(paths.scripts.src)
    .pipe(terser())
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

export function pug() {
  return src(paths.pug.src)
    .pipe(gulpPug({ pretty: true, 'locals': { plural } }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(paths.pug.dest))
    .pipe(browserSync.stream());
}

export async function images() {
  const files = await imagemin(["src/images/**/*.{jpg,jpeg,png,svg}"], {
    destination: "dist/images",
    plugins: [
      imageminMozjpeg({ quality: 40, progressive: true }),
      imageminOptipng({
        optimizationLevel: 7,
        bitDepthReduction: true,
        colorTypeReduction: true,
        paletteReduction: true,
      }),
      imageminPngquant({
        quality: [0.6, 0.8],
        speed: 1,
        strip: true,
        dithering: 0.5,
      }),
      // Enhanced SVG optimization
      imageminSvgo({
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
        ],
      }),
    ],
  });

  // Log more detailed information
  console.log(`Images optimized: ${files.length}`);

  return files;
}

async function logImageSizes() {
  const { promises: fs } = await import("fs");
  const path = await import("path");

  const srcDir = "src/images";
  const distDir = "dist/images";

  const files = await fs.readdir(srcDir);
  const pngFiles = files.filter((file) => file.endsWith(".png"));
  const svgFiles = files.filter((file) => file.endsWith(".svg"));

  console.log("PNG Optimization Report:");
  console.log("------------------------");

  for (const file of pngFiles) {
    const srcPath = path.join(srcDir, file);
    const distPath = path.join(distDir, file);

    try {
      const srcStat = await fs.stat(srcPath);
      const distStat = await fs.stat(distPath);

      const srcSize = srcStat.size;
      const distSize = distStat.size;
      const savings = (((srcSize - distSize) / srcSize) * 100).toFixed(2);

      console.log(
        `${file}: ${(srcSize / 1024).toFixed(2)}KB → ${(
          distSize / 1024
        ).toFixed(2)}KB (${savings}% saved)`
      );
    } catch (err) {
      console.log(`Error processing ${file}: ${err.message}`);
    }
  }

  console.log("\nSVG Optimization Report:");
  console.log("------------------------");

  for (const file of svgFiles) {
    const srcPath = path.join(srcDir, file);
    const distPath = path.join(distDir, file);

    try {
      const srcStat = await fs.stat(srcPath);
      const distStat = await fs.stat(distPath);

      const srcSize = srcStat.size;
      const distSize = distStat.size;
      const savings = (((srcSize - distSize) / srcSize) * 100).toFixed(2);

      console.log(
        `${file}: ${(srcSize / 1024).toFixed(2)}KB → ${(
          distSize / 1024
        ).toFixed(2)}KB (${savings}% saved)`
      );
    } catch (err) {
      console.log(`Error processing ${file}: ${err.message}`);
    }
  }
}

export function serve() {
  browserSync.init({
    server: {
      baseDir: "dist/",
    },
  });

  watch("src/pug/**/*.pug", pug);
  watch(paths.styles.src, styles);
  watch(paths.scripts.src, scripts);
  watch(paths.images.src, images);
  watch("src/fonts/*", fonts);
  watch("node_modules/swiper/**/*", swiper)
}

export const build = series(
  clean,
  parallel(pug, styles, scripts, images, fonts, swiper),
  logImageSizes
);

export default series(build, serve);

