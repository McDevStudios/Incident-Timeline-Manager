// Ensure that the Chart.js library is included in your index.html file:
// <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

class TableManager {
    constructor() {
        // Define default columns explicitly
        this.defaultColumns = ['select', 'start_datetime', 'end_datetime', 'title', 'description'];
        this.customColumns = [];
        this.columns = [...this.defaultColumns]; // Initialize columns with defaults
        this.data = [];
        this.selectedRows = new Set();
        this.itemColors = new Map();
        this.init();
    }

    async init() {
        await this.loadCustomColumns();
        await this.loadTableData();
        this.setupEventListeners();
    }

    async loadCustomColumns() {
        try {
            const response = await fetch('http://localhost:3000/api/columns');
            if (response.ok) {
                const columns = await response.json();
                this.customColumns = columns.map(col => col.column_name);
                this.columns = [...this.defaultColumns, ...this.customColumns];
            }
        } catch (error) {
            console.error('Error loading custom columns:', error);
        }
    }

    async loadTableData() {
        try {
            const response = await fetch('http://localhost:3000/api/table/data');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            this.renderTable();
        } catch (error) {
            console.error('Error loading table data:', error);
            this.data = [];
        }
    }

    setupEventListeners() {
        document.getElementById('addRow').addEventListener('click', () => this.addRow());
        document.getElementById('addColumn').addEventListener('click', () => this.addColumn());
        document.getElementById('deleteColumn').addEventListener('click', () => this.deleteColumn());
        document.getElementById('deleteRows').addEventListener('click', () => this.deleteSelectedRows());
        document.getElementById('exportSelected').addEventListener('click', () => this.exportSelectedToCSV());
    }

