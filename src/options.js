const yargs = require('yargs');
const options = yargs
    .command('<args>', 'Taskwarrior arguments')
    .option('copy', {
        describe: 'Copy the output to clipbard',
        type: 'boolean',
        demandOption: false,
    })
    .option('columns', {
        alias: 'c',
        describe: `Display columns [--columns=Tag,Description | --columns]`,
        type: 'string',
        demandOption: false,
    })
    .option('format-description', {
        describe: `Description format [--format-description '%s']`,
        type: 'string',
        demandOption: false,
    })
    .option('format-annotation', {
        describe: `Annotation format [--format-description '*%s*']`,
        type: 'string',
        demandOption: false,
    })
    .version('1.0')
    .argv;

module.exports = options;