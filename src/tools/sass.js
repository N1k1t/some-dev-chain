const Path = require('path');
const {render} = require('node-sass');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');

const {eachFiles, promiseWrap} = require('../utils');
const renderPromise = promiseWrap(render);

module.exports = main;


async function main(task, config = {}) {
	const {globalVars = {}, paths: customPaths = []} = config;
	const {files} = task;
	
	const globalVarsResult = Object.keys(globalVars)
		.reduce((result, key) => result += `$${key}: ${toType(globalVars[key])};`, '');

	await eachFiles(files, async (file, resolve) => {
		const {name, path, contents, pathSegments} = file;
		const postCssConfig = [autoprefixer({browsers: ['last 30 versions'], cascade: false})];
		const renderConfig = {
			data: globalVarsResult + contents.toString(),
			outputStyle: 'compressed',
			includePaths: [Path.normalize(`${process.cwd()}/node_modules`), process.cwd(), pathSegments.dir, ...customPaths]
		};
		
		const result = await renderPromise(renderConfig).catch(error => {throw `${name}: ${error}`});
		const postResult = await postcss(postCssConfig).process(result.css, {from: undefined});

		file.setContents(postResult.css);
		resolve();
	});
}

function toType(value) {
	if (/^[\d]+$|^\#/.test(value)) return value;

	return `'${value}'`;
}