    async addRow() {
        const now = new Date();
        const newRow = {
            start_datetime: now.toISOString(),
            end_datetime: now.toISOString(),
            title: '',
            description: '',
            custom_fields: {}
        };

        try {
            const response = await fetch('http://localhost:3000/api/table/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRow)
            });
            
            if (response.ok) {
                const savedRow = await response.json();
                this.data.push(savedRow);
                this.getItemColor(savedRow.id);
                this.renderTable();
            } else {
                console.error('Failed to add row:', await response.text());
            }
        } catch (error) {
            console.error('Error adding row:', error);
        }
    }

    generatePastelColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 80%)`;
    }

    getItemColor(id) {
        if (!this.itemColors.has(id)) {
            this.itemColors.set(id, this.generatePastelColor());
        }
        return this.itemColors.get(id);
    }

    toggleSelectAll(checked) {
        const tbody = document.querySelector('#dataTable table tbody');
        const rows = tbody.getElementsByTagName('tr');
        
        this.selectedRows.clear();
        if (checked) {
            for (let i = 0; i < rows.length; i++) {
                this.selectedRows.add(i);
                const checkbox = rows[i].querySelector('input[type="checkbox"]');
                if (checkbox) checkbox.checked = true;
            }
        } else {
            Array.from(rows).forEach(row => {
                const checkbox = row.querySelector('input[type="checkbox"]');
                if (checkbox) checkbox.checked = false;
            });
        }
        
        this.updateTimeline();
    }

    updateTimeline() {
        const visualTimeline = document.getElementById('visual-timeline');
        visualTimeline.innerHTML = '';

        const visualTimelineInner = document.createElement('div');
        visualTimelineInner.className = 'visual-timeline-inner';
        visualTimeline.appendChild(visualTimelineInner);

        const selectedItems = Array.from(this.selectedRows)
            .map(index => ({
                ...this.data[index],
                index,
                color: this.getItemColor(this.data[index].id)
            }))
            .filter(item => item.start_datetime)
            .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));

        if (selectedItems.length === 0) return;

        const firstDate = new Date(selectedItems[0].start_datetime);
        const lastDate = selectedItems.reduce((latest, item) => {
            const endDate = item.end_datetime ? new Date(item.end_datetime) : new Date(item.start_datetime);
            return endDate > latest ? endDate : latest;
        }, new Date(selectedItems[0].start_datetime));

        const daysSpan = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
        const itemSpacing = selectedItems.length <= 2 ? 200 : Math.min(daysSpan * 100, 400);
        const minWidth = Math.max(daysSpan * itemSpacing, visualTimeline.offsetWidth);
        visualTimelineInner.style.width = `${minWidth}px`;

        const timelineWidth = minWidth;
        const totalDuration = lastDate - firstDate;
        
        selectedItems.forEach((item, rowIndex) => {
            const startDate = new Date(item.start_datetime);
            const endDate = item.end_datetime ? new Date(item.end_datetime) : new Date(item.start_datetime);
            
            const visualItem = document.createElement('div');
            visualItem.className = 'visual-timeline-item';
            
            const startPosition = ((startDate - firstDate) / totalDuration) * timelineWidth;
            const endPosition = ((endDate - firstDate) / totalDuration) * timelineWidth;
            
            visualItem.style.left = `${startPosition}px`;
            visualItem.style.width = `${Math.max(endPosition - startPosition, 150)}px`;
            visualItem.style.top = `${rowIndex * 60 + 20}px`;
            visualItem.style.backgroundColor = item.color;
            
            const itemLabel = document.createElement('div');
            itemLabel.className = 'visual-timeline-label';
            itemLabel.textContent = item.title || 'Untitled';
            
            const dateLabel = document.createElement('div');
            dateLabel.className = 'visual-timeline-date';
            dateLabel.textContent = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
            
            visualItem.appendChild(itemLabel);
            visualItem.appendChild(dateLabel);
            visualTimelineInner.appendChild(visualItem);
        });

        visualTimelineInner.style.height = `${selectedItems.length * 60 + 60}px`;
    }

    renderTable() {
        const table = document.createElement('table');
        const thead = table.createTHead();
        const headerRow = thead.insertRow();

        // Add checkbox in header for select all
        const selectAllTh = document.createElement('th');
        const selectAllCheckbox = document.createElement('input');
        selectAllCheckbox.type = 'checkbox';
        selectAllCheckbox.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
        selectAllTh.appendChild(selectAllCheckbox);
        headerRow.appendChild(selectAllTh);

        // Add other column headers
        this.columns.forEach(column => {
            if (column !== 'select') {
                const th = document.createElement('th');
                th.textContent = column.replace(/_/g, ' ').toUpperCase();
                headerRow.appendChild(th);
            }
        });

        const tbody = table.createTBody();
        this.data.forEach((row, rowIndex) => {
            const tr = tbody.insertRow();
            tr.dataset.index = rowIndex;

            // Add checkbox cell
            const tdSelect = tr.insertCell();
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = this.selectedRows.has(rowIndex);
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    this.selectedRows.add(rowIndex);
                } else {
                    this.selectedRows.delete(rowIndex);
                }
                this.updateTimeline();
            });
            tdSelect.appendChild(checkbox);

            // Add data cells
            this.columns.forEach(column => {
                if (column !== 'select') {
                    const td = tr.insertCell();
                    const input = document.createElement('input');
                    
                    // Add unique ID and name to input
                    input.id = `input-${row.id}-${column}`;
                    input.name = `input-${row.id}-${column}`;
                    
                    if (column.includes('datetime')) {
                        input.type = 'datetime-local';
                        if (row[column]) {
                            const date = new Date(row[column]);
                            input.value = date.toISOString().slice(0, 16);
                        }
                    } else {
                        input.type = 'text';
                        if (this.customColumns.includes(column)) {
                            input.value = row.custom_fields?.[column] || '';
                        } else {
                            input.value = row[column] || '';
                        }
                    }

                    input.addEventListener('input', async (e) => {
                        const currentRow = {...this.data[rowIndex]};
                        const updatedRow = {
                            ...currentRow,
                            custom_fields: {
                                ...(currentRow.custom_fields || {})
                            }
                        };

                        if (this.customColumns.includes(column)) {
                            updatedRow.custom_fields[column] = e.target.value;
                        } else {
                            updatedRow[column] = input.type === 'datetime-local' 
                                ? new Date(e.target.value).toISOString()
                                : e.target.value;
                        }

                        this.data[rowIndex] = updatedRow;
                        
                        if (this.selectedRows.has(rowIndex)) {
                            this.updateTimeline();
                        }

                        if (this.updateTimeout) {
                            clearTimeout(this.updateTimeout);
                        }
                        
                        this.updateTimeout = setTimeout(async () => {
                            try {
                                const response = await fetch(`http://localhost:3000/api/table/data/${row.id}`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(updatedRow)
                                });
                                
                                if (response.ok) {
                                    const serverResponse = await response.json();
                                    this.data[rowIndex] = {
                                        ...updatedRow,
                                        ...serverResponse,
                                        custom_fields: {
                                            ...(updatedRow.custom_fields || {}),
                                            ...(serverResponse.custom_fields || {})
                                        }
                                    };
                                    
                                    if (this.selectedRows.has(rowIndex)) {
                                        this.updateTimeline();
                                    }
                                }
                            } catch (error) {
                                console.error('Error updating row:', error);
                            }
                        }, 300);
                    });

                    td.appendChild(input);
                }
            });
        });

        const tableContainer = document.getElementById('dataTable');
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
        this.updateTimeline();
    }

    async addColumn() {
        const columnName = prompt('Enter column name:');
        if (columnName && !this.columns.includes(columnName)) {
            try {
                const response = await fetch('http://localhost:3000/api/columns', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ column_name: columnName })
                });

                if (response.ok) {
                    const column = await response.json();
                    this.customColumns.push(columnName);
                    this.columns = [...this.defaultColumns, ...this.customColumns];
                    this.renderTable();
                }
            } catch (error) {
                console.error('Error adding column:', error);
            }
        }
    }

    async deleteColumn() {
        const columnName = prompt('Enter column name to delete:');
        if (!columnName || this.defaultColumns.includes(columnName)) {
            alert('Cannot delete default columns');
            return;
        }

        console.log('Attempting to delete column:', columnName);

        try {
            const response = await fetch(`http://localhost:3000/api/columns/${columnName}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (response.ok) {
                console.log('Server confirmed deletion');
                this.customColumns = this.customColumns.filter(col => col !== columnName);
                this.columns = [...this.defaultColumns, ...this.customColumns];
                console.log('Updated columns array:', this.columns);
                this.renderTable();
            } else {
                console.error('Failed to delete column:', data.error);
                alert('Failed to delete column: ' + data.error);
            }
        } catch (error) {
            console.error('Error during deletion:', error);
            alert('Error deleting column: ' + error.message);
        }
    }

    async deleteSelectedRows() {
        const selectedRows = Array.from(this.selectedRows).sort((a, b) => b - a);
        
        for (const rowIndex of selectedRows) {
            const row = this.data[rowIndex];
            try {
                const response = await fetch(`http://localhost:3000/api/table/data/${row.id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    this.data.splice(rowIndex, 1);
                }
            } catch (error) {
                console.error('Error deleting row:', error);
            }
        }
        
        this.selectedRows.clear();
        this.renderTable();
    }

    exportSelectedToCSV() {
        const selectedItems = Array.from(this.selectedRows)
            .map(index => this.data[index])
            .filter(item => item);

        if (selectedItems.length === 0) {
            alert('Please select rows to export');
            return;
        }

        // Get all columns except 'select'
        const headers = this.columns
            .filter(col => col !== 'select')
            .map(header => header.replace(/_/g, ' ').toUpperCase());
        
        const csvRows = [headers];

        selectedItems.forEach(item => {
            const row = this.columns
                .filter(col => col !== 'select')
                .map(col => {
                    if (col.includes('datetime')) {
                        return item[col] ? new Date(item[col]).toLocaleString() : '';
                    }
                    // Handle custom columns
                    if (this.customColumns.includes(col)) {
                        return item.custom_fields?.[col] || '';
                    }
                    // Handle default columns
                    return item[col] || '';
                });
            csvRows.push(row);
        });

        const csvContent = csvRows
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
        
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, `timeline_export_${timestamp}.csv`);
        } else {
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', `timeline_export_${timestamp}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Include all your existing methods (updateTimeline, exportSelectedToCSV, etc.)
    // ... rest of your existing methods ...
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const tableManager = new TableManager();
}); 