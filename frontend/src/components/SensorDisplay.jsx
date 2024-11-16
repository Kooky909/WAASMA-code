import { useState } from "react";

const SensorDisplay = ({ activeTank = {} }) => {



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

export default SensorDisplay