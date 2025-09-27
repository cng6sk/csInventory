import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import type { Trade, Item } from '../lib/api';

export function TradeForm() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [currentQuantity, setCurrentQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  
  // 用于管理搜索防抖
  const searchTimeoutRef = useRef<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 计算总金额
  const totalAmount = unitPrice && quantity ? 
    (parseFloat(unitPrice) * parseInt(quantity)).toFixed(4) : '0.0000';

  // 搜索物品（带防抖）
  const searchItems = async (keyword: string) => {
    setSearchLoading(true);
    try {
      const result = await api.searchItems(keyword, 15);
      setItems(result);
    } catch (err) {
      console.error('搜索物品失败:', err);
      setItems([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // 处理搜索输入变化
  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    setShowDropdown(true);
    
    // 清除之前的防抖计时器
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }
    
    // 设置新的防抖计时器
    searchTimeoutRef.current = window.setTimeout(() => {
      searchItems(value);
    }, 300); // 300ms防抖
  };

  // 初始加载默认物品列表
  useEffect(() => {
    searchItems('');
  }, []);

  // 当选择物品时，加载当前库存
  useEffect(() => {
    if (selectedItem) {
      const loadCurrentQuantity = async () => {
        try {
          const result = await api.getCurrentQuantity(selectedItem.nameId);
          setCurrentQuantity(result.quantity);
        } catch (err) {
          setCurrentQuantity(0);
        }
      };
      loadCurrentQuantity();
    } else {
      setCurrentQuantity(0);
    }
  }, [selectedItem]);

  // 选择物品
  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    setSearchKeyword(item.cnName);
    setShowDropdown(false);
  };

  // 清除选择
  const handleClearSelection = () => {
    setSelectedItem(null);
    setSearchKeyword('');
    setCurrentQuantity(0);
  };

  // 处理输入框焦点
  const handleInputFocus = () => {
    setShowDropdown(true);
    if (items.length === 0) {
      searchItems(searchKeyword);
    }
  };

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 清理防抖计时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 验证输入
      if (!selectedItem) {
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
        nameId: selectedItem.nameId,
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
      if (selectedItem) {
        const newQuantity = await api.getCurrentQuantity(selectedItem.nameId);
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
        {/* 物品搜索选择器 */}
        <label className="label">
          选择物品
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <input
                  ref={inputRef}
                  className="input"
                  type="text"
                  placeholder="搜索物品中文名称..."
                  value={searchKeyword}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={handleInputFocus}
                  style={{ paddingRight: selectedItem ? '30px' : '8px' }}
                />
                {selectedItem && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      fontSize: '16px'
                    }}
                  >
                    ×
                  </button>
                )}
                
                {/* 下拉选项 */}
                {showDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderTop: 'none',
                    borderRadius: '0 0 4px 4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {searchLoading ? (
                      <div style={{ padding: '12px', textAlign: 'center', color: '#666' }}>
                        搜索中...
                      </div>
                    ) : items.length > 0 ? (
                      items.map((item) => (
                        <div
                          key={item.nameId}
                          onClick={() => handleSelectItem(item)}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f0f0f0',
                            backgroundColor: selectedItem?.nameId === item.nameId ? '#f0f8ff' : 'white'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedItem?.nameId !== item.nameId) {
                              e.currentTarget.style.backgroundColor = '#f8f8f8';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedItem?.nameId !== item.nameId) {
                              e.currentTarget.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          <div style={{ fontWeight: 'bold' }}>{item.cnName}</div>
                          <div style={{ fontSize: '0.85em', color: '#666' }}>
                            ID: {item.nameId}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '12px', textAlign: 'center', color: '#666' }}>
                        {searchKeyword ? '没有找到匹配的物品' : '暂无物品'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {selectedItem && (
                <span style={{ 
                  fontSize: '0.9em', 
                  color: currentQuantity > 0 ? '#4CAF50' : '#f44336',
                  fontWeight: 'bold',
                  padding: '4px 8px',
                  backgroundColor: currentQuantity > 0 ? '#e8f5e8' : '#ffebee',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap'
                }}>
                  库存: {currentQuantity}
                </span>
              )}
            </div>
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
          disabled={loading || !selectedItem || !unitPrice || !quantity}
          style={{
            backgroundColor: tradeType === 'BUY' ? '#4CAF50' : '#f44336',
            opacity: loading || !selectedItem || !unitPrice || !quantity ? 0.6 : 1
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