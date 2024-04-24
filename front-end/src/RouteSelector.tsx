import {useState, useEffect, useCallback} from "react";
import "./timetable_static.css";

interface RoutePreview{
    name: string;
    destinations: string;
}
interface DirectionPreview{
    direction_id: number;
    trip_headsign: string;
}
interface StopPreview{
    stop_id: number;
    stop_code: string;
    stop_name: string;
}
interface JourneyData{
    journey_id: number;
    journey_name: string;
}
export interface SavedTrip{
    route_short_name: string;
    direction_id: number;
    startStop: string;
    endStop: string;
    transferTime: number;
}
export interface TimesData{
    BULL: string;
    display: {
        startStopName: string;
        endStopName: string;
        trip_headsign: string;
        times: {
            trip_id: number;
            startTime: number;
            endTime: number;
        }[];
    };
    data: SavedTrip;
}

const SERVER = import.meta.env["VITE_SERVER"];

export function getToken(){
    const token = localStorage.getItem("token");
    if (token === null){
        throw new Error("Not logged in.");
    }
    return token;
}
async function getRoutes(){
    const res = await fetch(`${SERVER}/routes`);
    if (!res.ok){
        throw new Error("Could not fetch routes.");
    }
    return await res.json();
}
async function getDirections(route: string){
    if (route === ""){
        throw new Error("Select a route.");
    }
    const res = await fetch(`${SERVER}/routes/${route}`);
    if (!res.ok){
        throw new Error("Could not fetch directions for route.");
    }
    return await res.json();
}
async function getStops(route: string, direction: string, date: string){
    if (route === ""){
        throw new Error("Select a route.");
    }
    const res = await fetch(`${SERVER}/routes/${route}/stops?direction=${direction}&date=${date.split("T")[0]}`);
    if (!res.ok){
        throw new Error("Could not fetch stops.");
    }
    return await res.json();
}
async function getJourneys(){
    const token = getToken();
    const res = await fetch(`${SERVER}/saved/list`, {headers: {"Authorization": `Bearer ${token}`}});
    if (!res.ok){
        throw new Error("Could not get saved trips.");
    }
    return await res.json();
}
async function getJourneyTrips(journey_id: string){
    if (journey_id === ""){
        throw new Error("Select a saved trip.");
    }
    const token = getToken();
    const res = await fetch(`${SERVER}/saved/get/${journey_id}`, {headers: {"Authorization": `Bearer ${token}`}});
    if (!res.ok){
        throw new Error("Could not get saved trips.");
    }
    return await res.json();
}
/*async function deleteJourney(journey_id: string){
    if (journey_id === ""){
        throw new Error("Select a saved trip.");
    }
    const token = getToken();
    const res = await fetch(`${SERVER}/saved/delete/${journey_id}`, {method: "DELETE", headers: {"Authorization": `Bearer ${token}`}});
    if (!res.ok){
        throw new Error("Could not delete saved trip.");
    }
    return await res.json();
}*/

interface RouteSelectorProps{
    submitRoutes: (saved: SavedTrip[], clear: boolean) => void;
    setError: (message: string) => void;//React.Dispatch<React.SetStateAction<string>>;
    date: string;
}

