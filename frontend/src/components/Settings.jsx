import { useState, useEffect } from "react";
import SensorSettings from "./SensorSettings";
import ChangeSettingsForm from "./ChangeSettingsForm";

function Settings() {

  const [readFrequency, setReadFrequency] = useState([]);
  const [storeFrequency, setStoreFrequency] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentSetting, setCurrentSetting] = useState({})
  const [currentValue, setCurrentValue] = useState({})

  useEffect(() => {
    fetchSettings()
  }, []);

  const fetchSettings = async () => {
    const response = await fetch("http://127.0.0.1:5000/settings");
    //const data = await response.json();

    const data = [
      {
        "read_frequency": 7
      },
      {
        "store_frequnecy": 8
      }
    ]

    // Format the users to extract the ID correctly
    //const formattedSettings = data.settings.map(setting => ({
    //    ...setting,
    //    _id: setting._id.$oid // Extract the ID as a string
    //}));
    //console.log(formattedSettings);
    //setUsers(formattedSettings);
    setReadFrequency(data[0].read_frequency);
    setStoreFrequency(data[1].store_frequnecy);
  };

  const closeModal = () => {
    setIsModalOpen(false)
    setCurrentSetting({})
  }

  const openEditModal = ( type ) => {
    if (isModalOpen) return
    if (type == "read") {
      setCurrentValue(readFrequency);
    } else if (type == "store") {
      setCurrentValue(storeFrequency);
    }
    setCurrentSetting(type)
    setIsModalOpen(true)
  }

  const onUpdate = () => {
    closeModal()
    fetchUsers()
  }

  return (
    <>
      <SensorSettings/>
      <div class="data-section">
        <h3>DATA SETTINGS</h3>
        <div class="data-setting">
        <table>
            <tbody>
              <tr>
                <td> Frequency of Data Reading: </td>
                <td>{readFrequency}</td>
                <td>
                <button onClick={() => openEditModal({ type: 'read' })}>
                    Update
                </button>
                </td>
              </tr>
              <tr>
                <td> Frequency of Data Storing: </td>
                <td>{storeFrequency}</td>
                <td>
                <button onClick={() => openEditModal({ type: 'store' })}>
                    Update
                </button>
                </td>
              </tr>
            </tbody>
            {isModalOpen && currentSetting && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <ChangeSettingsForm settingChange={currentSetting} currentValue={currentValue} updateCallback={onUpdate} />
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