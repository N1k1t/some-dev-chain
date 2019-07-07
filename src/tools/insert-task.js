module.exports = main;


async function main(task, config) {
	const foundedTask = task.allTasks[config.taskName];
	if (!foundedTask) throw `${name}: This task is not unavalible`;

	Object.assign(config, {
		variables: Object.assign(config.variables || {}, task.variables),
		isChild: true,
		chain: foundedTask.config.chain
	});

	const newTask = new task.constructor(`@${config.taskName}`, config);
	await newTask.run();

	for (let [name, file] of newTask.files) {
		task.addFile(name, file.contents);
	}
}