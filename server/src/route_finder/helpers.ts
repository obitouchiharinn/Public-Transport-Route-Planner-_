import {UserRoute} from "../types";

class PriorityQueue<T>{
    heap: [number, T][];

    constructor(){
        this.heap = [];
    }

    isEmpty(): boolean{
        return (this.heap.length === 0);
    }

    swap(i: number, j: number): void{
        let temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }

    insert(item: T, priority: number): void{
        if (priority < 0){
            // 0 is the highest priority
            return;
        }

        this.heap.push([priority, item]);
        let i = this.heap.length - 1;

        let p = Math.floor((i - 1) / 2);
        while (i > 0 && this.heap[i][0] < this.heap[p][0]){
            this.swap(p, i);
            i = p;
            p = Math.floor((i - 1) / 2);
        }
    }

    extractMin(): T | undefined{
        if (this.isEmpty() === true){
            return undefined;
        }

        const item = this.heap[0][1];
        const size = this.heap.length - 1;

        this.heap[0] = [this.heap[size][0], this.heap[size][1]];
        this.heap.pop();

        if (size === 0){
            return item;
        }

        let i = 0;
        while ((i+i+1 < size && this.heap[i+i+1][0] < this.heap[i][0]) || (i+i+2 < size && this.heap[i+i+2][0] < this.heap[i][0])){
            let c = i+i+1;
            if (i+i+2 < size && this.heap[i+i+2][0] < this.heap[i+i+1][0]){
                c = i+i+2;
            }

            this.swap(c, i);
            i = c;
        }

        return item;
    }
}

type Action = {
    rt: string;
    dir: number;
    ss: string;
    es: string;
};
interface Edge{
    node: number;
    cost: number;
    action: Action;
}
interface SearchResult{
    totalCost: number;
    actions: Action[];
    addPenalty?: [number, Action];
}
interface TransferPoint{
    displayName: string;
    edges: Edge[];
}
interface TransferPointPreview{
    node: number;
    displayName: string;
}
type Penalty = Map<number, [Action, number]>;

class Graph{
    private graph: Map<number, TransferPoint>;
    private transferCost: number;
    private routePenalty: number;

    constructor(data: [number, TransferPoint][]){
        this.graph = new Map(data);

        // Additional cost when transferring buses
        // This helps avoid trips from being suggested where many unnecessary transfers are made while staying on the same bus would be better
        this.transferCost = 360;
        // Penalty added to the first route in a sequence to try and get the search to suggest a different route
        this.routePenalty = 600;
    }

    getTransferPoints(): TransferPointPreview[]{
        return Array.from(this.graph).map((value) => ({node: value[0], displayName: value[1].displayName}));
    }

    findRoute(start: number, dest: number, penalty: Penalty): UserRoute | undefined{
        const result = this.search(start, dest, penalty);
        if (result.totalCost < 0 || result.actions.length === 0){
            return undefined;
        }

        if (result.addPenalty !== undefined){
            penalty.set(result.addPenalty[0], [result.addPenalty[1], this.routePenalty]);
        }
        // The search result may contain multiple consecutive actions with the same bus route
        // Combine those actions into one object
        const route: UserRoute = [];
        const A = result.actions;

        // lastRoute.ss stores the first stop after the last transfer
        // lastRoute.es stores the most recent end stop
        let lastRoute: Action = {rt: A[0].rt, dir: A[0].dir, ss: A[0].ss, es: A[0].es};

        if (A.length === 1){
            return [{
                route_short_name: lastRoute.rt,
                direction_id: lastRoute.dir,
                startStop: lastRoute.ss,
                endStop: lastRoute.es,
                transferTime: 0
            }];
        }

        for (let x = 1; x < A.length; x++){
            const stayOnBus = A[x].rt === lastRoute.rt && A[x].dir === lastRoute.dir && A[x].ss === lastRoute.es;
            if (stayOnBus && x < A.length - 1){
                // Stay on the same bus: update end stop to be the current action's end stop
                lastRoute.es = A[x].es;
            } else{
                if (!stayOnBus){
                    // Transfer buses: update lastRoute to be the first action from the new route
                    route.push({
                        route_short_name: lastRoute.rt,
                        direction_id: lastRoute.dir,
                        startStop: lastRoute.ss,
                        endStop: lastRoute.es,
                        transferTime: route.length === 0 ? 0 : 120// Change this later???
                    });
                    lastRoute.rt = A[x].rt; lastRoute.dir = A[x].dir;
                    lastRoute.ss = A[x].ss; lastRoute.es = A[x].es;
                }
                if (x === A.length - 1){
                    // Always add to the route when reaching the last action
                    route.push({
                        route_short_name: lastRoute.rt,
                        direction_id: lastRoute.dir,
                        startStop: lastRoute.ss,
                        endStop: A[x].es,
                        transferTime: 120
                    });
                }
            }
        }
        // const X = (result.actions.map((value) => ({
        //     route_short_name: value.rt,
        //     direction_id: value.dir,
        //     startStop: value.ss,
        //     endStop: value.es,
        //     transferTime: 120
        // }))); console.log(X);
        return route;
    }

