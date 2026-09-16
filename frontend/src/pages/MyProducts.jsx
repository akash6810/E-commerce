import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import './ProductList.css';

const MyProducts = () => {
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchMyProducts = async () => {
    try {
      const { data } = await API.get('/products');
      const userItems = data.filter((item) => {
        const ownerId = item.user?._id || item.user;
        return ownerId === user?._id;
      });
      setMyProducts(userItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyProducts();
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      setMyProducts((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) return <div className="loader">Loading your products...</div>;

  return (
    <div className="product-container">
      <h2>My Listed Products</h2>
      {myProducts.length === 0 ? (
        <p className="empty-message">You haven't posted any products yet.</p>
      ) : (
        <div className="product-grid">
          {myProducts.map((item) => (
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
                <p className="price">${item.price}</p>
                <span className="badge">{item.category}</span>

                {/* Action Buttons: Edit and Delete */}
                <div className="card-actions">
                  <button
                    onClick={() => navigate(`/update-product/${item._id}`)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;