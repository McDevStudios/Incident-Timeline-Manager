\c timeline_db

CREATE TABLE IF NOT EXISTS table_columns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    column_order INTEGER NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS table_data (
    id SERIAL PRIMARY KEY,
    start_datetime TIMESTAMP,
    end_datetime TIMESTAMP,
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    custom_fields JSONB DEFAULT '{}'::jsonb
);

-- Insert default columns
INSERT INTO table_columns (name, column_order, data_type) VALUES
    ('start_datetime', 1, 'datetime'),
    ('end_datetime', 2, 'datetime'),
    ('title', 3, 'text'),
    ('description', 4, 'text');

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update timestamp
CREATE TRIGGER update_table_data_updated_at
    BEFORE UPDATE ON table_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add table for custom columns
CREATE TABLE IF NOT EXISTS custom_columns (
    id SERIAL PRIMARY KEY,
    column_name VARCHAR(255) NOT NULL,
    column_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 