import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signInWithGoogle } from '../lib/firebase';
import { LogIn, Database, ShoppingBag, LayoutDashboard, LogOut, ShieldAlert, Tag } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import ProductManager from './ProductManager';
import OrderManager from './OrderManager';
import CategoryManager from './CategoryManager';

const ADMIN_EMAIL = 'dumb.mikeyyy@gmail.com';

export default function Admin() {
  const [user, loading] = useAuthState(auth);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user && user.email === ADMIN_EMAIL;

  if (loading) return <div className="h-96 flex items-center justify-center font-bold text-aesthetic-dark/40 uppercase tracking-widest">AUTHENTICATING...</div>;

  if (!user) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-aesthetic-lavender/10 rounded-full flex items-center justify-center text-aesthetic-lavender animate-pulse">
          <ShieldAlert size={40} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black text-aesthetic-dark tracking-tighter uppercase">Access Restricted</h2>
          <p className="text-aesthetic-dark/40 text-xs font-bold uppercase tracking-widest">Credentials Required for Override</p>
        </div>
        <button 
          onClick={signInWithGoogle}
          className="bg-aesthetic-lavender text-white font-black px-12 py-5 rounded-full hover:bg-aesthetic-dark transition-all soft-shadow text-lg flex items-center gap-3"
        >
          <LogIn size={20} />
          Authorize Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500">
          <ShieldAlert size={40} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black text-red-500 tracking-tighter uppercase">Denied</h2>
          <p className="text-aesthetic-dark/40 text-xs font-bold uppercase tracking-widest">Account [{user.email}] not in registry</p>
        </div>
        <button 
          onClick={() => auth.signOut()}
          className="text-aesthetic-dark/40 border border-aesthetic-gray px-8 py-3 rounded-full uppercase text-[10px] font-black hover:text-aesthetic-dark transition-all"
        >
          Switch Identity
        </button>
      </div>
    );
  }

  const navItems = [
    { label: 'DASHBOARD', path: '/admin', icon: LayoutDashboard },
    { label: 'PRODUCTS', path: '/admin/products', icon: Database },
    { label: 'CATEGORIES', path: '/admin/categories', icon: Tag },
    { label: 'ORDERS', path: '/admin/orders', icon: ShoppingBag },
  ];

  return (
    <div className="pt-8 w-full max-w-6xl mx-auto">
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/products" element={<ProductManager />} />
          <Route path="/categories" element={<CategoryManager />} />
          <Route path="/orders" element={<OrderManager />} />
        </Routes>
      </div>
    </div>
  );
}
