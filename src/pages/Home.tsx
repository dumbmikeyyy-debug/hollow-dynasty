import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';
import { Terminal, Zap, ArrowRight, TrendingUp, Heart } from 'lucide-react';

interface HomeProps {
  addToCart: (product: Product) => void;
}

export default function Home({ addToCart }: HomeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center pt-12">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="space-y-8 text-center z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-aesthetic-lavender/10 rounded-full text-aesthetic-lavender text-xs font-bold tracking-widest uppercase"
            >
              <Zap size={14} />
              Premium Aesthetic Gear
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-7xl font-black tracking-tighter text-aesthetic-dark leading-[0.9]"
            >
              Crafting your <br />
              <span className="text-aesthetic-lavender">perfect sanctuary.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-aesthetic-dark/60 text-sm md:text-lg max-w-lg mx-auto font-medium leading-relaxed"
            >
              Elevate your productivity and mood with our handpicked selection of premium room setup components.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
            >
              <button className="bg-aesthetic-lavender text-white font-bold px-10 py-5 rounded-full hover:bg-aesthetic-dark transition-all soft-shadow text-lg flex items-center justify-center gap-2 group">
                Explore Shop
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex -space-x-3 items-center justify-center pt-2 sm:pt-0">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-aesthetic-gray">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                  </div>
                ))}
                <div className="pl-6 text-xs font-bold text-aesthetic-dark/40 uppercase tracking-widest text-left">
                  2K+ Happy <br /> Setups
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-aesthetic-dark">
            Our <span className="text-aesthetic-lavender">Latest</span> Drops
          </h2>
          <p className="text-aesthetic-dark/40 font-bold text-xs uppercase tracking-[0.2em]">Curated Hardware for your Sanctuary</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[4/5] bg-white rounded-[2rem] border border-aesthetic-gray animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
            <Terminal size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-mono text-white/40">NO_DATA_STREAM_DETECTED</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
