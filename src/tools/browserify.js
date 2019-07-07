const Path = require('path');
const browserify = require('browserify');
const syntaxError = require('syntax-error');

const {eachFiles} = require('../utils');

module.exports = main;


async function main(task, config = {}) {
	const {paths: customPaths = [], globalVars: inputGlobalVars = {}} = config;
	const {files} = task;
	const waitList = [];
	const globalVars = {};

	for (const key in inputGlobalVars) {
		let variable = inputGlobalVars[key];

		variable = typeof variable == 'function' ? variable(task) : variable;
		globalVars[key] = () => JSON.stringify(variable);
	}

	await eachFiles(files, (file, resolve) => {
		const {contents, pathSegments} = file;
		const {full, dir} = pathSegments;

		const syntaxErrorResult = syntaxError(contents, full);
		if (syntaxErrorResult) throw syntaxErrorResult;

		const result = browserify(file, {
			insertGlobalVars: globalVars,
			paths: [Path.normalize(`${process.cwd()}/node_modules`), process.cwd(), dir, ...customPaths],
			basedir: dir
		});

		result.bundle((err, result) => {
			if (err) throw `${name}: ${err}`;

			file.setContents(result);
			resolve();
		});
	});
}