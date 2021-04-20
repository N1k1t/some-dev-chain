const Path = require('path');

const promiseWrap = require('./promise-wrap');
const babelInclude = require('./babel-include');

module.exports = {
	eachFiles,
	insertValiablesInPath,
	parseCliArgsAsVariables,
	promiseWrap,
	catchError,
	getEnvValue,
	babelInclude
};


function insertValiablesInPath(variables = {}, path) {
	const matches = path.match(/\$\{[\w]+\}/g) || [];

	for (const match of matches) {
		const variable = match.replace(/[{}]/g, '');
		const value = variables[variable];

		path = path.replace(match, value);
	}

	return Path.normalize(path);
}
function parseCliArgsAsVariables(params, ...args) {
	return args.reduce((map, value, key) => ({...map, [params[key]]: value}), {});
}

function eachFiles(files, cb) {
	return Promise.all([...files.values()].map(file => new Promise(async (res, rej) => {
		// Catch error from async or sync handler
		try {
			await cb(file, res, rej);
		} catch(error) {
			rej(error);
		}
	})));
}
function catchError(fn) {
	return fn.then(result => [null, result]).catch(error => [error]);
}
function getEnvValue(key) {
	return process.env[key];
}