import { useState, useEffect } from "react";
import SensorSettings from "./SensorSettings";
import ChangeSettingsForm from "./ChangeSettingsForm";
import './Settings.css';


function Settings() {

  const [readFrequency, setReadFrequency] = useState("");
  const [readFrequencyId, setReadFrequencyId] = useState("");
  const [systemState, setSystemState] = useState("");
  const [runNumber, setRunNumber] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentValue, setCurrentValue] = useState({})

  useEffect(() => {
    fetchSettings()
  }, []);

  const fetchSettings = async () => {
    const response = await fetch("http://127.0.0.1:5000/settings");
    const data = await response.json();
    setReadFrequency(data.settings[0].read_frequency);
    setReadFrequencyId(data.settings[0]._id);
    setSystemState(data.settings[0].system_state)
    setRunNumber(data.settings[0].run_number)
  };

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const openEditModal = () => {
    if (isModalOpen) return
    setCurrentValue(readFrequency);
    setIsModalOpen(true)
  }

  const onUpdate = () => {
    closeModal()
    fetchSettings()
  }

  return (
    <>
      <SensorSettings/>
      <div class="data-section">
        <h3>DATA SETTINGS</h3>
        <div className="data-setting">
        <table>
            <tbody>
              <tr>
                <td> Frequency of Data Reading: </td>
                <td> Every {readFrequency} Minutes</td>
                <td>
                <button onClick={() => openEditModal()}>
                    Update
                </button>
                </td>
              </tr>
              <tr>
                <td> Current System State: </td>
                <td>{systemState}</td>
              </tr>
              <tr>
                <td> Current Run Number: </td>
                <td>{runNumber}</td>
              </tr>
              
            </tbody>
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <ChangeSettingsForm settingChange={readFrequencyId} currentValue={currentValue} updateCallback={onUpdate} />
                    </div>
                </div>
            )}
          </table>
        </div>
      </div>
    </>
  );
}

export default Settings;
