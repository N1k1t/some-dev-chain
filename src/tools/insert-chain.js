const {Task} = require('../controllers');
const {catchError} = require('../utils');

module.exports = main;


async function main(task, config = {}) {
	const {instance, files, data} = task;
	const {alias: name = '@insert'} = config;
	const {variables = {}} = task.data;
	const taskConfig = {
		...config,

		data,
		isChild: true,
		name
	};

	const newTask = Task.build(instance, taskConfig);
	
	[...files.keys()].map(key => newTask.addFile(key, files.get(key).contents));
	const [error] = await catchError(newTask.run());

	if (error || newTask.error) throw error || newTask.error;
	[...newTask.files.keys()].map(key => task.addFile(key, newTask.files.get(key).contents));
}