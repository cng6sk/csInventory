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

function formatPrice(price: string) {
  return `¥${parseFloat(price).toFixed(2)}`;
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

  // 计算汇总统计
  const totalBuyAmount = data.reduce((sum, row) => sum + parseFloat(row.totalBuy), 0);
  const totalSellAmount = data.reduce((sum, row) => sum + parseFloat(row.totalSell), 0);
  const netAmount = totalSellAmount - totalBuyAmount;
  const profitDays = data.filter(row => parseFloat(row.net) > 0).length;
  const lossDays = data.filter(row => parseFloat(row.net) < 0).length;

  return (
    <div className="container-full" style={{ gap: 16 }}>
      <h3>数据统计</h3>
      
      {/* 查询控件 */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="label">
          开始时间
          <input className="datetime" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="label">
          结束时间
          <input className="datetime" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <button className="button" onClick={load} disabled={loading}>
          {loading ? '查询中...' : '查询'}
        </button>
      </div>

      {/* 错误显示 */}
      {error && <div className="error" style={{ color: '#f44336' }}>{error}</div>}

      {/* 汇总统计卡片 */}
      {data.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid rgba(33, 150, 243, 0.2)'
          }}>
            <div style={{ fontSize: '0.9em', color: 'var(--muted)', marginBottom: '4px' }}>总买入</div>
            <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#42a5f5' }}>
              {formatPrice(totalBuyAmount.toFixed(2))}
            </div>
          </div>
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid rgba(76, 175, 80, 0.2)'
          }}>
            <div style={{ fontSize: '0.9em', color: 'var(--muted)', marginBottom: '4px' }}>总卖出</div>
            <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#66bb6a' }}>
              {formatPrice(totalSellAmount.toFixed(2))}
            </div>
          </div>
          <div style={{
            padding: '12px',
            backgroundColor: netAmount >= 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
            borderRadius: '4px',
            textAlign: 'center',
            border: `1px solid ${netAmount >= 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`
          }}>
            <div style={{ fontSize: '0.9em', color: 'var(--muted)', marginBottom: '4px' }}>净收益</div>
            <div style={{ 
              fontSize: '1.2em', 
              fontWeight: 'bold', 
              color: netAmount >= 0 ? '#66bb6a' : '#ef5350' 
            }}>
              {formatPrice(netAmount.toFixed(2))}
            </div>
          </div>
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(156, 39, 176, 0.1)',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid rgba(156, 39, 176, 0.2)'
          }}>
            <div style={{ fontSize: '0.9em', color: 'var(--muted)', marginBottom: '4px' }}>盈利天数</div>
            <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#ab47bc' }}>
              {profitDays} / {data.length}
            </div>
          </div>
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid rgba(244, 67, 54, 0.2)'
          }}>
            <div style={{ fontSize: '0.9em', color: 'var(--muted)', marginBottom: '4px' }}>亏损天数</div>
            <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#ef5350' }}>
              {lossDays} / {data.length}
            </div>
          </div>
        </div>
      )}

      {/* 数据表格 */}
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>日期</th>
              <th className="text-right">买入总额</th>
              <th className="text-right">卖出总额</th>
              <th className="text-right">当日净额</th>
              <th>盈亏状态</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const netValue = parseFloat(row.net);
              const isProfit = netValue > 0;
              const isLoss = netValue < 0;
              
              return (
                <tr key={row.day} style={{
                  backgroundColor: isProfit ? 'rgba(76, 175, 80, 0.1)' : isLoss ? 'rgba(244, 67, 54, 0.1)' : 'transparent'
                }}>
                  <td style={{ fontWeight: 'bold' }}>{row.day}</td>
                  <td className="text-right" style={{ color: '#42a5f5' }}>
                    {formatPrice(row.totalBuy)}
                  </td>
                  <td className="text-right" style={{ color: '#66bb6a' }}>
                    {formatPrice(row.totalSell)}
                  </td>
                  <td className="text-right" style={{ 
                    fontWeight: 'bold',
                    color: isProfit ? '#66bb6a' : isLoss ? '#ef5350' : 'var(--muted)'
                  }}>
                    {formatPrice(row.net)}
                  </td>
                  <td>
                    {isProfit && (
                      <span style={{ 
                        padding: '2px 8px', 
                        backgroundColor: '#4caf50', 
                        color: 'white', 
                        borderRadius: '12px', 
                        fontSize: '0.8em'
                      }}>
                        盈利
                      </span>
                    )}
                    {isLoss && (
                      <span style={{ 
                        padding: '2px 8px', 
                        backgroundColor: '#f44336', 
                        color: 'white', 
                        borderRadius: '12px', 
                        fontSize: '0.8em'
                      }}>
                        亏损
                      </span>
                    )}
                    {netValue === 0 && (
                      <span style={{ 
                        padding: '2px 8px', 
                        backgroundColor: '#9e9e9e', 
                        color: 'white', 
                        borderRadius: '12px', 
                        fontSize: '0.8em'
                      }}>
                        平衡
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 16, textAlign: 'center', color: 'var(--muted)' }}>
                  选择时间范围后点击查询
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 数据分析 */}
      {data.length > 0 && (
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: '4px',
          marginTop: '16px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: 'var(--text)' }}>数据分析</h4>
          <div style={{ display: 'grid', gap: '8px', fontSize: '0.9em', color: 'var(--text)' }}>
            <div>
              📈 <strong>平均日收益:</strong> {formatPrice((netAmount / data.length).toFixed(2))}
            </div>
            <div>
              🎯 <strong>盈利率:</strong> {((profitDays / data.length) * 100).toFixed(1)}%
            </div>
            <div>
              📊 <strong>交易活跃度:</strong> {data.filter(row => parseFloat(row.totalBuy) > 0 || parseFloat(row.totalSell) > 0).length} / {data.length} 天有交易
            </div>
            {netAmount > 0 && (
              <div style={{ color: '#66bb6a' }}>
                ✅ <strong>总体表现良好，实现盈利 {formatPrice(netAmount.toFixed(2))}</strong>
              </div>
            )}
            {netAmount < 0 && (
              <div style={{ color: '#ef5350' }}>
                ⚠️ <strong>总体亏损 {formatPrice(Math.abs(netAmount).toFixed(2))}，需要调整交易策略</strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 