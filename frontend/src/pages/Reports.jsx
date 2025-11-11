import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function Reports() {
  const [result, setResult] = useState({ canBuild: 0, details: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/api/inventory/calculate');
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to calculate');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="card">
      <h2>Inventory Report</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <p>Complete products possible: <strong>{result.canBuild}</strong></p>
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Stock</th>
                <th>Required/Prod</th>
                <th>Max by this part</th>
              </tr>
            </thead>
            <tbody>
              {result.details.map((d) => (
                <tr key={d.name}>
                  <td>{d.name}</td>
                  <td>{d.quantity}</td>
                  <td>{d.requiredPerProduct}</td>
                  <td>{d.maxByThisPart}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn" onClick={load}>Recalculate</button>
        </>
      )}
    </div>
  );
}


