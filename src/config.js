const os = require('os');
const path = require('path');
const fs = require('fs');
const YAML = require('yaml');


const USE_YAML = true;

const CONFIG_JSON = 'config.json';
const CONFIG_YAML = 'config.yaml';

const filename = USE_YAML ? CONFIG_YAML : CONFIG_JSON; 


const configPath = path.join(os.homedir(), `/.config/taskmd/${filename}`);

let data = {};
if (fs.existsSync(configPath)) {
    const read = fs.readFileSync(configPath, 'utf-8');

    if (USE_YAML) {
        data = YAML.parse(read);
    } else {
        data = JSON.parse(read);
    }
}

const config = (option, defaultValue = undefined) => {
    if (typeof data[option] !== 'undefined') {
        return data[option];
    }
    
    return defaultValue;
}

module.exports = {
    get: config,
    data,
};