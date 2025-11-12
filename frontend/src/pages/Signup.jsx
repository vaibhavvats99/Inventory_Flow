import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/api/auth/signup', form);
      if (response.data) {
        navigate('/login');
      }
    } catch (err) {
      console.error('Signup error:', err);
      // Better error handling
      if (err.response) {
        // Server responded with error
        const msg = err.response.data?.message || 'Signup failed';
        setError(msg);
      } else if (err.request) {
        // Request made but no response (server might be down)
        setError('Unable to connect to server. Please check if the backend is running.');
      } else {
        // Something else happened
        setError(err.message || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Create account</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            minLength={6}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      <div className="hint">
        Already have an account? <Link to="/login">Log in</Link>
      </div>
    </div>
  );
}


