import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Trade } from '../lib/api';

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('zh-CN');
}

function formatPrice(price: string) {
  return `¥${parseFloat(price).toFixed(4)}`;
}

export function TradeHistory() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameIdFilter, setNameIdFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const loadAllTrades = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getAllTrades();
      setTrades(result);
    } catch (err: any) {
      setError(err.message || '加载交易历史失败');
    } finally {
      setLoading(false);
    }
  };

  const loadTradesByNameId = async (nameId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getTradeHistory(nameId);
      setTrades(result);
    } catch (err: any) {
      setError(err.message || '加载交易历史失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllTrades();
  }, []);

  const handleFilter = () => {
    if (nameIdFilter.trim()) {
      loadTradesByNameId(parseInt(nameIdFilter));
    } else {
      loadAllTrades();
    }
  };

  const filteredTrades = trades.filter(trade => {
    if (typeFilter === 'ALL') return true;
    return trade.type === typeFilter;
  });

  const handleDeleteTrade = async (tradeId: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteTrade(tradeId);
      // 重新加载交易列表
      if (nameIdFilter.trim()) {
        await loadTradesByNameId(parseInt(nameIdFilter));
      } else {
        await loadAllTrades();
      }
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.message || '删除交易失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-full">
      <h3>交易历史</h3>
      
      {/* 筛选控件 */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
        <label className="label" style={{ minWidth: '150px' }}>
          物品ID筛选
          <input
            className="input"
            type="number"
            placeholder="输入nameId"
            value={nameIdFilter}
            onChange={(e) => setNameIdFilter(e.target.value)}
          />
        </label>
        
        <label className="label">
          交易类型
          <select 
            className="input"
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value as 'ALL' | 'BUY' | 'SELL')}
          >
            <option value="ALL">全部</option>
            <option value="BUY">买入</option>
            <option value="SELL">卖出</option>
          </select>
        </label>
        
        <button 
          className="button" 
          onClick={handleFilter}
          disabled={loading}
        >
          {loading ? '查询中...' : '查询'}
        </button>
        
        <button 
          className="button" 
          onClick={() => {
            setNameIdFilter('');
            setTypeFilter('ALL');
            loadAllTrades();
          }}
          disabled={loading}
        >
          重置
        </button>
      </div>

      {/* 错误显示 */}
      {error && (
        <div style={{ color: '#f44336', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* 交易列表 */}
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              <th>交易ID</th>
              <th>物品名称</th>
              <th>类型</th>
              <th className="text-right">单价</th>
              <th className="text-right">数量</th>
              <th className="text-right">总金额</th>
              <th>交易时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.map((trade) => (
              <tr key={trade.id}>
                <td>{trade.id}</td>
                <td>
                  <div style={{ maxWidth: '200px' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--text)' }}>
                      {trade.cnName || `ID: ${trade.nameId}`}
                    </div>
                    {trade.enName && (
                      <div style={{ fontSize: '0.8em', color: 'var(--muted)', marginTop: '2px' }}>
                        {trade.enName}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span 
                    style={{ 
                      color: trade.type === 'BUY' ? '#4CAF50' : '#f44336',
                      fontWeight: 'bold'
                    }}
                  >
                    {trade.type === 'BUY' ? '买入' : '卖出'}
                  </span>
                </td>
                <td className="text-right">{formatPrice(trade.unitPrice)}</td>
                <td className="text-right">{trade.quantity}</td>
                <td className="text-right">
                  {trade.totalAmount ? formatPrice(trade.totalAmount) : ''}
                </td>
                <td>{trade.createdAt ? formatDateTime(trade.createdAt) : ''}</td>
                <td>
                  {deleteConfirm === trade.id ? (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button
                        className="button"
                        style={{ 
                          fontSize: '0.85em', 
                          padding: '4px 8px',
                          backgroundColor: '#f44336',
                          border: 'none'
                        }}
                        onClick={() => trade.id && handleDeleteTrade(trade.id)}
                        disabled={loading}
                      >
                        确认删除
                      </button>
                      <button
                        className="button"
                        style={{ 
                          fontSize: '0.85em', 
                          padding: '4px 8px',
                          backgroundColor: '#666',
                          border: 'none'
                        }}
                        onClick={() => setDeleteConfirm(null)}
                        disabled={loading}
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      className="button"
                      style={{ 
                        fontSize: '0.85em', 
                        padding: '4px 8px',
                        backgroundColor: '#ff9800',
                        border: 'none'
                      }}
                      onClick={() => setDeleteConfirm(trade.id || null)}
                      disabled={loading}
                    >
                      删除
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && filteredTrades.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '16px', textAlign: 'center', color: 'var(--muted)' }}>
                  暂无交易记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 统计信息 */}
      {filteredTrades.length > 0 && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>统计信息</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', color: 'var(--text)' }}>
            <div>总交易数: {filteredTrades.length}</div>
            <div>买入次数: {filteredTrades.filter(t => t.type === 'BUY').length}</div>
            <div>卖出次数: {filteredTrades.filter(t => t.type === 'SELL').length}</div>
            <div>
              买入总额: {formatPrice(
                filteredTrades
                  .filter(t => t.type === 'BUY')
                  .reduce((sum, t) => sum + parseFloat(t.totalAmount || '0'), 0)
                  .toFixed(4)
              )}
            </div>
            <div>
              卖出总额: {formatPrice(
                filteredTrades
                  .filter(t => t.type === 'SELL')
                  .reduce((sum, t) => sum + parseFloat(t.totalAmount || '0'), 0)
                  .toFixed(4)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 