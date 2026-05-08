import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types';
import { ShoppingBag, Eye, CheckCircle, Truck, Package, XCircle, Clock, ExternalLink, CreditCard, ArrowLeft, X } from 'lucide-react';
import { formatINR } from '../lib/utils';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err) {
      console.error(err);
      alert("Status sync failed");
    }
  };

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-600';
      case 'verified': return 'bg-purple-100 text-purple-600';
      case 'shipped': return 'bg-blue-100 text-blue-600';
      case 'delivered': return 'bg-green-100 text-green-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-aesthetic-gray text-aesthetic-dark/40';
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-[10px] font-black text-aesthetic-dark/30 hover:text-aesthetic-lavender transition-colors uppercase tracking-[0.3em] mb-4"
          >
            <ArrowLeft size={14} />
            Back to Console
          </button>
          <h2 className="text-5xl font-black text-aesthetic-dark tracking-tighter flex items-center gap-4">
            <ShoppingBag className="text-aesthetic-lavender" size={40} />
            Order Registry
          </h2>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <p className="text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-[0.2em] mb-1">Pending Pulse</p>
            <p className="text-2xl font-black text-amber-500">{orders.filter(o => o.status === 'pending').length}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-[0.2em] mb-1">Total Flow</p>
            <p className="text-2xl font-black text-aesthetic-dark">{orders.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center font-black text-aesthetic-dark/20 uppercase tracking-[0.3em]">Synching Data Stream...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="bento-card p-8 flex flex-col md:flex-row items-center gap-8 hover:border-aesthetic-lavender transition-all"
            >
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${getStatusStyle(order.status)}`}>
                <ShoppingBag size={24} />
              </div>
              
              <div className="flex-grow space-y-2">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-aesthetic-dark tracking-tight">{order.customer.name}</h3>
                  <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs font-bold text-aesthetic-dark/40 uppercase tracking-widest">
                  ID: {order.id} // {order.createdAt?.seconds ? format(order.createdAt.seconds * 1000, 'MMM dd, yyyy HH:mm') : 'New Transition'}
                </p>
              </div>

              <div className="text-2xl font-black text-aesthetic-lavender">
                {formatINR(order.total)}
              </div>

              <button 
                onClick={() => setSelectedOrder(order)}
                className="bg-white border-2 border-aesthetic-dark text-aesthetic-dark px-8 py-4 rounded-full font-black hover:bg-aesthetic-dark hover:text-white transition-all soft-shadow flex items-center gap-3"
              >
                <Eye size={18} />
                Analyze
              </button>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="py-24 text-center font-bold text-aesthetic-dark/20 uppercase tracking-[0.3em] italic">
              No Requisitions Detected
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-aesthetic-dark/60 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-aesthetic-cream w-full max-w-5xl rounded-[3rem] p-12 overflow-y-auto max-h-[90vh] soft-shadow border border-white">
            <div className="flex justify-between items-start mb-12 border-b border-aesthetic-gray pb-8">
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-aesthetic-dark tracking-tighter flex items-center gap-4">
                  <Package size={32} className="text-aesthetic-lavender" />
                  Order Pulse Report
                </h3>
                <p className="text-xs font-black text-aesthetic-dark/30 uppercase tracking-widest">Identifier: {selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-12 h-12 rounded-full bg-aesthetic-gray flex items-center justify-center hover:bg-aesthetic-lavender hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-12">
                <section className="space-y-6">
                  <h4 className="text-[10px] font-black text-aesthetic-dark/30 tracking-[0.3em] uppercase flex items-center gap-3">
                    <Truck size={14} />
                    Logistics Destination
                  </h4>
                  <div className="bento-card p-8 bg-white/50 space-y-4 text-sm">
                    <p className="text-xl font-black text-aesthetic-lavender">{selectedOrder.customer.name}</p>
                    <div className="grid grid-cols-2 gap-4 text-aesthetic-dark/60 font-bold">
                      <p>{selectedOrder.customer.mobile}</p>
                      <p>{selectedOrder.customer.email}</p>
                    </div>
                    <p className="text-aesthetic-dark/80 font-medium leading-relaxed">{selectedOrder.customer.address}</p>
                    <p className="font-black text-aesthetic-dark">{selectedOrder.customer.city}, {selectedOrder.customer.pincode}</p>
                  </div>
                </section>

                <section className="space-y-6">
                  <h4 className="text-[10px] font-black text-aesthetic-dark/30 tracking-[0.3em] uppercase flex items-center gap-3">
                    <Package size={14} />
                    Cargo Manifest
                  </h4>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-4 rounded-3xl border border-aesthetic-gray">
                        <div className="space-y-1">
                          <p className="font-black text-aesthetic-dark">{item.name}</p>
                          <p className="text-[10px] font-bold text-aesthetic-dark/40 uppercase">Qty: {item.quantity} // Rate: {formatINR(item.price)}</p>
                        </div>
                        <span className="font-black text-aesthetic-lavender">{formatINR(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-8 border-t border-aesthetic-gray">
                      <span className="text-[10px] font-black text-aesthetic-dark/30 tracking-widest uppercase">Total Valuation</span>
                      <span className="text-3xl font-black text-aesthetic-lavender">{formatINR(selectedOrder.total)}</span>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-12">
                <section className="space-y-6">
                  <h4 className="text-[10px] font-black text-aesthetic-dark/30 tracking-[0.3em] uppercase flex items-center gap-3">
                    <CreditCard size={14} />
                    Payment Evidence
                  </h4>
                  <div className="aspect-[4/3] bg-white rounded-[2rem] border-2 border-aesthetic-gray p-4 flex items-center justify-center overflow-hidden soft-shadow group relative">
                    {selectedOrder.paymentScreenshot ? (
                      <>
                        <img src={selectedOrder.paymentScreenshot} alt="Payment Proof" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        <a 
                          href={selectedOrder.paymentScreenshot} 
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute inset-0 bg-aesthetic-lavender/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white font-black uppercase text-xs tracking-widest gap-2"
                        >
                          <ExternalLink size={20} />
                          Expand View
                        </a>
                      </>
                    ) : (
                      <div className="text-red-500 font-black uppercase text-xs tracking-widest opacity-20">Evidence Void</div>
                    )}
                  </div>
                </section>

                <section className="space-y-6">
                  <h4 className="text-[10px] font-black text-aesthetic-dark/30 tracking-[0.3em] uppercase flex items-center gap-3">
                    <Clock size={14} />
                    Status Transition
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { status: 'verified', label: 'Verify', icon: CheckCircle },
                      { status: 'shipped', label: 'Ship', icon: Truck },
                      { status: 'delivered', label: 'Deliver', icon: CheckCircle },
                      { status: 'cancelled', label: 'Void', icon: XCircle },
                    ].map((btn) => (
                      <button 
                        key={btn.status}
                        onClick={() => updateStatus(selectedOrder.id, btn.status as OrderStatus)}
                        className={`flex items-center justify-center gap-3 py-5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${
                          selectedOrder.status === btn.status 
                            ? 'bg-aesthetic-lavender text-white shadow-lg' 
                            : 'bg-white border-2 border-aesthetic-gray text-aesthetic-dark/40 hover:border-aesthetic-lavender hover:text-aesthetic-lavender'
                        }`}
                      >
                        <btn.icon size={16} />
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
