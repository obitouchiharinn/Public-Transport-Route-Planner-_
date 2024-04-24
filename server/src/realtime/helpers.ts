import {UserRoute, RTTIData, StopTimesData, RealTimeEstimate} from "../types";
import {queries} from "../database";

let apiKey = "";
if (process.env["APIKEY"] !== undefined){
    apiKey = process.env["APIKEY"];
}

const timeMatch = new RegExp(/((?:[1-9])|(?:1[0-2])):([0-5]\d)([apx]m)/);

const RTTITest: RTTIData = [{"RouteNo":"129","RouteName":"PATTERSONSTN/HOLDOMSTN","Direction":"EAST","RouteMap":{"Href":"https://nb.translink.ca/geodata/129.kmz"},"Schedules":[{"Pattern":"EB1","Destination":"HOLDOMSTN","ExpectedLeaveTime":"8:01pm2024-03-18","ExpectedCountdown":10,"ScheduleStatus":"-","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"07:50:38pm"},{"Pattern":"EB1","Destination":"HOLDOMSTN","ExpectedLeaveTime":"8:24pm2024-03-18","ExpectedCountdown":33,"ScheduleStatus":"-","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"07:01:20pm"},{"Pattern":"EB1","Destination":"HOLDOMSTN","ExpectedLeaveTime":"8:53pm2024-03-18","ExpectedCountdown":62,"ScheduleStatus":"","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"07:31:02pm"},{"Pattern":"EB1","Destination":"HOLDOMSTN","ExpectedLeaveTime":"9:21pm2024-03-18","ExpectedCountdown":90,"ScheduleStatus":"*","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"10:05:03pm"}]},{"RouteNo":"130","RouteName":"METROTOWN/PENDER/KOOTENAY","Direction":"SOUTH","RouteMap":{"Href":"https://nb.translink.ca/geodata/130.kmz"},"Schedules":[{"Pattern":"S1","Destination":"WILLINGDON/TOMETROTOWNSTN","ExpectedLeaveTime":"7:52pm 2024-03-18","ExpectedCountdown":1,"ScheduleStatus":"-","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"07:50:58pm"},{"Pattern":"S2B","Destination":"WILLINGDON/TOMETROTOWNSTN","ExpectedLeaveTime":"8:05pm 2024-03-18","ExpectedCountdown":14,"ScheduleStatus":"","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"06:59:19pm"},{"Pattern":"S1","Destination":"WILLINGDON/TOMETROTOWNSTN","ExpectedLeaveTime":"8:33pm 2024-03-18","ExpectedCountdown":42,"ScheduleStatus":"-","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"07:18:25pm"},{"Pattern":"S2B","Destination":"WILLINGDON/TOMETROTOWNSTN","ExpectedLeaveTime":"8:37pm 2024-03-18","ExpectedCountdown":46,"ScheduleStatus":"","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"07:32:19pm"},{"Pattern":"S1","Destination":"WILLINGDON/TOMETROTOWNSTN","ExpectedLeaveTime":"9:02pm 2024-03-18","ExpectedCountdown":71,"ScheduleStatus":"","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"07:48:18pm"},{"Pattern":"S2B","Destination":"WILLINGDON/TOMETROTOWNSTN","ExpectedLeaveTime":"9:08pm 2024-03-18","ExpectedCountdown":77,"ScheduleStatus":"*","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"10:05:03pm"}]},{"RouteNo":"131","RouteName":"HASTINGSATGILMORE/KOOTENAYLOOP","Direction":"WEST","RouteMap":{"Href":"https://nb.translink.ca/geodata/131.kmz"},"Schedules":[{"Pattern":"WB1","Destination":"KOOTENAYLOOP","ExpectedLeaveTime":"8:08pm2024-03-18","ExpectedCountdown":17,"ScheduleStatus":"-","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"07:03:26pm"},{"Pattern":"WB1","Destination":"KOOTENAYLOOP","ExpectedLeaveTime":"9:03pm2024-03-18","ExpectedCountdown":72,"ScheduleStatus":"*","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"09:05:03pm"}]},{"RouteNo":"132","RouteName":"CAPITOLHILL/HASTINGSATGILMORE","Direction":"NORTH","RouteMap":{"Href":"https://nb.translink.ca/geodata/132.kmz"},"Schedules":[{"Pattern":"NB1","Destination":"CAPITOLHILL","ExpectedLeaveTime":"8:45pm2024-03-18","ExpectedCountdown":54,"ScheduleStatus":"","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"07:43:03pm"},{"Pattern":"NB1","Destination":"CAPITOLHILL","ExpectedLeaveTime":"9:45pm2024-03-18","ExpectedCountdown":114,"ScheduleStatus":"*","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"10:05:03pm"}]},{"RouteNo":"160","RouteName":"PORTCOQUITLAMSTN/KOOTENAYLOOP","Direction":"EAST","RouteMap":{"Href":"https://nb.translink.ca/geodata/160.kmz"},"Schedules":[{"Pattern":"E1","Destination":"PTCOQSTN","ExpectedLeaveTime":"7:59pm2024-03-18","ExpectedCountdown":8,"ScheduleStatus":"*","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"06:55:17pm"},{"Pattern":"E1","Destination":"PTCOQSTN","ExpectedLeaveTime":"8:13pm2024-03-18","ExpectedCountdown":22,"ScheduleStatus":"*","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"07:10:29pm"},{"Pattern":"E1","Destination":"PTCOQSTN","ExpectedLeaveTime":"8:28pm2024-03-18","ExpectedCountdown":37,"ScheduleStatus":"","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"07:25:16pm"},{"Pattern":"E1","Destination":"PTCOQSTN","ExpectedLeaveTime":"8:43pm2024-03-18","ExpectedCountdown":52,"ScheduleStatus":"","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"07:40:59pm"},{"Pattern":"E1","Destination":"PTCOQSTN","ExpectedLeaveTime":"8:58pm2024-03-18","ExpectedCountdown":67,"ScheduleStatus":"*","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"09:05:03pm"},{"Pattern":"E1","Destination":"PTCOQSTN","ExpectedLeaveTime":"9:13pm2024-03-18","ExpectedCountdown":82,"ScheduleStatus":"*","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"10:05:03pm"}]},{"RouteNo":"R5","RouteName":"HASTINGSST","Direction":"EAST","RouteMap":{"Href":"https://nb.translink.ca/geodata/R5.kmz"},"Schedules":[{"Pattern":"E1","Destination":"HASTINGSST/TOSFUEXCHANGE","ExpectedLeaveTime":"7:59pm2024-03-18","ExpectedCountdown":8,"ScheduleStatus":"-","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"07:50:11pm"},{"Pattern":"E1","Destination":"HASTINGSST/TOSFUEXCHANGE","ExpectedLeaveTime":"8:10pm2024-03-18","ExpectedCountdown":19,"ScheduleStatus":"-","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"07:49:35pm"},{"Pattern":"E1","Destination":"HASTINGSST/TOSFUEXCHANGE","ExpectedLeaveTime":"8:23pm2024-03-18","ExpectedCountdown":32,"ScheduleStatus":"*","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"06:59:06pm"},{"Pattern":"E1","Destination":"HASTINGSST/TOSFUEXCHANGE","ExpectedLeaveTime":"8:38pm2024-03-18","ExpectedCountdown":47,"ScheduleStatus":"*","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"07:14:33pm"},{"Pattern":"E1","Destination":"HASTINGSST/TOSFUEXCHANGE","ExpectedLeaveTime":"8:53pm2024-03-18","ExpectedCountdown":62,"ScheduleStatus":"","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"07:29:38pm"},{"Pattern":"E1","Destination":"HASTINGSST/TOSFUEXCHANGE","ExpectedLeaveTime":"9:08pm2024-03-18","ExpectedCountdown":77,"ScheduleStatus":"","CancelledTrip":false,"CancelledStop":false,"AddedTrip":false,"AddedStop":false,"LastUpdate":"07:44:20pm"}]}];

function getTravelDuration(data: StopTimesData[], startTime: number): [number, number]{
    const times: [number, number][] = [];
    for (let x = 0; x < data.length; x += 2){
        if (data[x].trip_id === data[x + 1].trip_id){
            times.push([data[x].departure_time % 86400, data[x + 1].arrival_time % 86400]);
        }
    }
    if (times.length === 0){
        return [-1, -1];
    }

    // Get times for all buses that leave the stop and sort by closest to the start time. The closest to start time will be used as the estimate for the travel duration.
    times.sort((a, b) => (Math.abs(a[0] - startTime) - Math.abs(b[0] - startTime)));
    return times[0];
}

function parseTime(time: string): number{
    const match = time.match(timeMatch);
    if (match === null){
        return -1;
    }
    const hour = match[1];
    const minute = match[2];
    const bull = match[3];

    if (hour === undefined || minute === undefined || bull === undefined){
        return -1;
    }

    let offset = 0;
    if (bull === "pm"){
        offset = 43200;
    } else if (bull === "xm"){// Not sure if they still use this to represent time >= 24:00
        offset = 86400;
    }

    const result = parseInt(hour) * 3600 + parseInt(minute) * 60 + offset;
    if (isNaN(result)){
        return -1;
    }

    return result;
}

async function fetchRTTIEstimate(minStartTime: number, route_short_name: string, stop_code: string): Promise<number>{
    if (parseInt(route_short_name) >= 990){
        // Assume skytrain is always on time (it sometimes isn't but there is no real-time available for skytrain)
        return minStartTime;
    }

    if (apiKey === ""){
        throw new Error("No API key found.");
    }

    const options: RequestInit = {method: "GET", headers: {"Content-Type": "application/JSON", "Accept": "application/JSON"}};
    const res = await fetch(`https://api.translink.ca/RTTIAPI/V1/stops/${stop_code}/estimates?apiKey=${apiKey}&TimeFrame=180`, options);
    if (!res.ok){
        throw new Error("Error fetching from the Translink API.");
    }

    //route_short_name = "130";
    const data: RTTIData = await res.json();
    //for (let x = 0; x < data.length; x++){console.log(data[x].Schedules);}
    //const data1 = await Promise.resolve(RTTITest);// Change to actual data later

    const route = data.find((value) => value.RouteNo === route_short_name);
    if (route === undefined || route.Schedules.length === 0){
        throw new Error("Could not find route. There may be no more departures from this stop for today.");
    }

    //const times = route.Schedules.map((value) => parseTime(value.ExpectedLeaveTime)).filter((value) => value >= minStartTime).sort((a, b) => a - b);
    const allTimes = route.Schedules.map((value) => parseTime(value.ExpectedLeaveTime)).sort((a, b) => a - b);
    const todayTimes = allTimes.filter((value) => value >= minStartTime);

    if (allTimes.length === 0){
        throw new Error("Trip is too far in advance to use real-time data.");
    }

    if (todayTimes.length > 0){
        return todayTimes[0];
    }
    return allTimes[0];
    //return minStartTime;
}

/*
Real-time estimate example
1. Start trip at 15:00
2. Take the 210 from stop 50438 to 61269
    - Get next real-time departure after 15:00 and set as the current time
    - Use static data to determine how long it should take to go from stop 50438 to 61269 on route 210
    - Add the result to the current time and this is the arrival time
3. Transfer to the 240 and take it from stop 54014 to 61563
    - Get next real-time departure after the previous arrival time (in step 2) and set as the current time
    - Use static data to determine how long it should take to go from stop 54014 to 61563 on route 240
    - Add the result to the current time and this is the arrival time
4. Return arrival time
*/
export async function getRealTimeEstimate(routes: UserRoute): Promise<RealTimeEstimate[]>{
    const t = new Date();
    
    let serviceNumber = 1;
    const weekday = t.getDay();
    if (weekday === 0){
        serviceNumber = 3;
    } else if (weekday === 6){
        serviceNumber = 2;
    }

    // This stores the expected start time in each iteration of the loop: the time that the previous route is expected to finish at
    let expectedTime = t.getHours() * 3600 + t.getMinutes() * 60 + t.getSeconds();
    t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
    const serviceDate = t.toISOString().split("T")[0];
    
    const estimates: RealTimeEstimate[] = [];

    for (let x = 0; x < routes.length; x++){
        const r = routes[x];
        // This is whether the real-time data is available and valid. If not, the user will be notified that static data is being used in place of real-time data by setting this value to the appropriate message
        let validMessage = "";
        // This stores the actual start time, given the real-time data
        let actualTime = expectedTime;
        let transferTime = 0;

        try{
            // If RTTI is successful, set actual time to the estimate from the data
            actualTime = await fetchRTTIEstimate(expectedTime, r.route_short_name, r.startStop);
        } catch (error){
            const e = error as Error;
            validMessage = e.message;
        }

        // The duration calculation should use the actual time, not expected time. If RTTI failed then actual time will be the same as expected time.
        const times = await queries.getStopTimes({
            route_short_name: r.route_short_name,
            service_id: serviceNumber,
            service_date: serviceDate,
            direction_id: r.direction_id,
            startStop: r.startStop,
            endStop: r.endStop,
            afterTime: 0
        });

        let startStopName = "";
        let endStopName = "";
        if (times.length >= 2){
            // The start and end stops should be the same for all results so it doesn't matter which one is used to get the name
            startStopName = times[0].stop_name;
            endStopName = times[1].stop_name;
        }

        const [start, end] = getTravelDuration(times, actualTime);
        const duration = ((((end - start) % 86400) + 86400) % 86400);
        if (start < 0 || end < 0){
            return [];
        }

        // If the real-time failed, use static data instead by setting the first trip after the expected time as the "actual time" estimate
        // (When real-time is successful, the time returned by the real-time api is used instead)
        if (validMessage !== ""){
            actualTime = start;
        }

        if (typeof r.transferTime === "number" && r.transferTime > 0){
            transferTime = r.transferTime;
        }

        estimates.push({
            route_short_name: r.route_short_name,
            expectedStart: expectedTime,
            actualStart: actualTime,
            endTime: actualTime + duration,
            startStopName: startStopName,
            endStopName: endStopName,
            realTimeMessage: validMessage
        });

        // Set the new expected time to the arrival time of this current route + any transfer time set by the user
        expectedTime = actualTime + duration + transferTime;
    }

    return estimates;
}
