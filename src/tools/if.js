module.exports = main;


async function main(task, config) {
	const {variables} = task.data;
	let isTrue = false;

	isTrue = config.handler && config.handler(task);
	isTrue = isTrue || variables[config.variable] && config.is === variables[config.variable];
	isTrue = isTrue || variables[config.variable] && config.eq.test(variables[config.variable]);

	if (isTrue && config.then) return task.mergeChain(config.then);
	if (config.else) task.mergeChain(config.else);
}