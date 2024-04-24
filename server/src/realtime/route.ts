import express from "express";
import {databaseErrorHandler, queries} from "../database";
import {getRealTimeEstimate} from "./helpers";
import {Empty, UserRoute} from "../types";

type RealTimeEstimateBody = {
    route: UserRoute;
}

const router = express.Router();

router.post("/realtime/estimates", databaseErrorHandler<Empty, Empty, RealTimeEstimateBody>(async (req, res) => {
    const route = req.body.route;

    if (route === undefined){
        return res.status(400).send("Route is missing.");
    }
    if (!Array.isArray(route) || route.length === 0){
        return res.status(400).send("Invalid route.");
    }

    for (let x = 0; x < route.length; x++){
        if (typeof route[x].route_short_name !== "string" || typeof route[x].direction_id !== "number" ||
        typeof route[x].startStop !== "string" || typeof route[x].endStop !== "string"){
            return res.status(400).send("Invalid route.");
        }
    }

    const estimate = await getRealTimeEstimate(route);

    if (estimate.length === 0){
        return res.status(404).send("Could not get real-time estimates. There may not be enough trips left in the day.");
    }

    return res.json(estimate);
}));

export default router;
