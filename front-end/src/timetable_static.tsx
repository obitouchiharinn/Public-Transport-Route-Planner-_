import {useState} from "react";
import RouteSelector, {SavedTrip, TimesData, getToken} from "./RouteSelector";
import "./timetable_static.css";
import Header from "./Header";
import NavBar from "./Nav";

type TimesSearchBody = {
    date: string;
    direction: number;
    start: string;
    end: string;
    prevTimes: number[];
    firstRoute?: boolean;
};

const SERVER = import.meta.env["VITE_SERVER"];

async function getTimes(route: string, options: TimesSearchBody){
    if (route === ""){
        throw new Error("Select a route.");
    }
    if (options.start === options.end){
        throw new Error("Start and end stops must be different");
    }
    const res = await fetch(`${SERVER}/routes/${route}/times`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(options)
    });
    if (!res.ok){
        throw new Error("Could not fetch stop times. There may be no more trips left in the day.");
    }
    return await res.json();
}
export async function saveJourney(name: string, routes: SavedTrip[]){
    if (name === ""){
        throw new Error("Saved trip must have a name.");
    }
    const token = getToken();
    const body = {name: name, routes: routes};
    const res = await fetch(`${SERVER}/saved/add`, {
        method: "POST",
        headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
        body: JSON.stringify(body)
    });
    if (!res.ok){
        if (res.status === 401){
            throw new Error("You must log in to save trips.");
        }
        throw new Error("Could not save trips.");
    }
}

export default function StaticTimetable(){
    const [date, setDate] = useState<string>("2024-01-01T00:00");
    const [timesCount, setTimesCount] = useState<number>(5);
    const [times, setTimes] = useState<TimesData[]>([]);
    const [saveName, setSaveName] = useState<string>("");
    const [error, setError] = useState<string>("\u00a0");

    const convertTime = (time: number) => {
        return `${Math.floor(time / 3600)}:${`${Math.floor((time % 3600) / 60)}`.padStart(2, "0")}:${`${time % 60}`.padStart(2, "0")}`;
    };

    const onRejected = (reason: Error) => {
        setError(reason.message);
        console.log(reason);
    };

    const submitRoutes = async (saved: SavedTrip[], clear: boolean = false) => {
        const newTimes: TimesData[] = [];
        // For each trip added, save a copy of the saved trip data used in case the user wants to save their trips
        const datetime = date.split("T");
        if (datetime.length !== 2){
            return;
        }
        const time = datetime[1].split(":").map((value) => parseInt(value));
        if (time.length !== 2){
            return;
        }

        try{
            for (let i = 0; i < saved.length; i++){
                // Current value's transfer time is the number of seconds between the end of the previous route and the start of the current route
                let prevTimes: number[] = [];
                if (newTimes.length > 0){
                    prevTimes = newTimes[newTimes.length - 1].display.times.map((value) => value.endTime + saved[i].transferTime);
                } else if (times.length > 0 && !clear){
                    // Do not use previous times when clearing them
                    prevTimes = times[times.length - 1].display.times.map((value) => value.endTime + saved[i].transferTime);
                } else{
                    for (let x = 0; x < timesCount; x++){
                        prevTimes.push(time[0] * 3600 + time[1] * 60);
                    }
                }
    
                const route = await getTimes(saved[i].route_short_name, {
                    date: datetime[0],
                    direction: saved[i].direction_id,
                    start: saved[i].startStop,
                    end: saved[i].endStop,
                    prevTimes: prevTimes,
                    firstRoute: (times.length === 0 || clear) && newTimes.length === 0
                });
    
                newTimes.push({
                    BULL: `${Date.now()}FRANK${i * 69}ASH`,
                    display: {
                        startStopName: route.startStopName,
                        endStopName: route.endStopName,
                        trip_headsign: route.trip_headsign,
                        times: route.times
                    },
                    data: saved[i]
                });
            }
        } catch (error){
            setError((error as Error).message);
            return;
        }

        if (clear){
            setTimes(newTimes);
        } else{
            setTimes(times.concat(newTimes));
        }
        setError("");
    };

    return (
        <div className="main-wrapper">
            <NavBar page={"static"}/>
            <Header/>
            
            <div className={"form-wrapper"}>
                <h2 className={"form-heading"}>Date and Time</h2>
                <label htmlFor={"datetime"}>Date</label>
                <input id={"datetime"} type={"datetime-local"} onChange={(event) => setDate(event.target.value)}/>
            
                <label htmlFor={"count"}>Number of trips to show</label>
                <input id={"count"} type={"number"} value={timesCount > 0 ? timesCount: ""} onChange={(event) => {
                    const value = parseInt(event.target.value);
                    if (!isNaN(value)){
                        setTimesCount(Math.min(20, value));
                    } else{
                        setTimesCount(0);
                    }}
                }/>
            </div>
            <RouteSelector submitRoutes={(saved, clear) => {submitRoutes(saved, clear).then(() => {}).catch((error) => setError(error))}} setError={(message) => setError(message)} date={date}/>
            <div className={"error"}>{error}</div>
            {times.length > 0 &&
            <div id={"times-wrapper"}>
            <div id={"times"}>
                {times.map((value, index) => (
                    <div className={"route"} key={value.BULL}>
                        <h2>{value.display.times.length > 0 ? value.display.trip_headsign : `Route ${index + 1}`}</h2>
                        <button className={"route-delete"} onClick={() => {
                            setTimes(times.filter((value2) => value.BULL !== value2.BULL));
                        }}>Remove</button>
                        <div className={"time-display"}>
                            <div className={"time-display-stops"}>
                                <div>{value.display.startStopName}</div>
                                <div>{value.display.endStopName}</div>
                            </div>
                            {value.display.times.map((trip, index) => (
                                <div key={index} className={"time-display-times"}>
                                    <div>{convertTime(trip.startTime)}</div>
                                    <div>{convertTime(trip.endTime)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className={"save"}>
                <button className="frm-btn" onClick={() => {setTimes([]);}}>Remove All Routes</button>
                <div>
                    <input placeholder={"Trip Name"} value={saveName} onChange={(event) => setSaveName(event.target.value)}/>
                    <button className="frm-btn" onClick={() => {
                        if (times.length > 10){
                            setError("A trip can only have at most 9 transfers (Why do you even need to transfer this many times?).");
                            return;
                        }
                        saveJourney(saveName, times.map((value) => {
                            const route = value.data;
                            return {
                                route_short_name: route.route_short_name,
                                direction_id: route.direction_id,
                                startStop: route.startStop,
                                endStop: route.endStop,
                                transferTime: route.transferTime
                            };
                        }))
                        .then(() => {
                            setSaveName("");
                            //loadJourneys();
                        })
                        .catch(onRejected);
                    }}>Save Trip</button>
                </div>
            </div>
            </div>
            }
        </div>
    );
}
