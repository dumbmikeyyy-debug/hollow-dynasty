import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Product } from '../types';
import { Plus, Edit2, Trash2, X, Upload, Save, Eye, ArrowLeft, Package } from 'lucide-react';
import { formatINR } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // To store ID of product being deleted
  const navigate = useNavigate();

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    alert(`Operation Failed: ${errInfo.error}. Check console for details.`);
    throw new Error(JSON.stringify(errInfo));
  };

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });
    return () => unsubscribe();
  }, []);

  const handleFile = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }
    
    // Check file size (Firestore has 1MB limit for entire document, so we limit base64)
    if (file.size > 200000) { // ~200KB limit for base64 to avoid Firestore limit
      alert("Image too large. Please use a URL or a smaller file (< 200KB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      handleImageChange(index, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragIndex(index);
  };

  const onDragLeave = () => {
    setDragIndex(null);
  };

  const onDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragIndex(null);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(index, file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    const prodData = {
      ...currentProduct,
      price: Number(currentProduct.price),
      discountPrice: currentProduct.discountPrice ? Number(currentProduct.discountPrice) : null,
      stock: Number(currentProduct.stock),
      updatedAt: serverTimestamp()
    };

    try {
      if (currentProduct.id) {
        await updateDoc(doc(db, 'products', currentProduct.id), prodData);
      } else {
        await addDoc(collection(db, 'products'), {
          ...prodData,
          createdAt: serverTimestamp()
        });
      }
      setIsEditing(false);
      setCurrentProduct(null);
    } catch (err) {
      handleFirestoreError(err, currentProduct.id ? OperationType.UPDATE : OperationType.CREATE, currentProduct.id ? `products/${currentProduct.id}` : 'products');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setIsDeleting(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  const handleImageChange = (index: number, val: string) => {
    const imgs = [...(currentProduct?.images || ['', '', '', ''])];
    imgs[index] = val;
    setCurrentProduct({ ...currentProduct, images: imgs });
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
            <Package className="text-aesthetic-lavender" size={40} />
            Entity Registry
          </h2>
        </div>
        <button 
          onClick={() => {
            setCurrentProduct({ images: ['', '', '', ''], stock: 0, price: 0 });
            setIsEditing(true);
          }}
          className="bg-aesthetic-lavender text-white font-black px-10 py-5 rounded-full hover:bg-aesthetic-dark transition-all soft-shadow flex items-center gap-3"
        >
          <Plus size={20} />
          Add New Entity
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center font-black text-aesthetic-dark/20 uppercase tracking-[0.3em]">Querying Registry...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p) => (
            <div key={p.id} className="bento-card p-6 flex flex-col gap-6 group hover:border-aesthetic-lavender transition-all">
              <div className="aspect-square bg-aesthetic-gray rounded-2xl overflow-hidden relative">
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => { setCurrentProduct(p); setIsEditing(true); }} className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-aesthetic-dark hover:bg-aesthetic-lavender hover:text-white transition-all soft-shadow">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => setIsDeleting(p.id)} className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all soft-shadow">
                    <Trash2 size={16} />
                  </button>
                </div>

                {isDeleting === p.id && (
                  <div className="absolute inset-0 z-10 bg-red-500/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
                    <Trash2 size={40} className="text-white mb-4 animate-bounce" />
                    <p className="text-white font-black uppercase tracking-widest text-[10px] mb-4">Confirm Deletion?</p>
                    <div className="flex gap-3 w-full">
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="flex-grow bg-white text-red-500 font-black py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-aesthetic-dark hover:text-white transition-all"
                      >
                        Delete
                      </button>
                      <button 
                        onClick={() => setIsDeleting(null)}
                        className="flex-grow bg-aesthetic-dark/20 text-white border border-white/20 font-black py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-aesthetic-dark transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-black text-lg text-aesthetic-dark tracking-tight line-clamp-1">{p.name}</h3>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-aesthetic-dark/30">
                    <span>Stock: {p.stock}</span>
                    <span>ID: {p.id.slice(0, 8)}...</span>
                  </div>
                </div>
                <p className="text-xl font-black text-aesthetic-lavender">{formatINR(p.price)}</p>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-24 text-center font-bold text-aesthetic-dark/20 uppercase tracking-[0.3em] italic">
              Registry is Currently Empty
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-aesthetic-dark/60 backdrop-blur-md" onClick={() => setIsEditing(false)} />
          <div className="relative bg-aesthetic-cream w-full max-w-4xl rounded-[3rem] p-12 overflow-y-auto max-h-[90vh] soft-shadow border border-white">
            <div className="flex justify-between items-center mb-12 border-b border-aesthetic-gray pb-8">
              <h3 className="text-4xl font-black text-aesthetic-dark tracking-tighter flex items-center gap-4">
                <Save size={32} className="text-aesthetic-lavender" />
                Entity Editor
              </h3>
              <button onClick={() => setIsEditing(false)} className="w-12 h-12 rounded-full bg-aesthetic-gray flex items-center justify-center hover:bg-aesthetic-lavender hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-10">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest ml-4">Entity Name</label>
                <input required value={currentProduct?.name || ''} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} className="w-full bg-white rounded-full px-8 py-5 font-bold text-sm focus:ring-4 ring-aesthetic-lavender/10 outline-none transition-all placeholder:text-aesthetic-dark/10 border border-aesthetic-gray" placeholder="Product name..." />
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest ml-4">System Description</label>
                <textarea required rows={4} value={currentProduct?.description || ''} onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })} className="w-full bg-white rounded-[2rem] px-8 py-6 font-bold text-sm focus:ring-4 ring-aesthetic-lavender/10 outline-none transition-all placeholder:text-aesthetic-dark/10 border border-aesthetic-gray resize-none" placeholder="Describe the sanctuary piece..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest ml-4">Raw Price (INR)</label>
                  <input required type="number" value={currentProduct?.price || ''} onChange={e => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })} className="w-full bg-white rounded-full px-8 py-5 font-bold text-sm focus:ring-4 ring-aesthetic-lavender/10 outline-none transition-all border border-aesthetic-gray" />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest ml-4">Offer Price (Optional)</label>
                  <input type="number" value={currentProduct?.discountPrice || ''} onChange={e => setCurrentProduct({ ...currentProduct, discountPrice: Number(e.target.value) })} className="w-full bg-white rounded-full px-8 py-5 font-bold text-sm focus:ring-4 ring-aesthetic-lavender/10 outline-none transition-all border border-aesthetic-gray" />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest ml-4">Stock Units</label>
                  <input required type="number" value={currentProduct?.stock || ''} onChange={e => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })} className="w-full bg-white rounded-full px-8 py-5 font-bold text-sm focus:ring-4 ring-aesthetic-lavender/10 outline-none transition-all border border-aesthetic-gray" />
                </div>
              </div>

              <div className="space-y-6">
                <label className="block text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest ml-4">Visual Assets (4 Max)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="space-y-4">
                      <div 
                        onDragOver={(e) => onDragOver(e, i)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, i)}
                        onClick={() => document.getElementById(`file-input-${i}`)?.click()}
                        className={`aspect-square rounded-3xl flex items-center justify-center overflow-hidden border-2 border-dashed transition-all cursor-pointer group relative ${
                          dragIndex === i 
                            ? 'bg-aesthetic-lavender/10 border-aesthetic-lavender' 
                            : 'bg-aesthetic-gray border-aesthetic-dark/10 hover:border-aesthetic-lavender/50'
                        }`}
                      >
                        {currentProduct?.images?.[i] ? (
                          <img src={currentProduct.images[i]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload size={24} className="text-aesthetic-dark/10 group-hover:text-aesthetic-lavender transition-colors" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-aesthetic-dark/20">Drop or Click</span>
                          </div>
                        )}
                        
                        {/* Hidden File Input */}
                        <input 
                          id={`file-input-${i}`}
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(i, file);
                          }}
                        />

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-aesthetic-lavender/0 group-hover:bg-aesthetic-lavender/5 transition-all pointer-events-none" />
                      </div>
                      <input 
                        placeholder="Image URL..."
                        value={currentProduct?.images?.[i] || ''}
                        onChange={e => handleImageChange(i, e.target.value)}
                        className="w-full bg-white border border-aesthetic-gray p-3 rounded-xl font-bold text-[10px] outline-none focus:border-aesthetic-lavender"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-aesthetic-lavender text-white font-black py-6 rounded-full hover:bg-aesthetic-dark transition-all soft-shadow text-lg flex items-center justify-center gap-3 active:scale-95">
                <Save size={24} />
                Commit to Registry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
