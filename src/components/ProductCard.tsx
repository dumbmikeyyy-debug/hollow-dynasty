import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight, Plus, Star, Package } from 'lucide-react';
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
      className="bento-card group flex flex-col h-full !rounded-2xl sm:!rounded-[2rem]"
    >
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-aesthetic-gray block group/img">
        {product.images?.[0] ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-aesthetic-gray/50">
            <Package className="text-aesthetic-dark/10" size={40} />
          </div>
        )}
        
        {/* Always visible discount badge as requested */}
        <div className="absolute top-3 left-3 sm:top-5 sm:left-5 bg-red-500 text-white text-[8px] sm:text-[10px] font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-full uppercase tracking-widest shadow-2xl z-[30] flex items-center justify-center">
          {hasDiscount 
            ? `${Math.round((1 - product.discountPrice! / product.price) * 100)}% OFF` 
            : '25% OFF'}
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 bg-white/90 backdrop-blur-md text-red-500 text-[8px] sm:text-[10px] font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-full uppercase tracking-widest shadow-sm z-20">
            Low Stock
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-aesthetic-dark/40 flex items-center justify-center backdrop-blur-[2px] z-20">
            <span className="bg-white text-aesthetic-dark font-black px-4 py-2 sm:px-6 sm:py-3 rounded-full text-[10px] sm:text-xs uppercase tracking-widest text-center mx-2">Sold Out</span>
          </div>
        )}
      </Link>

      <div className="p-3 sm:p-6 flex-grow flex flex-col gap-2 sm:gap-4">
        <div className="space-y-0.5 sm:space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[8px] sm:text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest leading-none">
              {product.category || 'Hardware'}
            </span>
            <div className="flex items-center text-amber-400">
              <Star size={8} className="sm:w-[10px] sm:h-[10px]" fill="currentColor" />
              <span className="text-[8px] sm:text-[10px] font-black ml-1 text-aesthetic-dark/40 italic">4.9</span>
            </div>
          </div>
          
          <Link to={`/product/${product.id}`}>
            <h3 className="text-sm sm:text-xl font-black text-aesthetic-dark tracking-tight leading-tight group-hover:text-aesthetic-lavender transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="pt-2 sm:pt-4 mt-auto flex items-center justify-between border-t border-aesthetic-gray/50">
          <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-sm sm:text-xl font-black text-aesthetic-dark">{formatINR(product.discountPrice!)}</span>
                  <span className="text-aesthetic-dark/30 font-bold text-[8px] sm:text-xs line-through">{formatINR(product.price)}</span>
                </>
              ) : (
                <span className="text-sm sm:text-xl font-black text-aesthetic-dark">{formatINR(product.price)}</span>
              )}
            </div>
          </div>

          <button 
            disabled={product.stock === 0}
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="w-8 h-8 sm:w-12 sm:h-12 bg-aesthetic-lavender text-white rounded-full flex items-center justify-center hover:bg-aesthetic-dark transition-all soft-shadow active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group-hover:scale-110"
          >
            <Plus size={16} className="sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
