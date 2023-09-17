'use client'
import { io } from "socket.io-client";
import { useEffect, useState} from "react";

function App() {
  // const [socketInstance, setSocketInstance] = useState("");
  // const [loading, setLoading] = useState(true);
  const [buttonStatus, setButtonStatus] = useState(false);
  const [devices, setDevices] = useState({
    "Exhausts": {},
    "Supplies": {},
    "Humidity Sensors": {},
    "Motion Sensors": {} 
  })

  // "Exhausts": {
  //   "Ventahood L1": [0, 200],
  //   device: [status, cfm, type]
  // },
  // "Supplies": {
  //   "Fresh Air": [0, 200],
  //   device: [status, cfm, type]
  // },
  // "Humidity Sensors": {
  //   "Double Bathroom": 57,
  //   device: humidity
  // },
  // "Motion Sensors": {
  //   "N-Bath Motion": 57,
  //   device: motion
  // } 



  const handleClick = () => {
    if (buttonStatus === false) {
      setButtonStatus(true);
    } else {
      setButtonStatus(false);
    }
  };

  useEffect(() => {
    // if (buttonStatus === true) {
      const socket = io("localhost:4000/", {
        transports: ["websocket"],
        cors: {
          origin: "http://localhost:3001/",
        },
      });

      // setSocketInstance(socket);

      socket.on("connect", (data) => {
        console.log("connected");
      });

      // setLoading(false);
      socket.on("node_changed", (data) => {
        const [typeNode, node, state, cfm, typeStatus] = data;
        console.log("node changed event received");
        console.log(data);
        
        setDevices((prevDevices) => {
          let updatedDevices = { ...prevDevices };

          if (data.length === 5) {
            updatedDevices[typeNode] = {
              ...updatedDevices[typeNode],
              [node]: [state, cfm, typeStatus],
            };
          } else if (typeNode === "Exhausts" || typeNode === "Supplies") {
            updatedDevices[typeNode] = {
              ...updatedDevices[typeNode],
              [node]: [state, prevDevices[typeNode][node][1], prevDevices[typeNode][node][2]],
            };
            // console.log(prevDevices[typeNode][node])
          } else {
            updatedDevices[typeNode] = {
              ...updatedDevices[typeNode],
              [node]: state,
            };
          }
          
          console.log(updatedDevices); // Log the updatedDevices object
          return updatedDevices;
        });
      });

      socket.on("disconnect", (data) => {
        console.log(data);
      });
  }, []);

  function DeviceList(props) {
    return (
      <div>
        <h1>{props.deviceType}</h1>
      </div>
    )
  }

  // const formatHumidity = (value) => {
  //   return "${value}%";
  // }

  return (
    <div className="bg-gradient-to-br from-background_green to-background_gray h-screen w-screen">
      <div className="grid grid-cols-3 gap-7 mx-8 py-4">
        <div className="col-start-2 flex justify-center">
          <h1 className="text-center text-white text-[35px] font-bold leading-snug col-start-1 inline-block">Pikes Peak IAQ</h1>
        </div>

        <div className="bg-zinc-300/50 rounded-2xl h-[48px] w-full grid grid-cols-3 place-content-center min-w-[300px]"> 
          <div className="flex col-span-2 text-white items-center justify-center pl-3">
            {/* IAQ Controller */}
            <p className="font-semibold text-lg">IAQ Controller</p>
          </div>
          
          <div className="flex opacity-100 w-24 h-9 bg-salmon rounded-2xl drop-shadow-lg items-center justify-center">
            <span className="leading-0 inline-block">ON</span>
            {/* <p className="flex opacity-100 w-24 h-9 bg-salmon rounded-2xl drop-shadow-lg place-content-center leading">ON</p> */}
            </div>
        </div>
      </div>
      
      <div className="flex flex-row flex-wrap w-full h-[90%] justify-evenly">
        <div className="flex flex-col w-[30%] h-full justify-between">

          <div className="w-full h-[48%] bg-background_white rounded-2xl drop-shadow-md px-6">
            <h2 className="text-center text-xl font-bold leading-snug pt-6 pb-6">Motion Sensors</h2>
            {Object.entries(devices["Motion Sensors"]).length === 0 ? (
              <p>The dictionary is empty.</p>
            ) : (
              <ul>
                {Object.entries(devices["Motion Sensors"]).map(([deviceName, deviceStatus]) => (
                  <li key={deviceName}>
                    <strong>{deviceName}: </strong>{deviceStatus === 2 
                    ? "Violated" 
                    : "Normal"
                    }
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="w-full h-[48%] bg-background_white rounded-2xl drop-shadow-md mt-4 px-6">
            <h2 className="text-center text-xl font-bold leading-snug pt-6 pb-6">Humidity Sensors</h2>
            {Object.entries(devices["Humidity Sensors"]).length === 0 ? (
              <p>The dictionary is empty.</p>
            ) : (
              <ul>
                {Object.entries(devices["Humidity Sensors"]).map(([deviceName, deviceStatus]) => (
                  <li key={deviceName}>
                    <strong>{deviceName}</strong>{": " + deviceStatus + "%"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>


        <div className="w-[30%] h-full bg-background_white rounded-2xl drop-shadow-md px-6">
          <h2 className="text-center text-xl font-bold leading-snug pt-6 pb-6">Exhausts</h2>
          {Object.entries(devices["Exhausts"]).length === 0 ? (
            <p>The dictionary is empty.</p>
          ) : (
            <div className="bg-stone-300 rounded-2xl">
              <table className="min-w-full text-left text-sm font-light">
                <thead class="border-b font-medium dark:border-neutral-500">
                  <tr>
                    <th scope="col" class="px-6 py-4">Fan Name</th>
                    <th scope="col" class="pl-2 pr-4 py-4">Level %</th>
                    <th scope="col" class="pl-4 pr-6 py-4">CFM</th>
                  </tr>
                </thead>
                <tbody>
                {/* {Object.entries(devices["Exhausts"]).map(([deviceName, [deviceStatus, deviceCFM, typeStatus]]) => (
                <li key={deviceName}>
                  <strong>{deviceName}</strong>{": "}{typeStatus === "bool" 
                    ? (deviceStatus === 2 
                      ? ("100. cfm: " + deviceCFM)
                      : ("0. cfm: 0"))
                      : (typeStatus === 100
                        ? (deviceStatus + ". cfm: " + Math.round(deviceCFM * deviceStatus / 100))
                        : (Math.round(deviceStatus* 100 / 255) + ". cfm: " + Math.round(deviceCFM * deviceStatus / 255))
                        )
                    }
                </li>
              ))} */}
                  {Object.entries(devices["Exhausts"]).map(([deviceName, [deviceStatus, deviceCFM, typeStatus]]) => (
                    <tr class="border-b dark:border-neutral-500 last:border-b-0">
                      <td class="whitespace-nowrap pl-6 pr-1 py-4 font-medium">{deviceName}</td>
                      {typeStatus === 'bool' ?
                        (deviceStatus === 2 ?
                          (<td class="whitespace-nowrap pl-2 pr-3 py-4 font-medium">100</td>)
                          : (<td class="whitespace-nowrap pl-2 pr-3 py-4 font-medium">0</td>))
                        : (typeStatus === 100 ?
                            <td class="whitespace-nowrap pl-2 pr-3 py-4 font-medium">{deviceStatus}</td>
                            : <td class="whitespace-nowrap pl-2 pr-3 py-4 font-medium">{Math.round(deviceStatus* 100 / 255)}</td>
                          )
                      }
                      {typeStatus === 'bool' ?
                        (deviceStatus === 2 ?
                          (<td class="whitespace-nowrap pl-4 pr-3 py-4 font-medium">{deviceCFM}</td>)
                          : (<td class="whitespace-nowrap pl-4 pr-3 py-4 font-medium">0</td>))
                        : (typeStatus === 100 ?
                            <td class="whitespace-nowrap pl-4 pr-3 py-4 font-medium">{Math.round(deviceCFM * deviceStatus / 100)}</td>
                            : <td class="whitespace-nowrap pl-4 pr-3 py-4 font-medium">{Math.round(deviceCFM * deviceStatus / 255)}</td>
                          )
                      }
                    </tr>
                    ))}
                </tbody>
              </table>

            {/* <ul>
              {Object.entries(devices["Exhausts"]).map(([deviceName, [deviceStatus, deviceCFM, typeStatus]]) => (
                <li key={deviceName}>
                  <strong>{deviceName}</strong>{": "}{typeStatus === "bool" 
                    ? (deviceStatus === 2 
                      ? ("100. cfm: " + deviceCFM)
                      : ("0. cfm: 0"))
                      : (typeStatus === 100
                        ? (deviceStatus + ". cfm: " + Math.round(deviceCFM * deviceStatus / 100))
                        : (Math.round(deviceStatus* 100 / 255) + ". cfm: " + Math.round(deviceCFM * deviceStatus / 255))
                        )
                    }
                </li>
              ))}
            </ul> */}
            </div>
          )}
        </div>
        
        <div className="w-[30%] h-[48%] bg-background_white rounded-2xl drop-shadow-md px-6">
          <h2 className="text-center text-xl font-bold leading-snug pt-6 pb-6">Supplies</h2>
          {Object.entries(devices["Supplies"]).length === 0 ? (
            <p>The dictionary is empty.</p>
          ) : (
            <ul>
              {Object.entries(devices["Supplies"]).map(([deviceName, [deviceStatus, deviceCFM, typeStatus]]) => (
                <li key={deviceName}>
                  <strong>{deviceName}</strong>{": "}{typeStatus === "bool"
                    ? (deviceStatus + ". cfm: " + (deviceCFM * deviceStatus /100))
                    : (Math.round(deviceStatus * 100 / 255) + ". cfm: " + Math.round(deviceCFM * deviceStatus / 255))
                    }
                  {/* + deviceStatus + ", max CFM: " + deviceCFM} */}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {/* {Object.entries(devices).map(([deviceType, deviceData]) => (
        <div key={deviceType}>
          <h2>{deviceType}</h2>
          {Object.entries(deviceData).length === 0 ? (
            <p>The dictionary is empty.</p>
          ) : (
            <ul>
              {Object.entries(deviceData).map(([deviceName, deviceStatus]) => (
                <li key={deviceName}>
                  <strong>{deviceName}:</strong>{" "}
                  {deviceType === "Humidity Sensors" 
                    ? deviceStatus + "%"
                    : deviceType === "Motion Sensors" 
                    ? deviceStatus === 2
                      ? "Violated"
                      : deviceStatus === 0
                      ? "Normal"
                      : "Unknown"
                    : deviceStatus}                  
                </li>
              ))}
            </ul>
          )}
        </div>
      ))} */}
    </div>
  );
}



export default App;