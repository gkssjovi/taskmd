const Size = require("./size");
const moment = require('moment');
const options = require("./options");
const config = require("./config");
moment.updateLocale('en', {
    relativeTime : {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        m: '1m',
        mm: '%dm',
        h: '1h',
        hh: '%dh',
        d: '1d',
        dd: '%dd',
        M: '1M',
        MM : '%dM',
        y: '1Y',
        yy: '%dY'
    }
});


const FILTER_COLUMNS = 0x1;

class Table {
    constructor(rawRows) {
        this.annotationPrefix = config.get('annotation-prefix', ' • ');
        this._rawRows = rawRows;
        this.headerTemplate = this._getHeaderTemplate();
        this.header = Object.values(this.headerTemplate);
        this.size = new Size(this.header.length);
        this.header.forEach((value, index) => this.size.update(index, String(value)));
        this.rowMap = this._getRowMap();
        this.rows = this.getRows();
        this.filters = {};
        this.filterColumnsIndex = [];
        this.output = '';
    }
    
    _getHeaderTemplate() {
        return  {
            id: 'ID',
            status: 'St',
            age: 'Age',
            trackwarrior: 'Time',
            priority: 'P',
            project: 'Project',
            tags: 'Tags',
            due: 'Due',
            description: 'Description',
            trackwarrior_rate: 'Rate',
            trackwarrior_total_amount: 'Total',
            urgency: 'Urg',
        };
    }
    
    _getRowMap() {
        return {
            id: 'id',
            status: 'status',
            age: (task) => {
                return moment.utc(task.entry).fromNow(true);
            },
            trackwarrior: 'trackwarrior',
            priority: 'priority',
            project: 'project',
            tags: 'tags',
            due: (task) => {
                if (Object.prototype.hasOwnProperty.call(task, 'due')) {
                    return moment.utc(task.due).fromNow(true);
                }
                return '';
            },
            description: 'description',
            trackwarrior_rate: 'trackwarrior_rate',
            trackwarrior_total_amount: 'trackwarrior_total_amount',
            urgency: 'urgency',
        };
    }
    
    
    getHeader() {
        return this.header;
    }
    
    getRows() {
        if (this.rows) {
            return this.rows;
        }

        const rows = [];
        for (let index = 0; index < this._rawRows.length; index++) {
            const rawRow = this._rawRows[index];
            const annotations = this._getAnnotations(index);
            const taskArray = Object.keys(this.rowMap).map((key, index, arr) => {
                let value = '';
                if (typeof this.rowMap[key] === 'string') {
                    value = rawRow[this.rowMap[key]];
                } else {
                    value = this.rowMap[key](rawRow);
                }
                if (!value) {
                    value = '';
                }
                this.size.update(index, String(value));
               
                // create size for the annotations
                if (key === 'description') {
                    this.size.update(index, this._applyFormatDescription(String(value)));

                    if (annotations.length > 0) {
                        annotations.forEach(({entry, description}) => this._updateAnnotationSize(index, entry, description));
                    }
                }

                return String(value);
            });
            
            rows.push(taskArray);
        }
        
        this.rows = rows;
        return this.rows;
    }
    
    _print(value) {
        value = String(value);
        process.stdout.write(value);
        this.output += value;
    }
    
    _renderRowAnnotation(rowIndex) {
        const size = this.size.export();
        const annotations = this._getAnnotations(rowIndex);
        
        if (annotations.length > 0) {
            const descriptionColumnIndex = this._getColumnInex(this.headerTemplate.description);

            for (let j = 0; j < annotations.length; j++) {

                const annotation = annotations[j];
                const { description } = annotation;

                for (let index = 0; index < size.length; index++) {
                    const len = size[index];
                    
                    if (this.filterColumnsIndex.length > 0 && !this.filterColumnsIndex.includes(index)) {
                        continue ;
                    }
                    
                    if (index === descriptionColumnIndex) {
                        const initalValue = `${description}`;
                        const value = this._applyFormatAnnotation(initalValue);
                        const diff = value - initalValue;
                        this._print(`| ${this.annotationPrefix}${value} `);
                        this._print(' '.repeat(len - description.length - this.annotationPrefix.length - diff));
                    } else {
                        this._print(`|  `);
                        this._print(' '.repeat(len));
                    }
                }
                this._print('|');
                this._print('\n');

            }
        }
    }
    
    _renderRow(rowIndex, row) {
        const size = this.size.export();
        const descriptionColumnIndex = this._getColumnInex(this.headerTemplate.description);

        for (let index = 0; index < size.length; index++) {
            const len = size[index];
            let value =  row[index];
            if (this.filterColumnsIndex.length > 0 && !this.filterColumnsIndex.includes(index)) {
                continue ;
            }
            
            if (index === descriptionColumnIndex) {
                value = this._applyFormatDescription(value);
            }
            
            this._print(`| ${value} `);
            this._print(' '.repeat(len - value.length));
        }
        this._print('|');
        this._print('\n');
        
        this._renderRowAnnotation(rowIndex);
        
        if (rowIndex == -1) {
            for (let index = 0; index < size.length; index++) {
                const len = size[index];
                const value =  row[index];

                if (this.filterColumnsIndex.length > 0 && !this.filterColumnsIndex.includes(index)) {
                    continue ;
                }
            
                this._print(`|--`);
                this._print('-'.repeat(len));
            }
            this._print('|');
            this._print('\n');
        }
    }
    
