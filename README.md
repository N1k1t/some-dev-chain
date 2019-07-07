# Some dev chain
Flexible handling and parsing of project sources

## Install
```sh
$ npm i --save-dev some-dev-chain
```

## CLI
##### Help
```sh
$ node_modules/.bin/dev-chain --help
```
##### Serve (servering handling from config)
```sh
$ node_modules/.bin/dev-chain serve :path-to-config
```
## Documentation
##### Parser tools
| Name | Description | Configuration
| ------ | ----------- | ------ |
| Sass | Sass parser | **globalVars** *::string[]* - Insert global variables into root of main sass module |
||| **paths** *::string[]* - Custom paths for import modules inside sass |
| Babel | Parsing to ES5 | - |
| Minify | Minify js (ES5) or css | - |
| Browserify | Builder of js modules | **globalVars** *::string[]* - Insert global variables into root of main js module |
||| **paths** *::string[]* - Custom paths for require modules inside js |
| Livereload | Livereload trigger | **type** *::string* - Use **"reload"** value for reload page |
||| **type** *::string* - Use **"change"** value for insert changes |

##### Inner tools
| Name | Description | Configuration
| ------ | ----------- | ------ |
| TODO | - | - |

## Run as service
Todo...

## Examples
##### Configuration example 1
```js
module.exports = {
	'pack': {
		watch: {
			minmatch: '**/test.js', ignore: '{*.json,node_modules}'
		},
		runFromCli: true,
		cliVars: '$input $output',
		description: 'compiler .js',
		chain: [
			{
				name: 'if', 
				variable: '$input',
				eq: /./, 
				then: [
					{name: 'setVariable', alias: '$dir', value: ({variables: vars}) => Path.dirname(vars.$input)},
					{name: 'getFiles', path: '($input)'}
				],
				else: [
					{name: 'setVariable', alias: '$dir', value: (task) => task.input.dir},
					{name: 'getWatchedFile'}
				]
			},
			{name: 'babel'},
			{name: 'browserify', globalVars: {}},
			{name: 'minify'},
			{name: 'insertChain', alias: 'css', chain: [
				{name: 'getFiles', path: '($dir)/test.scss'},
				{name: 'sass', globalVars: {a: '#fff'}},
				{name: 'minify'},
				{name: 'cssToJs'}
			]},
			{name: 'concat'},
			{
				name: 'if',
				variable: '$output',
				eq: /./,
				then: [{name: 'writeFiles', path: '($output)'}],
				else: [{name: 'writeFiles', dir: '($dir)/../dist/', fileName: 'result', ext: '.js'}]
			}
		]
	},
	'sass': {
		watch: {
			minmatch: '**/*.scss'
		},
		chain: [
			{name: 'getWatchedFile'},
			{name: 'setVariable', alias: '$dir', value: (task) => task.input.dir},
			{name: 'sass', globalVars: {a: '#fff'}},
			{name: 'minify'},
			{name: 'writeFiles', dir: '($dir)/../dist/', ext: '.css'}
		]
	},
	'reload': {
		runFromCli: true,
		chain: [
			{name: 'livereload', type: 'reload'}
		]
	}
};
```

##### Configuration example 2
```js
const Path = require('path');
const staticServiceDir = '../static';

module.exports = {
	'js-module': {
		description: 'Parse js modules places in views/js-modules/*.js',
		watch: {minmatch: 'src/views/js-modules/*.js', ignoreByFilename: /^\_/},
		chain: [
			{name: 'getWatchedFile'},
			{name: 'browserify'},
			{
				name: 'setVariable',
				alias: '$moduleName',
				value: (task) => `_module.${task.input.base}`
			},
			{name: 'writeFiles', path: `${staticServiceDir}/scripts/($moduleName)`},
			{name: 'livereload', type: 'reload'}
		]
	},
	'js-page': {
		description: 'Parse js places in views/pages/**/*.js',
		watch: {minmatch: 'src/views/pages/**/*.js', ignoreByFilename: /^\_/},
		chain: [
			{name: 'getWatchedFile'},
			{name: 'browserify'},
			{
				name: 'setVariable',
				alias: '$moduleName',
				value: ({inputFilePaths}) => `${_parseModuleName(inputFilePaths[0])}.${Path.parse(inputFilePaths[0]).name}.js`
			},
			{name: 'writeFiles', path: `${staticServiceDir}/scripts/($moduleName)`},
			{name: 'livereload', type: 'reload'}
		]
	},
	'pack-scripts': {
		description: 'Parse result of all js modules with babel',
		runFromCli: true,
		chain: [
			{name: 'getFiles', path: ['src/views/pages/**/*.js', 'src/views/js-modules/*.js'], ignoreByFilename: /^\_/},
			{name: 'babel'},
			{name: 'browserify', globalVars: {}},
			{name: 'minify'},
			{
				name: 'middleware', 
				handler: ({files}) => {
					files.forEach(file => {
						const {dir, name, full} = file.pathSegments;

						if (dir.indexOf('views/js-modules') > -1) return file.setName(`_module.${name}`);

						const moduleName = _parseModuleName(full);
						return file.setName(`${moduleName}.${name}`);
					});
				}
			},
			{name: 'writeFiles', dir: `${staticServiceDir}/scripts`},
			{name: 'livereload', type: 'reload'}
		]
	},

	'scss-module': {
		description: 'Parse scss modules places in views/scss-modules/*.scss',
		watch: {minmatch: 'src/views/scss-modules/*.scss', ignoreByFilename: /^\_/},
		chain: [
			{name: 'getWatchedFile'},
			{name: 'sass'},
			{name: 'minify'},
			{
				name: 'setVariable',
				alias: '$moduleName',
				value: ({inputFilePaths}) => `_module.${Path.parse(inputFilePaths[0]).name}`
			},
			{name: 'writeFiles', path: `${staticServiceDir}/css/($moduleName).css`, ignoreRemoveFiles: /.*/},
			{name: 'livereload', type: 'change'}
		]
	},
	'scss-page': {
		description: 'Parse scss places in views/pages/**/*.scss',
		watch: {minmatch: 'src/views/pages/**/*.scss', ignoreByFilename: /^\_/},
		chain: [
			{name: 'getWatchedFile'},
			{name: 'sass'},
			{name: 'minify'},
			{
				name: 'setVariable',
				alias: '$moduleName',
				value: ({inputFilePaths}) => `${_parseModuleName(inputFilePaths[0])}.${Path.parse(inputFilePaths[0]).name}.css`
			},
			{name: 'writeFiles', path: `${staticServiceDir}/css/($moduleName)`, ignoreRemoveFiles: /.*/},
			{name: 'livereload', type: 'change'}
		]
	}
};


function _parseModuleName(filePath) {
	filePath = Path.normalize(filePath);

	const componentPathSegments = Path.parse(filePath);
	const pathSegments = componentPathSegments.dir.split(Path.sep);
	let result = '';

	for (const key in pathSegments) {
		const segment = pathSegments[pathSegments.length - key - 1];
		if (segment == 'views') break;

		result += `${segment}.`;
	}

	return result.replace(/\.$/, '');
}
```