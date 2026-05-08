import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import UserOrders from './pages/UserOrders';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import { useCart } from './hooks/useCart';

function MainLayout() {
  const navigate = useNavigate();
  const cartProps = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'a') {
        navigate('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar {...cartProps} onCartOpen={() => setIsCartOpen(true)} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home {...cartProps} />} />
          <Route path="/product/:id" element={<ProductDetail {...cartProps} />} />
          <Route path="/checkout" element={<Checkout {...cartProps} />} />
          <Route path="/orders" element={<UserOrders />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </main>
      <footer className="py-8 border-t border-white/10 text-center text-sm text-white/40">
        <p>&copy; 2026 THE HOLLOW DYNASTY. ALL RIGHTS RESERVED.</p>
        <p className="mt-2 font-mono">EST. 2026 // NEO-TOKYO_DISTRICT_7</p>
      </footer>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        cart={cartProps.cart}
        removeFromCart={cartProps.removeFromCart}
        updateQuantity={cartProps.updateQuantity}
        total={cartProps.total}
      />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}
