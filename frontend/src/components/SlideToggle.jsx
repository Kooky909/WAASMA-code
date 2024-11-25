import React, { useState } from 'react';
import './SlideToggle.css'; // Include the CSS file

function SlideToggle() {
  const [activeTab, setActiveTab] = useState('home');

  const changeTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="container">
      <nav className="tabs">
        <div
          className={`tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => changeTab('home')}
        >
          Home
        </div>
        <div
          className={`tab ${activeTab === 'tank1' ? 'active' : ''}`}
          onClick={() => changeTab('tank1')}
        >
          Tank 1
        </div>
        <div
          className={`tab ${activeTab === 'tank2' ? 'active' : ''}`}
          onClick={() => changeTab('tank2')}
        >
          Tank 2
        </div>
        <div
          className="slider"
          style={{
            transform: `translateX(${activeTab === 'home' ? 0 : activeTab === 'tank1' ? 100 : 200}%)`,
          }}
        />
      </nav>
    </div>
  );
}

export default SlideToggle;
