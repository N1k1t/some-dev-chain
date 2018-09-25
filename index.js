const fs = require('fs');
const commander = require('commander-without-exit');
const readline = require('readline');

const tools = require('./src/tools');
const Task = require('./src/task-controller');
const TasksInstance = require('./src/tasks-instance');

const tasks = {};
const instance = new TasksInstance();

commander
	.command('task')
	.description('check task')
	.option('-l, --list', 'show list of tasks')
	.action((params) => {
		// TODO
	});

readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
}).on('line', (line) => commander.parse([...process.argv, ...line.split(' ')]));

module.exports = {
	init,
	createTask,
	registerTool,
	onceTaskRun,
	Task,
	tasks,
	tools
};

function createTask(name, config){
	return Task.create(name, Object.assign(config, {commander, instance}));
}
function init(inputTasks){
	for ( let key in inputTasks ){
		const config = inputTasks[key];
		tasks[key] = createTask(key, config);
	}

	commander.help();
}
function registerTool(name, handler){
	Object.assign(tools, { [name]: handler });
}
async function onceTaskRun(config, ...args){
	await Task.onceRun(config, ...args);
	process.exit(0);
}

process.on('uncaughtException', (err) => console.dir(err, {colors: true}));