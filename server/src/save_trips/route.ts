import express from "express";
import {loginErrorHandler, queries} from "../database";
import {Empty, UserRoute} from "../types";

type AddJourneyReqBody = {
    name: string;
    routes: UserRoute;
};

const router = express.Router();

router.get("/list", loginErrorHandler<Empty, Empty, Empty, {route: string}>(async (req, res, email) => {
    const journeys = (await queries.getJourneys(email)).map((value) => ({
        journey_id: parseInt(`${value.journey_id}`),
        journey_name: value.journey_name
    }));
    return res.json(journeys);
}));

router.post("/add", loginErrorHandler<Empty, Empty, AddJourneyReqBody>(async (req, res, email) => {
    if (typeof req.body.name !== "string"){
        return res.status(400).send("Trip must have a name.");
    }
    if (!Array.isArray(req.body.routes) || req.body.routes.length === 0){
        return res.status(400).send("No routes specified.");
    }

    const journey = req.body.routes.filter((value) => (
        typeof value.route_short_name === "string" && typeof value.direction_id === "number" &&
        typeof value.startStop === "string" && typeof value.endStop === "string"
    ));
    
    const journey_id = await queries.addJourney(email, req.body.name);
    
    try{
        for (let x = 0; x < journey.length; x++){
            await queries.addJourneyRoute(journey_id, x, journey[x]);
        }
    } catch (error){
        await queries.deleteJourney(journey_id, email);
    }

    return res.json(journey_id);
}));

router.get("/get/:journey", loginErrorHandler<{journey: string}>(async (req, res, email) => {
    const journey_id = parseInt(req.params.journey);
    if (isNaN(journey_id)){
        return res.status(400).send("Invalid journey provided.");
    }
    const journey = await queries.getJourneyRoutes(journey_id, email);

    if (journey.length === 0){
        return res.status(404).send("Journey not found.");
    }
    
    const renamed = journey.map((value) => ({
        route_short_name: value.route_short_name,
        direction_id: value.direction_id,
        startStop: value.startstop,
        endStop: value.endstop,
        transferTime: value.transfertime
    }));

    return res.json(renamed);
}));

router.delete("/delete/:journey", loginErrorHandler<{journey: string}>(async (req, res, email) => {
    const journey_id = parseInt(req.params.journey);
    if (isNaN(journey_id)){
        return res.status(400).send("Invalid journey provided.");
    }
    const journey = await queries.deleteJourney(journey_id, email);

    return res.json({deleted: journey});
}));

export default router;
