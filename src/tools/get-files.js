const glob = require('glob');
const {readFile} = require('fs').promises;

const {File} = require('../controllers');
const {insertValiablesInPath, promiseWrap} = require('../utils');
const glopPromise = promiseWrap(glob);

module.exports = main;


async function main(task, config = {}) {
	const {variables} = task.data;
	const {ignoreByFilename, path, globOptions} = config;
	const paths = path instanceof Array ? path : [path];
	
	const inputFilesPaths = paths.map(path => insertValiablesInPath(variables, path));
	const filePathArrays = await Promise.all(inputFilesPaths.map(path => glopPromise(path, globOptions || {})));

	let filePaths = filePathArrays
		.reduce((map, array) => map.concat(array), [])
		.filter(path => {
			const {name, ext} = File.parsePathSegments(path);
			if (ignoreByFilename && ignoreByFilename.test(`${name}${ext}`)) return false;
			return true;
		});

	const files = await Promise.all(filePaths.map(path => readFile(path)));
	files.map((file, key) => task.addFile(filePaths[key], file));
}