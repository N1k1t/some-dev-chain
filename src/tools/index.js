const {readdirSync} = require('fs');

module.exports = readdirSync(__dirname)
	.filter(path => path != __filename && /.js$/.test(path))
	.reduce((map, path) => ({...map, [pathToModuleName(path)]: require(`./${path}`)}), {});


/*
* @description 
* module-name.js => moduleName
*/
function pathToModuleName(path) {
	return path
		.replace(/\.js$/, '')
		.replace(/-[a-z]/g, value => value.substr(1).toUpperCase());
}