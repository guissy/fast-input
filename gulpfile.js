// npm i -D babel-core babel-plugin-transform-runtime babel-plugin-import babel-plugin-dva-hmr babel-runtime
// npm i -D gulp gulp-bump gulp-git gulp-if gulp-imagemin gulp-rename gulp-tsc gulp-typescript gulp-util gulp-replace run-sequence del
// npm i -D typescript awesome-typescript-loader @types/react @types/react-router @types/react-redux @types/node typed-css-modules
// npm i -D jest ts-jest @types/jest enzyme @types/enzyme identity-obj-proxy redux-mock-store react-addons-test-utils react-addons-test-utils @types/react-addons-test-utils
// npm i -D tslint tslint-react tslint-eslint-rules
// npm i -D mockjs
// npm i -D jscodeshift relative simple-uppercamelcase left-pad
// npm i -S antd

const gulp = require('gulp');
const runSequence = require('run-sequence');
const bump = require('gulp-bump');
const gutil = require('gulp-util');
const git = require('gulp-git');
const gulpif = require('gulp-if');
const fs = require('fs');
const through2 = require('through2');
const rename = require('gulp-rename');
const tsc = require('gulp-tsc');
const imagemin = require('gulp-imagemin');
const replace = require('gulp-replace');
const del = require('del');

