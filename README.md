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
const {init} = require('some-dev-chain');

init({
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
});
```

##### Configuration example 2
```js
const {init} = require('some-dev-chain');

init({
	'bpd': {
		watch: {minmatch: 'apps/pages/**/*.js'},
		chain: [
			{name: 'getWatchedFile'},
			{name: 'browserify', globalVars: {
					isProduction: false, 
					appInfo: ({input}) => Object({
						number: input.dir.match(/([\d]+)$/)[1],
						name: input.dir.match(/([\w]+)\\[\d]+$/)[1]
					})
				} 
			},
			{name: 'writeFiles', afterDir: '/dist/', fileName: 'main'},
			{name: 'livereload', type: 'reload'}
		]
	},
	'bpr': {
		description: 'Build page script result with Babel',
		runFromCli: true,
		cliVars: '$n',
		chain: [
			{name: 'getFiles', path: 'apps/pages/($n)/main.js'},
			{name: 'babel', type: 'insert-polifils'},
			{name: 'browserify', globalVars: {
					isProduction: true, 
					appInfo: ({variables}) => Object({
						number: variables.$n,
						name: 'tests'
					})
				} 
			},
			{name: 'babel'},
			{name: 'minify'},
			{name: 'writeFiles', dir: 'apps/pages/($n)/dist/', fileName: 'main'},
			{name: 'livereload', type: 'reload'}
		]
	},
	'bppd': {
		watch: {minmatch: 'apps/php-pages/**/*.js'},
		chain: [
			{name: 'getWatchedFile'},
			{name: 'browserify', globalVars: {
					isProduction: false, 
					appInfo: ({input}) => Object({
						number: input.dir.match(/([\d]+)$/)[1],
						name: input.dir.match(/([\w]+)\\[\d]+$/)[1]
					})
				} 
			},
			{name: 'writeFiles', afterDir: '/dist/'},
			{name: 'livereload', type: 'reload'}
		]
	},
	'bppr': {
		description: 'Build page script result with Babel',
		runFromCli: true,
		cliVars: '$n $filename',
		chain: [
			{name: 'getFiles', path: 'apps/php-pages/($n)/($filename).js'},
			{name: 'babel', type: 'insert-polifils'},
			{name: 'browserify', globalVars: {
					isProduction: true, 
					appInfo: ({variables}) => Object({
						number: variables.$n,
						name: 'tests'
					})
				} 
			},
			{name: 'babel'},
			{name: 'minify'},
			{name: 'writeFiles', dir: 'apps/php-pages/($n)/dist/'},
			{name: 'livereload', type: 'reload'}
		]
	},

	'btd': {
		description: 'Build test-app',
		watch: {minmatch: 'apps/tests/**/*.js'},
		chain: [
			{name: 'getWatchedFile'},
			{name: 'browserify', globalVars: {
					isProduction: false, 
					appInfo: ({input}) => Object({
						number: input.dir.match(/([\d]+)$/)[1],
						name: input.dir.match(/([\w]+)\\[\d]+$/)[1]
					})
				} 
			},
			{name: 'writeFiles', afterDir: '/dist/', fileName: 'build'},
			{name: 'livereload', type: 'reload'}
		]
	},
	'btr': {
		description: 'Build test-app result with Babel',
		runFromCli: true,
		cliVars: '$n',
		chain: [
			{name: 'getFiles', path: 'apps/tests/($n)/app.js'},
			{name: 'babel', type: 'insert-polifils'},
			{name: 'browserify', globalVars: {
					isProduction: true, 
					appInfo: ({variables}) => Object({
						number: variables.$n,
						name: 'tests'
					})
				} 
			},
			{name: 'babel'},
			{name: 'minify'},
			{name: 'writeFiles', dir: 'apps/tests/($n)/dist/', fileName: 'build-r'},
			{name: 'livereload', type: 'reload'}
		]
	},
	'bte': {
		description: 'Build test-app external',
		runFromCli: true,
		cliVars: '$n',
		chain: [
			{name: 'getFiles', path: 'apps/tests/($n)/app.js'},
			{name: 'babel', type: 'insert-polifils'},
			{name: 'browserify', globalVars: {
					isProduction: true, 
					appInfo: ({variables}) => Object({
						number: variables.$n,
						name: 'tests'
					})
				} 
			},
			{name: 'babel'},
			{name: 'minify'},
			{name: 'insertChain', alias: 'css', chain: [
				{name: 'getFiles', path: 'apps/tests/($n)/app.scss'},
				{name: 'sass', globalVars: {isExternal: true}},
				{name: 'minify'},
				{name: 'cssToJs', styleName: 'test-engine'}
			]},
			{name: 'concat'},
			{name: 'writeFiles', dir: 'apps/tests/($n)/dist/', fileName: 'build-e'},
			{name: 'livereload', type: 'reload'}
		]
	},

	'scss': {
		description: 'Parse all scss',
		watch: {minmatch: 'apps/**/*.scss', ignoreByFilename: /^\_/},
		chain: [
			{name: 'getWatchedFile'},
			{name: 'sass', globalVars: {isExternal: false}},
			{name: 'minify'},
			{
				name: 'if', 
				handler: task => task.input.dir.indexOf('pages') > -1,
				then: [{name: 'writeFiles', afterDir: '/dist/', ext: '.css', ignoreRemoveFiles: /./}],
				else: [{name: 'writeFiles', afterDir: '/dist/', ext: '.css', ignoreRemoveFiles: /./}]
			},
			{name: 'livereload', type: 'changed'}
		]
	},
	'htmlReload': {
		watch: {minmatch: 'pages/**/*.html'},
		chain: [{name: 'livereload', type: 'reload'}]
	}
});
```