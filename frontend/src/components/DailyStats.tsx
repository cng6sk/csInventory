import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { DailyFlowDTO } from '../lib/api';

function toLocalDateTimeInputValue(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function DailyStats() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [start, setStart] = useState<string>(toLocalDateTimeInputValue(weekAgo));
  const [end, setEnd] = useState<string>(toLocalDateTimeInputValue(now));
  const [data, setData] = useState<DailyFlowDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // 后端要求 ISO 日期时间（OffsetDateTime），我们把本地时间转为 ISO 字符串
      const startIso = new Date(start).toISOString();
      const endIso = new Date(end).toISOString();
      const res = await api.dailyStats(startIso, endIso);
      setData(res);
    } catch (e: any) {
      setError(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 初次加载
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <h3>按日统计</h3>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="label">
          开始
          <input className="datetime" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="label">
          结束
          <input className="datetime" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <button className="button" onClick={load} disabled={loading}>{loading ? '加载中...' : '查询'}</button>
      </div>
      {error && <div className="error">{error}</div>}
      <table className="table">
        <thead>
          <tr>
            <th>日期</th>
            <th style={{ textAlign: 'right' }}>买入总额</th>
            <th style={{ textAlign: 'right' }}>卖出总额</th>
            <th style={{ textAlign: 'right' }}>净额</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.day}>
              <td>{row.day}</td>
              <td style={{ textAlign: 'right' }}>{row.totalBuy}</td>
              <td style={{ textAlign: 'right' }}>{row.totalSell}</td>
              <td style={{ textAlign: 'right' }}>{row.net}</td>
            </tr>
          ))}
          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: 8, textAlign: 'center' }}>无数据</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 