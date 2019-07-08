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
##### Configure tasks
Todo...

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

##### Read/write files tools
| Name | Description | Configuration
| ------ | ----------- | ------ |
| getFiles | Get files for inserting into chain | **[REQUIRED]** **path** *::string* - Path as minmatch |
||| **ignoreByFilename** *::RegExp* - Use for ignoring files by name of file |
||| **globOptions** *::object* - Glob params. See https://www.npmjs.com/package/glob |
| getWatchedFiles | Get changed file from watcher | - |
| writeFiles | Get changed file from watcher | **path** *::string* - Write file with absolute path. Use for single file |
||| **dir** *::string* - Change dir path of files |
||| **afterDir** *::string* - Add path after files dir paths. Relative paths like "../../" is supported |
||| **fileName** *::string* - Change name of files |
||| **prefix** *::string* - Insert prefix after name of file into files |
||| **ext** *::string* - Change ext of files |

##### Inner tools
| Name | Description | Configuration
| ------ | ----------- | ------ |
| TODO | - | - |

## Run as service
Todo...

## Examples
##### Configuration example
```js
const Path = require('path');
const staticServiceDir = '../static';

module.exports = {
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