#!/usr/bin/env node

const child_process = require('child_process');
const { spawn } = child_process;
const util = require('util');
const exec = util.promisify(child_process.exec);
const os = require('os');
const options = require('./options');

const {Table, FILTER_COLUMNS} = require('./table');
const config = require('./config');

const call = async (command, args, silent = false) => {
    const data = [];
    const child = spawn(command, args);
    
    for await (const line of child.stdout) {
        if (!silent) {
            process.stdout.write(line)
        }
        data.push(line.toString());
    }

    return data.join('');
};

const copy = (data) => {
    let cp = 'pbcopy';
    if (os.platform() === 'darwin') {
       cp = 'pbcopy';
    } else {
        cp = 'xclip';
    }
    const proc = spawn(cp);
    proc.stdin.write(data);
    proc.stdin.end();
};

const main = async () => {
    const args = options._;
    const copyOutput = typeof options.copy !== 'undefined' ? options.copy : config.get('copy', true);

    const response = await call('task', [...args, 'export'], true);
    let tasks = [];
    try {
        tasks = JSON.parse(response);
    } catch (e) {
        process.stdout.write(e.message + '\n');
        process.stdout.end();
        process.exit(1);
    }

    const table = new Table(tasks);
    
    const header = table.getHeader().map(val => val.toLowerCase());
    let columns = (typeof options.columns !== 'undefined' ? options.columns.split(',') : []);
    
    // Load the defualt values
    if (typeof options.columns === 'undefined' && config.get('columns')) {
        columns = config.get('columns');
    }

    columns = columns.filter(column => header.includes(column.toLowerCase()));
    
    table.filter(FILTER_COLUMNS, columns);

    table.render();

    if (copyOutput) {
        copy(table.getOutput())
    }
};

main();