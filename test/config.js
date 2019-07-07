const Path = require('path');

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
					{name: 'setVariable', alias: '$dir', value: ({$input}) => Path.dirname($input)},
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
}