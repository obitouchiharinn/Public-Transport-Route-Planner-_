import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {SavedTrip} from "./RouteSelector";
import {saveJourney} from "./timetable_static";
import Header from "./Header";
import NavBar from "./Nav";
import "./route_finder.css";

interface TransferPoint{
    node: number;
    displayName: string;
}
interface TripPreview{
    headsigns: string[];
    startStopName: string;
    endStopName: string;
}

const SERVER = import.meta.env["VITE_SERVER"];

const removeDirection = new RegExp(/\b[A-z]+bound\s*/g);

async function getTransferPoints(){
    const res = await fetch(`${SERVER}/routefinder/points`);
    if (!res.ok){
        throw new Error("Could not fetch stops.");
    }
    return await res.json();
}
async function getRoutes(start: string, end: string){
    if (start === "" || end === ""){
        throw new Error("Select a start and end point.");
    }
    if (start === end){
        throw new Error("Start and end points must be different.");
    }
    const res = await fetch(`${SERVER}/routefinder/routes?start=${start}&end=${end}`);
    if (!res.ok){
        throw new Error("Could not fetch routes.");
    }
    return await res.json();
}

export default function RouteFinder(){
    const [points, setPoints] = useState<TransferPoint[]>([]);
    const [startPoint, setStartPoint] = useState<string>("");
    const [endPoint, setEndPoint] = useState<string>("");
    const [data, setData] = useState<SavedTrip[][]>([]);
    const [previews, setPreviews] = useState<{BULL: number; preview: TripPreview[]}[]>([]);
    const [savedRoutes, setSavedRoutes] = useState<number[]>([]);
    const [error, setError] = useState<string>("\u00a0");

    const navigate = useNavigate();

    const onRejected = (reason: Error) => {
        setError(reason.message);
        console.log(reason);
    };

    useEffect(() => {
        getTransferPoints().then((value) => setPoints(value)).catch(() => {setError("Could not fetch transfer points.")});
    }, []);

    return (
        <div className={"main-wrapper"}>
            <Header/>
            <NavBar page={"routefinder"}/>
            <div className={"form-wrapper"}>
                <h2>Route Finder</h2>
                <select onChange={(event) => setStartPoint(event.target.value)}>
                    <option key={""} value={""}>Select Start Point</option>
                    {points.map((value) => (
                        <option key={value.node} value={`${value.node}`}>{value.displayName}</option>
                    ))}
                </select>
                <select onChange={(event) => setEndPoint(event.target.value)}>
                    <option key={""} value={""}>Select End Point</option>
                    {points.map((value) => (
                        <option key={value.node} value={`${value.node}`}>{value.displayName}</option>
                    ))}
                </select>
                <button className={"start-button"} onClick={() => {
                    getRoutes(startPoint, endPoint)
                    .then((value_) => {
                        const value = (value_ as ({preview: TripPreview[]; route: SavedTrip[];})[]);
                        const routes = value.map((value2) => value2.route);
                        const preview = value.map((value2, index) => ({BULL: Date.now() + index, preview: value2.preview}));
                        if (routes.length !== preview.length){
                            setError("Cannot display routes. Some data from the server is missing.");
                            return;
                        }
                        setSavedRoutes([]);
                        setData(routes);
                        setPreviews(preview);
                        setError("");
                    })
                    .catch(onRejected);
                }}>Find Route</button>
            </div>
            <div className={"error"}>{error}</div>
            {(data.length === previews.length && data.length > 0) && <>
                <h2>Suggested Routes</h2>
                <div className={"search-results-wrapper"}>
                    <div className={"search-results"} style={{gridTemplateColumns: (previews.length <= 1 ? "repeat(1, 1fr)" : undefined)}}>{previews.map((value, index) => {
                        const routeNumbers = data[index].map((value2) => `${value2.route_short_name}`)
                        .reduce((previous, current, index2) => index2 > 0 ? `${previous}, ${current}` : current, "");

                        return (
                            <div key={value.BULL} className={"route-result"}>
                                <h2>{routeNumbers}</h2>
                                <details>
                                    <summary>Show more details</summary>
                                    <div className={"route-details"}>
                                    {value.preview.map((preview, index) => (
                                        <div key={preview.startStopName + preview.endStopName}>
                                            <h3>{`Step ${index + 1}:`}</h3>
                                            <div className={"route-step"}>
                                                <h4>{preview.headsigns.length > 1 ? "Take one of the following routes:" : "Take this route:"}</h4>
                                                <div className={"route-step-choices"}>{preview.headsigns.map((value3) => (
                                                    // Each headsign should be unique
                                                    <div key={value3}>{value3}</div>
                                                ))}</div>
                                                <h4>{`From: ${preview.startStopName}`}</h4>
                                                <h4>{`To: ${preview.endStopName}`}</h4>
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                </details>
                                <div className={"route-options"}>
                                    <button disabled={savedRoutes.includes(index)} onClick={() => {
                                        let journeyName = "Saved Journey";
                                        const p = value.preview;
                                        if (p.length >= 2){
                                            journeyName = `${p[0].startStopName.replaceAll(removeDirection, "")} to ${p[p.length - 1].endStopName.replaceAll(removeDirection, "")}`;
                                        }
                                        saveJourney(journeyName, data[index])
                                        .then((_) => {
                                            setSavedRoutes(savedRoutes.concat(index));
                                        })
                                        .catch(onRejected);
                                    }}>{savedRoutes.includes(index) ? "Route Already Saved" : "Save Route"}</button>
                                    <button onClick={() => {
                                        localStorage.setItem("route", JSON.stringify(data[index]));
                                        navigate("/realtime");
                                    }}>View in Real-Time</button>
                                </div>
                            </div>
                        );
                    })}</div>
                </div>
            </>}
        </div>
    );
}
