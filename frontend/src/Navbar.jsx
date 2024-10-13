import { Link } from 'react-router-dom';

function Navbar() {
    return (
      <nav>
        <Link to="/">Login</Link>
        <Link to="/home">Home</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/users">Users</Link>
      </nav>
    );
  }
  export default Navbar;