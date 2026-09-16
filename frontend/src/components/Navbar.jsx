import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const totalCartCount = cartItems?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  const handleCartClick = (e) => {
    if (!user) {
      e.preventDefault();
      alert('Please log in to view your cart.');
      navigate('/login', { state: { from: '/cart' } });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">ShopHub</Link>
      </div>

      <div className="navbar-links">
        <Link to="/" className="nav-item">Products</Link>

        {/* Cart Link */}
        <Link to="/cart" onClick={handleCartClick} className="nav-item">
          🛒 Cart ({user ? totalCartCount : 0})
        </Link>

        {user ? (
          <>
            <Link to="/my-products" className="nav-item">My Products</Link>
            <Link to="/add-product" className="nav-item">Add Product</Link>

            <Link to="/profile" className="nav-profile-link" title="My Profile">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="nav-avatar" />
              ) : (
                <div className="nav-avatar-placeholder">
                  {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </div>
              )}
            </Link>

            <button onClick={logoutUser} className="btn-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-item">Login</Link>
            <Link to="/register" className="btn-register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;