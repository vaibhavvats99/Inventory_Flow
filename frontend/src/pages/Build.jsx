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
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);

  const selectedProduct = products.find((p) => p.id === Number(productId));
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  async function handleCreateProduct() {
    if (!formData.name.trim()) {
      setMessage('Product name cannot be empty');
      return;
    }
    try {
      const { data } = await api.post('/api/products', { name: formData.name });
      setProducts([...products, data]);
      setFormData({ name: '' });
      setShowModal(false);
      setMessage('Product created successfully');
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Failed to create product');
    }
  }

  async function handleUpdateProduct() {
    if (!formData.name.trim()) {
      setMessage('Product name cannot be empty');
      return;
    }
    try {
      const { data } = await api.put(`/api/products/${editingId}`, { name: formData.name });
      setProducts(products.map((p) => (p.id === editingId ? data : p)));
      setFormData({ name: '' });
      setEditingId(null);
      setShowModal(false);
      setMessage('Product updated successfully');
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Failed to update product');
    }
  }

  async function handleDeleteProduct(id) {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/api/products/${id}`);
        setProducts(products.filter((p) => p.id !== id));
        setMessage('Product deleted successfully');
      } catch (err) {
        setMessage(err?.response?.data?.message || 'Failed to delete product');
      }
    }
  }

  function openCreateModal() {
    setModalType('create');
    setFormData({ name: '' });
    setEditingId(null);
    setShowModal(true);
  }

  function openEditModal(product) {
    setModalType('edit');
    setFormData({ name: product.name });
    setEditingId(product.id);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setFormData({ name: '' });
    setEditingId(null);
  }

  function handleModalSubmit() {
    if (modalType === 'create') {
      handleCreateProduct();
    } else if (modalType === 'edit') {
      handleUpdateProduct();
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
            <label className="form-label">Search Product</label>
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input search-input"
              />
              {searchTerm && filteredProducts.length > 0 && (
                <div className="search-dropdown">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="search-dropdown-item"
                      onClick={() => {
                        setProductId(String(p.id));
                        setSearchTerm('');
                        setResult(null);
                      }}
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="btn btn-secondary" onClick={openCreateModal}>
              ➕ Add Product
            </button>
          </div>

          {productId && (
            <div className="selected-product-display">
              <span className="selected-label">Selected:</span>
              <span className="selected-name">{selectedProduct?.name || 'Loading...'}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Desired quantity</label>
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

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{modalType === 'create' ? 'Create Product' : 'Edit Product'}</h2>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    placeholder="Enter product name"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary" onClick={handleModalSubmit}>
                  {modalType === 'create' ? 'Create' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
