const {eachFiles} = require('../utils');

module.exports = main;


async function main(task, config) {
	const {files} = task;

	await eachFiles(files, ([name, file], resolve) => {
		task.addFile(name, `
			(function() {
				var element = document.createElement("style");

				element.setAttribute("name", "${config.styleName || name.replace(/\\/g, '/')}");
				document.head.appendChild(element).textContent = "${file.contents.toString().replace(/"/g, '\\"').replace(/\n|\r|\t/g,'')}";
			}());
		`.replace(/\n|\r|\t/g,''));
		resolve();
	});
}