const Path = require('path');
const sass = require('node-sass');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');

const {eachFiles} = require('../utils');

module.exports = main;


async function main(task, config = {}) {
	const {globalVars = {}, paths: customPaths = []} = config;
	const {files} = task;
	
	const globalVarsResult = Object.keys(globalVars)
		.reduce((result, key) => result += `$${key}: ${toType(globalVars[key])};`, '');

	await eachFiles(files, (file, resolve) => {
		const {name, path, contents, pathSegments} = file;
		
		sass.render({
			data: globalVarsResult + contents.toString(),
			outputStyle: 'compressed',
			includePaths: [Path.normalize(`${process.cwd()}/node_modules`), process.cwd(), pathSegments.dir, ...customPaths]
		}, (err, result) => {
			if (err) throw `${name}: ${err}`;

			postcss([ autoprefixer({browsers: ['last 30 versions'], cascade: false}) ]).process(result.css, {from: undefined}).then((result) => {
				file.setContents(result.css);
				resolve();
			});
		});
	});
}

function toType(value) {
	if (/^[\d]+$|^\#/.test(value)) return value;

	return `'${value}'`;
}