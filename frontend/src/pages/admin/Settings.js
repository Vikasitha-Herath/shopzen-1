import React, { useEffect, useState, useRef } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { THEMES, FONTS, applyTheme } from '../../context/ThemeContext';
import ImageUpload from '../../components/ImageUpload';

const TABS = [
  { id:'general', label:'🏪 Store', group:'store' },
  { id:'business', label:'🏢 Business', group:'store' },
  { id:'delivery', label:'🚚 Delivery', group:'ops' },
  { id:'payment', label:'💳 Payment', group:'ops' },
  { id:'gateways', label:'🔌 Gateways', group:'ops' },
  { id:'appearance', label:'🎨 Theme', group:'design' },
  { id:'fonts', label:'🔤 Fonts', group:'design' },
  { id:'banners', label:'🖼️ Banners', group:'design' },
  { id:'pages', label:'📄 Pages', group:'design' },
  { id:'content', label:'✏️ Content', group:'design' },
  { id:'seo', label:'🔍 SEO', group:'marketing' },
  { id:'features', label:'⚙️ Features', group:'advanced' },
  { id:'advanced', label:'🔧 Advanced', group:'advanced' },
  { id:'admins', label:'👑 Admins', group:'advanced' },
];

const GROUPS = [
  { id:'store', label:'Store' },
  { id:'ops', label:'Operations' },
  { id:'design', label:'Design' },
  { id:'marketing', label:'Marketing' },
  { id:'advanced', label:'Advanced' },
];

const GATEWAY_PRESETS = {
  payhere: { name: 'PayHere', logo: '💳', color: '#0066cc', fields: [{ key:'merchantId', label:'Merchant ID', type:'text' }, { key:'merchantSecret', label:'Merchant Secret', type:'password' }, { key:'appId', label:'App ID (optional)', type:'text' }, { key:'appSecret', label:'App Secret (optional)', type:'password' }] },
  stripe: { name: 'Stripe', logo: '💜', color: '#635bff', fields: [{ key:'publicKey', label:'Publishable Key', type:'text', hint:'pk_test_... or pk_live_...' }, { key:'secretKey', label:'Secret Key', type:'password', hint:'sk_test_... or sk_live_...' }, { key:'webhookSecret', label:'Webhook Secret', type:'password' }] },
  paypal: { name: 'PayPal', logo: '🅿️', color: '#003087', fields: [{ key:'clientId', label:'Client ID', type:'text' }, { key:'clientSecret', label:'Client Secret', type:'password' }] },
};


