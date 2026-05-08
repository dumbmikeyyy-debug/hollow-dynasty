import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Order } from '../types';
import { AlertTriangle, TrendingUp, ShoppingBag, Package, Plus, Clock, Users, Bell, Tag } from 'lucide-react';
import { formatINR } from '../lib/utils';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubProds = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });
    
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    });
    
    return () => { unsubProds(); unsubOrders(); };
  }, []);

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.total, 0);
  
  const lowStockCount = products.filter(p => p.stock <= 5).length;
  const recentOrders = orders.slice(0, 5);

  const stats = [
    { label: 'REVENUE', value: formatINR(totalRevenue), icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-100' },
    { label: 'ORDERS', value: orders.length, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-100' },
    { label: 'LOW STOCK', value: lowStockCount, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100' },
    { label: 'CATALOG', value: products.length, icon: Package, color: 'text-purple-500', bg: 'bg-purple-100' },
  ];

  if (loading) return <div className="h-96 flex items-center justify-center font-black text-aesthetic-dark/30 uppercase tracking-[0.3em]">Synching Central Node...</div>;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-aesthetic-dark tracking-tighter">Admin Console</h1>
          <p className="text-aesthetic-dark/50 font-medium text-lg italic">Welcome back! Here's the pulse of your sanctuary today.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-3 bg-white border-2 border-aesthetic-dark px-6 py-4 rounded-full font-black text-aesthetic-dark hover:bg-aesthetic-gray transition-all soft-shadow"
          >
            <Clock size={20} />
            Manage Orders
          </button>
          <button 
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-3 bg-aesthetic-lavender text-white px-8 py-4 rounded-full font-black hover:bg-aesthetic-dark transition-all soft-shadow"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bento-card p-10 space-y-6 group hover:scale-[1.02] transition-transform">
            <div className={`w-16 h-16 ${stat.bg} rounded-3xl flex items-center justify-center ${stat.color} transition-transform group-hover:rotate-12`}>
              <stat.icon size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-[0.3em] mb-2 leading-none">{stat.label}</p>
              <p className="text-4xl font-black text-aesthetic-dark leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-12 items-start">
        {/* Recent Activity */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <h2 className="text-4xl font-black text-aesthetic-dark tracking-tighter">Recent Activity</h2>
            <Link to="/admin/orders" className="text-aesthetic-lavender font-black text-xs uppercase tracking-widest hover:underline">View History</Link>
          </div>
          
          <div className="bg-aesthetic-gray/20 rounded-[2.5rem] border border-aesthetic-gray p-4">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-[0.2em] text-left">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Amount</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aesthetic-gray">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-white transition-colors rounded-2xl">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-aesthetic-lavender/10 rounded-full flex items-center justify-center text-aesthetic-lavender font-black text-sm uppercase">
                          {order.customer.name.charAt(0)}
                        </div>
                        <span className="font-black text-aesthetic-dark">{order.customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'completed' ? 'bg-green-100 text-green-600' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="font-black text-aesthetic-dark">{formatINR(order.total)}</span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <span className="text-xs font-bold text-aesthetic-dark/40 uppercase">
                        {order.createdAt?.seconds ? format(order.createdAt.seconds * 1000, 'MMM dd, HH:mm') : 'Just now'}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-20 text-center font-bold text-aesthetic-dark/20 uppercase tracking-widest italic">
                      No Recent Pulse Detected
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Actions Panel */}
        <div className="bg-aesthetic-dark rounded-[3rem] p-10 text-white space-y-12 soft-shadow">
          <h2 className="text-4xl font-black tracking-tighter">Quick Actions</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <button 
              onClick={() => navigate('/admin/products')}
              className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-white/10 transition-all group"
            >
              <div className="w-12 h-12 bg-aesthetic-lavender/20 rounded-2xl flex items-center justify-center text-aesthetic-lavender group-hover:scale-110 transition-transform">
                <Tag size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Products</span>
            </button>
            
            <button 
              onClick={() => navigate('/admin/categories')}
              className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-white/10 transition-all group"
            >
              <div className="w-12 h-12 bg-aesthetic-lavender/20 rounded-2xl flex items-center justify-center text-aesthetic-lavender group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Category</span>
            </button>
            
            <button className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 bg-aesthetic-lavender/20 rounded-2xl flex items-center justify-center text-aesthetic-lavender group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Clients</span>
            </button>
            
            <button className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 bg-aesthetic-lavender/20 rounded-2xl flex items-center justify-center text-aesthetic-lavender group-hover:scale-110 transition-transform">
                <AlertTriangle size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Alerts</span>
            </button>
          </div>

          <div className="pt-12 border-t border-white/10 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Inventory Monitor</h3>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
              <p className="text-sm font-bold text-aesthetic-lavender italic">Inventory is flourishing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