gulp.task('css2less', () => {
  return gulp.src(['src/**/*.css'])
    .on('data', file => del(file.path))
    .pipe(rename({ extname: '.less' }))
    .pipe(gulp.dest('src'));
});
gulp.task('jsx2tsx', () => {
  return gulp.src(['src/router.js', 'src/routes/**/*.js'], { base: 'src' })
    .pipe(replace(/\w+\.propTypes = {\n\s*};/, ''))
    .pipe(replace(/import React/, 'import * as React'))
    .pipe(replace(/import styles/, 'import * as styles'))
    .pipe(replace(/\.css('|")/, '.less$1'))
    .pipe(replace(/const (\w+) = () => \{/, 'const $1: React.SFC<any> = () => {'))
    .on('data', file => del(file.path))
    .pipe(rename({ extname: '.tsx' }))
    .pipe(gulp.dest('src'));
});
gulp.task('js2ts', () => {
  return gulp.src(['src/**/*.js', '!src/router.js', '!src/routes/**/*.js', '!src/components/**/*.js'])
    .pipe(replace(/import React/, 'import * as React'))
    .pipe(replace(/\.css('|")/, '.less$1'))
    .pipe(replace(/(\n\s+\/\/ 1\. Initialize)/, '\nimport {browserHistory} from \'dva/router\';\nimport router from \'./router\';$1'))
    .pipe(replace('require(\'./router\')', 'router'))
    .pipe(replace('dva()', 'dva({history: browserHistory})'))
    .on('data', file => del(file.path))
    .pipe(rename({ extname: '.ts' }))
    .pipe(gulp.dest('src'));
});
gulp.task('request', ['css2less', 'jsx2tsx', 'js2ts'], () => {
  return gulp.src('src/utils/request.*')
    .pipe(through2.obj((file, enc, cb) => {
      let content = file.contents.toString();
      if (!content.includes('options?')) {
        const source = 'request(url, options)';
        const target = 'request(url: string, options?:{method?: string;})';
        const source2 = 'const error';
        const target2 = 'const error: any';
        content = content.replace(source, target);
        content = content.replace(source2, target2);
      }
// eslint-disable-next-line no-param-reassign
      file.contents = new Buffer(content);
      cb(null, file);
    }))
    .pipe(gulp.dest('src/utils/'));
});

gulp.task('tsconfig', () => {
  if (!fs.existsSync('./tsconfig.json')) {
    fs.writeFileSync('tsconfig.json', `{
  "transpileOnly": true,
  "compilerOptions": {
    "outDir": "./dist/",
    "sourceMap": true,
    "noImplicitAny": true,
    "module": "commonjs",
    "moduleResolution": "node",
    "target": "es5",
    "lib": ["dom","es6","ES2016.Array.Include","dom.iterable","scripthost","es2017.object"],
    "allowJs": false,
    "traceResolution": false,
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "strictNullChecks": false,
    "jsx": "react",
    "skipDefaultLibCheck": true,
    "types": [
      // add node as an option
      "node"
   ],
   // typeRoots option has been previously configured
   "typeRoots": [
      // add path to @types
      "node_modules/@types"
   ]
  },
  "include": [
    "typings/dva.d.ts",
    "./src/**/*.ts",
    "./src/**/*.tsx"
  ],
  "exclude": [
    "./src/**/*.spec.tsx",
    "./src/**/*.spec.ts",
    "node_modules"
  ]
}`);
  }
});

gulp.task('typedCssModules', () => {
  require('child_process').exec('tcm -c -p src/**/*.less');
  if (!(require('./package.json').scripts.tcm)) {
    return gulp.src(['package.json'])
      .pipe(replace(/("build": "roadhog build",)/, '$1\n    "tcm": "tcm -p src/**/*.less -w",'))
      .pipe(gulp.dest('.'));
  }
});


gulp.task('js2tsQueue', ['request', 'tsconfig', 'typedCssModules']);


gulp.task('roadhogrc', () => {
  return gulp.src(['.roadhogrc'])
    .pipe(replace(/\{/, 'export default {'))
    .pipe(replace(/index\.js/, 'index.ts'))
    .pipe(replace(/"transform-runtime"/, '"transform-runtime",  ["import", { "libraryName": "antd", "libraryDirectory": "lib", "style": true }]'))
    .on('data', file => del(file.path))
    .pipe(rename({ basename: '.roadhogrc', extname: '.js' }))
    .pipe(gulp.dest('.'));
});

gulp.task('webpack.config.dev', () => {
  return gulp.src('./node_modules/roadhog/lib/config/webpack.config.{dev,prod}.js')
    .pipe(through2.obj((file, enc, cb) => {
      let content = file.contents.toString();
      const source0 = '\'tsx\',';
      const target0 = '\'.tsx\',';
      content = content.replace(source0, target0);
      const source1 = 'exclude: [/\\.html$/, /\\.(js|jsx)$/, /\\.(css|less)$/, /\\.json$/, /\\.svg$/],';
      const target1 = 'exclude: [/\\.html$/, /\\.(js|jsx)$/, /\\.(css|less)$/, /\\.json$/, /\\.svg$/, /\\.tsx?$/],';
      content = content.replace(source1, target1);
      const source2 = 'test: /\\.(js|jsx)$/,';
      const target2 = `test: /\\.(ts|tsx)$/,
        include: paths.appSrc,
        loader: 'awesome-typescript?configFileName=tsconfig.json'
      }, {
        test: /\\.(js|jsx)$/,`;
      if (!content.includes('awesome-typescript')) content = content.replace(source2, target2);
      const source31 = 'loader: \'style!\' + cssLoaders.own.join(\'!\')';
      const target31 = 'loader: \'style!\' + cssLoaders.own.join(\'!\') +' +
        ' \'!\'+paths.appDirectory+\'/build/css/antd-css-loader.js\'';
      const source32 = 'cssLoaders.own.join(\'!\') + \'!less?{"modifyVars":\' + theme + \'}\'';
      const target32 = 'cssLoaders.own.join(\'!\') + \'!less!\'+paths.appDirectory+\'/build/css/antd-css-loader.js\'';
      if (!content.includes('antd-css-loader')) {
        content = content.split(source31).join(target31);
        content = content.split(source32).join(target32);
      }

// eslint-disable-next-line no-param-reassign
      file.contents = new Buffer(content);
      cb(null, file);
    }))
    .pipe(gulp.dest('./node_modules/roadhog/lib/config/'));
});


gulp.task('getEntry', () => {
  return gulp.src('node_modules/roadhog/lib/utils/getEntry.js')
    .pipe(through2.obj((file, enc, cb) => {
      let content = file.contents.toString();
      const source = '(filePath, \'.js\')';
      const target = '(filePath, \'.ts\')';
      content = content.replace(source, target);
// eslint-disable-next-line no-param-reassign
      file.contents = new Buffer(content);
      cb(null, file);
    }))
    .pipe(gulp.dest('node_modules/roadhog/lib/utils/'));
});

gulp.task('router.d.ts', () => {
  return gulp.src('node_modules/dva/router.d.ts')
    .pipe(through2.obj((file, enc, cb) => {
      let content = file.contents.toString();
      const source = 'import PropTypes from "react-router/lib/PropTypes';
      const target = 'import * as PropTypes from "react-router/lib/PropTypes';
      content = content.replace(source, target);
// eslint-disable-next-line no-param-reassign
      file.contents = new Buffer(content);
      cb(null, file);
    }))
    .pipe(gulp.dest('node_modules/dva/'));
});


gulp.task('dva.d.ts', () => {
  // typings/dva.d.ts
  if (!fs.existsSync('typings')) {
    fs.mkdirSync('typings');
  }
  fs.writeFileSync('typings/dva.d.ts', `import * as H from 'history';
import * as R from 'react-router';

declare global {
  namespace HistoryModule {
    export type History = H.History;
  }
  namespace ReactRouter {
    export type PlainRoute = any;
    export type RouteProps = R.RouteProps;
    export type RouterState = any;
    export type StringifyQuery = any;
    export type RedirectFunction = any;
    export type LeaveHook = any;
    export type EnterHook = any;
    export type RouteHook = any;
    export type RouterListener = any;
    export type RouterOnContext = any;
    export type RouteComponentProps<P, S> = R.RouteComponentProps<P>;
    export type HistoryBase = any;
    export type ParseQueryString = any;
  }
  export interface Action {
    type: any;
    payload?: any;
  }
  export interface ReduxProps {
    dispatch?: (action: Action) => void;
  }
}`);
});

gulp.task('roadhogQueue', ['roadhogrc', 'webpack.config.dev', 'getEntry', 'router.d.ts', 'dva.d.ts']);


gulp.task('jest', () => {
  if (!(require('./package.json').jest)) {
    fs.writeFileSync('jest-setup.js', `/* eslint-disable no-undef */
window.matchMedia =
  window.matchMedia ||
  (() => {
    return { matches: false, addListener: () => {}, removeListener: () => {} };
  });`);
    fs.writeFileSync('src/router.spec.tsx', `import {browserHistory} from 'dva/router';
import {shallow} from 'enzyme';
import * as React from 'react';
import IndexPage from './pages/index/IndexPage';
import Router from './router';

test('router: / => IndexPage', () => {
  const wrapper = shallow(<Router history={browserHistory} />);
  const route = wrapper;
  expect(route.find({component: IndexPage})).toEqual(route.find({path: '/'}));
});
`);
    fs.writeFileSync('src/index.spec.ts', `beforeAll(() => {
  const div = document.createElement('div');
  div.id = 'root';
  return document.body.appendChild(div);
});

test('index: #root', () => {
  require('./index');
  const root = document.querySelector('#root');
  expect(root.childNodes[0].textContent).toContain('react-empty');
});`);
    return gulp.src(['package.json'])
      .pipe(replace(/("build": "roadhog build",)/, '$1\n    "test": "jest",'))
      .pipe(replace(/("dependencies":)/, `"jest": {
    "moduleFileExtensions": [
      "ts",
      "tsx",
      "js"
    ],
      "setupFiles": [
      "./jest-setup.js"
    ],
      "moduleDirectories": [
      "node_modules"
    ],
      "transform": {
      "\\\\.(ts|tsx)$": "<rootDir>/node_modules/ts-jest/preprocessor.js"
    },
    "testRegex": "/src/.*\\\\.spec\\\\.(ts|tsx|js)$",
      "globals": {
      "__TS_CONFIG__": {
        "module": "commonjs",
          "jsx": "react"
      }
    },
    "moduleNameMapper": {
      "\\\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
        "\\\\.(css|less)$": "identity-obj-proxy"
    }
  },
    $1`))
      .pipe(gulp.dest('.'));
  }
});

gulp.task('tslint', () => {
  if (!fs.existsSync('tslint.json')) {
    fs.writeFileSync('tslint.json', `{
  "extends": ["tslint:latest", "tslint-react", "tslint-config-airbnb", "tslint-eslint-rules"],
  "rules": {
    "interface-name": [true, "never-prefix"],
    "object-literal-sort-keys": false,
    "quotemark": [true, "single", "avoid-escape", "jsx-double"],
    "max-line-length": {
      "options": [120]
    },
    "new-parens": true,
    "no-arg": true,
    "no-bitwise": true,
    "no-conditional-assignment": true,
    "no-consecutive-blank-lines": false,
    "no-console": {
      "options": [
        "debug",
        "info",
        "log",
        "time",
        "timeEnd",
        "trace"
      ]
    },
    "ter-arrow-parens": false,
    "jsx-no-multiline-js": false,
    "jsx-no-lambda": false,
    "jsx-wrap-multiline": false,
    "semicolon": [true, "always", "ignore-bound-class-methods"]
  },
  "jsRules": {
    "max-line-length": {
      "options": [120]
    }
  }
}`);
  }
  if (!(require('./package.json').scripts.tslint)) {
    return gulp.src(['package.json'])
      .pipe(replace(/("build": "roadhog build",)/, '$1\n    "tslint": "tslint -p tsconfig.json -c tslint.json -e node_modules",'))
      .pipe(gulp.dest('.'));
  }
});

gulp.task('mock', () => {
  fs.writeFileSync('.roadhogrc.mock.js', `'use strict';

const mock = {};
require('fs')
  .readdirSync(require('path').join(__dirname + '/mock'))
  .filter(file=>file.endsWith('.js'))
  .filter(file=>!file.includes('plugin'))
  .forEach(function (file) {
    Object.assign(mock, require('./mock/' + file));
  });

export default mock;`);
});

gulp.task('pages', () => {
  if (!fs.existsSync('src/pages')) {
    fs.mkdirSync('src/pages');
    fs.mkdirSync('src/pages/index');
    const exec = require('child_process').exec;
    gulp.src('src/models/example.ts')
      .pipe(rename('IndexPage.model.ts'))
      .pipe(replace(/example/, 'indexPage'))
      .pipe(gulp.dest('src/pages/index'))
      .on('end', () => {
        exec('rm -rf src/models');
      });
    gulp.src('src/services/example.ts')
      .pipe(rename('IndexPage.service.ts'))
      .pipe(replace(/\.\./, '../..'))
      .pipe(gulp.dest('src/pages/index'))
      .on('end', () => {
        exec('rm -rf src/services');
      });
    gulp.src('src/routes/*')
      .pipe(replace('../assets', '../../assets'))
      .pipe(gulp.dest('src/pages/index'))
      .on('end', () => {
        exec('rm -rf src/routes');
      });
    gulp.src('src/router.tsx')
      .pipe(replace(/routes/, 'pages/index'))
      .pipe(gulp.dest('src'));
    exec('rm -rf src/components');
  }
});

gulp.task('default', (done) => {
  runSequence(
    'js2tsQueue',
    'roadhogQueue',
    'jest',
    'tslint',
    'pages',
    'mock',
    done);
});
