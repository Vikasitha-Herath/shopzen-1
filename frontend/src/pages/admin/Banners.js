import ImageUpload from '../../components/ImageUpload';
import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h2 className="font-display font-bold text-xl text-gray-900">{title}</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">×</button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

export function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { title: '', subtitle: '', image: '', link: '', buttonText: 'Shop Now', position: 'hero', isActive: true, sortOrder: 0 };
  const [form, setForm] = useState(emptyForm);

  const fetch = async () => { const { data } = await API.get('/banners/admin/all'); setBanners(data); };
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (b) => { setForm({ ...b }); setEditing(b); setModal(true); };

  const save = async () => {
    if (!form.title) { toast.error('Title required'); return; }
    setSaving(true);
    try {
      if (editing) { await API.put(`/banners/${editing._id}`, form); toast.success('Banner updated'); }
      else { await API.post('/banners', form); toast.success('Banner created'); }
      setModal(false); fetch();
    } catch (err) { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete banner?')) return;
    await API.delete(`/banners/${id}`); toast.success('Deleted'); fetch();
  };

  const toggle = async (b) => {
    await API.put(`/banners/${b._id}`, { ...b, isActive: !b.isActive });
    fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="font-display text-xl font-bold text-gray-900">Banners</h2><p className="text-sm text-gray-500">Manage homepage banners and promotions</p></div>
        <button onClick={openAdd} className="btn-primary text-sm">+ Add Banner</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.length === 0 && <div className="col-span-3 bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">No banners. Create your first banner!</div>}
        {banners.map(b => (
          <div key={b._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group">
            <div className="relative aspect-video bg-gray-100">
              {b.image ? <img src={b.image} alt={b.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🖼️</div>}
              <div className="absolute top-2 left-2 flex gap-1">
                <span className="badge bg-white text-gray-600 text-xs shadow capitalize">{b.position}</span>
                {b.isActive ? <span className="badge badge-new text-xs">Active</span> : <span className="badge bg-gray-100 text-gray-500 text-xs">Hidden</span>}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 text-sm">{b.title}</h3>
              {b.subtitle && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{b.subtitle}</p>}
              {b.link && <p className="text-xs text-primary mt-1 truncate">{b.link}</p>}
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => openEdit(b)} className="btn-outline text-xs py-1.5 px-3 flex-1">Edit</button>
                <button onClick={() => toggle(b)} className={`text-xs py-1.5 px-3 rounded-lg border font-medium transition-colors flex-1 ${b.isActive ? 'text-orange-600 border-orange-200 hover:bg-orange-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}>{b.isActive ? 'Hide' : 'Show'}</button>
                <button onClick={() => del(b._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <Modal title={editing ? 'Edit Banner' : 'Add Banner'} onClose={() => setModal(false)}>
          <div className="space-y-3">
            <div><label className="form-label">Title *</label><input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="form-input" /></div>
            <div><label className="form-label">Subtitle</label><input value={form.subtitle} onChange={e => setForm(p => ({...p, subtitle: e.target.value}))} className="form-input" /></div>
            <div><label className="form-label">Image URL</label><input value={form.image} onChange={e => setForm(p => ({...p, image: e.target.value}))} className="form-input" placeholder="https://..." />{form.image && <img src={form.image} alt="" className="w-full h-24 object-cover rounded-lg mt-2" />}</div>
            <div><label className="form-label">Link URL</label><input value={form.link} onChange={e => setForm(p => ({...p, link: e.target.value}))} className="form-input" placeholder="/shop/electronics" /></div>
            <div><label className="form-label">Button Text</label><input value={form.buttonText} onChange={e => setForm(p => ({...p, buttonText: e.target.value}))} className="form-input" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="form-label">Position</label><select value={form.position} onChange={e => setForm(p => ({...p, position: e.target.value}))} className="form-input"><option value="hero">Hero Slider</option><option value="promo">Promo Section</option><option value="sidebar">Sidebar</option></select></div>
              <div><label className="form-label">Sort Order</label><input type="number" value={form.sortOrder} onChange={e => setForm(p => ({...p, sortOrder: Number(e.target.value)}))} className="form-input" /></div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({...p, isActive: e.target.checked}))} className="accent-primary" /><span className="text-sm text-gray-600">Active</span></label>
            <div className="flex gap-3 pt-2 border-t"><button onClick={save} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Banner'}</button><button onClick={() => setModal(false)} className="btn-outline">Cancel</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => { const { data } = await API.get('/reviews/admin/all'); setReviews(data); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const approve = async (id, current) => {
    await API.put(`/reviews/admin/${id}/approve`, { approved: !current });
    toast.success('Review status updated');
    fetch();
  };

  const del = async (id) => {
    if (!window.confirm('Delete review?')) return;
    await API.delete(`/reviews/admin/${id}`);
    toast.success('Deleted');
    fetch();
  };

  return (
    <div>
      <div className="mb-6"><h2 className="font-display text-xl font-bold text-gray-900">Reviews</h2><p className="text-sm text-gray-500">Moderate customer reviews</p></div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> : reviews.length === 0 ? <div className="p-12 text-center text-gray-400">No reviews yet</div> : (
          <div className="divide-y divide-gray-100">
            {reviews.map(r => (
              <div key={r._id} className="p-5 flex gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{r.user?.firstName} {r.user?.lastName}</p>
                      <p className="text-xs text-gray-400">{r.product?.name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => <span key={s} className={`text-sm ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}
                    </div>
                  </div>
                  {r.title && <p className="font-semibold text-sm text-gray-700 mt-2">{r.title}</p>}
                  <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <span className={`badge text-xs ${r.isApproved ? 'badge-new' : 'bg-yellow-100 text-yellow-700'}`}>{r.isApproved ? 'Approved' : 'Pending'}</span>
                  <button onClick={() => approve(r._id, r.isApproved)} className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-colors ${r.isApproved ? 'text-orange-600 border-orange-200 hover:bg-orange-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}>{r.isApproved ? 'Unapprove' : 'Approve'}</button>
                  <button onClick={() => del(r._id)} className="text-xs px-2.5 py-1 rounded-lg font-medium border text-red-500 border-red-200 hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBanners;
