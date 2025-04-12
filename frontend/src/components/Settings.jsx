import { useState, useEffect } from "react";
import SensorSettings from "./SensorSettings";
import ChangeSettingsForm from "./ChangeSettingsForm";
import './Settings.css';


function Settings() {

  const [readFrequency, setReadFrequency] = useState("");
  const [settingsId, setSettingsId] = useState("");
  const [systemState, setSystemState] = useState("");
  const [runNumber, setRunNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentValue, setCurrentValue] = useState({})

  useEffect(() => {
    fetchSettings()
  }, []);

  const fetchSettings = async () => {
    const response = await fetch("http://127.0.0.1:5000/settings");
    const data = await response.json();
    setReadFrequency(data.settings[0].read_frequency);
    setSettingsId(data.settings[0]._id);
    setSystemState(data.settings[0].system_state)
    setRunNumber(data.settings[0].run_number)
    const mongoDate = data.settings[0].start_date;
    let date = new Date(mongoDate["$date"]);
    setStartDate(date.toLocaleString())
  };

  // Function to handle button click
  const handleClick = async () => {
    if (systemState === 'running') {
      setSystemState('waiting');
      console.log('Stopping...');
      const data = {
        settingsId
      }
      const url = `http://127.0.0.1:5000/stop_run`;
      const options = {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ setting_id: settingsId.$oid })
      };

      try {
        const response = await fetch(url, options);
        console.log(response)
      } catch (error) {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } 
  };

  // Conditionally set button styles based on the state
  const buttonStyles = {
    backgroundColor: systemState === 'running' ? 'red' : 'gray',
    color: 'white',
    padding: '10px 20px',
    fontSize: '16px',
    border: 'none',
    cursor: systemState === 'running' ? 'pointer' : 'not-allowed',  // Pointer cursor when start, not allowed when stop
    opacity: systemState === 'waiting' ? 0.6 : 1  // Make the button slightly transparent when disabled
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
        <h3>Data Settings</h3>
        <div className="data-setting">
        <table>
            <tbody>
              <tr>
                <td> Frequency of Data Reading: </td>
                <td>{readFrequency} Seconds</td>
                <td>
                <button onClick={() => openEditModal()}>
                    Update
                </button>
                </td>
              </tr>
              <tr>
                <td> Current System State: </td>
                <td>{systemState}</td>
                <td>
                <button
                  style={buttonStyles}
                  onClick={handleClick}
                  disabled={systemState === 'waiting'}  // Disable the button when in 'stop' state
                >
                  {'Stop Run'}
                </button>
                </td>
              </tr>
              <tr>
                <td> Current Run Number: </td>
                <td>{runNumber}</td>
              </tr>
              <tr>
                <td> Run Start Date: </td>
                <td>{startDate}</td>
              </tr>
              
            </tbody>
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <ChangeSettingsForm settingChange={settingsId} currentValue={currentValue} updateCallback={onUpdate} />
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
