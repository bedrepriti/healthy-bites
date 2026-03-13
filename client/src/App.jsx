// Healthy Bites - Main Application Router
// Author: Priti Bedre

import { Routes, Route } from "react-router-dom";
import Footer from "./components/common/Footer";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import TrackOrder from "./pages/TrackOrder";
import Contact from "./pages/Contact";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";

import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <CartProvider>
      {/* Main Page Layout */}
      <div className="page-wrapper">

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/products" element={<AdminProducts />} />

          {/* Fallback Route */}
          <Route
            path="*"
            element={
              <div style={{ padding: 40, textAlign: "center" }}>
                <h2>404 - Page Not Found</h2>
                <p>This page does not exist.</p>
              </div>
            }
          />
        </Routes>

        {/* Global Footer */}
        <Footer />

      </div>
    </CartProvider>
  );
}

export default App;