    private getPenalty(node: number, action: Action, penalty: Penalty): number{
        const a = penalty.get(node);
        if (a !== undefined){
            if (action.rt === a[0].rt && action.dir === a[0].dir &&
                action.ss === a[0].ss && action.es === a[0].es
            ){
                return a[1];
            }
        }
        return 0;
    }

    private getValidMoves(start: number, currentBus?: string, penalty?: Penalty): Edge[]{
        const node = this.graph.get(start);
        if (node === undefined){
            return [];
        }
        const actions: Edge[] = [];
        for (let x = 0; x < node.edges.length; x++){
            let cost = node.edges[x].cost;
            const action = node.edges[x].action;

            // If the successor involves transferring to another bus, add the penalty to the edge cost
            if (currentBus !== undefined && currentBus !== action.rt){
                cost += this.transferCost;
            }
            if (penalty !== undefined){
                cost += this.getPenalty(node.edges[x].node, action, penalty);
            }
            actions.push({node: node.edges[x].node, action: action, cost: cost});
        }
        return actions;
    }

    private getEdgeFromAction(start: number, action: Action): Edge | undefined{
        const node = this.graph.get(start);
        if (node === undefined){
            return undefined;
        }
        for (let x = 0; x < node.edges.length; x++){
            if (node.edges[x].action === action){
                return node.edges[x];
            }
        }
        return undefined;
    }

    private moveDistance(start: number, dest: number): number{
        return 0;
    }

