import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Order } from '../types';
import { Package, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { formatINR } from '../lib/utils';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function UserOrders() {
  const [user] = useAuthState(auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('customer.email', '==', user.email),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="h-96 flex flex-col items-center justify-center font-mono space-y-4">
        <ShieldCheck size={48} className="text-cyber-cyan opacity-20" />
        <p className="opacity-40 uppercase">AUTHENTICATION_REQUIRED_FOR_HISTORY</p>
      </div>
    );
  }

  if (loading) return <div className="h-96 flex items-center justify-center font-mono opacity-50 uppercase">FETCHING_ORDER_HISTORY...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold uppercase tracking-widest flex items-center gap-4">
          <Package className="text-cyber-cyan" />
          MY_HISTORY
        </h1>
        <div className="font-mono text-xs text-white/40 uppercase">USER: {user.email}</div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 font-mono text-white/20 uppercase">
          NO_TRANSACTIONS_DETECTED_IN_THIS_NODE
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="glass-panel p-6 cyber-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-white/40 uppercase">{order.id}</span>
                  <span className={`text-[9px] px-2 py-0.5 border font-mono uppercase ${order.status === 'pending' ? 'text-amber-500 border-amber-500/20' : 'text-cyber-cyan border-cyber-cyan/20'}`}>
                    {order.status}
                  </span>
                </div>
                <h3 className="font-bold uppercase tracking-wider">{order.items.length} COMPONENT_PACKS</h3>
                <p className="font-mono text-[9px] text-white/20">
                  {order.createdAt?.seconds ? format(order.createdAt.seconds * 1000, 'PPPP') : 'SYNCING...'}
                </p>
              </div>
              
              <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <p className="text-[10px] font-mono text-white/40 uppercase">INVESTMENT</p>
                  <p className="font-bold neon-text-cyan">{formatINR(order.total)}</p>
                </div>
                <div className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-cyber-cyan transition-colors">
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
