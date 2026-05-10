import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const PRESETS = {
  christmas: { name:'🎄 Christmas', theme:{ primaryColor:'#15803d', secondaryColor:'#dc2626', bgColor:'#052e16', snowEffect:true, confettiEffect:false }, announcement:'🎄 Merry Christmas! Special discounts all week!', announcementBg:'#15803d', featuredBannerTitle:'Christmas Sale 🎄', featuredBannerSubtitle:'Up to 50% off on selected items', discountPercent:25, couponCode:'XMAS25' },
  newyear: { name:'🎊 New Year', theme:{ primaryColor:'#7c3aed', secondaryColor:'#f59e0b', bgColor:'#1e1b4b', snowEffect:false, confettiEffect:true }, announcement:'🎊 Happy New Year! Use NEWYEAR20 for 20% off!', announcementBg:'#7c3aed', featuredBannerTitle:'New Year Sale 🎊', featuredBannerSubtitle:'Start the year with amazing deals', discountPercent:20, couponCode:'NEWYEAR20' },
  blackfriday: { name:'🖤 Black Friday', theme:{ primaryColor:'#111827', secondaryColor:'#f59e0b', bgColor:'#030712', snowEffect:false, confettiEffect:false }, announcement:'🖤 BLACK FRIDAY — Biggest sale of the year!', announcementBg:'#111827', featuredBannerTitle:'Black Friday 🖤', featuredBannerSubtitle:'Unbeatable deals — today only', discountPercent:50, couponCode:'BLACK50' },
  valentines: { name:'💝 Valentine\'s', theme:{ primaryColor:'#be185d', secondaryColor:'#fb7185', bgColor:'#1f0a14', snowEffect:false, confettiEffect:true }, announcement:'💝 Valentine\'s Day — Show love with special gifts!', announcementBg:'#be185d', featuredBannerTitle:'Valentine\'s Day 💝', featuredBannerSubtitle:'Perfect gifts for your loved ones', discountPercent:15, couponCode:'LOVE15' },
  eid: { name:'☪️ Eid', theme:{ primaryColor:'#b45309', secondaryColor:'#fbbf24', bgColor:'#1c0a00', snowEffect:false, confettiEffect:true }, announcement:'☪️ Eid Mubarak! Special Eid discounts!', announcementBg:'#b45309', featuredBannerTitle:'Eid Mubarak ☪️', featuredBannerSubtitle:'Celebrate with amazing deals', discountPercent:20, couponCode:'EID20' },
  halloween: { name:'🎃 Halloween', theme:{ primaryColor:'#ea580c', secondaryColor:'#a16207', bgColor:'#0c0500', snowEffect:false, confettiEffect:false }, announcement:'🎃 Halloween Sale — Spooky deals inside!', announcementBg:'#ea580c', featuredBannerTitle:'Halloween 🎃', featuredBannerSubtitle:'Frighteningly good deals', discountPercent:30, couponCode:'SPOOKY30' },
  easter: { name:'🐣 Easter', theme:{ primaryColor:'#059669', secondaryColor:'#a78bfa', bgColor:'#022c22', snowEffect:false, confettiEffect:true }, announcement:'🐣 Happy Easter! Egg-citing deals await!', announcementBg:'#059669', featuredBannerTitle:'Easter 🐣', featuredBannerSubtitle:'Egg-stra special deals this Easter', discountPercent:20, couponCode:'EASTER20' },
};

const emptyForm = { name:'', type:'custom', isActive:false, announcement:'', announcementBg:'#b5451b', discountPercent:0, couponCode:'', featuredBannerTitle:'', featuredBannerSubtitle:'', startDate:'', endDate:'', theme:{ primaryColor:'#b5451b', secondaryColor:'#f0a500', bgColor:'#0f172a', snowEffect:false, confettiEffect:false, customCSS:'' } };

// ── Live Preview Components ───────────────────────────────────────────────────
const SnowPreview = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {Array.from({length:12},(_,i)=>({id:i,left:Math.random()*100,delay:Math.random()*5,dur:3+Math.random()*5})).map(f=>(
      <div key={f.id} style={{position:'absolute',top:-10,left:`${f.left}%`,animationName:'snowfall',animationDuration:`${f.dur}s`,animationDelay:`${f.delay}s`,animationTimingFunction:'linear',animationIterationCount:'infinite',color:'rgba(255,255,255,0.8)',fontSize:'14px'}}>❄</div>
    ))}
  </div>
);

const ConfettiPreview = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {Array.from({length:15},(_,i)=>({id:i,left:Math.random()*100,delay:Math.random()*4,dur:2+Math.random()*4,color:['#b5451b','#f0a500','#3b82f6','#10b981','#8b5cf6','#ef4444'][i%6]})).map(p=>(
      <div key={p.id} style={{position:'absolute',top:-10,left:`${p.left}%`,width:8,height:8,borderRadius:2,background:p.color,animationName:'confetti-fall',animationDuration:`${p.dur}s`,animationDelay:`${p.delay}s`,animationTimingFunction:'linear',animationIterationCount:'infinite'}}/>
    ))}
  </div>
);

