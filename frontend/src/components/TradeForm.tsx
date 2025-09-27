import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Trade, Item } from '../lib/api';

export function TradeForm() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedNameId, setSelectedNameId] = useState<string>('');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [currentQuantity, setCurrentQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // 计算总金额
  const totalAmount = unitPrice && quantity ? 
    (parseFloat(unitPrice) * parseInt(quantity)).toFixed(4) : '0.0000';

  // 加载物品列表
  useEffect(() => {
    const loadItems = async () => {
      try {
        const result = await api.getAllItems();
        setItems(result);
      } catch (err) {
        console.error('加载物品列表失败:', err);
        setItems([]);
      }
    };
    loadItems();
  }, []);

  // 当选择物品时，加载当前库存
  useEffect(() => {
    if (selectedNameId) {
      const loadCurrentQuantity = async () => {
        try {
          const result = await api.getCurrentQuantity(parseInt(selectedNameId));
          setCurrentQuantity(result.quantity);
        } catch (err) {
          setCurrentQuantity(0);
        }
      };
      loadCurrentQuantity();
    } else {
      setCurrentQuantity(0);
    }
  }, [selectedNameId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 验证输入
      if (!selectedNameId) {
        throw new Error('请选择物品');
      }
      if (!unitPrice || parseFloat(unitPrice) <= 0) {
        throw new Error('请输入有效的单价');
      }
      if (!quantity || parseInt(quantity) <= 0) {
        throw new Error('请输入有效的数量');
      }
      if (tradeType === 'SELL' && parseInt(quantity) > currentQuantity) {
        throw new Error(`卖出数量不能超过当前库存(${currentQuantity})`);
      }

      const trade: Trade = {
        nameId: parseInt(selectedNameId),
        type: tradeType,
        unitPrice: parseFloat(unitPrice).toFixed(4),
        quantity: parseInt(quantity)
      };

      const result = await api.createTrade(trade);
      setMessage(`交易创建成功！交易ID: ${result.id}`);
      setMessageType('success');
      
      // 重置表单
      setUnitPrice('');
      setQuantity('');
      
      // 刷新库存
      if (selectedNameId) {
        const newQuantity = await api.getCurrentQuantity(parseInt(selectedNameId));
        setCurrentQuantity(newQuantity.quantity);
      }
      
    } catch (err: any) {
      setMessage(err.message || '创建交易失败');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-centered">
      <h3>创建交易</h3>
      
      <form onSubmit={handleSubmit}>
        {/* 物品选择 */}
        <label className="label">
          选择物品
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {items.length > 0 ? (
              <select 
                className="input"
                value={selectedNameId} 
                onChange={(e) => setSelectedNameId(e.target.value)}
                required
                style={{ flex: '1', minWidth: '200px' }}
              >
                <option value="">请选择物品</option>
                {items.map((item) => (
                  <option key={item.nameId} value={item.nameId}>
                    {item.cnName} ({item.nameId})
                  </option>
                ))}
              </select>
            ) : (
              <input 
                className="input" 
                type="number"
                placeholder="输入物品nameId"
                value={selectedNameId} 
                onChange={(e) => setSelectedNameId(e.target.value)}
                required 
                style={{ flex: '1', minWidth: '200px' }}
              />
            )}
            {selectedNameId && (
              <span style={{ 
                fontSize: '0.9em', 
                color: currentQuantity > 0 ? '#4CAF50' : '#f44336',
                fontWeight: 'bold',
                padding: '4px 8px',
                backgroundColor: currentQuantity > 0 ? '#e8f5e8' : '#ffebee',
                borderRadius: '4px'
              }}>
                库存: {currentQuantity}
              </span>
            )}
          </div>
        </label>

        {/* 交易类型 */}
        <label className="label">
          交易类型
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="radio"
                name="tradeType"
                value="BUY"
                checked={tradeType === 'BUY'}
                onChange={(e) => setTradeType(e.target.value as 'BUY' | 'SELL')}
              />
              买入
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="radio"
                name="tradeType"
                value="SELL"
                checked={tradeType === 'SELL'}
                onChange={(e) => setTradeType(e.target.value as 'BUY' | 'SELL')}
              />
              卖出
            </label>
          </div>
        </label>

        {/* 单价输入 */}
        <label className="label">
          单价 (¥)
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

        {/* 数量输入 */}
        <label className="label">
          数量
          <input
            className="input"
            type="number"
            min="1"
            placeholder="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </label>

        {/* 总金额显示 */}
        <div className="label">
          <span>总金额: ¥{totalAmount}</span>
        </div>

        {/* 提交按钮 */}
        <button 
          className="button" 
          type="submit" 
          disabled={loading || !selectedNameId || !unitPrice || !quantity}
          style={{
            backgroundColor: tradeType === 'BUY' ? '#4CAF50' : '#f44336',
            opacity: loading || !selectedNameId || !unitPrice || !quantity ? 0.6 : 1
          }}
        >
          {loading ? '处理中...' : `${tradeType === 'BUY' ? '买入' : '卖出'}`}
        </button>
      </form>

      {/* 消息显示 */}
      {message && (
        <div 
          className="message"
          style={{ 
            color: messageType === 'success' ? '#4CAF50' : '#f44336',
            marginTop: '12px'
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
} 