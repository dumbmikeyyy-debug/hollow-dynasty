import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight, Plus, Star } from 'lucide-react';
import { Product } from '../types';
import { formatINR } from '../lib/utils';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  addToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart }) => {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="bento-card group flex flex-col h-full"
    >
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-aesthetic-gray">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        {hasDiscount && (
          <div className="absolute top-4 left-4 bg-aesthetic-lavender text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
            OFFER
          </div>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-red-500 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
            Low Stock
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-aesthetic-dark/40 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-white text-aesthetic-dark font-black px-6 py-3 rounded-full text-xs uppercase tracking-widest">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="p-6 flex-grow flex flex-col space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest leading-none">
              {product.category || 'Hardware'}
            </span>
            <div className="flex items-center text-amber-400">
              <Star size={10} fill="currentColor" />
              <span className="text-[10px] font-black ml-1 text-aesthetic-dark/40 italic">4.9</span>
            </div>
          </div>
          
          <Link to={`/product/${product.id}`}>
            <h3 className="text-xl font-black text-aesthetic-dark tracking-tight leading-tight group-hover:text-aesthetic-lavender transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="pt-4 mt-auto flex items-center justify-between border-t border-aesthetic-gray/50">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-aesthetic-dark/30 uppercase tracking-tighter leading-none mb-1">Price</span>
            <div className="flex items-baseline gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-xl font-black text-aesthetic-dark">{formatINR(product.discountPrice!)}</span>
                  <span className="text-aesthetic-dark/30 font-bold text-xs line-through">{formatINR(product.price)}</span>
                </>
              ) : (
                <span className="text-xl font-black text-aesthetic-dark">{formatINR(product.price)}</span>
              )}
            </div>
          </div>

          <button 
            disabled={product.stock === 0}
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="w-12 h-12 bg-aesthetic-lavender text-white rounded-full flex items-center justify-center hover:bg-aesthetic-dark transition-all soft-shadow active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group-hover:scale-105"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
