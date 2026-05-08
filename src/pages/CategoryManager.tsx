import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Category } from '../types';
import { Plus, Trash2, Tag, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFirestoreError = (error: unknown, op: string) => {
    console.error(`Firestore ${op} error:`, error);
    alert(`Action failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Category)));
    }, (error) => handleFirestoreError(error, 'LIST'));
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await addDoc(collection(db, 'categories'), { name: newName.trim() });
      setNewName('');
    } catch (error) {
      handleFirestoreError(error, 'CREATE');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      setIsDeleting(null);
    } catch (error) {
      handleFirestoreError(error, 'DELETE');
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-[10px] font-black text-aesthetic-dark/30 hover:text-aesthetic-lavender transition-colors uppercase tracking-[0.3em] mb-4"
          >
            <ArrowLeft size={14} />
            Back to Console
          </button>
          <h2 className="text-5xl font-black text-aesthetic-dark tracking-tighter flex items-center gap-4">
            <Tag className="text-aesthetic-lavender" size={40} />
            Category Index
          </h2>
        </div>

        <form onSubmit={handleAdd} className="flex gap-4 bg-white p-2 rounded-full border border-aesthetic-gray soft-shadow md:w-96">
          <input 
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="New Category Name..."
            className="flex-grow bg-transparent px-6 py-2 font-bold text-sm outline-none placeholder:text-aesthetic-dark/20"
          />
          <button type="submit" className="bg-aesthetic-lavender text-white font-black px-8 py-3 rounded-full hover:bg-aesthetic-dark transition-all text-[10px] uppercase tracking-widest">
            Add
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bento-card p-8 flex justify-between items-center group hover:border-aesthetic-lavender transition-all relative overflow-hidden">
            <span className="font-black text-aesthetic-dark uppercase tracking-widest text-xs">{cat.name}</span>
            <button 
              onClick={() => setIsDeleting(cat.id)}
              className="w-10 h-10 rounded-full bg-aesthetic-gray text-aesthetic-dark/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
            >
              <Trash2 size={16} />
            </button>

            {isDeleting === cat.id && (
              <div className="absolute inset-0 bg-red-500 flex items-center justify-between px-6 animate-in slide-in-from-right duration-300">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Delete?</span>
                <div className="flex gap-2">
                  <button onClick={() => handleDelete(cat.id)} className="bg-white text-red-500 p-2 rounded-full hover:bg-aesthetic-dark hover:text-white transition-all">
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => setIsDeleting(null)} className="bg-white/20 text-white p-2 rounded-full hover:bg-white/40 transition-all">
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full py-24 text-center font-bold text-aesthetic-dark/20 uppercase tracking-[0.3em] italic">
            No Categories in Registry
          </div>
        )}
      </div>
    </div>
  );
}
