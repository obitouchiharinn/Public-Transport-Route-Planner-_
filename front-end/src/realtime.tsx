import {useState, useEffect} from "react";
import RouteSelector, {SavedTrip} from "./RouteSelector";
import Header from "./Header";
import NavBar from "./Nav";
import "./realtime.css";

interface RealTimeEstimate{
    route_short_name: string;
    expectedStart: number;
    actualStart: number;
    endTime: number;
    startStopName: string;
    endStopName: string;
    realTimeMessage: string;
}

const SERVER = import.meta.env["VITE_SERVER"];

const warnings = new Set(["990", "992", "997", "999"]);

export async function updateRealTime(route: SavedTrip[]){
    if (route.length === 0){
        throw new Error("Select a route.");
    }
    const body = {route: route};
    const res = await fetch(`${SERVER}/realtime/estimates`, {
        method: "POST",
        headers: {"Content-Type": "application/json", "Authorization": `Bearer ${"NO ONE BEATS THE B U  L    L"}`},
        body: JSON.stringify(body)
    });
    if (!res.ok){
        throw new Error("Could not fetch real-time estimates.");
    }
    return await res.json() as RealTimeEstimate[];
}

export default function RealTimeInfo(){
    const [times, setTimes] = useState<SavedTrip[]>([]);
    const [data, setData] = useState<RealTimeEstimate[]>([]);
    const [error, setError] = useState<string>("\u00a0");

    const convertTime = (time: number) => {
        return `${Math.floor(time / 3600)}:${`${Math.floor((time % 3600) / 60)}`.padStart(2, "0")}:${`${time % 60}`.padStart(2, "0")}`;
    };

    const onRejected = (reason: Error) => {
        setError(reason.message);
        console.log(reason);
    };

    const submit = (saved: SavedTrip[], clear: boolean = false) => {
        console.log(saved);
        const existingRoutes: [string, number][] = times.map((value) => [value.route_short_name, value.direction_id]);
        saved = saved.filter((value) => existingRoutes.find((value2) => value.route_short_name === value2[0] && value.direction_id === value2[1]) === undefined);

        if (clear === false){
            setTimes(times.concat(saved));
        } else{
            setTimes(saved);
        }
    };

    useEffect(() => {
        const routeStorage = localStorage.getItem("route");
        if (routeStorage === null){
            return;
        }

        let localRoute: SavedTrip[];
        try{
            localRoute = JSON.parse(routeStorage);
        } catch (error){
            return;
        }
        setTimes(localRoute);
    }, []);

    return (
        <div className={"main-wrapper"}>
            <NavBar page={"realtime"}/>
            <Header/>
            
            <RouteSelector submitRoutes={submit} setError={() => {}} date={"2024-04-09T00:00"}/>
            <h2>Selected Trip</h2>
            <div className={"realtime-sequence"}>
                {times.map((value, index) => (
                    // {index > 0 && <div key={`${value.route_short_name}BULL${value.direction_id}`} className={"realtime-sequence-divider"}>&gt;</div>}
                    <div className={"realtime-sequence-item"} key={`${value.route_short_name}${value.direction_id}`}>
                        <div className={"realtime-sequence-text"}>{value.route_short_name}</div>
                        <div className={"realtime-sequence-remove"} onClick={() => {
                            setTimes(times.filter((__, index2) => index2 !== index));
                            localStorage.removeItem("route");
                        }}>&#x2716;</div>
                    </div>
                ))}
            </div>
            <button onClick={() => {
                updateRealTime(times)
                .then((value) => {
                    console.log(value);
                    setData(value);
                    setError("");
                })
                .catch(onRejected);
            }}>Update Real-Time Info</button>
            <div className={"error"}>{error}</div>
            <div className={"realtime-result-wrapper"}>
                {data.map((value, index) => {
                    let color = "#00ff00";
                    if (value.realTimeMessage !== ""){
                        color = "#ff0000";
                    } else if (warnings.has(value.route_short_name)){
                        color = "#ffff00";
                    }

                    return (
                        <div key={value.expectedStart + value.actualStart * 86400 + value.endTime * 86400 * 86400} className={"realtime-result"}>
                            <div className={"realtime-result-text"}>{`${index > 0 ? "Transfer" : "Start"}`}</div>{/* (${Math.floor((value.actualStart - value.expectedStart) / 60)} min)*/}
                            <div className={"realtime-result-node"}>{value.startStopName}</div>
                            <div className={"realtime-result-text"}>{convertTime(value.actualStart)}</div>
                            <div className={"realtime-result-container"}>
                                <div className={"realtime-result-bar"} style={{
                                    backgroundColor: color,
                                    height: `${(value.endTime - value.actualStart) / 80}em`
                                }}></div>
                                <div className={"realtime-result-textbox realtime-result-text"}>{value.route_short_name}</div>
                            </div>
                            <div className={"realtime-result-text"}>{convertTime(value.endTime)}</div>
                            <div className={"realtime-result-node"}>{value.endStopName}</div>
                            {index === times.length - 1 && <div className={"realtime-result-text"}>Finish</div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
