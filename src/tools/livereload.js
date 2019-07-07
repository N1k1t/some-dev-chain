const {
	useReload, 
	useChange, 
	checkConnection
} = require('../utils/livereload-server');

module.exports = main;


async function main(task, config = {}) {
	const {type} = config;
	const {files} = task;

	await checkConnection();

	if (type == 'reload') return useReload();
	[...files.values()].forEach(file => useChange(file.writePath));
}