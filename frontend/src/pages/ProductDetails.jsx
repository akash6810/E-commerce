import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error('Failed to fetch product details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Determine if the current viewer created this product
  const ownerId = product?.user?._id || product?.user;
  const isOwner = Boolean(user && ownerId && user._id === ownerId);

  const handleAddToCart = () => {
  if (!user) {
    alert('Please log in to add items to your cart.');
    navigate('/login', { state: { from: location.pathname } });
    return;
  }

  addToCart(product, quantity);
};

  const handleBuyNow = () => {
  if (!user) {
    alert('Please log in to proceed to checkout.');
    navigate('/login', { state: { from: location.pathname } });
    return;
  }

  addToCart(product, quantity);
  navigate('/cart');
};

  if (loading) return <div className="loader">Loading product details...</div>;
  if (!product) return <div className="loader">Product not found.</div>;

  return (
    <div className="details-container">
      <button onClick={() => navigate(-1)} className="btn-back">
        ← Back to Browse
      </button>

      <div className="details-card">
        <div className="details-image-section">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <div className="details-no-image">No Image Available</div>
          )}
        </div>

        <div className="details-info-section">
          <span className="details-category">{product.category}</span>
          <h1 className="details-title">{product.name}</h1>
          <p className="details-price">₹{product.price}</p>

          <div className="details-divider" />

          <h3>Overview</h3>
          <p className="details-description">
            {product.description || 'No description provided for this product.'}
          </p>

          <div className="details-seller-info">
            <span>Verified Seller: </span>
            <strong>
              {isOwner ? 'You (Owner)' : product.user?.name || 'Member'}
            </strong>
          </div>

          {/* Conditional rendering based on ownership */}
          {isOwner ? (
            <div className="owner-notice-box">
              <p className="owner-notice-text">
                ℹ️ You listed this item. Product owners cannot purchase or add their own items to the cart.
              </p>
              <button
                type="button"
                onClick={() => navigate(`/update-product/${product._id}`)}
                className="btn-owner-edit"
              >
                Edit Listing
              </button>
            </div>
          ) : (
            <>
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="details-actions">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="btn-add-cart"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="btn-buy-now"
                >
                  Buy Now
                </button>
              </div>

              {addedMessage && (
                <div className="cart-toast">✓ Added to your cart successfully!</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;