const {srcPath, distPath} = require('../utils');
const timestamp = Date.now();

module.exports = {
	description: 'Test task',
	timestamp,
	
	chain: [
		{name: 'setVariable', alias: '$path', value: srcPath},
		{name: 'getFiles', path: '($path)/module.js'},
		{name: 'browserify', globalVars: {a: 'test'}},
		{name: 'babel'},
		{name: 'minify'},
		{name: 'insertChain', chain: [{name: 'setVariable', alias: '$dist', value: distPath}]},
		{name: 'writeFiles', dir: '($dist)', prefix: timestamp}
	]
};