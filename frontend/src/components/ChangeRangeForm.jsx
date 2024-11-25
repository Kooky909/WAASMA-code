import { useState } from "react";

const ChangeRangeForm = ({ sensorChange = {}, updateCallback }) => {
    console.log(sensorChange._id);

    const [range_low, setRangeLow] = useState(sensorChange.range_low || "");
    const [range_high, setRangeHigh] = useState(sensorChange.range_high || "");

    const onSubmit = async (e) => {
        e.preventDefault()

        const data = {
            range_low,
            range_high
        }
        console.log(data)
        console.log(sensorChange._id)
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
                <label htmlFor="range_low">Range-low:</label>
                <input
                    type="text"
                    id="range_low"
                    value={range_low}
                    onChange={(e) => setRangeLow(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="range_high">Range-high:</label>
                <input
                    type="text"
                    id="range_high"
                    value={range_high}
                    onChange={(e) => setRangeHigh(e.target.value)}
                />
            </div>
            <button type="submit">{"Update"}</button>
        </form>
    );
};

export default ChangeRangeForm