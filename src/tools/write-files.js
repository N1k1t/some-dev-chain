const colors = require('colors/safe');
const fs = require('fs').promises;
const Path = require('path');

const {insertValiablesInPath, eachFiles} = require('../utils');

module.exports = main;


async function main(task, config = {}) {
	const {files} = task;

	await eachFiles(files, async (file, resolve) => {
		const {name, contents, pathSegments, isWrited} = file;
		const {dir, ext, name: fileName} = file.pathSegments;
		const {instance} = task;
		const {variables} = task.data;

		if (isWrited) return false;
		let resultPath = config.path || `${config.dir || dir}/${config.afterDir || ''}/${config.fileName || fileName}${config.prefix ? `-${config.prefix}` : ''}${config.ext || ext}`;
		resultPath = insertValiablesInPath(variables, resultPath);

		file.setWritePath(resultPath);
		instance.ignoreFileWatching(resultPath);
		
		await file.write();
		instance.unignoreFileWatching(resultPath);

		task.logger.success(`Writed in ${colors.cyan.bold(resultPath)}`, 'cyan', 'bgBlack');
		resolve();
	});
}