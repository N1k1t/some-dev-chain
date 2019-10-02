const colors = require('colors/safe');

module.exports = main;


async function main(task, config = {}) {
	const {ms} = config;
	task.logger.info(`Wait for ${colors.cyan.bold(ms)} ms`, 'cyan');
	return new Promise(res => setTimeout(res, ms));
}