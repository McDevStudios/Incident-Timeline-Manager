const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'database',
    database: 'timeline_db',
    password: 'postgres',
    port: 5432,
});

// Get table structure and data
app.get('/api/table/structure', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT name, column_order, data_type FROM table_columns ORDER BY column_order'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all table data
app.get('/api/table/data', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM table_data ORDER BY start_datetime');
        console.log('Sending data to frontend:', result.rows); // Debug log
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching table data:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add new row
app.post('/api/table/data', async (req, res) => {
    const { start_datetime, end_datetime, title, description, ...customFields } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO table_data 
            (start_datetime, end_datetime, title, description, custom_fields) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *`,
            [start_datetime, end_datetime, title, description, JSON.stringify(customFields)]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update row
app.put('/api/table/data/:id', async (req, res) => {
    const { id } = req.params;
    const { start_datetime, end_datetime, title, description, custom_fields } = req.body;
    
    console.log('Updating row with data:', { id, start_datetime, end_datetime, title, description, custom_fields });

    try {
        const result = await pool.query(
            `UPDATE table_data 
            SET start_datetime = COALESCE($1, start_datetime),
                end_datetime = COALESCE($2, end_datetime),
                title = COALESCE($3, title),
                description = COALESCE($4, description),
                custom_fields = $5
            WHERE id = $6 
            RETURNING *`,
            [start_datetime, end_datetime, title, description, custom_fields, id]
        );
        
        console.log('Updated row:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating row:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete row
app.delete('/api/table/data/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM table_data WHERE id = $1', [id]);
        res.json({ message: 'Row deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add endpoint to manage custom columns
app.post('/api/columns', async (req, res) => {
    const { column_name } = req.body;
    try {
        // Get the highest current order
        const orderResult = await pool.query(
            'SELECT COALESCE(MAX(column_order), 0) as max_order FROM custom_columns'
        );
        const newOrder = orderResult.rows[0].max_order + 1;

        const result = await pool.query(
            'INSERT INTO custom_columns (column_name, column_order) VALUES ($1, $2) RETURNING *',
            [column_name, newOrder]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all columns
app.get('/api/columns', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM custom_columns ORDER BY column_order');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Simplified delete endpoint
app.delete('/api/columns/:columnName', async (req, res) => {
    const { columnName } = req.params;
    console.log('DELETE request received for column:', columnName);
    
    try {
        // Log the exact SQL query we're about to execute
        const query = 'DELETE FROM custom_columns WHERE column_name = $1';
        console.log('Executing SQL:', query, 'with value:', columnName);
        
        const result = await pool.query(query, [columnName]);
        console.log('Rows affected by DELETE:', result.rowCount);
        
        if (result.rowCount > 0) {
            console.log('Successfully deleted column from database');
            res.json({ success: true, rowsDeleted: result.rowCount });
        } else {
            console.log('No rows were deleted - column might not exist in database');
            res.status(404).json({ error: 'Column not found in database' });
        }
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 