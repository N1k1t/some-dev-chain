const Path = require('path');
const babel = require('babel-core');

const {eachFiles, babelInclude} = require('../utils');
const {getPluginPath, getPresetPath} = babelInclude;

module.exports = main;


async function main(task, config = {}) {
	const {files} = task;
	const {type} = config;

	await eachFiles(files, (file, resolve) => {
		const {contents} = file;
		let babelConfig = {
			plugins: [
				'transform-object-assign', 
				'transform-es2015-template-literals', 
				'transform-remove-strict-mode', 
				'transform-object-rest-spread',
				// 'transform-runtime'
				// 'transform-async-to-generator'
			].map(getPluginPath),
			presets: ['es2015'].map(getPresetPath)
		};

		// babelConfig.plugins[4] = [babelConfig.plugins[4], {'regenerator': true}];

		switch(type) {
			case 'insert-polifils': babelConfig = {...babelConfig, plugins : ['transform-runtime', 'transform-async-to-generator'].map(getPluginPath)};
		}

		const result = babel.transform(contents, babelConfig);
		file.setContents(result.code);

		resolve();
	});
}