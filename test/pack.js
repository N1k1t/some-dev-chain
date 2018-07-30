const DevChain = require('../index');

let input = process.argv[2] || `${__dirname}/src/test.js`;
let output = process.argv[3] || `${__dirname}/dist/result-2.js`;

DevChain.onceTaskRun(require('./config').pack, input, output);