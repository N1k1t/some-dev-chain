const {readFileSync} = require('fs');
const emptyTaskConfig =  require('./empty-task-config');
const jsTaskConfig = require('./js-task-config');

const mainScssResult = `body{background-color:#000;color:#333}\n`;
const moduleScssResult = `html{font-size:14px}body{background-color:#000;color:#000}.container{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex}`;
const jsBabelResult = `// Init global events handling\nwindow.addEventListener('click', function () {\n  return console.log('click');\n});\nwindow.addEventListener('load', function () {\n  return console.log('load');\n});`;
const jsMinifyResult = `window.addEventListener("click",function(){return console.log("click")}),window.addEventListener("load",function(){return console.log("load")});`;

const jsBrowserifyResult = getMock('js-browserify-result');
const jsIntegrationConfigResult = getMock('js-integration-config-result');

module.exports = {
	emptyTaskConfig,
	jsTaskConfig,

	mainScssResult,
	moduleScssResult,
	jsBabelResult,
	jsMinifyResult,
	
	jsBrowserifyResult,
	jsIntegrationConfigResult
};


function getMock(name) {
	return readFileSync(`${__dirname}/${name}.mock`).toString();
}