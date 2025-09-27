import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Inventory, SellRequest } from '../lib/api';

interface SellFormProps {
  inventory: Inventory;
  onSellSuccess: () => void;
  onCancel: () => void;
}

export function SellForm({ inventory, onSellSuccess, onCancel }: SellFormProps) {
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // 计算相关金额
  const sellQuantity = parseInt(quantity) || 0;
  const sellPrice = parseFloat(unitPrice) || 0;
  const totalSellAmount = sellQuantity * sellPrice;
  const costBasis = sellQuantity * parseFloat(inventory.weightedAverageCost);
  const profit = totalSellAmount - costBasis;

  // 重置表单
  useEffect(() => {
    setUnitPrice('');
    setQuantity('');
    setMessage(null);
  }, [inventory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 验证输入
      if (!unitPrice || parseFloat(unitPrice) <= 0) {
        throw new Error('请输入有效的卖出单价');
      }
      if (!quantity || parseInt(quantity) <= 0) {
        throw new Error('请输入有效的卖出数量');
      }
      if (parseInt(quantity) > inventory.currentQuantity) {
        throw new Error(`卖出数量不能超过当前库存(${inventory.currentQuantity})`);
      }

      const sellRequest: SellRequest = {
        nameId: inventory.nameId,
        unitPrice: parseFloat(unitPrice).toFixed(4),
        quantity: parseInt(quantity)
      };

      const result = await api.createSellTrade(sellRequest);
      setMessage(`卖出交易创建成功！交易ID: ${result.id}`);
      setMessageType('success');
      
      // 延迟关闭以显示成功消息
      setTimeout(() => {
        onSellSuccess();
      }, 1500);
      
    } catch (err: any) {
      setMessage(err.message || '创建卖出交易失败');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
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
        backgroundColor: 'var(--bg-elev)',
        border: '1px solid var(--card-border)',
        padding: '24px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h3 style={{ color: 'var(--text)', marginBottom: '20px' }}>卖出库存</h3>
        
        {/* 物品信息显示 */}
        <div style={{ 
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          border: '1px solid rgba(33, 150, 243, 0.2)',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1em' }}>
            {inventory.cnName || `ID: ${inventory.nameId}`}
          </div>
          {inventory.enName && (
            <div style={{ fontSize: '0.9em', color: 'var(--muted)', marginTop: '4px' }}>
              {inventory.enName}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px', fontSize: '0.9em' }}>
            <div>
              <span style={{ color: 'var(--muted)' }}>当前库存: </span>
              <span style={{ fontWeight: 'bold', color: '#66bb6a' }}>{inventory.currentQuantity}</span>
            </div>
            <div>
              <span style={{ color: 'var(--muted)' }}>成本单价: </span>
              <span style={{ fontWeight: 'bold' }}>¥{parseFloat(inventory.weightedAverageCost).toFixed(4)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 卖出单价 */}
          <label className="label">
            卖出单价 (¥)
            <input
              className="input"
              type="number"
              step="0.0001"
              min="0"
              placeholder="0.0000"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              required
            />
          </label>

          {/* 卖出数量 */}
          <label className="label">
            卖出数量 (最大: {inventory.currentQuantity})
            <input
              className="input"
              type="number"
              min="1"
              max={inventory.currentQuantity}
              placeholder="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </label>

          {/* 收益计算显示 */}
          {unitPrice && quantity && (
            <div style={{ 
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'grid', gap: '4px', fontSize: '0.9em' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>卖出总额:</span>
                  <span style={{ fontWeight: 'bold' }}>¥{totalSellAmount.toFixed(4)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>成本总额:</span>
                  <span>¥{costBasis.toFixed(4)}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  paddingTop: '4px',
                  borderTop: '1px solid rgba(0,0,0,0.1)',
                  fontWeight: 'bold'
                }}>
                  <span>预计{profit >= 0 ? '盈利' : '亏损'}:</span>
                  <span style={{ color: profit >= 0 ? '#4CAF50' : '#f44336' }}>
                    ¥{Math.abs(profit).toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 按钮组 */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button 
              type="button"
              className="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                backgroundColor: '#666',
                flex: 1
              }}
            >
              取消
            </button>
            <button 
              className="button" 
              type="submit" 
              disabled={loading || !unitPrice || !quantity}
              style={{
                backgroundColor: '#f44336',
                opacity: loading || !unitPrice || !quantity ? 0.6 : 1,
                flex: 1
              }}
            >
              {loading ? '处理中...' : '确认卖出'}
            </button>
          </div>
        </form>

        {/* 消息显示 */}
        {message && (
          <div 
            className="message"
            style={{ 
              color: messageType === 'success' ? '#4CAF50' : '#f44336',
              marginTop: '12px',
              textAlign: 'center'
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
} 