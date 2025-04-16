import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Analysis from './components/Analysis';
import Settings from './components/Settings';
import Users from './components/Users';
import Navbar from './Navbar';
import PrivateRoute from './PrivateRoute';
import "./App.css";

function App() {

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} /> 
          <Route path="/home" element={ <PrivateRoute> <Home /> </PrivateRoute> } />
          <Route path="/analysis" element={ <PrivateRoute> <Analysis /> </PrivateRoute> } />
          <Route path="/settings" element={ <PrivateRoute> <Settings /> </PrivateRoute> } />
          <Route path="/users" element={ <PrivateRoute> <Users /> </PrivateRoute> } />
        </Routes>
      </Router>
    </>
  );
}

export default App;