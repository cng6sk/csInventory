import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { InvestmentPoolDTO } from '../lib/api';

function formatPrice(price: string | number) {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return `¥${num.toFixed(2)}`;
}

function formatPercent(rate: string | number) {
  const num = typeof rate === 'string' ? parseFloat(rate) : rate;
  return `${(num * 100).toFixed(2)}%`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

export function InvestmentPool() {
  const [data, setData] = useState<InvestmentPoolDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualValue, setManualValue] = useState<string>('');
  const [isUsingManualValue, setIsUsingManualValue] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getInvestmentPoolStats();
      setData(result);
    } catch (e: any) {
      setError(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const calculateWithManualValue = async (inputValue?: string) => {
    setCalculating(true);
    setError(null);
    try {
      const result = await api.calculateWithManualValue(inputValue);
      setData(result);
      setIsUsingManualValue(!!inputValue);
    } catch (e: any) {
      setError(e.message || '计算失败');
    } finally {
      setCalculating(false);
    }
  };

  const handleManualValueSubmit = () => {
    if (manualValue.trim()) {
      calculateWithManualValue(manualValue);
    } else {
      // 如果输入为空，则使用成本价计算
      calculateWithManualValue();
      setIsUsingManualValue(false);
    }
  };

  const resetToDefault = () => {
    setManualValue('');
    setIsUsingManualValue(false);
    loadData(); // 重新加载默认数据
  };

  useEffect(() => {
    void loadData();
  }, []);

  if (loading) {
    return (
      <div className="container-full" style={{ textAlign: 'center', padding: '40px' }}>
        <div>正在加载投资池数据...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-full">
        <div className="error" style={{ color: '#f44336', marginBottom: '16px' }}>
          {error}
        </div>
        <button className="button" onClick={loadData}>重新加载</button>
      </div>
    );
  }

  if (!data) return null;

  const isProfit = parseFloat(data.absoluteProfit) > 0;
  const profitColor = isProfit ? '#4caf50' : '#f44336';
  const profitIcon = isProfit ? '📈' : '📉';

  return (
    <div className="container-full" style={{ gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <h3>💰 CS投资池仪表板</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="button" onClick={loadData} disabled={loading}>
            📊 刷新数据
          </button>
        </div>
      </div>

      {/* 手动输入当前价值区域 */}
      <div style={{
        padding: '16px',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(33, 150, 243, 0.3)',
        marginBottom: '16px'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: 'var(--text)' }}>
          📝 当前持仓市场价值
        </h4>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="number"
            step="0.01"
            placeholder="请输入当前市场价值（元）"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              color: 'var(--text)',
              fontSize: '0.9em',
              minWidth: '200px'
            }}
          />
          <button 
            className="button" 
            onClick={handleManualValueSubmit}
            disabled={calculating}
            style={{ 
              backgroundColor: '#4caf50', 
              borderColor: '#4caf50',
              fontSize: '0.9em'
            }}
          >
            {calculating ? '计算中...' : '💱 使用此价值计算'}
          </button>
          {isUsingManualValue && (
            <button 
              className="button" 
              onClick={resetToDefault}
              style={{ 
                backgroundColor: '#ff9800', 
                borderColor: '#ff9800',
                fontSize: '0.9em'
              }}
            >
              🔄 恢复成本价
            </button>
          )}
        </div>
        {isUsingManualValue && (
          <div style={{ 
            fontSize: '0.8em', 
            color: '#4caf50', 
            marginTop: '8px',
            fontWeight: 'bold'
          }}>
            ✅ 当前使用手动输入的市场价值: ¥{manualValue}
          </div>
        )}
        {!isUsingManualValue && (
          <div style={{ 
            fontSize: '0.8em', 
            color: 'var(--muted)', 
            marginTop: '8px'
          }}>
            💡 当前使用成本价计算，输入实际市场价值可获得更准确的收益分析
          </div>
        )}
      </div>

      {/* 核心指标卡片网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* 总投入 */}
        <div className="metric-card" style={{
          padding: '20px',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(33, 150, 243, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.9em', color: 'var(--muted)', marginBottom: '8px' }}>
            💳 累计投入
          </div>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#42a5f5' }}>
            {formatPrice(data.totalInvestment)}
          </div>
          <div style={{ fontSize: '0.8em', color: 'var(--muted)', marginTop: '4px' }}>
            {data.totalBuyTrades} 笔买入交易
          </div>
        </div>

        {/* 当前价值 */}
        <div className="metric-card" style={{
          padding: '20px',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.9em', color: 'var(--muted)', marginBottom: '8px' }}>
            📦 当前价值
          </div>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#66bb6a' }}>
            {formatPrice(data.currentHoldingValue)}
          </div>
          <div style={{ fontSize: '0.8em', color: 'var(--muted)', marginTop: '4px' }}>
            持有 {data.currentHoldingItems} 种物品
          </div>
        </div>

        {/* 总收益 */}
        <div className="metric-card" style={{
          padding: '20px',
          backgroundColor: isProfit ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
          borderRadius: '8px',
          border: `1px solid ${isProfit ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.9em', color: 'var(--muted)', marginBottom: '8px' }}>
            {profitIcon} 总收益
          </div>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: profitColor }}>
            {formatPrice(data.absoluteProfit)}
          </div>
          <div style={{ fontSize: '0.8em', color: profitColor, marginTop: '4px' }}>
            {formatPercent(data.returnRate)}
          </div>
        </div>

        {/* 已回收 */}
        <div className="metric-card" style={{
          padding: '20px',
          backgroundColor: 'rgba(156, 39, 176, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(156, 39, 176, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.9em', color: 'var(--muted)', marginBottom: '8px' }}>
            💰 已回收
          </div>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#ab47bc' }}>
            {formatPrice(data.totalWithdrawal)}
          </div>
          <div style={{ fontSize: '0.8em', color: 'var(--muted)', marginTop: '4px' }}>
            {data.totalSellTrades} 笔卖出交易
          </div>
        </div>
      </div>

      {/* 资金池概览 */}
      <div style={{
        padding: '24px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: 'var(--text)' }}>
          🏦 资金池概览
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.9em', color: 'var(--muted)', marginBottom: '4px' }}>
              持仓成本
            </div>
            <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#ff9800' }}>
              {formatPrice(data.currentCost)}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '0.9em', color: 'var(--muted)', marginBottom: '4px' }}>
              总价值
            </div>
            <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#2196f3' }}>
              {formatPrice(data.totalValue)}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '0.9em', color: 'var(--muted)', marginBottom: '4px' }}>
              投资天数
            </div>
            <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#9c27b0' }}>
              {data.totalInvestmentDays} 天
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '0.9em', color: 'var(--muted)', marginBottom: '4px' }}>
              交易物品
            </div>
            <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#607d8b' }}>
              {data.totalItems} 种
            </div>
          </div>
        </div>
      </div>

      {/* 投资时间线 */}
      <div style={{
        padding: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: 'var(--text)' }}>
          📅 投资时间线
        </h4>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8em', color: 'var(--muted)' }}>首次投资</div>
            <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#4caf50' }}>
              {formatDate(data.firstInvestmentDate)}
            </div>
          </div>
          
          <div style={{ 
            flex: 1, 
            height: '2px', 
            background: 'linear-gradient(to right, #4caf50, #2196f3)',
            borderRadius: '1px',
            minWidth: '100px'
          }}></div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8em', color: 'var(--muted)' }}>最后交易</div>
            <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#2196f3' }}>
              {formatDate(data.lastTradeDate)}
            </div>
          </div>
        </div>
      </div>

      {/* 投资表现总结 */}
      <div style={{
        padding: '20px',
        backgroundColor: isProfit ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)',
        borderRadius: '8px',
        border: `1px solid ${isProfit ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: 'var(--text)' }}>
          📊 投资表现总结
        </h4>
        
        <div style={{ fontSize: '0.95em', lineHeight: '1.6', color: 'var(--text)' }}>
          {isProfit ? (
            <div>
              <div style={{ color: '#4caf50', marginBottom: '8px' }}>
                ✅ <strong>投资表现良好</strong>
              </div>
              <div>
                在过去 {data.totalInvestmentDays} 天里，您通过 {data.totalBuyTrades + data.totalSellTrades} 笔交易，
                将 {formatPrice(data.totalInvestment)} 的投入转化为 {formatPrice(data.totalValue)} 的总价值，
                实现了 {formatPrice(data.absoluteProfit)} 的收益（{formatPercent(data.returnRate)}）。
              </div>
            </div>
          ) : (
            <div>
              <div style={{ color: '#f44336', marginBottom: '8px' }}>
                ⚠️ <strong>当前处于亏损状态</strong>
              </div>
              <div>
                当前亏损 {formatPrice(Math.abs(parseFloat(data.absoluteProfit)))}，
                建议重新评估投资策略或等待市场回暖。
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ fontSize: '0.8em', color: 'var(--muted)', textAlign: 'center' }}>
        💡 默认使用成本价计算持仓价值，可手动输入实际市场价值获得准确的盈亏分析
      </div>
    </div>
  );
} 