    search(start: number, dest: number, penalty: Penalty): SearchResult{
        if (start === dest){
            return {totalCost: 0, actions: []};
        }

        const pq = new PriorityQueue<Edge>();
        const actions: Action[] = [];
        const parents = new Map<number, [number, Action]>();
        const costs = new Map<number, number>();
        const visited = new Set<number>();
    
        // Start with all the moves from the start position
        const startingMoves = this.getValidMoves(start, undefined, penalty);
        for (let x = 0; x < startingMoves.length; x++){
            const p = startingMoves[x];
            parents.set(p.node, [start, p.action]);
            costs.set(p.node, p.cost);
            pq.insert(p, p.cost + this.moveDistance(p.node, dest));
            visited.add(p.node);
        }
        visited.add(start);
    
        let done = false;
        while (done === false){
            let currentState = pq.extractMin();
            if (typeof currentState === "undefined"){
                // No valid path exists. This takes care of pq.isEmpty()
                return {totalCost: -1, actions: []};
            }

            const currentNode = currentState.node;
    
            // Get the position with lowest cost
            const currentCost = costs.get(currentNode);
            if (currentCost === undefined){
                return {totalCost: -1, actions: []};
            }
    
            if (currentNode === dest){
                // Path found
                done = true;
            } else{
                const parent = parents.get(currentNode);
                const successors = this.getValidMoves(currentNode, parent !== undefined ? parent[1].rt : undefined);

                for (let x = 0; x < successors.length; x++){
                    const p = successors[x];
                    // Only add positions to the priority queue if they have not been visited already
                    let nextCost = false;
                    if (costs.has(p.node)){
                        nextCost = p.cost + currentCost < costs.get(p.node)!;
                    }
                    if ((visited.has(p.node) === false || nextCost)){
                        parents.set(p.node, [currentNode, p.action]);
                        costs.set(p.node, p.cost + currentCost);
                        pq.insert(p, p.cost + currentCost + this.moveDistance(p.node, dest));
                        visited.add(p.node);
                    }
                }
                visited.add(currentNode);
            }
        }
    
        const noPenalty: [number, Action][] = [];
        let currentNode = dest;
        let totalCost = 0;
        let pathExists = true;
        while (currentNode !== start && pathExists){
            const nextNode = parents.get(currentNode);
            if (nextNode !== undefined){
                // This goes through the path backwards so to get the correct cost, get cost from next node to current node.
                const nextEdge = this.getEdgeFromAction(nextNode[0], nextNode[1]);
                if (nextEdge === undefined){
                    pathExists = false;
                } else{
                    totalCost += nextEdge.cost;
                    actions.push(nextNode[1]);

                    // Keep track of all actions that currently do not have a penalty. Return the first action that has no penalty
                    // (since this iterates backwards, it will actually be the last element inserted into noPenalty)
                    // The node provided to getPenalty is the destination of the provided action. Since this is iterating backwards, the destination
                    // is actually "currentNode", not "nextNode".
                    const currentPenalty = this.getPenalty(currentNode, nextNode[1], penalty);
                    if (currentPenalty === 0){
                        noPenalty.push([currentNode, nextNode[1]]);
                    }
                }

                currentNode = nextNode[0];
            } else{
                pathExists = false;
            }
        }
    
        if (pathExists === false){
            return {totalCost: -1, actions: []};
        }

        const result: SearchResult = {
            totalCost: totalCost,
            actions: actions.reverse()
        };
        if (noPenalty.length > 0){
            result.addPenalty = noPenalty[noPenalty.length - 1];
        }

        return result;
    }
}

