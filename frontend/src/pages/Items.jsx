import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios.js';

export default function Items() {
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  }, []);

  // Simplified: allow CRUD for everyone (no roles)
  const isAdmin = true;

  const [query, setQuery] = useState({ search: '', category: '', sort: 'createdAt', order: 'desc', page: 1, limit: 10 });
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', category: '', quantity: 0, requiredPerProduct: 0 });
  const [editingId, setEditingId] = useState(null);

  async function fetchItems() {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/api/items', { params: query });
      setData(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchItems(); /* eslint-disable-next-line */ }, [query.page, query.limit, query.search, query.category, query.sort, query.order]);

  function resetForm() {
    setForm({ name: '', category: '', quantity: 0, requiredPerProduct: 0 });
    setEditingId(null);
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/api/items', form);
      resetForm();
      fetchItems();
    } catch (err) {
      alert(err?.response?.data?.message || 'Create failed');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      await api.put(`/api/items/${editingId}`, form);
      resetForm();
      fetchItems();
    } catch (err) {
      alert(err?.response?.data?.message || 'Update failed');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`/api/items/${id}`);
      fetchItems();
    } catch (err) {
      alert(err?.response?.data?.message || 'Delete failed');
    }
  }

  return (
    <div className="card">
      <h2>Items</h2>
      <div className="toolbar">
        <input placeholder="Search by name" value={query.search} onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })} />
        <input placeholder="Filter by category" value={query.category} onChange={(e) => setQuery({ ...query, category: e.target.value, page: 1 })} />
        <select value={query.sort} onChange={(e) => setQuery({ ...query, sort: e.target.value })}>
          <option value="createdAt">Created</option>
          <option value="quantity">Quantity</option>
          <option value="name">Name</option>
        </select>
        <select value={query.order} onChange={(e) => setQuery({ ...query, order: e.target.value })}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Required/Prod</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data.items.map((it) => (
                <tr key={it.id}>
                  <td>{it.name}</td>
                  <td>{it.category}</td>
                  <td>{it.quantity}</td>
                  <td>{it.requiredPerProduct}</td>
                  {isAdmin && (
                    <td>
                      <button className="btn" onClick={() => { setEditingId(it.id); setForm({ name: it.name, category: it.category, quantity: it.quantity, requiredPerProduct: it.requiredPerProduct }); }}>Edit</button>
                      <button className="btn danger" onClick={() => handleDelete(it.id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button className="btn" disabled={query.page <= 1} onClick={() => setQuery({ ...query, page: query.page - 1 })}>Prev</button>
            <span>
              Page {query.page} / {Math.max(1, Math.ceil((data.total || 0) / query.limit))}
            </span>
            <button className="btn" disabled={query.page >= Math.ceil((data.total || 0) / query.limit)} onClick={() => setQuery({ ...query, page: query.page + 1 })}>Next</button>
          </div>
        </>
      )}

      {isAdmin && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>{editingId ? 'Edit Item' : 'Add Item'}</h3>
          <form onSubmit={editingId ? handleUpdate : handleCreate} className="form">
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Category
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            </label>
            <label>
              Quantity
              <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            </label>
            <label>
              Required per product
              <input type="number" value={form.requiredPerProduct} onChange={(e) => setForm({ ...form, requiredPerProduct: Number(e.target.value) })} />
            </label>
            <div className="row">
              <button type="submit" className="btn">{editingId ? 'Update' : 'Create'}</button>
              {editingId && (
                <button type="button" className="btn" onClick={resetForm}>Cancel</button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


