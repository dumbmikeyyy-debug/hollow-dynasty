import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../hooks/useCart';
import { formatINR } from '../lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  total: number;
}

export default function CartDrawer({ isOpen, onClose, cart, removeFromCart, updateQuantity, total }: CartDrawerProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-aesthetic-dark/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-aesthetic-cream z-[70] flex flex-col shadow-2xl"
          >
            <div className="p-8 flex items-center justify-between border-b border-aesthetic-gray">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-aesthetic-dark tracking-tighter">Your Sanctuary</h2>
                <p className="text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-[0.2em] leading-none">Assemble your Space</p>
              </div>
              <button onClick={onClose} className="p-3 bg-aesthetic-gray rounded-full hover:bg-aesthetic-lavender hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-8 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                  <div className="w-20 h-20 bg-aesthetic-gray rounded-full flex items-center justify-center">
                    <ShoppingBag size={32} />
                  </div>
                  <p className="font-bold uppercase tracking-widest text-xs">Vessel Is Empty</p>
                  <button 
                    onClick={onClose}
                    className="text-aesthetic-lavender border border-aesthetic-lavender px-6 py-2 rounded-full hover:bg-aesthetic-lavender hover:text-white transition-all font-bold text-xs"
                  >
                    Explore Shop
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bento-card p-4 flex gap-4 border-aesthetic-gray/50 items-center">
                    <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-grow space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-black text-sm text-aesthetic-dark leading-tight line-clamp-1">{item.name}</h3>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-aesthetic-dark/20 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-aesthetic-lavender font-black text-sm">{formatINR(item.price)}</p>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center bg-aesthetic-gray rounded-full p-1">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white rounded-full text-aesthetic-dark hover:bg-aesthetic-lavender hover:text-white transition-all soft-shadow"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center font-black text-xs">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white rounded-full text-aesthetic-dark hover:bg-aesthetic-lavender hover:text-white transition-all soft-shadow"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 border-t border-aesthetic-gray bg-white space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-[0.2em] leading-none mb-1">Total Investment</span>
                  <span className="text-3xl font-black text-aesthetic-dark leading-none">{formatINR(total)}</span>
                </div>
                <button 
                  onClick={() => {
                    onClose();
                    navigate('/checkout');
                  }}
                  className="w-full bg-aesthetic-lavender text-white font-black py-5 rounded-full hover:bg-aesthetic-dark transition-all soft-shadow text-lg flex items-center justify-center gap-3"
                >
                  Assemble Sanctuary
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
