import express, {NextFunction, Request, Response} from "express";
import cors from "cors";
import "dotenv/config";

import {initializeDatabase} from "./database";
import staticTimetables from "./static_timetables/route";
import realTime from "./realtime/route";
import routeFinder from "./route_finder/route";
import saveTrips from "./save_trips/route";
import users from "./users/route";
const app = express();
app.disable("x-powered-by");

const host = process.env["HOST"] || "0.0.0.0";
const port = parseInt(process.env["PORT"] || "8080");


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(staticTimetables);
app.use(realTime);
app.use("/routefinder", routeFinder);
app.use("/saved", saveTrips);
app.use(users);
app.get("/", (req, res) => {
    // This is just for testing
    res.send("CANNOT\u2800GET\u3164/\u00a0\u200b");
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(error.stack);
    next();
});

initializeDatabase().then(() => {
    app.listen(port);
}).catch((error) => {
    console.log(error);
    app.listen(port);
});
