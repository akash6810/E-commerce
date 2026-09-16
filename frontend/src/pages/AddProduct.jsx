import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import './AddProduct.css';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Package text and file into FormData
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('description', description);
    if (image) {
      formData.append('image', image);
    }

    try {
      await API.post('/products', formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <form className="product-form" onSubmit={handleSubmit}>
        <h2>Add New Product</h2>
        {error && <p className="form-error">{error}</p>}

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
        <div className="form-group">
          <label>Description</label>
          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write detailed specifications or highlights..."
            required
          />
        </div>
        <div className="form-group">
          <label>Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;