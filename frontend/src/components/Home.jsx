import React, { useEffect, useState } from 'react';
import ConfigSensorsForm from "./ConfigSensorsForm";
import HomeDisplay from "./HomeDisplay";
import SensorDisplay from "./SensorDisplay";
import SlideToggle from './SlideToggle';
import WebSocketProvider from "./WebSocketProvider";
import { io } from "socket.io-client";
import "../home.css";

const SOCKET_SERVER_URL = "http://localhost:5000";  // Flask WebSocket server

function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [systemState, setSystemState] = useState(""); 
  const [sensors, setSensors] = useState({});
  const typeOrder = ["water", "air"]; // Define the order

  const socket = io(SOCKET_SERVER_URL, { transports: ["websocket"] });
  const [backendReady, setBackendReady] = useState(true); 
  const [readFrequency, setReadFrequency] = useState();

  useEffect(() => {
    fetchSensors();
    fetchSystemState();
    fetchBackendReady()
  }, []);

  useEffect(() => {
    let intervalId;

    const startPolling = () => {
      intervalId = setInterval(async () => {
        const ready = await fetchBackendReady();
        if (ready) {
          clearInterval(intervalId); // stop polling
          setBackendReady(true);     // trigger reload
        }
      }, 1000); // check every 1 seconds
    };

    if (backendReady == false) {  // Start polling when you know backend is resetting
      console.log("polling!")
      startPolling();
    }

    return () => clearInterval(intervalId); // cleanup on unmount
  }, [backendReady]);

  useEffect(() => {          //React to backendReady changing
    fetchBackendReady()
    if (backendReady == true) {
      fetchSensors();
      fetchSystemState();
    }
  }, [backendReady]);

  const fetchSensors = async () => {
    const response = await fetch("http://127.0.0.1:5000/sensors");
    const data = await response.json();

    // Format the sensors to extract the ID correctly
    const formattedSensors = data.sensors.map(sensor => ({
        ...sensor,
        _id: sensor._id.$oid // Extract the ID as a string
    }));
    setSensors(formattedSensors);
  };

  const fetchSystemState = async () => {
    const response = await fetch("http://127.0.0.1:5000/settings");
    const data = await response.json();
    setSystemState(data.settings[0].system_state)
  };

  const fetchBackendReady = async () => {
    const response = await fetch("http://127.0.0.1:5000/backend_ready");
    const data = await response.json();
    if (data.backend_reset === true) {
      return false
    }
    return true
  };

  const fetchSettings = async () => {
    const response = await fetch("http://127.0.0.1:5000/settings");
    const data = await response.json();
    setReadFrequency(data.settings[0].read_frequency);
    while (readFrequency === undefined) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
    }
  };

  const handleFormSubmit = async () => {
    // Fetch or trigger a function to refresh data after form submission
    // You can re-fetch the data here or perform any other necessary action
    fetchSystemState();
  };

  // Callback function to change the backendReady state
  const handleBackendReset = () => {
    console.log("setting backend!!!!")
    setBackendReady(false); // This sets backendReady to false when called
  };
  
  const changeTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <WebSocketProvider>
      {systemState === "waiting" ? (
          <ConfigSensorsForm onFormSubmit={handleFormSubmit} />
        ) : (
          backendReady ? (      
          <div className="container">
          <nav className="tabs">
            <div
              className={`tab ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => changeTab('home')} >
              Home
            </div>
            <div
              className={`tab ${activeTab === 'tank1' ? 'active' : ''}`}
              onClick={() => changeTab('tank1')}>
              Tank 1
            </div>
            <div
              className={`tab ${activeTab === 'tank2' ? 'active' : ''}`}
              onClick={() => changeTab('tank2')}>
              Tank 2
            </div>
          </nav>

          <section>
            {activeTab === 'home' && (
              <div className="tab-content home">
                <h2>Home</h2>
                <HomeDisplay readFrequency1={readFrequency}/>
              </div>
            )}
            {activeTab === 'tank1' && (
              <div className="tab-content tank1">
                <h2>Tank 1</h2>
                {sensors
                  .filter(sensor => sensor.tank === 1) // Filter by tank
                  .sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)) // Sort by predefined order
                  .map((sensor, index) => (
                    <SensorDisplay 
                      key={`${sensor.name}-${sensor.measure}`} // ← unique key here
                      inputSensor={sensor}
                      onBackendReset={handleBackendReset} />
                  ))}
              </div>
            )}
            {activeTab === 'tank2' && (
              <div className="tab-content tank2">
                <h2>Tank 2</h2>
                {sensors
                  .filter(sensor => sensor.tank === 2) // Filter by tank
                  .sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)) // Sort by predefined order
                  .map((sensor, index) => (
                    <SensorDisplay inputSensor={sensor} onBackendReset={handleBackendReset} />
                  ))}
              </div>
            )}
          </section>
          </div>
        ) : (
          // Backend is not ready, show the waiting message
          <div>Waiting for backend...</div>
        )
      )}
    </WebSocketProvider>
  );
}

export default Home;
