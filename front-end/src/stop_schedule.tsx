import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Schedule {
  Pattern: string;
  Destination: string;
  ExpectedLeaveTime: string;
  ExpectedCountdown: number;
  ScheduleStatus: string;
}

interface Bus {
  RouteNo: string;
  RouteName: string;
  Direction: string;
  RouteMap: {
    Href: string;
  };
  Schedules: Schedule[];
}

interface Stop {
  StopNo: number;
  Name: string;
  BayNo: string;
  City: string;
  OnStreet: string;
  AtStreet: string;
  Latitude: number;
  Longitude: number;
  WheelchairAccess: number;
  Distance: number;
  Routes: string;
}

const StopSchedule = () => {
  const { stopCode } = useParams<{ stopCode: string }>();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [stopData, setStopData] = useState<Stop | null>(null);

  const apiKey = import.meta.env["VITE_API_KEY"];

  //Use translink API to fetch live data about each stop
  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        const response = await fetch(
          `https://api.translink.ca/rttiapi/v1/stops/${stopCode}/estimates?apikey=${apiKey}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setBuses(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    //For each stop, fetch aditional static information about the stop
    const fetchStopData = async () => {
      try {
        const response = await fetch(
          `https://api.translink.ca/rttiapi/v1/stops/${stopCode}?apikey=${apiKey}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setStopData(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchStopData();
    fetchRouteData();
  }, []);

  //Convert time to readable format, and remove the date
  const extractTime = (expectedLeaveTime: string) => {
    return expectedLeaveTime.split(" ")[0];
  };

  return (
    <div className="buses-container">
      <h1>{stopData?.Name}</h1>
      <h3>City: {stopData?.City}</h3>
      <h3>
        Address: {stopData?.OnStreet} & {stopData?.AtStreet}
      </h3>
      <h3>
        Wheelchair Access:{" "}
        {stopData?.WheelchairAccess === 1 ? (
          <span style={{ color: "green" }}>&#10003;</span>
        ) : (
          <span style={{ color: "red" }}>&#10007;</span>
        )}
      </h3>
      {buses.map((bus, index) => (
        <div className="bus-card" key={index}>
          <h2>Route No: {bus.RouteNo}</h2>
          <p>Route Name: {bus.RouteName}</p>
          <p>Direction: {bus.Direction}</p>
          <ul className="schedule-list">
            {bus.Schedules.map((schedule, scheduleIndex) => (
              <li className="schedule-item" key={scheduleIndex}>
                {scheduleIndex === 0 ? (
                  <div>
                    <h3>Destination: {schedule.Destination}</h3>
                    <h4>
                      Next bus at {extractTime(schedule.ExpectedLeaveTime)}{" "}
                      arriving in {schedule.ExpectedCountdown} minutes.
                    </h4>
                  </div>
                ) : (
                  <p>
                    Bus at {extractTime(schedule.ExpectedLeaveTime)} arriving in{" "}
                    {schedule.ExpectedCountdown} minutes.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default StopSchedule;
