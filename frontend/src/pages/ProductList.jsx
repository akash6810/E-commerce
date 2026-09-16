import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products');
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
  if (!user) {
    alert('Please log in to add items to your cart.');
    navigate('/login', { state: { from: window.location.pathname } });
    return;
  }

  addToCart(product);
};

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  if (loading) return <div className="loader">Loading products...</div>;

  return (
    <div className="product-container">
      <div className="product-header">
        <h2>Available Items</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="empty-message">No matching products found.</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((item) => (
            <div key={item._id} className="product-card">
              <div className="image-wrapper">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="product-info">
                <h3>{item.name}</h3>
                <p className="price">₹{item.price}</p>
                <span className="badge">{item.category}</span>
                <p className="seller">Added by: {item.user?.name || 'Unknown'}</p>

                {/* --- BUTTONS SECTION --- */}
                <div className="card-actions">
                  <button
                    onClick={() => navigate(`/product/${item._id}`)}
                    className="btn-details"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="btn-add-cart"
                  >
                    Add to Cart
                  </button>

                  {user && item.user && user._id === (item.user._id || item.user) && (
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;