const Path = require('path');
const {initTasks} = require('../../src');
const {throwError} = require('../stdout-utils');

module.exports = main;


function main(instance) {
	const {rootPath, configPath} = instance;

	if (!configPath) throwError('Config not found');
	const config = require(Path.resolve(rootPath, Path.normalize(configPath)));

	return initTasks(config);
}