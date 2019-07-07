const promiseWrap = require('./promise-wrap');
const Path = require('path');

module.exports = {
	eachFiles,
	insertValiablesInPath,
	parseCliArgsAsVariables,
	promiseWrap,
	catchError,
	getEnvValue
};


function insertValiablesInPath(variables = {}, path) {
	const matches = path.match(/\(\$[\w]+\)/g) || [];

	for (const match of matches) {
		const variable = match.substr(1, match.length - 2);
		const value = variables[variable];

		path = path.replace(match, value);
	}

	return Path.normalize(path);
}
function parseCliArgsAsVariables(params, ...args) {
	return args.reduce((map, value, key) => ({...map, [params[key]]: value}), {});
}

function eachFiles(files, cb) {
	return Promise.all([...files.values()].map(file => new Promise(resolve => cb(file, resolve))));
}
function catchError(fn) {
	return fn.then(result => [null, result]).catch(error => [error]);
}
function getEnvValue(key) {
	return process.env[key];
}