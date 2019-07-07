const {eachFiles} = require('../utils');

module.exports = main;


async function main(task, config) {
	const {files} = task;
	let result = '';

	await eachFiles(files, ([name, file], resolve) => {
		result += file.contents + '\n';

		resolve();
	});

	task.removeFiles();
	task.addFile('concat.js', result);
}