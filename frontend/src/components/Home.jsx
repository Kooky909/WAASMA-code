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
  const [sensors, setSensors] = useState({});
  const typeOrder = ["Water", "Air", "Pressure"]; // Define the order

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socket = io(SOCKET_SERVER_URL, { transports: ["websocket"] });

  useEffect(() => {
    fetchSensors();
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

  const onUpdate = () => {
    closeModal()
    fetchSensors()
  }
  
  const changeTab = (tab) => {
    setActiveTab(tab);
  };

  const openConfigSensorsModal = () => {
    if (isModalOpen) return
    setIsModalOpen(true)
    setIsConfigOpen(true)
  };

  const closeModal = () => {
    setIsModalOpen(false)
    setIsConfigOpen(false)
  }

  return (
    <WebSocketProvider>
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
            <button 
              onClick={() => openConfigSensorsModal()}
              className="blue-button" // Added class
            >
              Configure Sensors
            </button>
            <HomeDisplay socket={socket} />
          </div>
        )}
        {activeTab === 'tank1' && (
          <div className="tab-content tank1">
            <h2>Tank 1 Content</h2>
            <button onClick={() => openConfigSensorsModal()}>Configure Sensors</button>
            <SensorDisplay inputSensor={sensors[0]} tank={1} />
            <SensorDisplay inputSensor={sensors[1]} tank={1} />
            <SensorDisplay inputSensor={sensors[2]} tank={1} />
          </div>
        )}
        {activeTab === 'tank2' && (
          <div className="tab-content tank2">
            <h2>Tank 2 Content</h2>
            <button onClick={() => openConfigSensorsModal()}>Configure Sensors</button>
            <SensorDisplay inputSensor={sensors[3]} tank={2}/>
            <SensorDisplay inputSensor={sensors[4]} tank={2}/>
            <SensorDisplay inputSensor={sensors[5]} tank={2}/>
          </div>
        )}
        {isModalOpen && activeTab && isConfigOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={closeModal}>&times;</span>
              <h3>Configure Sensors</h3>
              <ConfigSensorsForm updateCallback={onUpdate} />
            </div>
          </div>
        )}
      </section>
    </div>
    </WebSocketProvider>
  );
}

export default Home;
