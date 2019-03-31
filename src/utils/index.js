const fsPromise = require('./fs-promise');
const promiseWrap = require('./promise-wrap');
const Path = require('path');

module.exports = {
	fsPromise,
	eachFiles,
	insertValiablesInPath,
	promiseWrap
};


async function eachFiles(files, config, cb) {
	let waitList = [];

	for (let file of files) {
		waitList.push(new Promise((resolve) => cb(file, resolve)));
	}

	await Promise.all(waitList);
}
function insertValiablesInPath({variables}, path) {
	let matches = path.match(/\(\$[\w]+\)/g) || [];

	for (let match of matches) {
		let variable = match.substr(1, match.length - 2);
		let value = variables[variable];

		path = path.replace(match, value);
	}

	return Path.normalize(path);
}