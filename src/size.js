
class Size {
    constructor(columnsLength) {
        this.data = new Array(columnsLength).fill(0);
    }
    
    update(index, str) {
        str = String(str);
        if (str.length > this.data[index]) {
            this.data[index] = str.length;
        }
    }
    
    export() {
        return this.data;
    }
}


module.exports = Size;