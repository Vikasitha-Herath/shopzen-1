import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

// ─── Section definitions ───────────────────────────────────────────────────────
const ALL_SECTIONS = [
  { id: 'hero',         label: '🖼️  Hero Banner',        desc: 'Full-width top slider' },
  { id: 'categories',  label: '📂 Category Grid',       desc: 'Shop by category tiles' },
  { id: 'featured',    label: '⭐ Featured Products',   desc: 'Hand-picked product row' },
  { id: 'promo',       label: '🎯 Promo Banner',        desc: 'Mid-page promotional strip' },
  { id: 'new_arrivals',label: '🆕 New Arrivals',        desc: 'Latest products carousel' },
  { id: 'bestsellers', label: '🏆 Best Sellers',        desc: 'Top-selling products row' },
  { id: 'newsletter',  label: '📧 Newsletter Bar',      desc: 'Email signup strip' },
  { id: 'testimonials',label: '💬 Testimonials',        desc: 'Customer review quotes' },
  { id: 'brands',      label: '🏷️  Brand Logos',        desc: 'Trusted brands marquee' },
  { id: 'gift_cards',  label: '🎁 Gift Cards',          desc: 'Gift card promotion block' },
  { id: 'seasonal',    label: '🌸 Seasonal Banner',     desc: 'Seasonal/holiday promotion' },
  { id: 'recently',    label: '🕐 Recently Viewed',     desc: 'Personalized product trail' },
];

const DEFAULT_LAYOUT = ALL_SECTIONS.map((s, i) => ({ ...s, enabled: true, order: i }));

export default function LayoutEditor() {
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  // ─── Load saved layout from Settings ────────────────────────────────────────
  useEffect(() => {
    API.get('/settings')
      .then(r => {
        const saved = r.data?.homepage_layout;
        if (saved && Array.isArray(saved)) {
          // Merge saved with ALL_SECTIONS to catch newly added sections
          const savedIds = saved.map(s => s.id);
          const missing = ALL_SECTIONS.filter(s => !savedIds.includes(s.id))
            .map((s, i) => ({ ...s, enabled: false, order: saved.length + i }));
          const merged = [...saved, ...missing].map(s => {
            const meta = ALL_SECTIONS.find(a => a.id === s.id);
            return { ...s, label: meta?.label || s.label, desc: meta?.desc || s.desc };
          });
          setLayout(merged);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ─── Save layout ─────────────────────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    try {
      const toSave = layout.map(({ id, enabled, order }) => ({ id, enabled, order }));
      await API.put('/settings', { homepage_layout: toSave });
      toast.success('✅ Layout saved! Refresh the storefront to see changes.');
    } catch {
      toast.error('Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  // ─── Toggle section ──────────────────────────────────────────────────────────
  const toggle = (id) => {
    setLayout(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  // ─── Drag-and-drop reorder ───────────────────────────────────────────────────
  const onDragStart = (e, id) => {
    setDragging(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e, id) => {
    e.preventDefault();
    setDragOver(id);
  };
  const onDrop = (e, targetId) => {
    e.preventDefault();
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return; }
    setLayout(prev => {
      const arr = [...prev].sort((a, b) => a.order - b.order);
      const fromIdx = arr.findIndex(s => s.id === dragging);
      const toIdx   = arr.findIndex(s => s.id === targetId);
      const [item]  = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr.map((s, i) => ({ ...s, order: i }));
    });
    setDragging(null);
    setDragOver(null);
  };
  const onDragEnd = () => { setDragging(null); setDragOver(null); };

  const moveUp = (id) => {
    setLayout(prev => {
      const arr = [...prev].sort((a, b) => a.order - b.order);
      const idx = arr.findIndex(s => s.id === id);
      if (idx === 0) return prev;
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr.map((s, i) => ({ ...s, order: i }));
    });
  };
  const moveDown = (id) => {
    setLayout(prev => {
      const arr = [...prev].sort((a, b) => a.order - b.order);
      const idx = arr.findIndex(s => s.id === id);
      if (idx === arr.length - 1) return prev;
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr.map((s, i) => ({ ...s, order: i }));
    });
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Loading layout…</div>;

  const sorted = [...layout].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">🏗️ Homepage Layout Editor</h2>
        <p className="text-sm text-gray-500 mt-1">
          Drag sections to reorder them, or toggle the switch to show/hide each section.
          Changes are live on the storefront after saving.
        </p>
      </div>

      <div className="space-y-2 mb-6">
        {sorted.map((section, idx) => (
          <div
            key={section.id}
            draggable
            onDragStart={e => onDragStart(e, section.id)}
            onDragOver={e => onDragOver(e, section.id)}
            onDrop={e => onDrop(e, section.id)}
            onDragEnd={onDragEnd}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing ${
              dragOver === section.id
                ? 'border-blue-400 bg-blue-50 scale-[1.01]'
                : dragging === section.id
                ? 'border-gray-300 opacity-40'
                : 'border-gray-100 bg-white hover:border-gray-200'
            } ${!section.enabled ? 'opacity-50' : ''}`}
          >
            {/* Drag handle */}
            <div className="text-gray-300 cursor-grab select-none text-lg">⠿</div>

            {/* Order badge */}
            <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-medium flex-shrink-0">
              {idx + 1}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className={`font-medium text-sm ${section.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                {section.label}
              </div>
              <div className="text-xs text-gray-400">{section.desc}</div>
            </div>

            {/* Arrow controls */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveUp(section.id)}
                disabled={idx === 0}
                className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs px-1"
                title="Move up"
              >▲</button>
              <button
                onClick={() => moveDown(section.id)}
                disabled={idx === sorted.length - 1}
                className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs px-1"
                title="Move down"
              >▼</button>
            </div>

            {/* Toggle */}
            <button
              onClick={() => toggle(section.id)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                section.enabled ? 'bg-green-500' : 'bg-gray-200'
              }`}
              title={section.enabled ? 'Hide section' : 'Show section'}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                section.enabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary px-6 py-2.5 text-sm font-semibold"
        >
          {saving ? 'Saving…' : '💾 Save Layout'}
        </button>
        <button
          onClick={() => setLayout(DEFAULT_LAYOUT)}
          className="px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          Reset to Default
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
        💡 <strong>Tip:</strong> Sections with the toggle OFF are hidden from customers but preserved in your layout. You can re-enable them anytime.
      </div>
    </div>
  );
}
