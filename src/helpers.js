
const truncate = (str, length) => {
    if (str.length <= length) {
        return str;
    }
    
    return str.substr(0, length) + '\u2026'
};

const chunk = (str, size) => {
  const data = [];
  if (size > str.length) {
    size = str.length;
  }
  
  const times = Math.ceil(str.length  / size);

  let start = 0;
  for (let i = 0; i < times; i++) {
    const piece = str.substr(start, size);
    data.push(piece);
    start += size;
    if (start >= str.length - 1) {
      break;
    }
  }

  return data;
}

module.exports = {
    truncate,
    chunk
};