const {File} = require('../controllers');
const {readFile} = require('fs').promises;

module.exports = main;


async function main(task, config) {
	const {inputFilePaths} = task;
	const files = await Promise.all(inputFilePaths.map(path => readFile(path)));

	files.forEach((file, key) => task.addFile(inputFilePaths[key], file));
}