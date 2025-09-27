import { useState } from 'react'
import './App.css'
import { ItemForm } from './components/ItemForm'
import { TradeManagement } from './components/TradeManagement'
import { InventoryList } from './components/InventoryList'
import { DailyStats } from './components/DailyStats'

function App() {
  const [tab, setTab] = useState<'item' | 'trade' | 'inventory' | 'stats'>('item')

  return (
    <div className="main">
      <header className="navbar">
        <div className="brand">
          <span className="brand-dot" />
          <h2 className="brand-title">CS Inventory 控制台</h2>
        </div>
        <div className="tabs" role="tablist" aria-label="主导航">
          <button 
            className="tab-btn" 
            role="tab" 
            aria-selected={tab === 'item'} 
            aria-current={tab === 'item' ? 'page' : undefined} 
            onClick={() => setTab('item')}
          >
            创建物品
          </button>
          <button 
            className="tab-btn" 
            role="tab" 
            aria-selected={tab === 'trade'} 
            aria-current={tab === 'trade' ? 'page' : undefined} 
            onClick={() => setTab('trade')}
          >
            交易管理
          </button>
          <button 
            className="tab-btn" 
            role="tab" 
            aria-selected={tab === 'inventory'} 
            aria-current={tab === 'inventory' ? 'page' : undefined} 
            onClick={() => setTab('inventory')}
          >
            库存查看
          </button>
          <button 
            className="tab-btn" 
            role="tab" 
            aria-selected={tab === 'stats'} 
            aria-current={tab === 'stats' ? 'page' : undefined} 
            onClick={() => setTab('stats')}
          >
            数据统计
          </button>
        </div>
      </header>

      <section className="card">
        {tab === 'item' && <ItemForm />}
        {tab === 'trade' && <TradeManagement />}
        {tab === 'inventory' && <InventoryList />}
        {tab === 'stats' && <DailyStats />}
      </section>
    </div>
  )
}

export default App
