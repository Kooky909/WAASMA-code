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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [systemState, setSystemState] = useState(""); 
  const [place, setPlace] = useState(null);
  const [sensors, setSensors] = useState({});
  const typeOrder = ["Water", "Air", "Pressure"]; // Define the order

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socket = io(SOCKET_SERVER_URL, { transports: ["websocket"] });

  useEffect(() => {
    fetchSensors();
    fetchSystemState();
  }, []);

  const fetchSensors = async () => {
    const response = await fetch("http://127.0.0.1:5000/sensors");
    const data = await response.json();

    // Format the sensors to extract the ID correctly
    const formattedSensors = data.sensors.map(sensor => ({
        ...sensor,
        _id: sensor._id.$oid // Extract the ID as a string
    }));
    console.log(formattedSensors);
    setSensors(formattedSensors);
  };

  const fetchSystemState = async () => {
    const response = await fetch("http://127.0.0.1:5000/settings");
    const data = await response.json();
    setSystemState(data.settings[0].system_state)
  };

  const handleFormSubmit = async () => {
    // Fetch or trigger a function to refresh data after form submission
    // You can re-fetch the data here or perform any other necessary action
    fetchSystemState();
  };
  
  const changeTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <WebSocketProvider>
      {systemState === "waiting" ? (
          <ConfigSensorsForm onFormSubmit={handleFormSubmit} />
        ) : (
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
              <h2>Home Content</h2>
              <HomeDisplay socket={socket} />
            </div>
          )}
          {activeTab === 'tank1' && (
            <div className="tab-content tank1">
              <h2>Tank 1 Content</h2>
              {sensors
                .filter(sensor => sensor.tank === "1") // Filter by tank
                .sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)) // Sort by predefined order
                .map((sensor, index) => (
                  <SensorDisplay inputSensor={sensor} />
                ))}
            </div>
          )}
          {activeTab === 'tank2' && (
            <div className="tab-content tank2">
              <h2>Tank 2 Content</h2>
              {sensors
                .filter(sensor => sensor.tank === "2") // Filter by tank
                .sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)) // Sort by predefined order
                .map((sensor, index) => (
                  <SensorDisplay inputSensor={sensor} />
                ))}
            </div>
          )}
        </section>
        </div>
      )}
    </WebSocketProvider>
  );
}

export default Home;
