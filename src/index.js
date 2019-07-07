const tools = require('./tools');
const utils = require('./utils');
const {Instance, Commander} = require('./controllers');

const commander = Commander.build();
const instance = Instance.build({commander, tools});

module.exports = {
	initTasks,
	initTask,
	commander,
	instance,
	utils
};


function initTasks(tasks) {
	Object.keys(tasks).map(name => instance.useTask(name, tasks[name]));
	commander.init();
	commander.printHelp();
}
function initTask(name, task) {
	instance.useTask(name, task);
}