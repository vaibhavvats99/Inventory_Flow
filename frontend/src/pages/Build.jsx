import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function Build() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [result, setResult] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    async function load() {
      const { data } = await api.get('/api/products');
      setProducts(data);
    }
    load();
  }, []);

  async function calculate() {
    if (!productId) return;
    const { data } = await api.get(`/api/products/${productId}/can-build`);
    setResult(data);
  }

  const enough = result && result.canBuild >= qty;

  return (
    <div className="card">
      <h2>Build</h2>
      <div className="form">
        <label>
          Product
          <select value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">Select product</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label>
          Desired quantity
          <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
        </label>
        <button className="btn" onClick={calculate}>Check</button>
      </div>
      {result && (
        <div className="card" style={{ marginTop: 16 }}>
          <p>Stock can build: <strong>{result.canBuild}</strong></p>
          <p>Requested: <strong>{qty}</strong> → {enough ? 'Enough stock' : 'Not enough stock'}</p>
          <table className="table">
            <thead>
              <tr>
                <th>Part</th>
                <th>Required/Prod</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {result.details.map((d) => (
                <tr key={d.name}>
                  <td>{d.name}</td>
                  <td>{d.requiredPerProduct}</td>
                  <td>{d.maxByThisPart}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


