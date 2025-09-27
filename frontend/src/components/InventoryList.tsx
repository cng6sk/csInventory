import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Inventory } from '../lib/api';

function formatPrice(price: string) {
  return `¥${parseFloat(price).toFixed(4)}`;
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('zh-CN');
}

export function InventoryList() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);

  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getAllInventory();
      setInventory(result);
    } catch (err: any) {
      setError(err.message || '加载库存失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // 计算库存总价值
  const totalInventoryValue = inventory.reduce((sum, item) => {
    return sum + parseFloat(item.totalInvestmentCost);
  }, 0);

  // 有库存的物品数量
  const activeItems = inventory.filter(item => item.currentQuantity > 0);

  return (
    <div className="container-full">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>库存管理</h3>
        <button 
          className="button" 
          onClick={loadInventory}
          disabled={loading}
        >
          {loading ? '刷新中...' : '刷新'}
        </button>
      </div>

      {/* 错误显示 */}
      {error && (
        <div style={{ color: '#f44336', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* 库存概览 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '12px', 
        marginBottom: '20px',
        padding: '12px',
        backgroundColor: '#f0f8ff',
        borderRadius: '4px'
      }}>
        <div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>总物品种类</div>
          <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{inventory.length}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>有库存物品</div>
          <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{activeItems.length}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>总库存数量</div>
          <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
            {inventory.reduce((sum, item) => sum + item.currentQuantity, 0)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>总投入成本</div>
          <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#2196F3' }}>
            {formatPrice(totalInventoryValue.toFixed(4))}
          </div>
        </div>
      </div>

      {/* 库存列表 */}
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              <th>物品ID</th>
              <th className="text-right">当前数量</th>
              <th className="text-right">加权平均成本</th>
              <th className="text-right">总投入成本</th>
              <th className="text-right">当前价值</th>
              <th>最后更新</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.nameId} style={{ 
                backgroundColor: item.currentQuantity === 0 ? '#f5f5f5' : 'transparent'
              }}>
                <td>{item.nameId}</td>
                <td className="text-right">
                  <span style={{ 
                    color: item.currentQuantity > 0 ? '#4CAF50' : '#999',
                    fontWeight: 'bold'
                  }}>
                    {item.currentQuantity}
                  </span>
                </td>
                <td className="text-right">
                  {formatPrice(item.weightedAverageCost)}
                </td>
                <td className="text-right">
                  {formatPrice(item.totalInvestmentCost)}
                </td>
                <td className="text-right">
                  <span style={{ color: '#2196F3', fontWeight: 'bold' }}>
                    {formatPrice((parseFloat(item.weightedAverageCost) * item.currentQuantity).toFixed(4))}
                  </span>
                </td>
                <td>{formatDateTime(item.lastUpdatedAt)}</td>
                <td>
                  <button 
                    className="button"
                    style={{ fontSize: '0.8em', padding: '4px 8px' }}
                    onClick={() => setSelectedInventory(item)}
                  >
                    详情
                  </button>
                </td>
              </tr>
            ))}
            {!loading && inventory.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                  暂无库存数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 库存详情弹窗 */}
      {selectedInventory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h4>库存详情</h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <strong>物品ID:</strong> {selectedInventory.nameId}
              </div>
              <div>
                <strong>当前数量:</strong> 
                <span style={{ 
                  color: selectedInventory.currentQuantity > 0 ? '#4CAF50' : '#f44336',
                  fontWeight: 'bold',
                  marginLeft: '8px'
                }}>
                  {selectedInventory.currentQuantity}
                </span>
              </div>
              <div>
                <strong>加权平均成本:</strong> {formatPrice(selectedInventory.weightedAverageCost)}
              </div>
              <div>
                <strong>总投入成本:</strong> {formatPrice(selectedInventory.totalInvestmentCost)}
              </div>
              <div>
                <strong>当前价值:</strong> 
                <span style={{ color: '#2196F3', fontWeight: 'bold', marginLeft: '8px' }}>
                  {formatPrice((parseFloat(selectedInventory.weightedAverageCost) * selectedInventory.currentQuantity).toFixed(4))}
                </span>
              </div>
              <div>
                <strong>创建时间:</strong> {formatDateTime(selectedInventory.createdAt)}
              </div>
              <div>
                <strong>最后更新:</strong> {formatDateTime(selectedInventory.lastUpdatedAt)}
              </div>
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button 
                className="button"
                onClick={() => setSelectedInventory(null)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 