export default function RouteSelector({submitRoutes, setError, date}: RouteSelectorProps){
    const [routes, setRoutes] = useState<RoutePreview[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<string>("");
    const [directions, setDirections] = useState<DirectionPreview[]>([]);
    const [selectedDirection, setSelectedDirection] = useState<string>("-1");
    const [stops, setStops] = useState<StopPreview[]>([]);
    const [startStop, setStartStop] = useState<string>("");
    const [endStop, setEndStop] = useState<string>("");
    const [transferTime, setTransferTime] = useState<number>(0);
    const [selectedJourney, setSelectedJourney] = useState<string>("");
    const [journeys, setJourneys] = useState<JourneyData[]>([]);
    
    const loadJourneys = useCallback(() => {
        getJourneys()
        .then((value) => setJourneys(value))
        .catch(() => {setJourneys([])});
    }, [setJourneys]);

    const onRejected = (reason: Error) => {
        setError(reason.message);
        console.log(reason);
    };

    useEffect(() => {
        try{
            getRoutes().then((value) => setRoutes(value)).catch(() => {setError("Could not fetch routes.")});
            loadJourneys();
        } catch (error){
            console.error(error);
        }
    }, []);

    return (
        <div>
            <div id={"options"} className="form-wrapper">
                <h2 className={"form-heading"}>Select from Saved Trips</h2>
                {journeys.length > 0 ?
                <>
                    <select onChange={(event) => setSelectedJourney(event.target.value)}>
                        <option key={""} value={""}>Select From Saved Trips</option>
                        {journeys.map((value) => (
                            <option key={value.journey_id} value={value.journey_id}>{value.journey_name}</option>
                        ))}
                    </select>
                    
                    <button className="frm-btn" onClick={() => {
                        getJourneyTrips(selectedJourney)
                        .then((value) => {
                            submitRoutes(value, true);
                        })
                        .catch(onRejected);
                    }}>Set Trip</button>
                    {// This should probably be moved to the account settings
                    /* <div id={"save-controls"}>
                    <button className="frm-btn" onClick={() => {
                        deleteJourney(selectedJourney)
                        .then((_) => {
                            loadJourneys();
                        })
                        .catch(onRejected);
                    }}>Delete Trip</button>
                    </div> */}
                </>
                :
                <div>You currently do not have any saved trips.</div>
                }

                <hr className={"form-divider"}/>

                <h2 className={"form-heading"}>Create New Trip</h2>

                <select onChange={(event) => setSelectedRoute(event.target.value)}>
                    <option key={""} value={""}>Select Route</option>
                    {routes.map((value) => (
                        <option key={value.name} value={value.name}>{`${value.name} ${value.destinations}`}</option>
                    ))}
                </select>
                <button className="frm-btn" onClick={() => {
                    getDirections(selectedRoute)
                    .then((value) => {
                        if (value.length > 0){
                            setDirections(value);
                            setSelectedDirection(value[0].direction_id);
                        }
                        setStops([]);
                        setError("");
                    })
                    .catch(onRejected);
                }}>Set Route</button>
            
                <select onChange={(event) => setSelectedDirection(event.target.value)}>
                    {directions.length === 0 && <option key={""} value={""}>Select Direction</option>}
                    {directions.map((value) => (
                        <option key={`${value.direction_id}${value.trip_headsign}`} value={`${value.direction_id}`}>{value.trip_headsign}</option>
                    ))}
                </select>
                <button className="frm-btn" onClick={() => {
                    getStops(selectedRoute, selectedDirection, date)
                    .then((value) => {
                        if (value.length === 0){
                            throw new Error("No service at the selected time.");
                        }
                        setStops(value);
                        setError("");
                    })
                    .catch(onRejected);}
                }>Set Direction</button>
                
                <select onChange={(event) => setStartStop(event.target.value)}>
                    <option key={""} value={""}>Select Start Stop</option>
                    {stops.map((value) => (
                        <option key={value.stop_id} value={value.stop_code}>{value.stop_name}</option>
                    ))}
                </select>
                
                <select onChange={(event) => setEndStop(event.target.value)}>
                    <option key={""} value={""}>Select End Stop</option>
                    {stops.map((value) => (
                        <option key={value.stop_id} value={value.stop_code}>{value.stop_name}</option>
                    ))}
                </select>
                <label htmlFor={"transfer"}>Transfer time from previous route (seconds)</label>
                <input id={"transfer"} type={"number"} value={transferTime > 0 ? transferTime: ""} onChange={(event) => {
                    const value = parseInt(event.target.value);
                    if (!isNaN(value)){
                        setTransferTime(value);
                    } else{
                        setTransferTime(0);
                    }}
                }/>
                <p></p>
                <button className="frm-btn" onClick={() => {
                    if (startStop === "" || endStop === ""){
                        setError("Select a start and end stop.");
                        return;
                    }
                    submitRoutes([{
                        route_short_name: selectedRoute,
                        direction_id: parseInt(selectedDirection),
                        startStop: startStop,
                        endStop: endStop,
                        transferTime: transferTime
                    }], false);
                }}>Add Route to Trip</button>
            </div>
        </div>
    );
}
