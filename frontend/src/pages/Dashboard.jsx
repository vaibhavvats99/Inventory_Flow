import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Modal from '../components/Modal.jsx';
import Toast from '../components/Toast.jsx';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [parts, setParts] = useState({ parts: [], canBuild: 0 });
  const [newProduct, setNewProduct] = useState('');
  const [link, setLink] = useState({ name: '', required: 1, stock: '' });
  const [error, setError] = useState('');
  const [showProducts, setShowProducts] = useState(true);
  const [showItems, setShowItems] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(true);
  const [toast, setToast] = useState(null);

  function getLowStock() {
    if (!selected) return [];
    return parts.parts
      .filter((p) => (p.stock || 0) < 5)
      .map((p) => ({ productName: selected.name, partName: p.name, stock: p.stock || 0 }));
  }

  const lowStock = getLowStock();

  async function loadProducts() {
    const { data } = await api.get('/api/products');
    setProducts(data);
    if (!selected && data.length > 0) {
      setSelected(data[0]);
      loadParts(data[0].id);
    }
  }

  async function loadParts(productId) {
    const { data } = await api.get(`/api/products/${productId}/parts`);
    setParts(data);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function showToast(message, type = 'success') {
    setToast({ message, type });
  }

  async function createProduct(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/products', { name: newProduct });
      setNewProduct('');
      setShowAddModal(false);
      showToast('Product added successfully!', 'success');
      await loadProducts();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create product');
      showToast(err?.response?.data?.message || 'Failed to create product', 'error');
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
      setLink({ name: '', required: 1, stock: '' });
      setShowLinkModal(false);
      showToast('Part linked successfully!', 'success');
      await loadParts(selected.id);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to link part', 'error');
    }
  }

  async function removePart(itemId) {
    if (!selected) return;
    if (!confirm('Remove this part from the product?')) return;
    try {
      await api.delete(`/api/products/${selected.id}/parts/${itemId}`);
      showToast('Part removed successfully!', 'success');
      await loadParts(selected.id);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to remove part', 'error');
    }
  }

  return (
    <div className="dashboard-container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="dashboard-grid">
        <section className={`panel panel-products ${showProducts ? 'open' : ''}`}>
          <div className="panel-header">
            <div className="panel-header-content">
              <span className="panel-icon-text">📦</span>
              <h2 className="panel-title">MY PRODUCTS</h2>
            </div>
            <button className="panel-toggle" onClick={() => setShowProducts((v) => !v)}>
              <span className="panel-icon">{showProducts ? '−' : '+'}</span>
            </button>
          </div>
          <div className="panel-divider"></div>
          {showProducts && (
            <div className="panel-body">
              {products.length === 0 ? (
                <p className="muted" style={{ marginBottom: '20px' }}>No products yet. Add one to get started.</p>
              ) : (
                <ul className="product-list">
                  {products.map((p) => (
                    <li key={p.id}>
                      <button
                        className={`chip ${selected?.id === p.id ? 'chip-active' : ''}`}
                        onClick={() => {
                          setSelected(p);
                          loadParts(p.id);
                        }}
                      >
                        {p.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="add-section">
                <button className="btn btn-success" onClick={() => setShowAddModal(true)}>
                  {products.length > 0 ? '➕ Add More Product' : '➕ Add Product'}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className={`panel panel-items ${showItems ? 'open' : ''}`}>
          <div className="panel-header">
            <div className="panel-header-content">
              <span className="panel-icon-text">📋</span>
              <h2 className="panel-title">ITEM LIST</h2>
            </div>
            <button className="panel-toggle" onClick={() => setShowItems((v) => !v)}>
              <span className="panel-icon">{showItems ? '−' : '+'}</span>
            </button>
          </div>
          <div className="panel-divider"></div>
          {showItems && (
            <div className="panel-body">
              {!selected ? (
                <p className="muted">Select a product to view its parts.</p>
              ) : (
                <>
                  <div className="product-header">
                    <h3 className="product-name">{selected.name} parts</h3>
                    <div className="progress-container">
                      <div className="progress-label">Complete products possible: <strong className="progress-value">{parts.canBuild}</strong></div>
                      {parts.canBuild > 0 && (
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${Math.min(100, (parts.canBuild / 10) * 100)}%` }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {parts.parts.length === 0 ? (
                    <p className="muted">No parts linked yet.</p>
                  ) : (
                    <div className="parts-table-wrapper">
                      <table className="table compact">
                        <thead>
                          <tr>
                            <th>Part</th>
                            <th>Required</th>
                            <th>Stock</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {parts.parts.map((p) => (
                            <tr key={p.itemId}>
                              <td>{p.name}</td>
                              <td>{p.required}</td>
                              <td>{p.stock}</td>
                              <td>
                                <button className="icon-button" onClick={() => removePart(p.itemId)} title="Remove part">
                                  ×
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>

        <section className={`panel panel-link ${showLinkForm ? 'open' : ''}`}>
          <div className="panel-header">
            <div className="panel-header-content">
              <span className="panel-icon-text">🔗</span>
              <h2 className="panel-title">LINK A PART</h2>
            </div>
            <button className="panel-toggle" onClick={() => setShowLinkForm((v) => !v)}>
              <span className="panel-icon">{showLinkForm ? '−' : '+'}</span>
            </button>
          </div>
          <div className="panel-divider"></div>
          {showLinkForm && (
            <div className="panel-body">
              {!selected ? (
                <p className="muted">Select a product first.</p>
              ) : (
                <button className="btn btn-success" onClick={() => setShowLinkModal(true)} style={{ width: '100%' }}>
                  ➕ Link a Part
                </button>
              )}
            </div>
          )}
        </section>

        <section className="panel low-stock-card">
          <div className="panel-header">
            <div className="panel-header-content">
              <span className="panel-icon-text">⚠️</span>
              <h2 className="panel-title">LOW STOCK ALERT</h2>
            </div>
          </div>
          <div className="panel-divider"></div>
          <div className="panel-body">
            {lowStock.length === 0 ? (
              <p className="muted">All items are sufficiently stocked.</p>
            ) : (
              <ul className="low-stock-list">
                {lowStock.map((it, idx) => (
                  <li key={idx} className="low-stock-item">
                    <span>{`${it.productName} >>> ${it.partName} >>> ${it.stock}`}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setNewProduct(''); setError(''); }} title="Add Product">
        <form onSubmit={createProduct} className="form">
          <label>
            New product name
            <input value={newProduct} onChange={(e) => setNewProduct(e.target.value)} required autoFocus />
          </label>
          {error && <div className="error">{error}</div>}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button className="btn btn-success" type="submit" style={{ flex: 1 }}>Add Product</button>
            <button className="btn btn-secondary" type="button" onClick={() => { setShowAddModal(false); setNewProduct(''); setError(''); }} style={{ flex: 1 }}>Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showLinkModal} onClose={() => { setShowLinkModal(false); setLink({ name: '', required: 1, stock: '' }); }} title="Link a Part">
        <form onSubmit={addLink} className="form">
          <label>
            Part Name
            <input value={link.name} onChange={(e) => setLink({ ...link, name: e.target.value })} required autoFocus />
          </label>
          <label>
            Required Qty
            <input type="number" min={1} value={link.required} onChange={(e) => setLink({ ...link, required: Number(e.target.value) })} required />
          </label>
          <label>
            Stock (optional)
            <input type="number" min={0} value={link.stock} onChange={(e) => setLink({ ...link, stock: e.target.value === '' ? '' : Number(e.target.value) })} />
          </label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button className="btn btn-success" type="submit" style={{ flex: 1 }}>Add / Update</button>
            <button className="btn btn-secondary" type="button" onClick={() => { setShowLinkModal(false); setLink({ name: '', required: 1, stock: '' }); }} style={{ flex: 1 }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
