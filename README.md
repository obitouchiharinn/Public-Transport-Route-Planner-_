# Transit Travel Guide - Final Report

Description: A transit route planning app, with additional tools to assist in viewing TransLink routes and planning stops for regular riders in the Metro Vancouver area.

Project URL: https://transit-app-frontend-1-lc5xesneda-uw.a.run.app

## Architecture:

Stack: PostgreSQL (To CloudSQL on GCP), React with Vite, Node.js, Express.js, GCP 

Front-end: Built with React using Vite development server. Holds the main user interface and handles API calls for Map and Stop data.

API: TransLink API used for live bus stop information. Static stop information taken from TransLink static data table.

Server: Node.js server in Typescript, using express to retrieve and store data to our database, and store data in endpoints.

Database: PostgreSQL in development and testing, Cloud SQL with PostgreSQL while running on GCP.

Hosting: Project is containerized with Docker and images are hosted on GCP using Cloud Run. The backend is an Express server running in a Docker container that connects to our Cloud SQL instance. The frontend pages are served by the static function in a separate Express server, with a container similar to the backend. These two servers were separated to avoid route name conflicts.


## Features:

Bus Stop Map:
View all bus stops within a relative radius of map position, with clustering of markers to improve performance. Clusters are overlaid on a single Canvas layer.
Radius of stops are displayed when hovering over a cluster, and zooms into a cluster when clicked selected.
View name of each bus stop with a marker containing a link to the stops live timetable.
Filter bus stops by name or direction, also update cluster counts and radius.



### Live Timetable:
For each stop, view the following information after accessing from the map:
City the stop is located in.
The address of the stop, given as an intersection of ST and AVE
Wheelchair access to the stop.
A list of routes that use the stop, along with direction.
Arrival time of the next bus and time remaining, along with the next 5 after it.

### Static Timetable:
View scheduled departure and arrival times for multiple routes at a time.
When adding multiple routes, the departure times returned for each route are automatically set based on the arrival times of the previous route.
Users can use this feature to find the expected time for their entire journey.
If a user frequently travels along a specific journey, they can save it to their account.
Users can quickly view static timetables for a saved journey, without the need to input each route, direction, and stops again.

### Real-time Route Viewer:
Provide an estimate of the actual travel time for a user’s journey by combining real-time data from the TransLink API with the static timetables.
This feature takes an input similar to the static timetable feature (a sequence of routes) and uses TransLink real-time API to estimate how long the journey will take.
When real-time data from TransLink is not available, data from the static timetables will be used as a fallback.
Users can quickly view the real-time estimates for their saved journeys.

### Route Finder:
Suggests the best 1-5 routes from a start location to an end location.
This feature stores a graph of the city where the nodes are transfer points and the edges have weights set to the expected travel time between nodes.
When a user specifies a start and end location, the server does a search on the graph to determine the best routes from start to end.
Once suggested routes have been found, for each route, the user can view travel instructions (which bus to take, which stops to get on or off at), save the route as a journey, or view the route in the real-time route viewer.

### User Authentication:
Register, and login endpoints, using stateless authentication. Stateless authentication is more scalable than stateful authentication, and benefits of stateful authentication, such as being able to shut off sessions from the server side, are not necessary.
Profile page that is protected to only display the user’s own personal information.



## How To Test:

### Bus stop map: 

1. Search for a specific bus stop using the search bar below the map, else you can hover the mouse over a specific cluster to see the range of the stops highlighted in blue.

2. Click a cluster to expand and zoom in, continue to the lowest level to view all stops in a specific region.

3. View timetable by clicking on the corresponding marker to open a popup, follow link to view timetable. Will show all buses (route) coming to that stop and the next 6 bus times for each. 

### Static timetable:

#### To create a new trip:

1. Start by choosing the date you will make the trip on.

2. Under “Create New Trip”, select the first route on your trip, then click Set Route.

3. The direction box below will show all directions for this route. Select the direction you intend to travel in, then click Set Direction.

4. The stop boxes below will then show all stops for the route and direction. Select the stops you intend to depart from and arrive at, then click Set Stops.

5. The scheduled times will then appear on the page below. Repeat steps 2 to 4 to add more routes to your trip.

#### To save a trip:

1. Once you have a trip added, enter the name to save it as in the Trip Name box at the bottom of the page.

2. Click “Save Trip” then reload the page to update the saved trips.

#### To view a saved trip:

1. Start by choosing the date you will make the trip on.

2. Under “Select from Saved Trips”, select the trip view.

3. Click “Set Trip”.

### Real-time Route Viewer:

1. Select a trip by either creating a new trip or selecting one from your saved trips. The interface for selecting a trip is the same as in the static timetable.

2. Once your trip is added, click “Update Real-Time Info” to show the times for the trip.

3. Click the button again to refresh the real-time info.

### Route Finder:

1. Select a start and end point from the list of transfer points.

2. Click “Find Route”.

3. The list of suggested routes will be displayed below. For each route, you can click to show more details, save it to your account, or view it in the real-time route viewer.


## Known Issues:

Problems where some less frequent bus stops are not updated or do not return any data sometimes, which is a known issue with TransLink API. For testing purposes, please use a busy or high traffic bus stop for accurate updates.

Small delay with wheelchair access icon loading in after the rest of the live time table, leading a small load after. 

The route finder required manually creating a graph of the city because TransLink does not provide transfer points. Due to time constraints, the graph of the entire Metro Vancouver area could not be created so the current graph only includes a smaller part of the city. The current graph does contain enough nodes to demonstrate the functionality of the route finder.

When first visiting the website after a while, it may take a few seconds to start up. This is because Cloud Run only allocates resources when the application is in use. If the website has not been visited recently, Cloud Run must start up a new instance to run the server which may take some time.


## IDs and Passwords: 

There is a test account in the system that has a saved journey.
Email: test@bull.com
Password: 123

Log in with these credentials then navigate to the static timetable. There should be a saved trip that can be accessed under “Select from Saved Trips”.

Alternatively, to create a new account, go to the register page. Then, log in with that account to access all features in the system.