// ── Banners Tab Component (inline) ───────────────────────────────────────────
const BannersTab = () => {
  const [banners, setBanners] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [modal, setModal] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({
    title:'', subtitle:'', image:'', link:'', buttonText:'Shop Now',
    position:'hero', isActive:true, sortOrder:0
  });

  const fetch = () => {
    setLoading(true);
    API.get('/banners?admin=true').then(r => setBanners(r.data || [])).catch(()=>{}).finally(()=>setLoading(false));
  };
  React.useEffect(()=>{ fetch(); },[]);

  const openNew = () => { setForm({title:'',subtitle:'',image:'',link:'',buttonText:'Shop Now',position:'hero',isActive:true,sortOrder:0}); setEditing(null); setModal(true); };
  const openEdit = (b) => { setForm({...b}); setEditing(b); setModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing?._id) await API.put(`/banners/${editing._id}`, form);
      else await API.post('/banners', form);
      toast.success('Banner saved!');
      setModal(false);
      fetch();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const deleteBanner = async (id) => {
    if (!window.confirm('Delete banner?')) return;
    await API.delete(`/banners/${id}`);
    fetch();
    toast.success('Deleted');
  };

  const toggle = async (b) => {
    await API.put(`/banners/${b._id}`, { ...b, isActive: !b.isActive });
    fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">Homepage Banners</h3>
          <p className="text-sm text-gray-400">Hero sliders and promotional banners displayed on the store</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm">+ Add Banner</button>
      </div>

      {loading ? <div className="py-8 text-center text-gray-400">Loading...</div> :
        banners.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="text-4xl mb-2">🖼️</div>
            <p className="text-gray-400 mb-3 text-sm">No banners yet</p>
            <button onClick={openNew} className="btn-primary text-sm">Create First Banner</button>
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map(b => (
              <div key={b._id} className="flex gap-4 items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {b.image ? <img src={b.image} alt={b.title} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{b.title || 'Untitled'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`badge text-xs ${b.isActive ? 'badge-new' : 'bg-gray-100 text-gray-500'}`}>{b.isActive ? 'Active' : 'Hidden'}</span>
                    <span className="text-xs text-gray-400">{b.position || 'hero'}</span>
                    {b.link && <span className="text-xs text-gray-400 truncate max-w-32">{b.link}</span>}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={()=>toggle(b)} className={`text-xs px-2 py-1 rounded-lg font-medium ${b.isActive?'bg-amber-50 text-amber-600 hover:bg-amber-100':'bg-green-50 text-green-600 hover:bg-green-100'}`}>{b.isActive?'Hide':'Show'}</button>
                  <button onClick={()=>openEdit(b)} className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">Edit</button>
                  <button onClick={()=>deleteBanner(b._id)} className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">{editing ? 'Edit Banner' : 'New Banner'}</h3>
              <button onClick={()=>setModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">✕</button>
            </div>
            <div className="space-y-4">
              <div><label className="form-label">Title</label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="form-input" placeholder="Summer Sale — Up to 50% Off"/></div>
              <div><label className="form-label">Subtitle</label><input value={form.subtitle} onChange={e=>setForm(p=>({...p,subtitle:e.target.value}))} className="form-input" placeholder="Shop the best deals"/></div>
              <ImageUpload label="Banner Image" hint="Recommended: 1400×500px. Wide landscape image." value={form.image} onChange={url=>setForm(p=>({...p,image:url}))}/>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Button Text</label><input value={form.buttonText} onChange={e=>setForm(p=>({...p,buttonText:e.target.value}))} className="form-input" placeholder="Shop Now"/></div>
                <div><label className="form-label">Link URL</label><input value={form.link} onChange={e=>setForm(p=>({...p,link:e.target.value}))} className="form-input" placeholder="/shop"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Position</label>
                  <select value={form.position} onChange={e=>setForm(p=>({...p,position:e.target.value}))} className="form-input">
                    <option value="hero">Hero (Main Slider)</option>
                    <option value="promo">Promo Banner</option>
                    <option value="sidebar">Sidebar</option>
                  </select>
                </div>
                <div><label className="form-label">Sort Order</label><input type="number" value={form.sortOrder} onChange={e=>setForm(p=>({...p,sortOrder:Number(e.target.value)}))} className="form-input"/></div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e=>setForm(p=>({...p,isActive:e.target.checked}))} style={{accentColor:'var(--color-primary)'}} className="w-4 h-4"/>
                <span className="text-sm font-medium text-gray-700">Active (show on website)</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5 pt-4 border-t">
              <button onClick={save} disabled={saving} className="btn-primary flex-1">{saving?'Saving...':'Save Banner'}</button>
              <button onClick={()=>setModal(false)} className="btn-outline px-5">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminSettings() {
  const [tab, setTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    storeName:'', storeTagline:'', storeEmail:'', storePhone:'', storeAddress:'',
    currency:'LKR', currencySymbol:'Rs.',
    standardDelivery:600, freeDeliveryThreshold:5000,
    codEnabled:true, bankTransferEnabled:true,
    bankName:'', bankAccountName:'', bankAccountNumber:'', bankBranch:'',
    theme:'default', primaryColor:'', secondaryColor:'', darkBgColor:'',
    fontStyle:'default', logoUrl:'', faviconUrl:'', customCSS:'',
    metaTitle:'', metaDescription:'', googleAnalytics:'', facebookPixel:'',
    lowStockAlert:5, orderNotificationEmail:'', autoConfirmOrders:false,
    reviewsRequireApproval:true, allowGuestCheckout:true, maintenanceMode:false,
    facebookUrl:'', instagramUrl:'', twitterUrl:'', whatsappNumber:'', youtubeUrl:'', linkedinUrl:'',
    businessType:'ecommerce', enableNewsletter:true, enableWishlist:true,
    enableReviews:true, enableGiftCards:true, enableReturns:true, maxReturnDays:7,
    taxEnabled:false, taxRate:0, taxLabel:'VAT',
    heroStyle:'gradient', headerStyle:'default', footerStyle:'default',
    customHeaderCode:'', customFooterCode:'',
    termsUrl:'', privacyUrl:'',
  });
  const [gateways, setGateways] = useState([]);
  const [deliveryServices, setDeliveryServices] = useState([]);
  const [pages, setPages] = useState([]);
  const [adminForm, setAdminForm] = useState({ firstName:'', lastName:'', email:'', password:'', confirmPassword:'' });
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [pageForm, setPageForm] = useState({ slug:'', title:'', content:'', showInFooter:true, showInNav:false, sortOrder:0 });
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [deliveryForm, setDeliveryForm] = useState({ name:'', code:'', description:'', estimatedDays:'', trackingUrl:'', rates:[{ name:'Standard', price:600, freeAbove:0, estimatedDays:'' }] });
  const [gwConfigs, setGwConfigs] = useState({});

  useEffect(() => {
    API.get('/settings').then(r => setSettings(p => ({ ...p, ...r.data }))).catch(() => {});
    API.get('/payments/admin/all').then(r => { setGateways(r.data); const cfgs = {}; r.data.forEach(g => { cfgs[g.gateway] = { ...g.config, isEnabled: g.isEnabled, isLive: g.isLive, displayName: g.displayName }; }); setGwConfigs(cfgs); }).catch(() => {});
    API.get('/delivery/admin/all').then(r => setDeliveryServices(r.data)).catch(() => {});
    API.get('/pages/admin/all').then(r => setPages(r.data)).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await API.put('/settings', settings);
      applyTheme(settings);
      // Write to localStorage cache so the theme bootstrap script uses the
      // correct theme on next page load (critical for production / Vercel)
      try { localStorage.setItem('shopzen_theme_settings', JSON.stringify(settings)); } catch {}
      toast.success('✅ Settings saved & applied!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const saveGateway = async (gateway) => {
    try {
      const cfg = gwConfigs[gateway] || {};
      await API.put(`/payments/admin/${gateway}`, {
        isEnabled: cfg.isEnabled || false, isLive: cfg.isLive || false,
        displayName: cfg.displayName || GATEWAY_PRESETS[gateway]?.name,
        config: Object.fromEntries(Object.entries(cfg).filter(([k]) => !['isEnabled','isLive','displayName'].includes(k)))
      });
      toast.success(`${GATEWAY_PRESETS[gateway]?.name} settings saved!`);
    } catch { toast.error('Failed to save gateway'); }
  };

  const toggleGateway = async (gateway) => {
    try {
      const { data } = await API.put(`/payments/admin/${gateway}/toggle`);
      setGwConfigs(p => ({ ...p, [gateway]: { ...p[gateway], isEnabled: data.isEnabled } }));
      toast.success(data.isEnabled ? 'Gateway enabled!' : 'Gateway disabled');
    } catch { toast.error('Failed'); }
  };

  const saveDelivery = async () => {
    try {
      await API.put(`/delivery/admin/${deliveryForm.code}`, deliveryForm);
      const { data } = await API.get('/delivery/admin/all');
      setDeliveryServices(data); setEditingDelivery(null);
      toast.success('Delivery service saved!');
    } catch { toast.error('Failed'); }
  };

  const toggleDelivery = async (code) => {
    try {
      const { data } = await API.put(`/delivery/admin/${code}/toggle`);
      setDeliveryServices(p => p.map(s => s.code === code ? data : s));
    } catch { toast.error('Failed'); }
  };

  const savePage = async () => {
    try {
      if (editingPage?._id) await API.put(`/pages/admin/${editingPage._id}`, pageForm);
      else await API.post('/pages/admin', pageForm);
      const { data } = await API.get('/pages/admin/all');
      setPages(data); setEditingPage(null);
      toast.success('Page saved!');
    } catch { toast.error('Failed'); }
  };

  const deletePage = async (id) => {
    if (!window.confirm('Delete this page?')) return;
    await API.delete(`/pages/admin/${id}`);
    setPages(p => p.filter(x => x._id !== id));
  };

  const createAdmin = async () => {
    if (adminForm.password !== adminForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setCreatingAdmin(true);
    try {
      await API.post('/admin/create-admin', { ...adminForm, username: adminForm.email.split('@')[0] + '_admin' });
      toast.success('Admin created!');
      setAdminForm({ firstName:'', lastName:'', email:'', password:'', confirmPassword:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setCreatingAdmin(false); }
  };

  const applyPreset = (key) => {
    const t = THEMES[key]; if (!t) return;
    const next = { ...settings, theme: key, primaryColor: t.primary, secondaryColor: t.accent, darkBgColor: t.dark };
    setSettings(next); applyTheme(next);
  };

  const applyFont = (key) => { const next = { ...settings, fontStyle: key }; setSettings(next); applyTheme(next); };
  const handleColor = (key, val) => { const next = { ...settings, [key]: val }; setSettings(next); applyTheme(next); };

  const currentTheme = THEMES[settings.theme] || THEMES.default;
  const currentFont = FONTS[settings.fontStyle] || FONTS.default;

  const F = ({ label, value, onChange, type='text', placeholder, hint, col2, disabled }) => (
    <div className={col2 ? 'sm:col-span-2' : ''}>
      <label className="form-label">{label}</label>
      <input type={type} value={value||''} onChange={onChange} placeholder={placeholder} disabled={disabled}
        className={`form-input ${disabled ? 'bg-gray-50 text-gray-400' : ''}`} />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  const Toggle = ({ label, desc, value, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div><p className="text-sm font-medium text-gray-800">{label}</p>{desc&&<p className="text-xs text-gray-400 mt-0.5">{desc}</p>}</div>
      <div onClick={onChange} className={`w-12 h-6 rounded-full cursor-pointer relative flex-shrink-0 transition-all ${value ? 'bg-primary' : 'bg-gray-200'}`}>
        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${value ? 'left-6' : 'left-0.5'}`}/>
      </div>
    </div>
  );

  const SaveBar = () => (
    <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between">
      <p className="text-xs text-gray-400">Changes preview live · Save to apply permanently</p>
      <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
        {saving ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving...</> : '✓ Save & Apply'}
      </button>
    </div>
  );

  const activeGroup = TABS.find(t => t.id === tab)?.group || 'store';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500">Full control over your store</p>
        </div>
        {!['admins','gateways','delivery','pages'].includes(tab) && (
          <button onClick={save} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
            {saving ? 'Saving...' : '✓ Save & Apply'}
          </button>
        )}
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-2 sticky top-24">
            {GROUPS.map(group => (
              <div key={group.id} className="mb-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 pt-3 pb-1">{group.label}</p>
                {TABS.filter(t => t.group === group.id).map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">

            {/* ── GENERAL ── */}
            {tab === 'general' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">Store Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <F label="Store Name *" value={settings.storeName} onChange={e=>setSettings(p=>({...p,storeName:e.target.value}))} />
                  <F label="Tagline" value={settings.storeTagline} onChange={e=>setSettings(p=>({...p,storeTagline:e.target.value}))} />
                  <F label="Email" type="email" value={settings.storeEmail} onChange={e=>setSettings(p=>({...p,storeEmail:e.target.value}))} />
                  <F label="Phone" value={settings.storePhone} onChange={e=>setSettings(p=>({...p,storePhone:e.target.value}))} />
                  <F label="Currency Code" value={settings.currency} onChange={e=>setSettings(p=>({...p,currency:e.target.value}))} placeholder="LKR" />
                  <F label="Currency Symbol" value={settings.currencySymbol} onChange={e=>setSettings(p=>({...p,currencySymbol:e.target.value}))} placeholder="Rs." />
                </div>
                <div><label className="form-label">Address</label><textarea value={settings.storeAddress||''} onChange={e=>setSettings(p=>({...p,storeAddress:e.target.value}))} rows={2} className="form-input resize-none"/></div>
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Social Media Links</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <F label="Facebook" value={settings.facebookUrl} onChange={e=>setSettings(p=>({...p,facebookUrl:e.target.value}))} placeholder="https://facebook.com/..." />
                    <F label="Instagram" value={settings.instagramUrl} onChange={e=>setSettings(p=>({...p,instagramUrl:e.target.value}))} placeholder="https://instagram.com/..." />
                    <F label="Twitter / X" value={settings.twitterUrl} onChange={e=>setSettings(p=>({...p,twitterUrl:e.target.value}))} />
                    <F label="WhatsApp" value={settings.whatsappNumber} onChange={e=>setSettings(p=>({...p,whatsappNumber:e.target.value}))} placeholder="+94 7X XXX XXXX" />
                    <F label="YouTube" value={settings.youtubeUrl} onChange={e=>setSettings(p=>({...p,youtubeUrl:e.target.value}))} />
                    <F label="LinkedIn" value={settings.linkedinUrl} onChange={e=>setSettings(p=>({...p,linkedinUrl:e.target.value}))} />
                  </div>
                </div>
                <SaveBar/>
              </div>
            )}

            {/* ── BUSINESS ── */}
            {tab === 'business' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">Business Configuration</h3>
                <div>
                  <label className="form-label">Business Type</label>
                  <select value={settings.businessType||'ecommerce'} onChange={e=>setSettings(p=>({...p,businessType:e.target.value}))} className="form-input">
                    <option value="ecommerce">E-Commerce (Products)</option>
                    <option value="digital">Digital Products / Downloads</option>
                    <option value="services">Services</option>
                    <option value="food">Food & Restaurant</option>
                    <option value="fashion">Fashion & Clothing</option>
                    <option value="electronics">Electronics</option>
                    <option value="grocery">Grocery & Supermarket</option>
                    <option value="pharmacy">Pharmacy / Health</option>
                    <option value="jewelry">Jewelry & Accessories</option>
                    <option value="furniture">Furniture & Home</option>
                    <option value="books">Books & Stationery</option>
                    <option value="sports">Sports & Fitness</option>
                    <option value="auto">Automotive</option>
                    <option value="other">Other</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Helps customize the store for your business type</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Tax Settings</p>
                  <Toggle label="Enable Tax" desc="Add tax to orders" value={settings.taxEnabled} onChange={()=>setSettings(p=>({...p,taxEnabled:!p.taxEnabled}))} />
                  {settings.taxEnabled && (
                    <div className="grid sm:grid-cols-2 gap-4 mt-3 ml-4">
                      <F label="Tax Label" value={settings.taxLabel} onChange={e=>setSettings(p=>({...p,taxLabel:e.target.value}))} placeholder="VAT, GST, Tax" />
                      <F label="Tax Rate (%)" type="number" value={settings.taxRate} onChange={e=>setSettings(p=>({...p,taxRate:Number(e.target.value)}))} placeholder="15" />
                    </div>
                  )}
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Policy URLs</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <F label="Terms & Conditions URL" value={settings.termsUrl} onChange={e=>setSettings(p=>({...p,termsUrl:e.target.value}))} placeholder="/page/terms" />
                    <F label="Privacy Policy URL" value={settings.privacyUrl} onChange={e=>setSettings(p=>({...p,privacyUrl:e.target.value}))} placeholder="/page/privacy" />
                  </div>
                </div>
                <SaveBar/>
              </div>
            )}

            {/* ── DELIVERY ── */}
            {tab === 'delivery' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div><h3 className="font-semibold text-gray-900">Delivery Services</h3><p className="text-xs text-gray-400">Configure shipping options for customers</p></div>
                  <button onClick={() => { setDeliveryForm({ name:'', code:'', description:'', estimatedDays:'', trackingUrl:'', rates:[{ name:'Standard', price:600, freeAbove:0, estimatedDays:'' }] }); setEditingDelivery('new'); }} className="btn-primary text-sm">+ Add Service</button>
                </div>
                <div className="space-y-3">
                  {deliveryServices.map(svc => (
                    <div key={svc.code} className="border border-gray-100 rounded-xl p-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-800 text-sm">{svc.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${svc.isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{svc.isEnabled ? 'Active' : 'Disabled'}</span>
                        </div>
                        <p className="text-xs text-gray-500">{svc.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {svc.rates?.map((r, i) => (
                            <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg">
                              {r.name}: Rs. {r.price} {r.freeAbove > 0 ? `· Free >Rs.${r.freeAbove}` : ''}
                            </span>
                          ))}
                        </div>
                        {svc.trackingUrl && <p className="text-xs text-gray-400 mt-1">🔗 Tracking: {svc.trackingUrl}</p>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => { setDeliveryForm({ ...svc }); setEditingDelivery(svc); }} className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">Edit</button>
                        <button onClick={() => toggleDelivery(svc.code)} className={`text-xs px-2.5 py-1.5 rounded-lg ${svc.isEnabled ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>{svc.isEnabled ? 'Disable' : 'Enable'}</button>
                      </div>
                    </div>
                  ))}
                </div>

                {editingDelivery && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingDelivery(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                      <h3 className="font-bold text-lg mb-4">{editingDelivery === 'new' ? 'Add Delivery Service' : 'Edit Service'}</h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="form-label">Name *</label><input value={deliveryForm.name} onChange={e=>setDeliveryForm(p=>({...p,name:e.target.value}))} className="form-input"/></div>
                          <div><label className="form-label">Code *</label><input value={deliveryForm.code} onChange={e=>setDeliveryForm(p=>({...p,code:e.target.value.toLowerCase().replace(/\s/g,'-')}))} className="form-input" placeholder="express"/></div>
                        </div>
                        <div><label className="form-label">Description</label><input value={deliveryForm.description} onChange={e=>setDeliveryForm(p=>({...p,description:e.target.value}))} className="form-input"/></div>
                        <div><label className="form-label">Estimated Days</label><input value={deliveryForm.estimatedDays} onChange={e=>setDeliveryForm(p=>({...p,estimatedDays:e.target.value}))} className="form-input" placeholder="3-5 business days"/></div>
                        <div><label className="form-label">Tracking URL</label><input value={deliveryForm.trackingUrl} onChange={e=>setDeliveryForm(p=>({...p,trackingUrl:e.target.value}))} className="form-input" placeholder="https://provider.com/track/{trackingNumber}"/></div>
                        <div>
                          <label className="form-label">Rates</label>
                          {deliveryForm.rates?.map((rate, i) => (
                            <div key={i} className="grid grid-cols-2 gap-2 mb-2 p-3 bg-gray-50 rounded-xl">
                              <input value={rate.name} onChange={e=>setDeliveryForm(p=>({...p,rates:p.rates.map((r,ri)=>ri===i?{...r,name:e.target.value}:r)}))} className="form-input text-sm" placeholder="Rate name"/>
                              <input type="number" value={rate.price} onChange={e=>setDeliveryForm(p=>({...p,rates:p.rates.map((r,ri)=>ri===i?{...r,price:Number(e.target.value)}:r)}))} className="form-input text-sm" placeholder="Price"/>
                              <input type="number" value={rate.freeAbove} onChange={e=>setDeliveryForm(p=>({...p,rates:p.rates.map((r,ri)=>ri===i?{...r,freeAbove:Number(e.target.value)}:r)}))} className="form-input text-sm" placeholder="Free above (0=never)"/>
                              <input value={rate.estimatedDays} onChange={e=>setDeliveryForm(p=>({...p,rates:p.rates.map((r,ri)=>ri===i?{...r,estimatedDays:e.target.value}:r)}))} className="form-input text-sm" placeholder="Days"/>
                            </div>
                          ))}
                          <button type="button" onClick={()=>setDeliveryForm(p=>({...p,rates:[...p.rates,{name:'',price:0,freeAbove:0,estimatedDays:''}]}))} className="text-xs text-primary hover:underline">+ Add Rate</button>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4 pt-4 border-t">
                        <button onClick={saveDelivery} className="btn-primary flex-1">Save Service</button>
                        <button onClick={()=>setEditingDelivery(null)} className="btn-outline">Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PAYMENT ── */}
            {tab === 'payment' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">Manual Payment Methods</h3>
                <Toggle label="🏦 Bank Transfer" desc="Accept direct bank transfers" value={settings.bankTransferEnabled} onChange={()=>setSettings(p=>({...p,bankTransferEnabled:!p.bankTransferEnabled}))} />
                {settings.bankTransferEnabled && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3 ml-4 border-l-2 border-primary">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <F label="Bank Name" value={settings.bankName} onChange={e=>setSettings(p=>({...p,bankName:e.target.value}))} placeholder="Bank of Ceylon" />
                      <F label="Account Name" value={settings.bankAccountName} onChange={e=>setSettings(p=>({...p,bankAccountName:e.target.value}))} />
                      <F label="Account Number" value={settings.bankAccountNumber} onChange={e=>setSettings(p=>({...p,bankAccountNumber:e.target.value}))} />
                      <F label="Branch" value={settings.bankBranch} onChange={e=>setSettings(p=>({...p,bankBranch:e.target.value}))} />
                    </div>
                  </div>
                )}
                <Toggle label="💵 Cash on Delivery" desc="Accept cash on delivery" value={settings.codEnabled} onChange={()=>setSettings(p=>({...p,codEnabled:!p.codEnabled}))} />
                <SaveBar/>
              </div>
            )}

            {/* ── GATEWAYS ── */}
            {tab === 'gateways' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Payment Gateways</h3>
                <p className="text-sm text-gray-400 mb-5">Configure online payment gateways. Customers will see enabled gateways at checkout.</p>
                <div className="space-y-5">
                  {Object.entries(GATEWAY_PRESETS).map(([gwKey, preset]) => {
                    const cfg = gwConfigs[gwKey] || {};
                    const isEnabled = cfg.isEnabled || false;
                    return (
                      <div key={gwKey} className={`border-2 rounded-2xl overflow-hidden transition-all ${isEnabled ? 'border-primary/30' : 'border-gray-100'}`}>
                        <div className={`flex items-center justify-between p-4 ${isEnabled ? 'bg-primary/5' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{preset.logo}</span>
                            <div>
                              <p className="font-bold text-gray-800">{preset.name}</p>
                              <p className="text-xs text-gray-500">Payment gateway integration</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{isEnabled ? 'Enabled' : 'Disabled'}</span>
                            <div onClick={() => toggleGateway(gwKey)} className={`w-12 h-6 rounded-full cursor-pointer relative transition-all ${isEnabled ? 'bg-primary' : 'bg-gray-200'}`}>
                              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${isEnabled ? 'left-6' : 'left-0.5'}`}/>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Live Mode</label>
                            <div onClick={() => setGwConfigs(p => ({ ...p, [gwKey]: { ...p[gwKey], isLive: !cfg.isLive } }))}
                              className={`w-10 h-5 rounded-full cursor-pointer relative transition-all ${cfg.isLive ? 'bg-green-500' : 'bg-gray-200'}`}>
                              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${cfg.isLive ? 'left-5' : 'left-0.5'}`}/>
                            </div>
                          </div>
                          {!cfg.isLive && <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5">⚠️ Sandbox/Test mode — no real charges</p>}
                          <div className="grid sm:grid-cols-2 gap-3">
                            {preset.fields.map(field => (
                              <div key={field.key}>
                                <label className="form-label text-xs">{field.label}</label>
                                <input type={field.type} value={cfg[field.key]||''} onChange={e=>setGwConfigs(p=>({...p,[gwKey]:{...p[gwKey],[field.key]:e.target.value}}))}
                                  className="form-input text-sm" placeholder={field.type==='password'?'••••••••':''}/>
                                {field.hint && <p className="text-xs text-gray-400 mt-0.5">{field.hint}</p>}
                              </div>
                            ))}
                          </div>
                          <button onClick={() => saveGateway(gwKey)} className="btn-primary text-sm">Save {preset.name} Settings</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-sm font-semibold text-blue-800 mb-1">💡 More gateways coming</p>
                  <p className="text-xs text-blue-600">Razorpay, 2Checkout, HNB iPay, Sampath Vishwa integrations available on request.</p>
                </div>
              </div>
            )}

            {/* ── APPEARANCE ── */}
            {tab === 'appearance' && (
              <div className="space-y-7">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Color Themes</h3>
                  <p className="text-xs text-gray-400 mb-4">Click to preview instantly. Save to apply permanently.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                    {Object.entries(THEMES).map(([key, theme]) => (
                      <button key={key} onClick={() => applyPreset(key)}
                        className={`relative p-3 rounded-2xl border-2 transition-all hover:scale-105 hover:shadow-md ${settings.theme===key?'border-gray-800 shadow-xl':'border-gray-100 hover:border-gray-300'}`}>
                        <div className="flex gap-1 mb-2 rounded-lg overflow-hidden h-9">
                          <div className="flex-1" style={{background:theme.primary}}/><div className="flex-1" style={{background:theme.accent}}/><div className="flex-1" style={{background:theme.dark}}/>
                        </div>
                        <p className="text-xs font-bold text-gray-700 text-center">{theme.name}</p>
                        {settings.theme===key && <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><span className="text-white text-xs font-bold">✓</span></div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-5">
                  <h4 className="font-semibold text-gray-800 mb-3">Custom Colors</h4>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[['primaryColor','🎨 Primary',currentTheme.primary],['secondaryColor','✨ Accent',currentTheme.accent],['darkBgColor','🌑 Dark BG',currentTheme.dark]].map(([key,label,fb]) => (
                      <div key={key}>
                        <label className="form-label text-xs">{label}</label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={settings[key]||fb||'#000000'} onChange={e=>handleColor(key,e.target.value)} className="w-12 h-10 rounded-xl border-2 border-gray-200 cursor-pointer p-0.5 flex-shrink-0"/>
                          <input value={settings[key]||fb||''} onChange={e=>handleColor(key,e.target.value)} className="form-input font-mono text-sm flex-1"/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-5">
                  <h4 className="font-semibold text-gray-800 mb-4">Logo & Favicon</h4>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <ImageUpload label="Store Logo" hint="Recommended: 200×60px PNG or SVG" value={settings.logoUrl} onChange={url=>setSettings(p=>({...p,logoUrl:url}))} />
                    <ImageUpload label="Favicon" hint="32×32px .ico or .png" value={settings.faviconUrl} onChange={url=>setSettings(p=>({...p,faviconUrl:url}))} />
                  </div>
                </div>

                <div className="border-t pt-5">
                  <h4 className="font-semibold text-gray-800 mb-1">Custom CSS</h4>
                  <p className="text-xs text-gray-400 mb-2">Inject CSS into the storefront</p>
                  <textarea value={settings.customCSS||''} onChange={e=>setSettings(p=>({...p,customCSS:e.target.value}))} rows={5} className="form-input resize-none font-mono text-xs" placeholder=".btn-primary { border-radius: 20px; }"/>
                </div>

                {/* Live preview */}
                <div className="border-t pt-5">
                  <h4 className="font-semibold text-gray-800 mb-3">Live Preview</h4>
                  <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                    <div className="py-1.5 text-center text-xs font-semibold text-white" style={{background:settings.primaryColor||currentTheme.primary}}>🚚 Free delivery on orders over {settings.currencySymbol||'Rs.'} {(settings.freeDeliveryThreshold||5000).toLocaleString()}</div>
                    <div className="px-5 py-4 flex items-center justify-between" style={{background:settings.darkBgColor||currentTheme.dark}}>
                      <div className="flex items-center gap-2.5">
                        {settings.logoUrl ? <img src={settings.logoUrl} alt="" className="h-8 object-contain"/> : <span className="font-bold text-white text-base" style={{fontFamily:currentFont.display}}>{settings.storeName||'ShopZen'}</span>}
                      </div>
                      <div className="px-4 py-1.5 rounded-lg text-white text-xs font-semibold" style={{background:settings.primaryColor||currentTheme.primary}}>Shop Now</div>
                    </div>
                    <div className="p-4 grid grid-cols-3 gap-2" style={{background:currentTheme.bodyBg}}>
                      {[1,2,3].map(i=>(
                        <div key={i} className="rounded-xl overflow-hidden border border-gray-100" style={{background:currentTheme.cardBg}}>
                          <div className="h-12" style={{background:`linear-gradient(135deg,${settings.primaryColor||currentTheme.primary}33,${settings.secondaryColor||currentTheme.accent}33)`}}/>
                          <div className="p-2 space-y-1"><div className="h-2 bg-gray-200 rounded-full"/><div className="h-3 rounded-full w-2/3" style={{background:settings.primaryColor||currentTheme.primary}}/></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <SaveBar/>
              </div>
            )}

            {/* ── FONTS ── */}
            {tab === 'fonts' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Typography</h3>
                <p className="text-sm text-gray-400 mb-5">Click to preview. Save to apply site-wide.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(FONTS).map(([key, font]) => (
                    <button key={key} onClick={()=>applyFont(key)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all hover:shadow-lg ${settings.fontStyle===key?'border-primary bg-primary/5 shadow-lg':'border-gray-100 hover:border-gray-200'}`}>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <p className="text-xl font-bold text-gray-900 leading-tight" style={{fontFamily:font.display}}>{settings.storeName||'ShopZen'}</p>
                        {settings.fontStyle===key&&<span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3" style={{fontFamily:font.body}}>Premium shopping. Quality products delivered to your door.</p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">{font.name?.split(' + ')?.[0] || font.name || ''}</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">+</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">{font.name?.split(' + ')?.[1] || ''}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <SaveBar/>
              </div>
            )}


            {/* ── BANNERS ── */}
            {tab === 'banners' && <BannersTab />}

            {/* ── PAGES ── */}
            {tab === 'pages' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div><h3 className="font-semibold text-gray-900">Business Pages</h3><p className="text-xs text-gray-400">About, Terms, Privacy, FAQ, Contact etc</p></div>
                  <button onClick={() => { setPageForm({ slug:'', title:'', content:'', showInFooter:true, showInNav:false, sortOrder:0 }); setEditingPage('new'); }} className="btn-primary text-sm">+ Add Page</button>
                </div>
                <div className="space-y-2">
                  {pages.map(page => (
                    <div key={page._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{page.title}</p>
                        <p className="text-xs text-gray-400">/page/{page.slug} {page.showInFooter?'· Footer':''} {page.showInNav?'· Nav':''}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setPageForm({...page}); setEditingPage(page); }} className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">Edit</button>
                        <button onClick={() => deletePage(page._id)} className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

                {editingPage && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingPage(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                      <h3 className="font-bold text-lg mb-4">{editingPage === 'new' ? 'Create Page' : 'Edit Page'}</h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="form-label">Title *</label><input value={pageForm.title} onChange={e=>setPageForm(p=>({...p,title:e.target.value}))} className="form-input"/></div>
                          <div><label className="form-label">URL Slug *</label><input value={pageForm.slug} onChange={e=>setPageForm(p=>({...p,slug:e.target.value.toLowerCase().replace(/\s/g,'-')}))} className="form-input" placeholder="about-us"/></div>
                        </div>
                        <div><label className="form-label">Content (HTML)</label><textarea value={pageForm.content} onChange={e=>setPageForm(p=>({...p,content:e.target.value}))} rows={10} className="form-input resize-none font-mono text-xs" placeholder="<h2>Title</h2><p>Your content...</p>"/></div>
                        <div className="flex gap-5">
                          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={pageForm.showInFooter} onChange={e=>setPageForm(p=>({...p,showInFooter:e.target.checked}))} className="accent-primary"/><span className="text-sm">Show in Footer</span></label>
                          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={pageForm.showInNav} onChange={e=>setPageForm(p=>({...p,showInNav:e.target.checked}))} className="accent-primary"/><span className="text-sm">Show in Nav</span></label>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4 pt-4 border-t">
                        <button onClick={savePage} className="btn-primary flex-1">Save Page</button>
                        <button onClick={()=>setEditingPage(null)} className="btn-outline">Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* ── CONTENT CUSTOMIZER ── */}
            {tab === 'content' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900 mb-2">Content Customizer</h3>
                <p className="text-sm text-gray-400 mb-5">Customize every text label on your storefront — no coding needed.</p>

                {/* Hero Stats */}
                <div className="border border-gray-100 rounded-xl p-5">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">🏆 Hero Stats Numbers</h4>
                  <div className="space-y-3">
                    {(() => {
                      let stats = [];
                      try { stats = JSON.parse(settings.heroStats||'[]'); } catch {}
                      return stats.map((s,i) => (
                        <div key={i} className="flex gap-3 items-center">
                          <input value={s.number} onChange={e=>{ const n=[...stats]; n[i]={...n[i],number:e.target.value}; setSettings(p=>({...p,heroStats:JSON.stringify(n)})); }} className="form-input w-28 text-sm" placeholder="50K+"/>
                          <input value={s.label} onChange={e=>{ const n=[...stats]; n[i]={...n[i],label:e.target.value}; setSettings(p=>({...p,heroStats:JSON.stringify(n)})); }} className="form-input flex-1 text-sm" placeholder="Products"/>
                          <button onClick={()=>{ const n=stats.filter((_,si)=>si!==i); setSettings(p=>({...p,heroStats:JSON.stringify(n)})); }} className="text-red-400 hover:text-red-600 text-sm px-2">✕</button>
                        </div>
                      ));
                    })()}
                    <button onClick={()=>{ let s=[]; try{s=JSON.parse(settings.heroStats||'[]');}catch{}; s.push({number:'100+',label:'New Label'}); setSettings(p=>({...p,heroStats:JSON.stringify(s)})); }}
                      className="text-sm font-semibold" style={{color:'var(--color-primary)'}}>+ Add Stat</button>
                  </div>
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input type="checkbox" checked={settings.heroShowStats!==false} onChange={e=>setSettings(p=>({...p,heroShowStats:e.target.checked}))} style={{accentColor:'var(--color-primary)'}} className="w-4 h-4"/>
                    <span className="text-sm text-gray-700">Show stats in hero</span>
                  </label>
                  <div className="mt-3"><label className="form-label">Browse All Button Label</label>
                    <input value={settings.heroBrowseAllLabel||'Browse All'} onChange={e=>setSettings(p=>({...p,heroBrowseAllLabel:e.target.value}))} className="form-input"/></div>
                </div>

                {/* Trust Badges */}
                <div className="border border-gray-100 rounded-xl p-5">
                  <h4 className="font-bold text-gray-800 mb-4">🏅 Trust Bar Badges</h4>
                  <div className="space-y-3">
                    {(() => {
                      let badges = [];
                      try { badges = JSON.parse(settings.trustBadges||'[]'); } catch {}
                      return badges.map((b,i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-xl">
                          <input value={b.icon} onChange={e=>{ const n=[...badges]; n[i]={...n[i],icon:e.target.value}; setSettings(p=>({...p,trustBadges:JSON.stringify(n)})); }} className="form-input text-center col-span-1 text-lg px-1" placeholder="🚀"/>
                          <input value={b.title} onChange={e=>{ const n=[...badges]; n[i]={...n[i],title:e.target.value}; setSettings(p=>({...p,trustBadges:JSON.stringify(n)})); }} className="form-input col-span-4 text-sm" placeholder="Title"/>
                          <input value={b.subtitle} onChange={e=>{ const n=[...badges]; n[i]={...n[i],subtitle:e.target.value}; setSettings(p=>({...p,trustBadges:JSON.stringify(n)})); }} className="form-input col-span-5 text-sm" placeholder="Subtitle"/>
                          <div className="col-span-1 flex justify-center">
                            <input type="checkbox" checked={b.enabled!==false} onChange={e=>{ const n=[...badges]; n[i]={...n[i],enabled:e.target.checked}; setSettings(p=>({...p,trustBadges:JSON.stringify(n)})); }} style={{accentColor:'var(--color-primary)'}} className="w-4 h-4"/>
                          </div>
                          <button onClick={()=>{ const n=badges.filter((_,bi)=>bi!==i); setSettings(p=>({...p,trustBadges:JSON.stringify(n)})); }} className="text-red-400 hover:text-red-600 text-sm col-span-1">✕</button>
                        </div>
                      ));
                    })()}
                    <button onClick={()=>{ let b=[]; try{b=JSON.parse(settings.trustBadges||'[]');}catch{}; b.push({icon:'⭐',title:'New Badge',subtitle:'Description',enabled:true}); setSettings(p=>({...p,trustBadges:JSON.stringify(b)})); }}
                      className="text-sm font-semibold" style={{color:'var(--color-primary)'}}>+ Add Badge</button>
                  </div>
                </div>

                {/* Section Labels */}
                <div className="border border-gray-100 rounded-xl p-5">
                  <h4 className="font-bold text-gray-800 mb-4">📝 Section Labels</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      ['sectionFeaturedTitle','Featured Title'],['sectionFeaturedSubtitle','Featured Subtitle'],
                      ['sectionSaleTitle','Sale Title'],['sectionSaleSubtitle','Sale Subtitle'],
                      ['sectionNewTitle','New Arrivals Title'],['sectionNewSubtitle','New Arrivals Subtitle'],
                      ['sectionCatTitle','Categories Title'],['sectionCatSubtitle','Categories Subtitle'],
                    ].map(([key,label])=>(
                      <div key={key}>
                        <label className="form-label">{label}</label>
                        <input value={settings[key]||''} onChange={e=>setSettings(p=>({...p,[key]:e.target.value}))} className="form-input text-sm"/>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Newsletter Labels */}
                <div className="border border-gray-100 rounded-xl p-5">
                  <h4 className="font-bold text-gray-800 mb-4">📬 Newsletter Labels</h4>
                  <div className="space-y-3">
                    {[
                      ['newsletterBadgeLabel','Badge Label','Newsletter'],
                      ['newsletterTitle','Heading','Be the First to Know'],
                      ['newsletterSubtitle','Subtitle','Exclusive deals in your inbox.'],
                      ['newsletterCta','Button Text','Subscribe'],
                      ['newsletterDisclaimer','Disclaimer Text','No spam. Unsubscribe any time.'],
                    ].map(([key,label,placeholder])=>(
                      <div key={key}>
                        <label className="form-label">{label}</label>
                        <input value={settings[key]||''} onChange={e=>setSettings(p=>({...p,[key]:e.target.value}))} className="form-input text-sm" placeholder={placeholder}/>
                      </div>
                    ))}
                  </div>
                </div>

                <SaveBar/>
              </div>
            )}
            {/* ── SEO ── */}
            {tab === 'seo' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-2">SEO & Analytics</h3>
                <div className="rounded-2xl border-2 p-5 text-center" style={{borderColor:'var(--color-primary)',background:'var(--color-primary)08'}}>
                  <div className="text-4xl mb-2">🔍</div>
                  <h4 className="font-bold text-gray-900 mb-1" style={{fontFamily:'var(--font-display)'}}>Full SEO Dashboard Available</h4>
                  <p className="text-sm text-gray-500 mb-4">Complete SEO tools including Core Web Vitals, Sitemap generator, Robots.txt editor, Google Analytics, Search Console, Social signals and more.</p>
                  <a href="/admin/seo" className="btn-primary inline-flex items-center gap-2 text-sm">Open SEO Dashboard →</a>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <F label="Google Analytics ID" value={settings.googleAnalytics} onChange={e=>setSettings(p=>({...p,googleAnalytics:e.target.value}))} placeholder="G-XXXXXXXXXX" hint="GA4 Measurement ID"/>
                  <F label="Facebook Pixel ID" value={settings.facebookPixel} onChange={e=>setSettings(p=>({...p,facebookPixel:e.target.value}))} placeholder="123456789012345"/>
                </div>
                <SaveBar/>
              </div>
            )}

            {/* ── FEATURES ── */}
            {tab === 'features' && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 mb-4">Store Features</h3>
                <p className="text-xs text-gray-400 mb-4">Enable or disable features based on your business needs</p>
                <Toggle label="💌 Newsletter Subscription" desc="Allow customers to subscribe to newsletter" value={settings.enableNewsletter} onChange={()=>setSettings(p=>({...p,enableNewsletter:!p.enableNewsletter}))} />
                <Toggle label="❤️ Wishlist" desc="Allow customers to save products to wishlist" value={settings.enableWishlist} onChange={()=>setSettings(p=>({...p,enableWishlist:!p.enableWishlist}))} />
                <Toggle label="⭐ Product Reviews" desc="Allow customers to leave reviews" value={settings.enableReviews} onChange={()=>setSettings(p=>({...p,enableReviews:!p.enableReviews}))} />
                <Toggle label="🎁 Gift Cards" desc="Enable gift card purchase and redemption" value={settings.enableGiftCards} onChange={()=>setSettings(p=>({...p,enableGiftCards:!p.enableGiftCards}))} />
                <Toggle label="↩️ Returns & Refunds" desc="Allow customers to submit return requests" value={settings.enableReturns} onChange={()=>setSettings(p=>({...p,enableReturns:!p.enableReturns}))} />
                {settings.enableReturns && (
                  <div className="ml-4">
                    <F label="Return Window (days)" type="number" value={settings.maxReturnDays} onChange={e=>setSettings(p=>({...p,maxReturnDays:Number(e.target.value)}))} hint="Days after delivery customer can request return"/>
                  </div>
                )}
                <Toggle label="⭐ Require Review Approval" desc="Manually approve reviews before publishing" value={settings.reviewsRequireApproval} onChange={()=>setSettings(p=>({...p,reviewsRequireApproval:!p.reviewsRequireApproval}))} />
                <Toggle label="👤 Guest Checkout" desc="Allow orders without account" value={settings.allowGuestCheckout} onChange={()=>setSettings(p=>({...p,allowGuestCheckout:!p.allowGuestCheckout}))} />
                <SaveBar/>
              </div>
            )}

            {/* ── ADVANCED ── */}
            {tab === 'advanced' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">Advanced Settings</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <F label="Low Stock Alert Threshold" type="number" value={settings.lowStockAlert} onChange={e=>setSettings(p=>({...p,lowStockAlert:Number(e.target.value)}))} hint="Alert when stock falls below this"/>
                  <F label="Order Notification Email" type="email" value={settings.orderNotificationEmail} onChange={e=>setSettings(p=>({...p,orderNotificationEmail:e.target.value}))} hint="Receive order alerts here"/>
                </div>
                <Toggle label="✅ Auto-Confirm Orders" desc="Automatically confirm orders after placement" value={settings.autoConfirmOrders} onChange={()=>setSettings(p=>({...p,autoConfirmOrders:!p.autoConfirmOrders}))} />
                <Toggle label="⚠️ Maintenance Mode" desc="Show maintenance page to all visitors" value={settings.maintenanceMode} onChange={()=>setSettings(p=>({...p,maintenanceMode:!p.maintenanceMode}))} />
                <SaveBar/>
              </div>
            )}

            {/* ── ADMINS ── */}
            {tab === 'admins' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-5">Create Admin Account</h3>
                <div className="max-w-md space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="form-label">First Name *</label><input value={adminForm.firstName} onChange={e=>setAdminForm(p=>({...p,firstName:e.target.value}))} className="form-input"/></div>
                    <div><label className="form-label">Last Name</label><input value={adminForm.lastName} onChange={e=>setAdminForm(p=>({...p,lastName:e.target.value}))} className="form-input"/></div>
                  </div>
                  <div><label className="form-label">Email *</label><input type="email" value={adminForm.email} onChange={e=>setAdminForm(p=>({...p,email:e.target.value}))} className="form-input"/></div>
                  <div><label className="form-label">Password *</label><input type="password" value={adminForm.password} onChange={e=>setAdminForm(p=>({...p,password:e.target.value}))} className="form-input"/></div>
                  <div><label className="form-label">Confirm Password *</label><input type="password" value={adminForm.confirmPassword} onChange={e=>setAdminForm(p=>({...p,confirmPassword:e.target.value}))} className="form-input"/></div>
                  <button onClick={createAdmin} disabled={creatingAdmin} className="btn-primary">{creatingAdmin?'Creating...':'Create Admin Account'}</button>
                </div>
                <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl max-w-md">
                  <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ Security Notice</p>
                  <p className="text-xs text-amber-700">Admin accounts have full access. Only create for trusted team members.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}