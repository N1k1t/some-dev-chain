const {sep} = require('path');
const {assert} = require('chai');

const {
	insertValiablesInPath, 
	parseCliArgsAsVariables
} = require('./../../src/utils');


describe('Utils: Meta', () => {
	it('[insertValiablesInPath]: positive', () => {
		const path = insertValiablesInPath({$a: 'qwe', $b: 'rty'}, '/($a)/($b)/($a)');
		assert.equal(path, `${sep}qwe${sep}rty${sep}qwe`);
	});
	it('[parseCliArgsAsVariables]: positive', () => {
		const variables = parseCliArgsAsVariables('$input $output', 'qwe', 'rty');

		assert.propertyVal(variables, '$input', 'qwe', '$input variable');
		assert.propertyVal(variables, '$output', 'rty', '$output variable');
	});
});