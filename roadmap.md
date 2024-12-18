# Incident Timeline Manager
Manage incident data with dynamic table and timeline visualization.

## Overview
A lightweight CRUD web app with two main features:
1. **Table Management**: Add custom columns and rows for data entry.
2. **Timeline Visualization**: Dynamically display selected items from the table in a timeline.

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Infrastructure**: Docker (three containers: frontend, backend, database)

## Features

### 1. Table Management
- Users can:
  - Add, edit, and delete rows and columns.
  - Define custom column types (e.g., text, date).
  - View and manage data entries in a tabular format.
- Data is saved to a PostgreSQL database.

### 2. Timeline Visualization
- A timeline container below the table dynamically updates to display:
  - Items selected from the table.
  - Relevant details (e.g., timestamps, descriptions).
- Interactive features:
  - Users can select or deselect rows from the table to add/remove them from the timeline.
  - Data is visualized chronologically.

### 3. Containerized Architecture
- **Frontend Container**:
  - Serves the web app (HTML, CSS, JavaScript) using a simple HTTP server (e.g., Nginx or a Node.js static file server).
- **Backend Container**:
  - Hosts the Node.js Express API.
  - Handles CRUD operations for the table and serves data for the timeline.
- **Database Container**:
  - Runs PostgreSQL.
  - Stores table and timeline data persistently.

---

## Development Phases

### Phase 1: Core Functionality
1. **Frontend**
   - Create a table interface for users to:
     - Add columns and rows.
     - Edit and delete entries.
   - Build a simple timeline container below the table.
     - Dynamically populate the timeline as users select items from the table.
   - Package the frontend in a container (e.g., using Nginx or similar).
2. **Backend**
   - Set up an Express server with the following routes:
     - CRUD operations for table entries.
     - Endpoint for fetching table data.
   - Define API contracts (e.g., JSON structure for table and timeline).
   - Package the backend in a separate container.
3. **Database**
   - Define a schema for the table:
     - Example columns: `id`, `timestamp`, `title`, `description`.
   - Run PostgreSQL in its own container.
   - Ensure connectivity with the backend using network configuration.

### Phase 2: Integration
- Connect frontend, backend, and database:
  - Link frontend actions (e.g., form submissions, row selections) to backend API endpoints using fetch.
  - Ensure backend communicates with the database to save and retrieve data.
  - Use Docker Compose or equivalent to define and manage the multi-container setup.
- Test inter-container networking to verify seamless data flow.

### Phase 3: Deployment
- Use Docker Compose to deploy the app with all three containers.
- Deploy to a cloud provider supporting containerized apps (e.g., AWS ECS, Azure, or DigitalOcean).
- Configure environment variables for sensitive data (e.g., database credentials).

---