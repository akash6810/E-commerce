import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import './EditProduct.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setName(data.name || '');
        setPrice(data.price || '');
        setCategory(data.category || '');
        // Pre-fill previous description, fallback to empty string if not previously stored
        setDescription(data.description || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product details');
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('description', description);
    if (image) {
      formData.append('image', image);
    }

    try {
      await API.put(`/products/${id}`, formData);
      setMessage('Product updated successfully!');
      setTimeout(() => navigate('/my-products'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loader">Loading product details...</div>;

  return (
    <div className="edit-product-container">
      <form className="edit-product-form" onSubmit={handleSubmit}>
        <h2>Update Product</h2>
        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}

        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Price (₹)</label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        {/* Previous description box */}
        <div className="form-group">
          <label>Description</label>
          <textarea
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description..."
            required
          />
        </div>

        <div className="form-group">
          <label>Replace Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Updating...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;