    render() {
        
        this._orderColumns();
        this._applyFilters();
        this._renderRow(-1, this.header);

        for (let index = 0; index < this.rows.length; index++) {
            const row = this.rows[index];
            this._renderRow(index, row);
        }
    }
    
    filter(type, data) {
        this.filters[type] = data;
    }
    
    getOutput() {
        return this.output;
    }
    
    getSwap() {
        this.filterColumns = this.filters[FILTER_COLUMNS] || [];

        if (this.filterColumns.length > 0) {
            const columnsOrder = {};
            let index = 0;
            for (index = 0; index < this.filterColumns.length; index++) {
                const element = this.filterColumns[index].toLowerCase();
                columnsOrder[element] = index;
            }

            for (let idx = 0; idx < this.header.length; idx++) {
                const element = this.header[idx].toLowerCase()
                if (!Object.prototype.hasOwnProperty.call(columnsOrder, element)) {
                    columnsOrder[element] = index++;
                }
                
            }
            
            const headerLower = this.header.map(val => val.toLowerCase());
            const headerOrdered = new Array(this.header.length);
            const swap = [];
            const columnsOrderKeys = Object.keys(columnsOrder);
            for (let index = 0; index < columnsOrderKeys.length; index++) {
                const key = columnsOrderKeys[index];
                const newIndex = columnsOrder[key];
                const oldIndex = headerLower.indexOf(key);
                headerOrdered[newIndex] = this.header[oldIndex];
                swap.push([newIndex, oldIndex]);
            }
            
            return [swap, headerOrdered];
        } 
    }
    
    _getAnnotations(rowIndex) {
        const result = [];
        
        if (typeof this._rawRows[rowIndex] !== 'undefined') {
            const rawRow = this._rawRows[rowIndex];
            if (typeof rawRow['annotations'] !== 'undefined') {
                const annotations = rawRow['annotations'];
                for (let index = 0; index < annotations.length; index++) {
                    const annotation = annotations[index];
                    const {entry, description} = annotation;

                    result.push({
                        entry,
                        description,
                    });
                }
            }
        }
        
        return result;
    }
    
    _applyFilters() {
        this.filterColumnsIndex = [];
        if (Object.prototype.hasOwnProperty.call(this.filters, FILTER_COLUMNS)) {
            const fc = this.filters[FILTER_COLUMNS].map(val => val.toLowerCase());
            if (fc.length > 0) {
                for (let index = 0; index < this.header.length; index++) {
                    const column = this.header[index].toLowerCase();
                    if (fc.includes(column)) {
                        this.filterColumnsIndex.push(index);
                    }
                }
            }
        }
    }
    
    _orderColumns() {
        // Order by the filterColumns
        const result = this.getSwap();
        if (result) {
            const [swap, headerOrdered] = result;
            this.header = headerOrdered;
            this.size = new Size(this.header.length);
            this.header.forEach((value, index) => this.size.update(index, value));
            const rows = this.rows;
            this.rows = [];
            
            const descriptionColumnIndex = this._getColumnInex(this.headerTemplate.description);
      
            for (let index = 0; index < rows.length; index++) {
                const oldRow = rows[index];
                const annotations = this._getAnnotations(index);
                const row = new Array(oldRow.length);
                for (let i = 0; i < row.length; i++) {
                    row[i] = oldRow[swap[i][1]]
                    this.size.update(i, row[i]);

                    
                    // create size for the annotations
                    if (i === descriptionColumnIndex) {
                        this.size.update(i, this._applyFormatDescription(row[i]));
                        if (annotations.length > 0) {
                            annotations.forEach(({entry, description}) => this._updateAnnotationSize(i, entry, description));
                        }
                    }
                }

                this.rows.push(row);
            }
        }
    }
    
    _getColumnInex(columnName) {
        return this.header.indexOf(columnName);
    }
    
    _updateAnnotationSize(index, entry, description) {
        const spacer = ' '.repeat(this.annotationPrefix.length);
        return this.size.update(index, this._applyFormatAnnotation(`${spacer}${String(description)}`));
    }
    
    _applyFormatAnnotation(str) {
        if (typeof options.formatAnnotation === 'undefined') {
            const fa = config.get('format-annotation');
            if (fa) {
                return fa.replace(/%s/mig,  str);
            }
            return str;
        }
        
        return options.formatAnnotation.replace(/%s/mig,  str);
    }

    _applyFormatDescription(str) {
        if (typeof options.formatDescription === 'undefined') {
            const fd = config.get('format-description');
            if (fd) {
                return fd.replace(/%s/mig,  str);
            }
            return str;
        }
        
        return options.formatDescription.replace(/%s/mig,  str);
    }
}

module.exports = {
   Table,
   FILTER_COLUMNS,
};