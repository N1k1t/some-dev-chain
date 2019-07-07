const Path = require('path');
const babel = require('babel-core');
const {eachFiles} = require('../utils');

module.exports = main;


async function main(task, config = {}) {
	const {files} = task;
	const {type} = config;

	await eachFiles(files, (file, resolve) => {
		const {contents} = file;
		let babelConfig = {
			plugins: ['transform-object-assign', 'transform-es2015-template-literals', 'transform-remove-strict-mode'].map(getPluginPath),
			presets: ['es2015'].map(getPresetPath)
		};

		switch(type) {
			case 'insert-polifils': babelConfig = {...babelConfig, plugins : ['transform-runtime', 'transform-async-to-generator'].map(getPluginPath)};
		}

		const result = babel.transform(contents, babelConfig);
		file.setContents(result.code);

		resolve();
	});
}

function getPluginPath(name) {
	return Path.resolve(`${__dirname}/../../node_modules/babel-plugin-${name}`);
}
function getPresetPath(name) {
	return Path.resolve(`${__dirname}/../../node_modules/babel-preset-${name}`);
}