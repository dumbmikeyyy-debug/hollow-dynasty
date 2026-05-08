import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, Menu, X, LogIn, LogOut } from 'lucide-react';
import { auth, signInWithGoogle } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { CartItem } from '../hooks/useCart';
import { cn } from '../lib/utils';
import CartDrawer from './CartDrawer';

interface NavbarProps {
  cart: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  total: number;
  onCartOpen: () => void;
}

export default function Navbar({ cart, removeFromCart, updateQuantity, total, onCartOpen }: NavbarProps) {
  const [user] = useAuthState(auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-aesthetic-gray">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-aesthetic-lavender rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="text-xl font-black tracking-tight text-aesthetic-dark hidden md:block">
              THE HOLLOW <span className="text-aesthetic-lavender">DYNASTY</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-12 text-sm font-semibold tracking-tight">
            <Link to="/" className="text-aesthetic-dark/70 hover:text-aesthetic-lavender transition-colors">Shop</Link>
            <Link to="/orders" className="text-aesthetic-dark/70 hover:text-aesthetic-lavender transition-colors">History</Link>
            
            <div className="flex items-center space-x-6">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-aesthetic-dark/40 font-medium">{user.email?.split('@')[0]}</span>
                  <button onClick={() => auth.signOut()} className="text-aesthetic-dark/60 hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={signInWithGoogle} 
                  className="bg-aesthetic-lavender/10 text-aesthetic-lavender px-6 py-3 rounded-full hover:bg-aesthetic-lavender hover:text-white transition-all font-bold"
                >
                  Sign In
                </button>
              )}
              
              <button 
                onClick={onCartOpen}
                className="relative p-3 bg-aesthetic-gray rounded-full hover:bg-aesthetic-lavender/10 transition-all text-aesthetic-dark"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-aesthetic-lavender text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-black shadow-lg">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={onCartOpen} className="relative p-2">
              <ShoppingCart size={22} className="text-aesthetic-dark" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-aesthetic-lavender text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/10 p-4 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-4 font-mono text-center">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="py-2">SHOP</Link>
            {user ? (
              <button onClick={() => auth.signOut()} className="py-2 text-cyber-magenta">LOGOUT</button>
            ) : (
              <button onClick={signInWithGoogle} className="py-2 text-cyber-cyan">LOGIN</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
