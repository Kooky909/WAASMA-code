import { useState } from "react";

const ChangeRangeForm = ({ sensorChange = {}, updateCallback }) => {
    console.log(sensorChange._id);

    const [range, setRange] = useState(sensorChange.range || "");

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
                <label htmlFor="range">Range:</label>
                <input
                    type="text"
                    id="range"
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                />
            </div>
            <button type="submit">{"Update"}</button>
        </form>
    );
};

export default ChangeRangeForm