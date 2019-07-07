const UglifyJS = require('uglify-js');
const csso = require('csso');

const {eachFiles} = require('../utils');

module.exports = main;


async function main(task, config = {}) {
	const {files} = task;

	await eachFiles(files, async (file, resolve) => {
		const {name, pathSegments} = file;
		const {ext} = file.pathSegments;
		let result = null;
		
		if (ext == '.js') result = await jsMin(name, file);
		if (ext == '.css' || ext == '.scss') result = await cssMin(name, file);

		file.setContents(result);
		resolve();
	});
}

async function jsMin(name, file) {
	const result = UglifyJS.minify(file.contents.toString());
	if (result.error) throw `${name}: ${result.error}`;

	return result.code;
}
async function cssMin(name, file) {
	const result = csso.minify(file.contents.toString());
	return result.css;
}