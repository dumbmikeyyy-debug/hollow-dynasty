import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CartItem } from '../hooks/useCart';
import { formatINR } from '../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, CreditCard, ShieldCheck, Upload, CheckCircle, Truck, Package, Zap, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface CheckoutProps {
  cart: CartItem[];
  total: number;
  clearCart: () => void;
}

export default function Checkout({ cart, total, clearCart }: CheckoutProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    pincode: '',
    city: '',
    state: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const upiUrl = useMemo(() => {
    return `upi://pay?pa=6396946267@fam&pn=THE%20HOLLOW%20DYNASTY&am=${total}&cu=INR`;
  }, [total]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("SCREENSHOT_REJECTED: PAYLOAD_EXCEEDS_2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot) {
      alert("ERROR: PAYMENT_VERIFICATION_SCREENSHOT_REQUIRED");
      return;
    }
    
    if (formData.mobile.length !== 10 || !/^\d{10}$/.test(formData.mobile)) {
      alert("ERROR: MOBILE_NUMBER_MUST_BE_10_DIGITS");
      return;
    }
    if (formData.pincode.length !== 6 || !/^\d{6}$/.test(formData.pincode)) {
      alert("ERROR: PINCODE_MUST_BE_6_DIGITS");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'orders'), {
        customer: formData,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total,
        paymentScreenshot: screenshot,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error(error);
      alert("SYSTEM_CRITICAL_FAILURE: ORDER_GEN_INTERRUPTED");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 bg-aesthetic-gray rounded-full flex items-center justify-center opacity-30">
          <Trash2 size={32} />
        </div>
        <p className="font-bold text-aesthetic-dark/30 uppercase tracking-widest text-xs">Your Vessel is empty</p>
        <button onClick={() => navigate('/')} className="bg-aesthetic-lavender text-white font-black px-10 py-4 rounded-full soft-shadow uppercase text-xs tracking-widest">Return to Store</button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center animate-in zoom-in duration-500 space-y-8 max-w-lg mx-auto">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-xl shadow-green-500/10">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-aesthetic-dark tracking-tighter leading-tight">Order Received</h1>
          <p className="text-aesthetic-dark/50 text-lg font-medium leading-relaxed">
            Your requisition has been transmitted to our sanctuary. Our curators are verifying your payment. We'll drop you an update soon.
          </p>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="bg-aesthetic-lavender text-white font-black px-12 py-5 rounded-full soft-shadow text-lg transition-all hover:bg-aesthetic-dark"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 pt-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-black text-aesthetic-dark/30 hover:text-aesthetic-lavender transition-colors uppercase tracking-widest"
      >
        <ArrowLeft size={16} />
        Back to Sanctuary
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-12 items-start">
        <div className="space-y-12">
          {/* Identity Section */}
          <section className="bento-card p-10 space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-aesthetic-lavender/10 rounded-full flex items-center justify-center text-aesthetic-lavender">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-aesthetic-dark tracking-tighter">Your Identity</h2>
                <p className="text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-[0.2em] leading-none">Authentication Details</p>
              </div>
            </div>

            <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest ml-4">Full Name</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-aesthetic-gray rounded-full px-6 py-4 font-bold text-sm focus:bg-white focus:ring-4 ring-aesthetic-lavender/10 outline-none transition-all placeholder:text-aesthetic-dark/20 border border-transparent focus:border-aesthetic-lavender/20" placeholder="Neo Anderson" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest ml-4">Mobile Number (+91)</label>
                <input required name="mobile" maxLength={10} pattern="[0-9]{10}" value={formData.mobile} onChange={handleInputChange} className="w-full bg-aesthetic-gray rounded-full px-6 py-4 font-bold text-sm focus:bg-white focus:ring-4 ring-aesthetic-lavender/10 outline-none transition-all placeholder:text-aesthetic-dark/20 border border-transparent focus:border-aesthetic-lavender/20" placeholder="9876543210" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest ml-4">Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-aesthetic-gray rounded-full px-6 py-4 font-bold text-sm focus:bg-white focus:ring-4 ring-aesthetic-lavender/10 outline-none transition-all placeholder:text-aesthetic-dark/20 border border-transparent focus:border-aesthetic-lavender/20" placeholder="user@net.com" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest ml-4">Shipping Sanctuary (Address)</label>
                <textarea required name="address" value={formData.address} onChange={handleInputChange} rows={3} className="w-full bg-aesthetic-gray rounded-3xl px-6 py-4 font-bold text-sm focus:bg-white focus:ring-4 ring-aesthetic-lavender/10 outline-none transition-all placeholder:text-aesthetic-dark/20 border border-transparent focus:border-aesthetic-lavender/20 resize-none" placeholder="Sector 4, Apartment 101..." />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest ml-4">Pincode</label>
                <input required name="pincode" maxLength={6} pattern="[0-9]{6}" value={formData.pincode} onChange={handleInputChange} className="w-full bg-aesthetic-gray rounded-full px-6 py-4 font-bold text-sm focus:bg-white focus:ring-4 ring-aesthetic-lavender/10 outline-none transition-all placeholder:text-aesthetic-dark/20 border border-transparent focus:border-aesthetic-lavender/20" placeholder="110001" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest ml-4">City</label>
                <input required name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-aesthetic-gray rounded-full px-6 py-4 font-bold text-sm focus:bg-white focus:ring-4 ring-aesthetic-lavender/10 outline-none transition-all placeholder:text-aesthetic-dark/20 border border-transparent focus:border-aesthetic-lavender/20" placeholder="Your City" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest ml-4">State</label>
                <input required name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-aesthetic-gray rounded-full px-6 py-4 font-bold text-sm focus:bg-white focus:ring-4 ring-aesthetic-lavender/10 outline-none transition-all placeholder:text-aesthetic-dark/20 border border-transparent focus:border-aesthetic-lavender/20" placeholder="Your State" />
              </div>
            </form>
          </section>

          {/* Payment Section */}
          <section className="bento-card p-10 space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-aesthetic-lavender/10 rounded-full flex items-center justify-center text-aesthetic-lavender">
                <CreditCard size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-aesthetic-dark tracking-tighter">Payment Portal</h2>
                <p className="text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-[0.2em] leading-none">Instant Verification</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12 bg-aesthetic-gray/30 p-8 rounded-[2rem] border border-aesthetic-gray">
              <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-aesthetic-dark/5">
                <QRCodeSVG value={upiUrl} size={180} />
              </div>
              <div className="flex-grow space-y-6 text-center md:text-left">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest leading-none">Scan to Pay (Prepaid Only)</p>
                  <p className="text-4xl font-black text-aesthetic-lavender">{formatINR(total)}</p>
                  <p className="text-sm font-bold text-aesthetic-dark/60">UPI ID: 6396946267@fam</p>
                </div>
                
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest leading-none">Payment Proof (.JPG/.PNG)</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`rounded-full border-4 border-dashed py-4 px-8 transition-all flex items-center justify-center gap-3 ${screenshot ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-aesthetic-gray text-aesthetic-dark/30 group-hover:border-aesthetic-lavender group-hover:text-aesthetic-lavender'}`}>
                      {screenshot ? (
                        <>
                          <CheckCircle size={20} />
                          <span className="font-black text-xs uppercase tracking-widest italic">Proof Attached</span>
                        </>
                      ) : (
                        <>
                          <Upload size={20} />
                          <span className="font-black text-xs uppercase tracking-widest italic">Select Screenshot</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Requisition Summary */}
        <aside className="sticky top-24 space-y-6">
          <div className="bento-card p-10 space-y-8 bg-white/50 backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-aesthetic-gray pb-6">
              <Package size={20} className="text-aesthetic-lavender" />
              <h3 className="text-xl font-black text-aesthetic-dark tracking-tighter">Your Package</h3>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-4 scrollbar-thin">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center group">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-aesthetic-gray rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-aesthetic-dark line-clamp-1">{item.name}</p>
                      <p className="text-[11px] font-bold text-aesthetic-dark/30">x{item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-black text-aesthetic-dark/60 text-sm">{formatINR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t-2 border-aesthetic-gray border-dashed space-y-6">
              <div className="flex justify-between items-center bg-aesthetic-gray/50 px-4 py-3 rounded-2xl">
                <span className="text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-widest">Premium Logistics</span>
                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Complimentary</span>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-aesthetic-dark/30 uppercase tracking-[0.2em] leading-none mb-1">Final Requisition</p>
                  <p className="text-3xl font-black text-aesthetic-dark leading-none italic">{formatINR(total)}</p>
                </div>
              </div>

              <button 
                form="checkout-form"
                disabled={isSubmitting || !screenshot}
                className="w-full bg-aesthetic-lavender text-white font-black py-5 rounded-full hover:bg-aesthetic-dark transition-all soft-shadow text-lg flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed group active:scale-95"
              >
                {isSubmitting ? 'Transmitting...' : 'Confirm Order'}
              </button>

              <div className="flex items-center gap-3 text-[10px] font-black text-aesthetic-dark/20 uppercase tracking-tighter leading-none justify-center">
                <Zap size={14} />
                Global drop_approved by Core
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
