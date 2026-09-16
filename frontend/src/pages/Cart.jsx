import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartSubtotal } =
    useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  const [address, setAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    phone: '',
  });

  const shipping = cartSubtotal > 0 ? (cartSubtotal > 500 ? 0 : 25) : 0;
  const orderTotal = cartSubtotal + shipping;

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/payment/my-orders');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const handleOpenCheckout = () => {
    if (!user) {
      alert('Please log in to proceed to checkout.');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    setShowAddressModal(true);
  };

  const handleExecutePayment = async (e) => {
    e.preventDefault();
    setShowAddressModal(false);
    setLoading(true);

    try {
      const { data: orderData } = await API.post('/payment/create-order', {
        amount: orderTotal,
      });

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShopHub',
        description: 'Order Payment',
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await API.post('/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: cartItems.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                imageUrl: item.imageUrl,
              })),
              shippingAddress: {
                address: address.street,
                city: address.city,
                postalCode: address.postalCode,
                phone: address.phone,
              },
              totalAmount: orderTotal,
            });

            if (verifyRes.data.success) {
              alert('Payment Successful! A confirmation email has been dispatched.');
              clearCart();
              fetchOrders();
              setShowOrdersModal(true);
            }
          } catch (err) {
            alert(err.response?.data?.message || 'Payment verification failed.');
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: address.phone || '9999999999',
        },
        theme: { color: '#244e5a' },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      alert(err.response?.data?.message || 'Error initiating payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-page-container">
      <div className="cart-header-row">
        <h2>Your Cart ({cartItems.length} items)</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowOrdersModal(true)} className="btn-order-status">
            📦 Check Status of Your Orders ({orders.length})
          </button>
          {cartItems.length > 0 && (
            <button onClick={clearCart} className="btn-clear-cart">
              Clear All
            </button>
          )}
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty-container">
          <h2>Your Cart is Empty</h2>
          <p>You have no pending items in your cart.</p>
          <button onClick={() => navigate('/')} className="btn-shop-now">Start Shopping</button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item-row">
                <div className="cart-item-image">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <div className="cart-no-img">No Img</div>}
                </div>
                <div className="cart-item-details">
                  <Link to={`/product/${item._id}`} className="cart-item-name">{item.name}</Link>
                  <span className="cart-item-category">{item.category}</span>
                  <span className="cart-item-unit-price">₹{item.price} each</span>
                </div>
                <div className="cart-quantity-box">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                </div>
                <div className="cart-item-total">₹{(Number(item.price) * item.quantity).toFixed(2)}</div>
                <button onClick={() => removeFromCart(item._id)} className="btn-remove-item">✕</button>
              </div>
            ))}
          </div>

          <div className="cart-summary-card">
            <h3>Order Summary</h3>
            <div className="summary-line">
              <span>Subtotal</span>
              <span>₹{cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Estimated Shipping</span>
              <span>{shipping === 0 ? '₹0.00' : `₹${shipping.toFixed(2)}`}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-line total-line">
              <span>Total</span>
              <span>₹{orderTotal.toFixed(2)}</span>
            </div>
            <button onClick={handleOpenCheckout} className="btn-checkout" disabled={loading}>
              {loading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 1: Address Dialog --- */}
      {showAddressModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Shipping Address</h3>
            <form onSubmit={handleExecutePayment}>
              <input
                type="text"
                placeholder="Street Address"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Postal / ZIP Code"
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="10-digit Phone Number"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                pattern="[0-9]{10}"
                required
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddressModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-confirm">
                  Pay Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Orders Status Viewer --- */}
      {showOrdersModal && (
        <div className="modal-backdrop">
          <div className="modal-content orders-modal">
            <div className="orders-header">
              <h3>Check Status of Your Orders</h3>
              <button onClick={() => setShowOrdersModal(false)} className="btn-close">✕</button>
            </div>
            {orders.length === 0 ? (
              <p>No orders placed yet.</p>
            ) : (
              <div className="orders-scroll-list">
                {orders.map((o) => (
                  <div key={o._id} className="order-status-card">
                    <div className="order-card-meta">
                      <span><strong>Order ID:</strong> {o.orderId}</span>
                      <span className="order-badge">{o.status}</span>
                    </div>
                    <p className="delivery-highlight">
                      🚚 <strong>Delivery Window:</strong> {new Date(o.createdAt).toLocaleDateString()} to {new Date(o.expectedDeliveryDate).toLocaleDateString()} (within 1 week)
                    </p>
                    <div className="order-items-mini">
                      {o.items.map((it, idx) => (
                        <div key={idx} className="mini-item">
                          {it.imageUrl && <img src={it.imageUrl} alt={it.name} />}
                          <div>
                            <p>{it.name}</p>
                            <small>Qty: {it.quantity} | ₹{it.price}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="order-total-text">Total Paid: ₹{o.totalAmount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;