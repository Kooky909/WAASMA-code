import { useState } from "react";

const ChangeSettingsForm = ({ settingChange, currentValue, updateCallback }) => {

    const [read_frequency, setFrequency] = useState(parseInt(currentValue, 10) || "");

    const onSubmit = async (e) => {
        e.preventDefault()

        const data = {
            read_frequency
        }
        console.log(data)
        const url = `http://127.0.0.1:5000/change_setting/${settingChange.$oid}`;
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
                <label htmlFor="frequency">Frequency:</label>
                <input
                    type="text"
                    id="read_frequency"
                    value={read_frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                />
            </div>
            <button type="submit">{"Update"}</button>
        </form>
    );
};

export default ChangeSettingsForm;