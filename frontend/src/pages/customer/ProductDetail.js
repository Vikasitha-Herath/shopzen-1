import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import API from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useAnimation } from '../../context/AnimationContext';
import { use3DTilt, MagneticButton, useScrollReveal, Card3D } from '../../components/Cinematic';
import toast from 'react-hot-toast';

gsap.registerPlugin(ScrollTrigger);

const Stars = ({ rating, count, interactive, selected, onSelect }) => (
  <div className="flex items-center gap-1">
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s}
          onClick={() => onSelect && onSelect(s)}
          className={`${interactive ? 'w-6 h-6 cursor-pointer hover:scale-125 transition-transform' : 'w-4 h-4'} ${s <= Math.round(interactive ? selected : rating) ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
    {count !== undefined && <span className="text-sm text-gray-400">({count})</span>}
  </div>
);

const VariantSelector = ({ variant, selected, onSelect }) => {
  const isColor = variant.type === 'color';
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <label className="text-sm font-black uppercase tracking-wide" style={{ color: 'var(--color-dark)' }}>{variant.name}</label>
        {selected && <span className="text-sm font-semibold text-gray-400">— {variant.values.find(v => v.value === selected)?.label || selected}</span>}
        {variant.required && !selected && <span className="text-xs text-red-500 font-bold">Required</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {variant.values?.filter(v => v.isAvailable !== false).map(val => {
          const isSel = selected === val.value;
          if (isColor && (val.value.startsWith('#') || val.value.startsWith('rgb'))) {
            return (
              <button key={val.value} onClick={() => onSelect(val.value)} title={val.label}
                className={`w-10 h-10 rounded-full transition-all duration-300 ${isSel ? 'scale-110' : 'hover:scale-110'}`}
                style={{ background: val.value, boxShadow: isSel ? `0 0 0 3px white, 0 0 0 5px var(--color-primary), 0 8px 20px var(--glow-primary)` : '0 2px 8px rgba(0,0,0,0.15)' }}>
                {isSel && <span className="text-white text-xs flex items-center justify-center h-full font-black">✓</span>}
              </button>
            );
          }
          return (
            <button key={val.value} onClick={() => onSelect(val.value)}
              className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all duration-300 ${isSel ? 'text-white shadow-lg scale-105' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:scale-105'}`}
              style={isSel ? { background: 'var(--theme-gradient)', borderColor: 'transparent', boxShadow: '0 8px 24px var(--glow-primary)' } : {}}>
              {val.label}
              {val.priceModifier !== 0 && <span className="text-xs ml-1 opacity-75">{val.priceModifier > 0 ? `+` : ''}{val.priceModifier}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { settings } = useTheme();
  const { config } = useAnimation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selImg, setSelImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [tab, setTab] = useState('description');
  const [wishlist, setWishlist] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [selVars, setSelVars] = useState({});
  const [varError, setVarError] = useState('');
  const [adding, setAdding] = useState(false);

  const heroRef   = useRef(null);
  const imgRef    = useRef(null);
  const infoRef   = useRef(null);
  const shineRef  = useRef(null);
  const btnRef    = useRef(null);

  const sym = settings?.currencySymbol || 'Rs.';

  useEffect(() => {
    setLoading(true); setSelVars({});
    API.get(`/products/${slug}`).then(r => {
      setProduct(r.data);
      API.get(`/reviews/product/${r.data._id}`).then(rr => setReviews(rr.data || [])).catch(() => {});
      API.get(`/products?category=${r.data.category?._id}&limit=5`)
        .then(rr => setRelated((rr.data.products || []).filter(p => p._id !== r.data._id).slice(0, 4)))
        .catch(() => {});
    }).catch(() => toast.error('Product not found')).finally(() => setLoading(false));
    if (user) API.get('/auth/wishlist').then(r => setWishlist(r.data.map(p => p._id))).catch(() => {});
  }, [slug, user]);

  /* Cinematic entrance */
  useEffect(() => {
    if (!product || !heroRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(imgRef.current,
      { opacity: 0, scale: 0.85, rotateY: -20, transformPerspective: 900 },
      { opacity: 1, scale: 1, rotateY: 0, duration: 0.9, ease: 'power3.out' }
    ).fromTo(infoRef.current?.children ? [...infoRef.current.children] : infoRef.current,
      { opacity: 0, x: 60, rotateY: 8, transformPerspective: 900 },
      { opacity: 1, x: 0, rotateY: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' },
      '-=0.5'
    );
  }, [product]);

  /* Image 3D tilt */
  use3DTilt(imgRef, { rotMax: 12, scaleHover: 1.03 });

  /* Shine sweep on image hover */
  useEffect(() => {
    const img   = imgRef.current;
    const shine = shineRef.current;
    if (!img || !shine || !config.cardShine) return;
    const enter = () => gsap.fromTo(shine, { x: '-120%' }, { x: '220%', duration: 0.9, ease: 'power2.out' });
    img.addEventListener('mouseenter', enter);
    return () => img.removeEventListener('mouseenter', enter);
  }, [config.cardShine, product]);

  const getPriceModifier = () => {
    if (!product?.variants) return 0;
    return product.variants.reduce((sum, v) => {
      const val = v.values?.find(x => x.value === selVars[v.name]);
      return sum + (val?.priceModifier || 0);
    }, 0);
  };

  const basePrice = product?.isOnSale && product?.salePrice ? product.salePrice : product?.price;
  const curPrice  = (basePrice || 0) + getPriceModifier();

  const handleAdd = () => {
    if (product?.variants?.length > 0) {
      const missing = product.variants.filter(v => v.required && !selVars[v.name]);
      if (missing.length > 0) { setVarError(`Please select: ${missing.map(v => v.name).join(', ')}`); return; }
    }
    setVarError(''); setAdding(true);
    addItem({ ...product, selectedVariants: selVars, price: curPrice }, qty);

    // GSAP button celebration
    const btn = btnRef.current;
    if (btn) {
      gsap.timeline()
        .to(btn, { scale: 0.88, duration: 0.1 })
        .to(btn, { scale: 1.12, duration: 0.2, ease: 'back.out(2)' })
        .to(btn, { scale: 1, duration: 0.3, ease: 'elastic.out(1,0.4)' });
    }

    toast.custom(t => (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border-2 ${t.visible ? 'fade-up' : ''}`}
        style={{ background: 'var(--card-bg)', borderColor: 'var(--color-primary)', minWidth: 250 }}>
        <img src={product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/48'} alt=""
          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"/>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>Added to Cart! 🛒</p>
          <p className="text-xs text-gray-500 truncate">{product.name}</p>
          {Object.keys(selVars).length > 0 && (
            <p className="text-xs text-gray-400">{Object.entries(selVars).map(([k,v]) => `${k}: ${v}`).join(' · ')}</p>
          )}
        </div>
        <div className="text-green-500 text-xl">✓</div>
      </div>
    ), { duration: config.cartToastDuration || 3000, position: config.cartToastPos || 'bottom-right' });

    setTimeout(() => setAdding(false), 1500);
  };

  const toggleWishlist = async () => {
    if (!user) { toast.error('Please log in'); return; }
    await API.post(`/auth/wishlist/${product._id}`);
    setWishlist(p => p.includes(product._id) ? p.filter(id => id !== product._id) : [...p, product._id]);
    toast.success(wishlist.includes(product._id) ? 'Removed from wishlist' : '❤️ Added to wishlist!');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please log in'); return; }
    setSubmittingReview(true);
    try {
      await API.post('/reviews', { ...reviewForm, product: product._id });
      toast.success('Review submitted! ⭐');
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="skeleton rounded-3xl" style={{ aspectRatio: '1', height: 480 }}/>
        <div className="space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="skeleton rounded-xl h-10"/>)}</div>
      </div>
    </div>
  );
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>;

  const images = [product.thumbnail, ...(product.images || [])].filter(Boolean);
  const isOnSale = product.isOnSale && product.salePrice;
  const discount = isOnSale ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const inWishlist = wishlist.includes(product._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" style={{ background: 'var(--body-bg)' }}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 flex-wrap">
        <Link to="/" style={{ color: 'var(--color-primary)' }}>Home</Link><span>/</span>
        <Link to="/shop" style={{ color: 'var(--color-primary)' }}>Shop</Link>
        {product.category && <><span>/</span><Link to={`/shop/${product.category.slug}`} style={{ color: 'var(--color-primary)' }}>{product.category.name}</Link></>}
        <span>/</span><span className="text-gray-600 font-medium truncate max-w-48">{product.name}</span>
      </nav>

      <div ref={heroRef} className="grid lg:grid-cols-2 gap-8 lg:gap-14">
        {/* ── Image Gallery ── */}
        <div>
          {/* Main image */}
          <div ref={imgRef} className="relative rounded-3xl overflow-hidden bg-gray-50 mb-3"
            style={{ aspectRatio: '1', transformStyle: 'preserve-3d', willChange: 'transform', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
            <img src={images[selImg] || 'https://via.placeholder.com/600'} alt={product.name}
              className="w-full h-full object-contain transition-all duration-500"/>
            {/* Shine */}
            <div ref={shineRef} className="absolute inset-0 pointer-events-none z-10"
              style={{ background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.3) 50%, transparent 80%)', transform: 'translateX(-120%)' }}/>
            {/* Badges */}
            {isOnSale && <span className="absolute top-4 left-4 badge badge-sale text-sm z-20">{discount}% OFF</span>}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => {
                  setSelImg(i);
                  gsap.fromTo(imgRef.current, { opacity: 0.4, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
                }}
                  className={`w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${selImg === i ? 'scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-90 hover:scale-105'}`}
                  style={selImg === i ? { borderColor: 'var(--color-primary)', boxShadow: '0 4px 16px var(--glow-primary)' } : {}}>
                  <img src={img} alt="" className="w-full h-full object-cover"/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div ref={infoRef} className="flex flex-col gap-4">
          {/* Brand + title */}
          <div>
            {product.brand && <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--color-primary)', opacity: 0.7 }}>{product.brand}</p>}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-dark)', letterSpacing: '-0.025em' }}>
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          {product.ratings?.count > 0 && (
            <div className="flex items-center gap-2">
              <Stars rating={product.ratings.average} count={product.ratings.count}/>
              <span className="text-sm text-gray-400">({product.ratings.count} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
              {sym} {curPrice?.toLocaleString()}
            </span>
            {isOnSale && (
              <>
                <span className="text-xl text-gray-400 line-through">{sym} {product.price?.toLocaleString()}</span>
                <span className="badge badge-sale text-sm">Save {discount}%</span>
              </>
            )}
          </div>
          {getPriceModifier() !== 0 && (
            <p className="text-xs text-gray-400">Base {sym} {basePrice?.toLocaleString()} + {sym} {getPriceModifier()} variant</p>
          )}

          {/* Short desc */}
          {product.shortDescription && <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{product.shortDescription}</p>}

          {/* Stock */}
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`}
              style={product.stock > 0 ? { boxShadow: '0 0 8px rgba(74,222,128,0.6)', animation: 'pulse-glow 2s infinite' } : {}}/>
            <span className={`text-sm font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              {product.variants.map(v => (
                <VariantSelector key={v.name} variant={v} selected={selVars[v.name]}
                  onSelect={val => { setSelVars(p => ({ ...p, [v.name]: val })); setVarError(''); }}/>
              ))}
              {varError && (
                <p className="text-red-500 text-sm font-bold flex items-center gap-1">⚠️ {varError}</p>
              )}
            </div>
          )}

          {/* Qty + Add */}
          {product.stock > 0 && (
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center rounded-2xl overflow-hidden border-2" style={{ borderColor: 'var(--card-border)' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="qty-btn border-0 rounded-none w-12 h-12 text-xl">−</button>
                <span className="px-4 font-black text-lg min-w-[48px] text-center" style={{ color: 'var(--color-dark)' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="qty-btn border-0 rounded-none w-12 h-12 text-xl">+</button>
              </div>
              <MagneticButton ref={btnRef} onClick={handleAdd}
                className="btn-primary flex-1 py-3.5 text-base font-black"
                style={{ background: adding ? 'linear-gradient(135deg,#16a34a,#22c55e)' : undefined }}>
                {adding ? '✓ Added!' : '🛒 Add to Cart'}
              </MagneticButton>
              <button onClick={toggleWishlist}
                className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                style={{ borderColor: inWishlist ? '#ef4444' : 'var(--card-border)', background: inWishlist ? '#fef2f2' : 'var(--card-bg)', color: inWishlist ? '#ef4444' : '#94a3b8' }}>
                <svg className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
              </button>
            </div>
          )}

          {/* Delivery info */}
          <div className="rounded-2xl p-4 border" style={{ background: 'var(--color-primary)06', borderColor: 'var(--color-primary)20' }}>
            <div className="flex items-center gap-2 text-sm font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
              🚚 Delivery from {sym} {settings?.standardDelivery || 600}
              {settings?.freeDeliveryThreshold && ` · Free over ${sym} ${settings.freeDeliveryThreshold.toLocaleString()}`}
            </div>
            <p className="text-xs text-gray-400">{settings?.maxReturnDays || 7}-day easy returns</p>
          </div>

          {/* Meta */}
          <div className="text-xs text-gray-400 space-y-1 border-t border-gray-100 pt-3">
            {product.sku && <p>SKU: <span className="font-mono">{product.sku}</span></p>}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.tags.map(t => <span key={t} className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">{t}</span>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="mt-14">
        <div className="flex gap-1 border-b overflow-x-auto mb-6" style={{ borderColor: 'var(--card-border)' }}>
          {['description', 'specifications', 'reviews'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-bold capitalize transition-all border-b-2 -mb-px whitespace-nowrap ${t === tab ? '' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
              style={t === tab ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' } : {}}>
              {t}
              {t === 'reviews' && product.ratings?.count > 0 && ` (${product.ratings.count})`}
            </button>
          ))}
        </div>

        {tab === 'description' && (
          <div className="prose max-w-none text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
            {product.description}
          </div>
        )}

        {tab === 'specifications' && (
          product.specifications?.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-2">
              {product.specifications.map((s, i) => (
                <Card3D key={i} className="flex gap-4 rounded-2xl p-4 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }} rotMax={8}>
                  <span className="text-sm font-black text-gray-500 w-32 flex-shrink-0">{s.key}</span>
                  <span className="text-sm text-gray-800 font-semibold">{s.value}</span>
                </Card3D>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">No specifications listed.</p>
        )}

        {tab === 'reviews' && (
          <div>
            {reviews.length > 0 ? (
              <div className="space-y-4 mb-10">
                {reviews.map(r => (
                  <Card3D key={r._id} className="rounded-2xl p-5 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }} rotMax={5}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0" style={{ background: 'var(--theme-gradient)' }}>
                          {r.user?.firstName?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: 'var(--color-dark)' }}>{r.user?.firstName} {r.user?.lastName}</p>
                          <Stars rating={r.rating}/>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    {r.title && <p className="font-bold text-sm mb-1" style={{ color: 'var(--color-dark)' }}>{r.title}</p>}
                    <p className="text-gray-600 text-sm">{r.comment}</p>
                  </Card3D>
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm mb-8">No reviews yet. Be the first!</p>}

            <div className="rounded-3xl p-6 sm:p-8 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <h3 className="font-black text-lg mb-5" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-dark)' }}>Write a Review</h3>
              {!user ? (
                <p className="text-gray-500 text-sm">Please <Link to="/login" className="font-bold hover:underline" style={{ color: 'var(--color-primary)' }}>sign in</Link> to write a review.</p>
              ) : (
                <form onSubmit={submitReview} className="space-y-4">
                  <div><label className="form-label">Rating</label><Stars rating={0} interactive selected={reviewForm.rating} onSelect={s => setReviewForm(p => ({ ...p, rating: s }))}/></div>
                  <div><label className="form-label">Title</label><input value={reviewForm.title} onChange={e => setReviewForm(p => ({ ...p, title: e.target.value }))} className="form-input" placeholder="Summary..."/></div>
                  <div><label className="form-label">Review</label><textarea value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} rows={4} className="form-input resize-none" placeholder="Share your experience..."/></div>
                  <MagneticButton type="submit" className="btn-primary" style={{}} onClick={submitReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Review ⭐'}
                  </MagneticButton>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Related Products ── */}
      {related?.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl sm:text-3xl font-black mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-dark)', letterSpacing: '-0.025em' }}>
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {related.map((p, i) => {
              const rRef = React.createRef();
              return (
                <div key={p._id} ref={rRef}
                  className="product-card"
                  style={{ transformStyle: 'preserve-3d' }}>
                  <Link to={`/product/${p.slug}`} className="block overflow-hidden bg-gray-50" style={{ aspectRatio: '1' }}>
                    <img src={p.thumbnail || p.images?.[0]} alt={p.name} className="card-img w-full h-full object-cover"/>
                  </Link>
                  <div className="p-3.5" style={{ background: 'var(--card-bg)' }}>
                    <Link to={`/product/${p.slug}`}>
                      <p className="text-sm font-bold line-clamp-2 hover:opacity-60 transition-opacity" style={{ color: 'var(--color-dark)', fontFamily: 'var(--font-display)' }}>{p.name}</p>
                    </Link>
                    <p className="font-black mt-1.5 text-base" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
                      {sym} {(p.salePrice || p.price)?.toLocaleString()}
                    </p>
                    {p.variants?.length > 0 && <p className="text-xs text-gray-400 mt-0.5">{p.variants.map(v => v.name).join(' · ')}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
