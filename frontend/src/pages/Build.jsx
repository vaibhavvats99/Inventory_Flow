import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

export default function Build() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [result, setResult] = useState(null);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');

  const selectedProduct = products.find((p) => p.id === Number(productId));

  useEffect(() => {
    async function load() {
      const { data } = await api.get('/api/products');
      setProducts(data);
    }
    load();
  }, []);

  async function calculate() {
    if (!productId) return;
    setMessage('');
    const { data } = await api.get(`/api/products/${productId}/can-build`);
    setResult(data);
  }

  const enough = result && result.canBuild >= qty;
  
  // Find the part that limits production
  function getLimitingPart() {
    if (!result || !result.details || result.details.length === 0) return null;
    let limiting = result.details[0];
    for (let i = 1; i < result.details.length; i++) {
      if (result.details[i].maxByThisPart < limiting.maxByThisPart) {
        limiting = result.details[i];
      }
    }
    return limiting;
  }
  
  const limitingPart = getLimitingPart();

  async function buildNow() {
    if (!productId || !enough) return;
    try {
      await api.post(`/api/products/${productId}/build`, { quantity: qty });
      setMessage(`Built ${qty} unit(s) successfully. Stock updated.`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Build failed');
    }
  }

  return (
    <div className="build-container">
      <div className="build-card">
        <div className="build-header">
          <span className="build-icon">🏭</span>
          <h1 className="build-title">Build</h1>
        </div>
        
        <div className="build-form-section">
          <div className="form-group">
            <label className="form-label">
              Product
            </label>
            <select 
              className="form-input form-select" 
              value={productId} 
              onChange={(e) => {
                setProductId(e.target.value);
                setResult(null);
              }}
            >
              <option value="">Select product</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Desired quantity
            </label>
            <input 
              type="number" 
              min={1} 
              value={qty} 
              onChange={(e) => setQty(Number(e.target.value))}
              className="form-input"
            />
          </div>
          
          <button 
            className="btn btn-primary" 
            onClick={calculate}
            disabled={!productId}
          >
            🔍 Check Availability
          </button>
        </div>

        {result && (
          <div className="build-results">
            <div className="results-header">
              <div className={`status-badge ${!enough ? 'status-warning' : ''}`}>
                {enough ? (
                  <>
                    <span className="status-icon">✅</span>
                    <span className="status-text">Available</span>
                  </>
                ) : (
                  <>
                    <span className="status-icon">🚨</span>
                    <span className="status-text">Not enough stock</span>
                  </>
                )}
              </div>
              <div className="build-summary">
                <div className="summary-item">
                  <span className="summary-label">Stock can build:</span>
                  <span className="summary-value">{result.canBuild}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Requested:</span>
                  <span className="summary-value">{qty}</span>
                </div>
              </div>
            </div>

            {enough && (
              <button 
                className="btn btn-success btn-build" 
                onClick={buildNow}
                disabled={!enough}
              >
                🏗️ Build {selectedProduct?.name || 'Product'} ({qty} unit{qty > 1 ? 's' : ''})
              </button>
            )}

            {message && (
              <div className={`message ${message.includes('successfully') ? 'message-success' : 'message-error'}`}>
                {message}
              </div>
            )}

            <div className="table-container">
              <table className="build-table">
                <thead>
                  <tr>
                    <th>Part</th>
                    <th>Required/Prod</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {result.details.map((d) => {
                    const isLimiting = limitingPart && d.name === limitingPart.name;
                    return (
                      <tr key={d.name} className={isLimiting ? 'row-limiting' : ''}>
                        <td>
                          <div className="part-name-cell">
                            {isLimiting && <span className="limiting-indicator">⚠️</span>}
                            <span className={isLimiting ? 'part-name-critical' : ''}>{d.name}</span>
                          </div>
                        </td>
                        <td>{d.requiredPerProduct}</td>
                        <td className={isLimiting ? 'stock-critical' : ''}>{d.maxByThisPart}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
