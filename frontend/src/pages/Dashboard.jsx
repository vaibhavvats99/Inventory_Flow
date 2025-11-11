import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [parts, setParts] = useState({ parts: [], canBuild: 0 });
  const [newProduct, setNewProduct] = useState('');
  const [link, setLink] = useState({ name: '', required: 1, stock: 0 });
  const [error, setError] = useState('');

  async function loadProducts() {
    const { data } = await api.get('/api/products');
    setProducts(data);
  }
  async function loadParts(productId) {
    const { data } = await api.get(`/api/products/${productId}/parts`);
    setParts(data);
  }

  useEffect(() => { loadProducts(); }, []);

  async function createProduct(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/products', { name: newProduct });
      setNewProduct('');
      loadProducts();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create product');
    }
  }

  async function addLink(e) {
    e.preventDefault();
    if (!selected) return;
    try {
      await api.post(`/api/products/${selected.id}/parts`, {
        itemName: link.name,
        required: Number(link.required),
        stock: link.stock === '' ? undefined : Number(link.stock),
      });
      loadParts(selected.id);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to link part');
    }
  }

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <div className="row" style={{ gap: 16 }}>
        <div className="card" style={{ flex: 1 }}>
          <h3>Your Products</h3>
          <form onSubmit={createProduct} className="form">
            <label>
              New product name
              <input value={newProduct} onChange={(e) => setNewProduct(e.target.value)} required />
            </label>
            <button className="btn">Add Product</button>
          </form>
          {error && <div className="error">{error}</div>}
          <ul>
            {products.map((p) => (
              <li key={p.id}>
                <button className="btn" onClick={() => { setSelected(p); loadParts(p.id); }}>{p.name}</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card" style={{ flex: 2 }}>
          {selected ? (
            <>
              <h3>{selected.name} parts</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Part</th>
                    <th>Required/Prod</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.parts.map((r) => (
                    <tr key={r.itemId}>
                      <td>{r.name}</td>
                      <td>{r.required}</td>
                      <td>{r.maxByThisPart}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>Complete products possible: <strong>{parts.canBuild}</strong></p>
              <div className="card">
                <h4>Link a part</h4>
                <form onSubmit={addLink} className="form">
                  <label>
                    Part name
                    <input value={link.name} onChange={(e) => setLink({ ...link, name: e.target.value })} required />
                  </label>
                  <label>
                    Required per product
                    <input type="number" value={link.required} onChange={(e) => setLink({ ...link, required: Number(e.target.value) })} min={1} required />
                  </label>
                  <label>
                    Total stock (optional)
                    <input type="number" value={link.stock} onChange={(e) => setLink({ ...link, stock: e.target.value === '' ? '' : Number(e.target.value) })} min={0} />
                  </label>
                  <button className="btn">Add/Update</button>
                </form>
              </div>
            </>
          ) : (
            <p>Select a product on the left to see its parts and capacity.</p>
          )}
        </div>
      </div>
    </div>
  );
}


