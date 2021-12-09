
const truncate = (str, length) => {
    if (str.length <= length) {
        return str;
    }
    
    return str.substr(0, length) + '\u2026'
};

module.exports = {
    truncate,
};