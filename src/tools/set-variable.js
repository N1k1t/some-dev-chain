module.exports = main;


async function main(task, config) {
	const {value, alias} = config;
	task.data.variables[alias] = typeof value == 'function' ? value(task) : value;
}