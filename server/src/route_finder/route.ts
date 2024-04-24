import express from "express";
import {databaseErrorHandler, queries} from "../database";
import {G, hasRoute} from "./helpers";
import {Empty, UserRoute} from "../types";

type RouteSearchQuery2 = {
    start: string;
    end: string;
};
interface RouteFinderPreview{
    headsigns: string[];
    startStopName: string;
    endStopName: string;
}

const router = express.Router();

router.get("/points", (req, res) => {
    return res.json(G.getTransferPoints());
});

router.get("/routes", databaseErrorHandler<Empty, string | UserRoute[], Empty, RouteSearchQuery2>(async (req, res) => {
    const startNode = parseInt(req.query.start);
    const endNode = parseInt(req.query.end);
    if (isNaN(startNode) || isNaN(endNode)){
        return res.status(400).send("Invalid start and end transfer points.");
    }

    const penalty = new Map();

    const routes: UserRoute[] = [];
    // For each route found, also include a preview so the user can have instructions on which buses to take and which stops to get on/off at
    const result: {route: UserRoute; preview: RouteFinderPreview[];}[] = [];

    // Returning multiple routes at once is temporarily disabled
    const maxRoutes = 5;
    let duplicate = false;
    let x = 0;
    while (x < maxRoutes && !duplicate){
        const route = G.findRoute(startNode, endNode, penalty);
        if (route !== undefined){
            if (hasRoute(routes, route)){
                // Stop adding more routes if the current route is already in the result
                duplicate = true;
            } else{
                routes.push(route);

                const previews: RouteFinderPreview[] = [];
                for (let i = 0; i < route.length; i++){
                    const preview = await queries.getRoutePreview(route[i]);

                    let startStopName = route[i].startStop;
                    let endStopName = route[i].endStop;
                    const headsigns = new Set<string>();

                    for (let b = 0; b < preview.length; b++){
                        if (preview[b].stop_code === startStopName){
                            startStopName = preview[b].stop_name;
                        } else if (preview[b].stop_code === endStopName){
                            endStopName = preview[b].stop_name;
                        }
                        headsigns.add(preview[b].trip_headsign.trim());
                    }

                    previews.push({
                        headsigns: Array.from(headsigns),
                        startStopName: startStopName,
                        endStopName: endStopName
                    });
                }
                result.push({route: route, preview: previews});
            }
        }
        x++;
    }

    return res.json(result);
}));

export default router;
