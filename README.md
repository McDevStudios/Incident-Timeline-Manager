# Incident Timeline Manager
Manage incident data with dynamic table and timeline visualization.

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Setup and Deployment](#setup-and-deployment)
- [Development](#development)
- [Extras](#extras)
- [License](#license)

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

## Setup and Deployment

### Prerequisites
- Docker and Docker Compose installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/McDevStudios/Incident-Timeline-Manager.git
   cd Incident-Timeline-Manager  

3. Build and start the containers:
   ```bash
   docker-compose up --build  

5. Access the application:
   - Frontend: `http://localhost:8080`
   - Backend API: `http://localhost:3000`

### Configuration
- **Ports**: The application uses port `8080` for the frontend and `3000` for the backend. These can be changed in the `docker-compose.yml` file if needed.
- **Database Credentials**: The default PostgreSQL username and password are set to `postgres`. These can be configured in the `docker-compose.yml` file under the `database` service.

## Development

### Frontend
- Located in the `frontend` directory.
- Uses Nginx to serve static files.

### Backend
- Located in the `backend` directory.
- Express server handles API requests.

### Database
- PostgreSQL setup with initial schema in `database/init.sql`.

## Extras
- Enhanced styling with CSS frameworks.
- Data export/import in CSV format.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
