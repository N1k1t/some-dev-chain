const livereload = require('gulp-livereload');
const {readFile, unlink} = require('fs').promises;
const {assert} = require('chai');
const {stub} = require('sinon');

const {jsTaskConfig, jsIntegrationConfigResult} = require('./../mock');
const {Instance, Task} = require('./../../src/controllers');
const tools = require('../../src/tools');

const {livereload: livereloadTool} = tools;
const {
	useReload, 
	useChange, 
	checkListening
} = require('./../../src/utils/livereload-server');

const {srcPath, distPath} = require('../utils');
const filesToUnlink = [];

describe('Livereload', () => {
	let instance, task, changedStab, reloadStub;

	before(() => {
		instance = Instance.build({tools});
		task = instance.useTask('Test', jsTaskConfig);

		changedStab = stub(livereload, 'changed').callsFake(() => console.log('readload'));		

		assert.instanceOf(instance, Instance, 'Build instance');
		assert.instanceOf(task, Task, 'Build task');
	});
	after(async () => {
		await Promise.all(filesToUnlink.map(path => unlink(path)));
	});

	it('Connection', async () => {
		await livereloadTool(task);
	});
	it('Reload', async () => {
		const result = useChange();
	});
});