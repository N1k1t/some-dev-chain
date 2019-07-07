const {readFile, unlink} = require('fs').promises;
const {assert} = require('chai');

const {jsTaskConfig, jsIntegrationConfigResult} = require('./../mock');
const {Instance, Task} = require('./../../src/controllers');
const tools = require('../../src/tools');
const {srcPath, distPath} = require('../utils');
const filesToUnlink = [];

describe('Usage', () => {
	let instance, task;

	before(() => {
		instance = Instance.build({tools});
		task = instance.useTask('Test', jsTaskConfig);

		assert.instanceOf(instance, Instance, 'Build instance');
		assert.instanceOf(task, Task, 'Build task');
	});
	after(async () => {
		await Promise.all(filesToUnlink.map(path => unlink(path)));
	})

	it('Config', async () => {
		const {timestamp} = jsTaskConfig;
		
		await task.run();

		const filePath = `${distPath}/module-${timestamp}.js`;
		const file = await readFile(filePath);

		assert.equal(file.toString(), jsIntegrationConfigResult);
		filesToUnlink.push(filePath);
	});
});