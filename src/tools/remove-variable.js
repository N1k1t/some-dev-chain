module.exports = main;


async function main(task, config) {
	const {alias} = config;
	delete task.data.variables[alias];
}