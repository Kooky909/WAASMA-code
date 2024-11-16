import { useState } from "react";

const ConfigSensorsForm = ({ activeTab = {}, updateCallback }) => {
    //console.log(sensorChange._id);

    //const [range, setRange] = useState(sensorChange.range || "");
    const [randomValue, setRandomValue] = useState(55 || "");
    const numTanks = 2;

    const handleNumTanksChange = (numTanks) => {
        console.log(numTanks);
      };

    const onSubmit = async (e) => {
        e.preventDefault()

        const data = {
            range
        }
        console.log(data)
        const url = `http://127.0.0.1:5000/change_range/${sensorChange._id}`;
        const options = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(url, options)
        if (response.status !== 201 && response.status !== 200) {
            const data = await response.json()
            alert(data.message)
        } else {
            updateCallback()
        }
    }


    return (
        <form onSubmit={onSubmit}>
            <div>
                <label htmlFor="numTanks">Enter number of desired tanks:</label>
                <input
                    type="number"
                    id="numTanks"
                    value={numTanks}
                    onChange={handleNumTanksChange}
                    min="1"
                    max="5"
                    required
                />
            </div>
            <br />

            {/* Render each tank configuration based on the numTanks value */}
            {[...Array(numTanks)].map((_, index) => {
                const tankId = index + 1;
                return (
                    <div className="tank-config" key={tankId}>
                        <h3>{`Tank ${tankId}`}</h3>
                        <div className="sensor-inputs">
                            <label>
                                Water quality:
                                <input
                                    type="number"
                                    value={randomValue || ''}
                                    onChange={(e) => setRandomValue(e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Air quality:
                                <input
                                    type="number"
                                    value={randomValue || ''}
                                    onChange={(e) => setRandomValue(e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Pressure:
                                <input
                                    type="number"
                                    value={randomValue || ''}
                                    onChange={(e) => setRandomValue(tankId, 'pressure', e.target.value) }
                                    required
                                />
                            </label>
                        </div>
                    </div>
                );
            })}

            <br />
            <button type="submit">Submit</button>
        </form>
    );
};

export default ConfigSensorsForm