import { useState } from 'react';
import { api } from '../lib/api';
import type { Trade } from '../lib/api';

export function TradeForm() {
  const [itemId, setItemId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload: Trade = { item: { id: Number(itemId) } } as Trade;
      const saved = await api.createTrade(payload);
      setMessage(`创建交易成功，ID=${saved.id}`);
      setItemId('');
    } catch (err: any) {
      setMessage(err.message || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="form">
      <h3>创建交易</h3>
      <label className="label">
        物品ID
        <input className="input" value={itemId} onChange={(e) => setItemId(e.target.value)} required />
      </label>
      <button className="button" type="submit" disabled={loading || !itemId}>{loading ? '提交中...' : '创建交易'}</button>
      {message && <div className="message">{message}</div>}
    </form>
  );
} 