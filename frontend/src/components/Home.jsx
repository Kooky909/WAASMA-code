import React, { useEffect, useState } from 'react';
import ConfigSensorsForm from "./ConfigSensorsForm";
import AnalysisTool from "./AnalysisTool";
import HomeDisplay from "./HomeDisplay";
import SensorDisplay from "./SensorDisplay";
import RealTimeChart from "./RealTimeChart";
import "../home.css";

function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [sensors, setSensors] = useState({});

  useEffect(() => {
    fetchSensors()
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

  const openAnalysisModal = () => {
    if (isModalOpen) return
    //setCurrentSensor(sensor)
    setIsModalOpen(true)
    setIsAnalysisOpen(true)
  };

  const closeModal = () => {
    setIsModalOpen(false)
    setIsConfigOpen(false)
    setIsAnalysisOpen(false)
  }

  return (
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
          <div className="tab-content">
            <h2>Home Content</h2>
            <button onClick={() => openConfigSensorsModal()}>Configure Sensors</button>
            <button onClick={() => openAnalysisModal()}>AnalysisTool</button>
            <HomeDisplay/>
          </div>
        )}
        {activeTab === 'tank1' && (
          <div className="tab-content">
            <h2>Tank 1 Content</h2>
            <button onClick={() => openConfigSensorsModal()}>Configure Sensors</button>
            <button onClick={() => openAnalysisModal()}>AnalysisTool</button>
            <SensorDisplay inputSensor={sensors[0]} />
            <SensorDisplay inputSensor={sensors[1]} />
            <SensorDisplay inputSensor={sensors[2]} />
          </div>
        )}
        {activeTab === 'tank2' && (
          <div className="tab-content">
            <h2>Tank 2 Content</h2>
            <button onClick={() => openConfigSensorsModal()}>Configure Sensors</button>
            <button onClick={() => openAnalysisModal()}>AnalysisTool</button>
            <SensorDisplay inputSensor={sensors[3]} />
            <SensorDisplay inputSensor={sensors[4]} />
            <SensorDisplay inputSensor={sensors[5]} />
          </div>
        )}
        {isModalOpen && activeTab && isConfigOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={closeModal}>&times;</span>
              <ConfigSensorsForm updateCallback={onUpdate} />
            </div>
          </div>
        )}
        {isModalOpen && activeTab && isAnalysisOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={closeModal}>&times;</span>
              <AnalysisTool/>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;