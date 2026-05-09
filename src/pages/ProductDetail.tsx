import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { formatINR } from '../lib/utils';
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, Zap, Star, Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductDetailProps {
  addToCart: (product: Product, quantity: number) => void;
}

export default function ProductDetail({ addToCart }: ProductDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  if (loading) return <div className="h-96 flex items-center justify-center font-black text-aesthetic-dark/40 uppercase tracking-[0.2em]">Initialising_Aesthetic...</div>;
  if (!product) return <div className="h-96 flex items-center justify-center font-black text-red-500 uppercase tracking-widest">Entry_Not_Found</div>;

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-aesthetic-dark/40 hover:text-aesthetic-lavender transition-colors uppercase tracking-widest"
      >
        <ArrowLeft size={16} />
        Back to Gallery
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Image Gallery */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bento-card aspect-square border-aesthetic-gray overflow-hidden"
          >
            <img 
              src={product.images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, i) => (
              <button 
                key={i}
                onClick={() => setActiveImage(i)}
                className={`bento-card aspect-square transition-all ${activeImage === i ? 'ring-4 ring-aesthetic-lavender border-transparent scale-95' : 'opacity-40 hover:opacity-100'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-10 py-4">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-aesthetic-lavender/10 rounded-full text-aesthetic-lavender text-[10px] font-black uppercase tracking-widest shadow-sm">
              <Zap size={14} />
              Authenticated Gear
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-aesthetic-dark tracking-tighter leading-[0.8]">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 text-sm font-bold text-aesthetic-dark/40 italic">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <span className="uppercase tracking-[0.2em] leading-none">(Voted #1 Best Seller)</span>
            </div>

            <div className="flex items-baseline gap-4 mt-2">
              {hasDiscount ? (
                <>
                  <span className="text-4xl font-black text-aesthetic-dark">{formatINR(product.discountPrice!)}</span>
                  <span className="text-xl text-aesthetic-dark/30 font-bold line-through">{formatINR(product.price)}</span>
                </>
              ) : (
                <span className="text-4xl font-black text-aesthetic-dark">{formatINR(product.price)}</span>
              )}
            </div>

            <p className="text-aesthetic-dark/60 text-lg leading-relaxed font-medium">
              {product.description}
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-8">
              <div className="flex items-center bg-aesthetic-gray rounded-full p-2">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-aesthetic-dark hover:bg-aesthetic-lavender hover:text-white transition-all soft-shadow disabled:opacity-30"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-black text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-aesthetic-dark hover:bg-aesthetic-lavender hover:text-white transition-all soft-shadow"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest leading-none">
                Stock: {product.stock} units
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                disabled={product.stock === 0}
                onClick={() => addToCart(product, quantity)}
                className="flex-grow bg-aesthetic-lavender text-white font-black px-10 py-5 rounded-full hover:bg-aesthetic-dark transition-all soft-shadow text-lg flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                Add to Sanctuary
              </button>
              <button 
                disabled={product.stock === 0}
                onClick={() => {
                  addToCart(product, quantity);
                  navigate('/checkout');
                }}
                className="flex-grow bg-aesthetic-dark text-white font-black px-10 py-5 rounded-full hover:bg-aesthetic-lavender transition-all soft-shadow text-lg flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bento-card flex items-center gap-4 group">
                <div className="w-12 h-12 bg-aesthetic-gray rounded-full flex items-center justify-center text-aesthetic-lavender group-hover:bg-aesthetic-lavender group-hover:text-white transition-all">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest leading-none mb-1">Protection</h4>
                  <p className="font-black text-aesthetic-dark">Lifetime Assurance</p>
                </div>
              </div>
              <div className="p-6 bento-card flex items-center gap-4 group">
                <div className="w-12 h-12 bg-aesthetic-gray rounded-full flex items-center justify-center text-aesthetic-lavender group-hover:bg-aesthetic-lavender group-hover:text-white transition-all">
                  <Truck size={24} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest leading-none mb-1">Shipping</h4>
                  <p className="font-black text-aesthetic-dark">Premium Courier</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
