import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')||'null'); } catch { return null; } })();

  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand">InventoryFlow</div>
        <div className="links">
          {token ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/build">Build</Link>
              <button onClick={logout} className="btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup" className="btn">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}


