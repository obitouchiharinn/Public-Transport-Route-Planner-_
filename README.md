# Public Transport Route Planner - How to Run

This guide explains how to run the Transit Route Planner project locally, including both the front-end and server components.

## Prerequisites

- Node.js (v16 or later recommended)
- npm (comes with Node.js)
- PostgreSQL database (for server data storage)
- Access to TransLink API (for live bus stop data)

## Front-end Setup

1. Open a terminal and navigate to the front-end directory:

   ```bash
   cd transit-route-planner/front-end
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and go to the URL shown in the terminal (usually http://localhost:5173).

## Server Setup

1. Open a separate terminal and navigate to the server directory:

   ```bash
   cd transit-route-planner/server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables for database connection. Create a `.env` file in the server directory with the following variables:

   ```
   CLOUD_USER=your_database_username
   CLOUD_PASSWORD=your_database_password
   CLOUD_DATABASE=your_database_name
   CLOUD_INSTANCE=your_cloud_sql_instance_connection_name (optional, for Google Cloud SQL)
   SECRET_KEY=your_jwt_secret_key
   ```

4. Start the server in development mode:

   ```bash
   npm run dev
   ```

   This will run the server with automatic reload on code changes.

5. Alternatively, to build and run the server in production mode:

   ```bash
   npm run start
   ```

## Database Setup and Data Import

1. Ensure your PostgreSQL database is running and accessible.

2. Create the necessary tables in your database. The main tables include:

   - routes
   - trips
   - stops
   - times
   - service
   - users
   - journeys
   - journey_trips

   (Refer to the database schema in the source code or documentation for detailed table definitions.)

3. Import the CSV data files located in `transit-route-planner/data/` into the corresponding tables. For example, using the `psql` command-line tool:

   ```bash
   psql -U your_database_username -d your_database_name -c "\copy routes FROM 'path/to/routes.csv' CSV HEADER;"
   psql -U your_database_username -d your_database_name -c "\copy service FROM 'path/to/service.csv' CSV HEADER;"
   psql -U your_database_username -d your_database_name -c "\copy stops FROM 'path/to/stops.csv' CSV HEADER;"
   psql -U your_database_username -d your_database_name -c "\copy times FROM 'path/to/times.csv' CSV HEADER;"
   psql -U your_database_username -d your_database_name -c "\copy trips FROM 'path/to/trips.csv' CSV HEADER;"
   ```

   Adjust the file paths as needed.

## Running the Full Application

- Start the server first (`npm run dev` in the server directory).
- Then start the front-end (`npm run dev` in the front-end directory).
- The front-end will communicate with the server API to provide full functionality.

## Additional Notes

- Static data files are located in `transit-route-planner/data/`.
- For more detailed information about the project features and architecture, please refer to the main [README.md](./README.md).

## Contact

For questions or support, please contact the project maintainer.
