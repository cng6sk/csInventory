import { useState } from 'react';
import { api } from '../lib/api';
import type { Item } from '../lib/api';

export function ItemForm() {
  const [form, setForm] = useState<Item>({ name: '', exterior: '', marketId: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload: Item = { ...form };
      const saved = await api.createItem(payload);
      setMessage(`创建成功，ID=${saved.id}`);
      setForm({ name: '', exterior: '', marketId: '' });
    } catch (err: any) {
      setMessage(err.message || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="form">
      <h3>创建物品</h3>
      <label className="label">
        名称
        <input className="input" name="name" value={form.name} onChange={onChange} required />
      </label>
      <label className="label">
        外观
        <select className="select" name="exterior" value={form.exterior || ''} onChange={onChange}>
          <option value="">未指定</option>
          <option value="Factory New">Factory New</option>
          <option value="Minimal Wear">Minimal Wear</option>
          <option value="Field-Tested">Field-Tested</option>
          <option value="Well-Worn">Well-Worn</option>
          <option value="Battle-Scarred">Battle-Scarred</option>
        </select>
      </label>
      <label className="label">
        市场ID
        <input className="input" name="marketId" value={form.marketId || ''} onChange={onChange} />
      </label>
      <button className="button" type="submit" disabled={loading}>{loading ? '提交中...' : '创建'}</button>
      {message && <div className="message">{message}</div>}
    </form>
  );
} 