const graph: [number, TransferPoint][] = [
    [731, {displayName: "Fraser St @ Kingsway", edges: [
        {node: 741, cost: 247, action: {rt: "008", dir: 0, ss: "50778", es: "50782"}},
        {node: 1439, cost: 360, action: {rt: "019", dir: 0, ss: "51138", es: "51142"}},
    ]}],
    [741, {displayName: "Fraser St @ King Edward Ave", edges: [
        {node: 731, cost: 207, action: {rt: "008", dir: 1, ss: "50840", es: "50843"}},
        {node: 749, cost: 276, action: {rt: "008", dir: 0, ss: "50782", es: "50786"}},
        {node: 1441, cost: 281, action: {rt: "025", dir: 0, ss: "51521", es: "51525"}},
    ]}],
    [749, {displayName: "Fraser St @ 33rd Ave", edges: [
        {node: 741, cost: 253, action: {rt: "008", dir: 1, ss: "50835", es: "50840"}},
        {node: 757, cost: 256, action: {rt: "008", dir: 0, ss: "50786", es: "50790"}},
        {node: 1449, cost: 291, action: {rt: "033", dir: 0, ss: "61104", es: "61106"}},
    ]}],
    [757, {displayName: "Fraser St @ 41st Ave", edges: [
        {node: 749, cost: 250, action: {rt: "008", dir: 1, ss: "60637", es: "50835"}},
        {node: 765, cost: 292, action: {rt: "008", dir: 0, ss: "50790", es: "50794"}},
        {node: 1457, cost: 188, action: {rt: "R4", dir: 0, ss: "61503", es: "50649"}},
    ]}],
    [765, {displayName: "Fraser St @ 49th Ave", edges: [
        {node: 757, cost: 228, action: {rt: "008", dir: 1, ss: "50827", es: "60637"}},
        {node: 782, cost: 840, action: {rt: "008", dir: 0, ss: "50790", es: "50802"}},
        {node: 1465, cost: 240, action: {rt: "049", dir: 0, ss: "51975", es: "51979"}},
    ]}],
    [782, {displayName: "Fraser St @ Marine Dr", edges: [
        {node: 765, cost: 456, action: {rt: "008", dir: 1, ss: "50820", es: "50827"}},
        {node: 1481, cost: 279, action: {rt: "100", dir: 0, ss: "52136", es: "52140"}},
    ]}],
    [1439, {displayName: "Knight St @ Kingsway", edges: [
        {node: 731, cost: 320, action: {rt: "019", dir: 1, ss: "51193", es: "51197"}},
        {node: 1441, cost: 48, action: {rt: "022", dir: 0, ss: "51296", es: "51297"}},
        {node: 1541, cost: 64, action: {rt: "019", dir: 0, ss: "51142", es: "51143"}},
    ]}],
    [1441, {displayName: "Knight St @ King Edward Ave", edges: [
        {node: 741, cost: 225, action: {rt: "025", dir: 1, ss: "51564", es: "51568"}},
        {node: 1439, cost: 23, action: {rt: "022", dir: 1, ss: "51343", es: "51344"}},
        {node: 1449, cost: 260, action: {rt: "022", dir: 0, ss: "51297", es: "51301"}},
        {node: 1541, cost: 104, action: {rt: "025", dir: 0, ss: "51525", es: "51144"}},
    ]}],
    [1449, {displayName: "Knight St @ 33rd Ave", edges: [
        {node: 749, cost: 213, action: {rt: "033", dir: 1, ss: "61114", es: "61116"}},
        {node: 1441, cost: 229, action: {rt: "022", dir: 1, ss: "51339", es: "51343"}},
        {node: 1457, cost: 247, action: {rt: "022", dir: 0, ss: "51301", es: "51305"}},
        {node: 2049, cost: 235, action: {rt: "033", dir: 0, ss: "61106", es: "61108"}},
    ]}],
    [1457, {displayName: "Knight St @ 41st Ave", edges: [
        {node: 757, cost: 148, action: {rt: "R4", dir: 1, ss: "50706", es: "50711"}},
        {node: 1449, cost: 207, action: {rt: "022", dir: 1, ss: "51336", es: "51339"}},
        {node: 1465, cost: 242, action: {rt: "022", dir: 0, ss: "51305", es: "51309"}},
        {node: 2057, cost: 147, action: {rt: "R4", dir: 0, ss: "50649", es: "51121"}},
    ]}],
    [1465, {displayName: "Knight St @ 49th Ave", edges: [
        {node: 765, cost: 209, action: {rt: "049", dir: 1, ss: "52022", es: "52027"}},
        {node: 1457, cost: 205, action: {rt: "022", dir: 1, ss: "51332", es: "51336"}},
        {node: 1481, cost: 478, action: {rt: "022", dir: 0, ss: "51309", es: "51318"}},
        {node: 2065, cost: 202, action: {rt: "049", dir: 0, ss: "51979", es: "51983"}},
    ]}],
    [1481, {displayName: "Knight St @ Marine Dr", edges: [
        {node: 782, cost: 239, action: {rt: "100", dir: 1, ss: "52205", es: "52209"}},
        {node: 1465, cost: 395, action: {rt: "022", dir: 1, ss: "51318", es: "51332"}},
        {node: 2083, cost: 121, action: {rt: "100", dir: 0, ss: "52140", es: "51832"}},
    ]}],
    [1541, {displayName: "Kingsway @ King Edward Ave", edges: [
        {node: 1439, cost: 65, action: {rt: "019", dir: 1, ss: "60540", es: "51193"}},
        {node: 1441, cost: 56, action: {rt: "025", dir: 1, ss: "51563", es: "51564"}},
        {node: 2044, cost: 226, action: {rt: "019", dir: 0, ss: "51143", es: "50659"}},
        {node: 2044, cost: 154, action: {rt: "025", dir: 0, ss: "51144", es: "50659"}}
    ]}],
    [2044, {displayName: "Victoria Dr @ Kingsway", edges: [
        {node: 1541, cost: 187, action: {rt: "019", dir: 1, ss: "51189", es: "60540"}},
        {node: 2049, cost: 200, action: {rt: "020", dir: 1, ss: "50697", es: "50699"}},
        {node: 2549, cost: 306, action: {rt: "019", dir: 0, ss: "50659", es: "50661"}},
    ]}],
    [2049, {displayName: "Victoria Dr @ 33rd Ave", edges: [
        {node: 1449, cost: 183, action: {rt: "033", dir: 1, ss: "61112", es: "61114"}},
        {node: 2044, cost: 123, action: {rt: "020", dir: 0, ss: "50656", es: "50658"}},
        {node: 2057, cost: 294, action: {rt: "020", dir: 1, ss: "50699", es: "51244"}},
        {node: 2549, cost: 241, action: {rt: "033", dir: 0, ss: "61108", es: "50662"}},
    ]}],
    [2057, {displayName: "Victoria Dr @ 41st Ave", edges: [
        {node: 1457, cost: 126, action: {rt: "R4", dir: 1, ss: "50702", es: "50706"}},
        {node: 2049, cost: 195, action: {rt: "020", dir: 0, ss: "50652", es: "50656"}},
        {node: 2065, cost: 260, action: {rt: "020", dir: 1, ss: "51244", es: "51248"}},
        {node: 2557, cost: 132, action: {rt: "R4", dir: 0, ss: "51121", es: "51124"}},
    ]}],
    [2065, {displayName: "Victoria Dr @ 49th Ave", edges: [
        {node: 1465, cost: 198, action: {rt: "049", dir: 1, ss: "52018", es: "52022"}},
        {node: 2057, cost: 296, action: {rt: "020", dir: 0, ss: "51209", es: "50652"}},
        {node: 2083, cost: 520, action: {rt: "020", dir: 1, ss: "51248", es: "61554"}},
        {node: 2665, cost: 195, action: {rt: "049", dir: 0, ss: "51983", es: "51987"}},
    ]}],
    [2083, {displayName: "Victoria Dr @ Marine Dr", edges: [
        {node: 1481, cost: 130, action: {rt: "100", dir: 1, ss: "52203", es: "52205"}},
        {node: 2065, cost: 484, action: {rt: "020", dir: 0, ss: "51202", es: "51209"}},
    ]}],
    [2377, {displayName: "Muirfield Dr @ Scarboro Ave", edges: [
        {node: 2665, cost: 390, action: {rt: "029", dir: 0, ss: "51804", es: "51810"}},
    ]}],
    [2549, {displayName: "Slocan St @ Kingsway", edges: [
        {node: 2044, cost: 292, action: {rt: "019", dir: 1, ss: "50694", es: "51189"}},
        {node: 2049, cost: 176, action: {rt: "033", dir: 1, ss: "61110", es: "61112"}},
        {node: 2557, cost: 236, action: {rt: "029", dir: 1, ss: "61110", es: "51819"}},
    ]}],
    [2557, {displayName: "Clarendon St @ 41st Ave", edges: [
        {node: 2057, cost: 111, action: {rt: "R4", dir: 1, ss: "51067", es: "50702"}},
        {node: 2549, cost: 246, action: {rt: "029", dir: 0, ss: "51814", es: "50662"}},
        {node: 2665, cost: 221, action: {rt: "029", dir: 1, ss: "51819", es: "51824"}},
    ]}],
    [2665, {displayName: "Elliott St @ 49th Ave", edges: [
        {node: 2065, cost: 160, action: {rt: "049", dir: 1, ss: "52015", es: "52018"}},
        {node: 2377, cost: 482, action: {rt: "029", dir: 1, ss: "51824", es: "51804"}},
        {node: 2557, cost: 250, action: {rt: "029", dir: 0, ss: "51810", es: "51814"}},
    ]}]
];

export const G = new Graph(graph);

export function hasRoute(routesList: UserRoute[], checkRoute: UserRoute): boolean{
    const stops = checkRoute.map((value) => value.startStop);

    for (let x = 0; x < routesList.length; x++){
        const thisRoute = routesList[x].map((value) => value.startStop);
        if (stops.length === thisRoute.length){
            let equal = true;
            for (let i = 0; i < stops.length; i++){
                if (stops[i] !== thisRoute[i]){
                    equal = false;
                }
            }

            if (equal === true){
                return true;
            }
        }
    }

    return false;
}
