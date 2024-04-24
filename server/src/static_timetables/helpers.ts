const dateMatch = new RegExp(/\d{4}-(?:(?:1[0-2])|(?:0[1-9]))-(?:(?:0[1-9])|(?:[1-2]\d)|(?:3[0-1]))/);

export function readDate(dateString: string, defaultDate: Date, offset: number = 0): [string, number]{
    let serviceDate = "2024-01-01";
    let serviceNumber = 1;

    let weekday = 1;

    if (typeof dateString === "string" && dateString.match(dateMatch) && dateString.length === 10){
        serviceDate = dateString;
        const t = new Date(serviceDate);
        t.setMinutes(t.getMinutes() + t.getTimezoneOffset());
        t.setHours(t.getHours() + offset);
        weekday = t.getDay();
        if (offset !== 0){
            // Use offset to add a number of hours to the time before returning the string
            serviceDate = t.toISOString().split("T")[0];
        }
    } else{
        const t = new Date(defaultDate);
        weekday = t.getDay();// This converts UTC to local time so get the weekday before changing the minutes
        t.setMinutes(t.getMinutes() - t.getTimezoneOffset());// This gives UTC time so subtract time zone offset from it to get local time
        t.setHours(t.getHours() + offset);
        serviceDate = t.toISOString().split("T")[0];
    }

    if (weekday === 0){
        serviceNumber = 3;
    } else if (weekday === 6){
        serviceNumber = 2;
    }
    
    return [serviceDate, serviceNumber];
}