export default function AdminSeasonal() {
  const [campaigns, setCampaigns] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    try { const { data } = await API.get('/seasonal/admin/all'); setCampaigns(data); } catch {}
  };

  const applyPreset = (key) => {
    const p = PRESETS[key];
    if (!p) return;
    setForm(prev => ({ ...prev, name:p.name, type:key==='newyear'?'new_year':key==='blackfriday'?'black_friday':key==='valentines'?'valentines':key, announcement:p.announcement, announcementBg:p.announcementBg, featuredBannerTitle:p.featuredBannerTitle, featuredBannerSubtitle:p.featuredBannerSubtitle, discountPercent:p.discountPercent, couponCode:p.couponCode, theme:{ ...prev.theme, ...p.theme } }));
    toast.success(`${p.name} preset applied!`);
  };

  const save = async () => {
    if (!form.name) { toast.error('Campaign name required'); return; }
    setSaving(true);
    try {
      if (editingId) { await API.put(`/seasonal/admin/${editingId}`, form); toast.success('Campaign updated!'); }
      else { await API.post('/seasonal/admin', form); toast.success('Campaign created!'); }
      setModal(false); fetchCampaigns();
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id) => {
    const campaign = campaigns.find(c=>c._id===id);
    if (!campaign.isActive) {
      await API.put(`/seasonal/admin/${id}/toggle`);
      toast.success('Campaign activated!');
    } else {
      await API.put('/seasonal/admin/deactivate-all');
      toast.success('Campaign deactivated');
    }
    fetchCampaigns();
  };

  const deleteCampaign = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    await API.delete(`/seasonal/admin/${id}`);
    fetchCampaigns();
  };

  const openEdit = (campaign) => {
    setForm({ ...emptyForm, ...campaign, startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().slice(0,10) : '', endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().slice(0,10) : '', theme: { ...emptyForm.theme, ...campaign.theme } });
    setEditingId(campaign._id);
    setModal(true);
  };

  const openNew = () => { setForm(emptyForm); setEditingId(null); setModal(true); };

  const T = ({ label, value, onChange, type='text', placeholder }) => (
    <div>
      <label className="form-label">{label}</label>
      <input type={type} value={value||''} onChange={onChange} placeholder={placeholder} className="form-input"/>
    </div>
  );

  const Toggle = ({ label, value, onChange }) => (
    <label className="flex items-center justify-between py-2.5 cursor-pointer">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div onClick={onChange} className={`w-11 h-6 rounded-full relative transition-all ${value?'bg-primary':'bg-gray-200'}`}>
        <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${value?'left-5.5':'left-0.5'}`} style={{width:18,height:18,left:value?22:2}}/>
      </div>
    </label>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div><h2 className="font-display text-xl font-bold text-gray-900">Seasonal Campaigns</h2><p className="text-sm text-gray-500">Create themed promotions with effects</p></div>
        <button onClick={openNew} className="btn-primary text-sm">+ New Campaign</button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-3">🎄</div>
          <p className="text-gray-400 mb-4">No campaigns yet</p>
          <button onClick={openNew} className="btn-primary text-sm">Create your first campaign</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map(c => (
            <div key={c._id} className={`rounded-2xl overflow-hidden border-2 ${c.isActive?'border-green-400 shadow-lg shadow-green-100':'border-gray-100'}`}>
              <div className="p-5 text-white relative overflow-hidden" style={{background:`linear-gradient(135deg, ${c.theme?.primaryColor||'#b5451b'}, ${c.theme?.bgColor||'#0f172a'})`}}>
                {c.theme?.snowEffect && <SnowPreview/>}
                {c.theme?.confettiEffect && <ConfettiPreview/>}
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg leading-tight">{c.name}</h3>
                    {c.isActive && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0">LIVE</span>}
                  </div>
                  {c.featuredBannerTitle && <p className="text-white/80 text-sm mt-1">{c.featuredBannerTitle}</p>}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {c.couponCode && <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-lg font-mono font-bold">{c.couponCode}</span>}
                    {c.discountPercent > 0 && <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-lg">{c.discountPercent}% off</span>}
                    {c.theme?.snowEffect && <span className="text-sm">❄️</span>}
                    {c.theme?.confettiEffect && <span className="text-sm">🎊</span>}
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 flex items-center gap-2 flex-wrap">
                <button onClick={()=>toggleActive(c._id)} className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex-1 transition-all ${c.isActive?'bg-red-50 text-red-600 hover:bg-red-100':'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                  {c.isActive?'⏹ Deactivate':'▶ Activate'}
                </button>
                <button onClick={()=>openEdit(c)} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">Edit</button>
                <button onClick={()=>deleteCampaign(c._id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto scale-in" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-gray-900">{editingId?'Edit Campaign':'New Campaign'}</h3>
              <button onClick={()=>setModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">✕</button>
            </div>
            <div className="p-5 space-y-5">
              {/* Presets */}
              <div>
                <p className="form-label mb-2">Quick Presets</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {Object.entries(PRESETS).map(([key,p])=>(
                    <button key={key} type="button" onClick={()=>applyPreset(key)}
                      className="p-2.5 rounded-xl border border-gray-200 hover:border-primary hover:shadow-sm transition-all text-center">
                      <div className="text-xl mb-0.5">{p.name.split(' ')[0]}</div>
                      <div className="text-xs text-gray-600 font-medium leading-tight">{p.name.slice(p.name.indexOf(' ')+1)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic */}
              <div className="grid sm:grid-cols-2 gap-3">
                <T label="Campaign Name *" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Christmas Sale 2024"/>
                <T label="Coupon Code" value={form.couponCode} onChange={e=>setForm(p=>({...p,couponCode:e.target.value.toUpperCase()}))} placeholder="XMAS25"/>
                <T label="Discount %" type="number" value={form.discountPercent} onChange={e=>setForm(p=>({...p,discountPercent:Number(e.target.value)}))} placeholder="25"/>
                <div>
                  <label className="form-label">Announcement BG Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={form.announcementBg||'#b5451b'} onChange={e=>setForm(p=>({...p,announcementBg:e.target.value}))} className="w-11 h-10 rounded-xl border-2 border-gray-200 cursor-pointer p-0.5"/>
                    <input value={form.announcementBg||''} onChange={e=>setForm(p=>({...p,announcementBg:e.target.value}))} className="form-input font-mono text-sm flex-1"/>
                  </div>
                </div>
                <T label="Start Date" type="date" value={form.startDate} onChange={e=>setForm(p=>({...p,startDate:e.target.value}))}/>
                <T label="End Date" type="date" value={form.endDate} onChange={e=>setForm(p=>({...p,endDate:e.target.value}))}/>
              </div>

              <div><label className="form-label">Announcement Text</label><input value={form.announcement} onChange={e=>setForm(p=>({...p,announcement:e.target.value}))} className="form-input" placeholder="🎄 Merry Christmas! 25% off everything!"/></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <T label="Banner Title" value={form.featuredBannerTitle} onChange={e=>setForm(p=>({...p,featuredBannerTitle:e.target.value}))} placeholder="Christmas Sale"/>
                <T label="Banner Subtitle" value={form.featuredBannerSubtitle} onChange={e=>setForm(p=>({...p,featuredBannerSubtitle:e.target.value}))} placeholder="Up to 50% off!"/>
              </div>

              {/* Theme colors */}
              <div>
                <p className="form-label mb-2">Theme Colors</p>
                <div className="grid grid-cols-3 gap-3">
                  {[['primaryColor','Primary'],['secondaryColor','Accent'],['bgColor','Background']].map(([key,label])=>(
                    <div key={key}>
                      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                      <div className="flex gap-1.5 items-center">
                        <input type="color" value={form.theme?.[key]||'#000000'} onChange={e=>setForm(p=>({...p,theme:{...p.theme,[key]:e.target.value}}))} className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 flex-shrink-0"/>
                        <input value={form.theme?.[key]||''} onChange={e=>setForm(p=>({...p,theme:{...p.theme,[key]:e.target.value}}))} className="form-input font-mono text-xs flex-1"/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Effects */}
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-800 mb-3">✨ Visual Effects</p>
                <div className="space-y-1">
                  <Toggle label="❄️ Snow Effect — falling snowflakes" value={form.theme?.snowEffect} onChange={()=>setForm(p=>({...p,theme:{...p.theme,snowEffect:!p.theme?.snowEffect}}))}/>
                  <Toggle label="🎊 Confetti Effect — celebration confetti" value={form.theme?.confettiEffect} onChange={()=>setForm(p=>({...p,theme:{...p.theme,confettiEffect:!p.theme?.confettiEffect}}))}/>
                </div>
                {/* Live preview */}
                <div className="mt-3 rounded-xl overflow-hidden relative h-24" style={{background:`linear-gradient(135deg,${form.theme?.primaryColor||'#b5451b'},${form.theme?.bgColor||'#0f172a'})`}}>
                  {form.theme?.snowEffect && <SnowPreview/>}
                  {form.theme?.confettiEffect && <ConfettiPreview/>}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm z-10 relative">{form.name||'Campaign Preview'}</span>
                  </div>
                </div>
              </div>

              <Toggle label="Activate campaign immediately" value={form.isActive} onChange={()=>setForm(p=>({...p,isActive:!p.isActive}))}/>
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <button onClick={save} disabled={saving} className="btn-primary flex-1">{saving?'Saving...':editingId?'Save Changes':'Create Campaign'}</button>
              <button onClick={()=>setModal(false)} className="btn-outline px-6">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
