import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Navbar from './components/Navbar';
import ProductList from './pages/ProductList';
import Login from './pages/Login';
import Register from './pages/Register';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import MyProducts from './pages/MyProducts'; // <-- 1. IMPORT
import { AuthContext } from './context/AuthContext';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import './App.css';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/add-product" element={user ? <AddProduct /> : <Navigate to="/login" />} />
          <Route path="/update-product/:id" element={user ? <EditProduct /> : <Navigate to="/login" />} />
          {/* 2. PROTECTED MY-PRODUCTS ROUTE */}
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/my-products" element={user ? <MyProducts /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;