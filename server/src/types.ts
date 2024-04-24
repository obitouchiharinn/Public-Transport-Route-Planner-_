export type Empty = Record<string, never>;

// Types for the static timetable viewer
export interface RouteData{
    route_id: number;
    route_short_name: string;
    route_long_name: string;
}
export interface User{
    user_id: number;
    name: string;
    email: string;
    password: string;
}

export interface RouteDirectionData{
    direction_id: number;
    trip_headsign: string;
}

interface StopData{
    stop_id: number;
    stop_code: string;
    stop_name: string;
    stop_lat: number;
    stop_lon: number;
}

export type StopListData = Pick<StopData, "stop_id" | "stop_code" | "stop_name">;

export interface TripData{
    stop_code: string;
    stop_name: string;
    arrival_time: number;
    departure_time: number;
}

export interface StopTimesOptions{
    route_short_name: string;
    service_id: number;
    service_date: string;
    direction_id: number;
    startStop: string;
    endStop: string;
    afterTime: number;
}

export interface StopTimesData{
    trip_id: number;
    trip_headsign: string;
    arrival_time: number;
    departure_time: number;
    stop_name: string;
}

export type StopScheduleData = Pick<StopTimesData, "trip_headsign" | "departure_time">;

// Types for the real-time route finder
export type UserRoute = {
    route_short_name: string;
    direction_id: number;
    startStop: string;
    endStop: string;
    transferTime: number;
}[];

export type RTTIData = {
    RouteNo: string;
    RouteName: string;
    Direction: string;
    RouteMap: {
        Href: string;
    };
    Schedules: {
        Pattern: string;
        Destination: string;
        ExpectedLeaveTime: string;
        ExpectedCountdown: number;
        ScheduleStatus: string;
        CancelledTrip: boolean;
        CancelledStop: boolean;
        AddedTrip: boolean;
        AddedStop: boolean;
        LastUpdate: string;
    }[];
}[];

export interface RealTimeEstimate{
    route_short_name: string;
    expectedStart: number;
    actualStart: number;
    endTime: number;
    startStopName: string;
    endStopName: string;
    realTimeMessage: string;
}

// Types for saving trips

export interface JourneyPreview{
    journey_id: number;
    journey_name: string;
}

// Types for route finder

export interface RoutePreview{
    trip_headsign: string;
    stop_name: string;
    stop_code: string;
}
