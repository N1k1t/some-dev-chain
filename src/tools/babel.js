const Path = require('path');
const babel = require('@babel/core');
const regenerator = require('regenerator')

const {eachFiles, babelInclude} = require('../utils');
const {getPluginPath, getPresetPath} = babelInclude;

module.exports = main;


async function main(task, config = {}) {
	const {files} = task;
	const {type} = config;

	await eachFiles(files, (file, resolve, reject) => {
		const {contents} = file;
		const babelConfig = {
			sourceType: 'script',
			presets: [['@babel/preset-env', { targets: 'defaults' }]],
		};

		const result = babel.transform(contents, babelConfig, (error, babelResult) => {
			if (error) return reject(error);

			const result = babelResult.code.includes('regeneratorRuntime')
				? regenerator.compile(babelResult.code, {includeRuntime: true}).code
				: babelResult.code;
			
			file.setContents(result);
			
			resolve();
		});
	});
}