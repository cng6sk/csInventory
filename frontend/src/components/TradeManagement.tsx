import { useState } from 'react';
import { TradeForm } from './TradeForm';
import { TradeHistory } from './TradeHistory';

export function TradeManagement() {
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  return (
    <div className="container-full">
      {/* 子标签页 */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '20px',
        borderBottom: '1px solid #e0e0e0',
        paddingBottom: '8px'
      }}>
        <button 
          className="tab-btn"
          style={{
            backgroundColor: activeTab === 'form' ? '#2196F3' : 'transparent',
            color: activeTab === 'form' ? 'white' : '#2196F3',
            border: '1px solid #2196F3',
            fontSize: '0.9em'
          }}
          onClick={() => setActiveTab('form')}
        >
          创建交易
        </button>
        <button 
          className="tab-btn"
          style={{
            backgroundColor: activeTab === 'history' ? '#2196F3' : 'transparent',
            color: activeTab === 'history' ? 'white' : '#2196F3',
            border: '1px solid #2196F3',
            fontSize: '0.9em'
          }}
          onClick={() => setActiveTab('history')}
        >
          交易历史
        </button>
      </div>

      {/* 内容区域 */}
      {activeTab === 'form' && <TradeForm />}
      {activeTab === 'history' && <TradeHistory />}
    </div>
  );
} 