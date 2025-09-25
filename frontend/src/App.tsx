import { useState } from 'react'
import './App.css'
import { ItemForm } from './components/ItemForm'
import { TradeForm } from './components/TradeForm'
import { DailyStats } from './components/DailyStats'

function App() {
  const [tab, setTab] = useState<'item' | 'trade' | 'stats'>('item')

  return (
    <div className="main">
      <header className="navbar">
        <div className="brand">
          <span className="brand-dot" />
          <h2 className="brand-title">CS Inventory 控制台</h2>
        </div>
        <div className="tabs" role="tablist" aria-label="主导航">
          <button className="tab-btn" role="tab" aria-selected={tab === 'item'} aria-current={tab === 'item' ? 'page' : undefined} onClick={() => setTab('item')}>创建物品</button>
          <button className="tab-btn" role="tab" aria-selected={tab === 'trade'} aria-current={tab === 'trade' ? 'page' : undefined} onClick={() => setTab('trade')}>创建交易</button>
          <button className="tab-btn" role="tab" aria-selected={tab === 'stats'} aria-current={tab === 'stats' ? 'page' : undefined} onClick={() => setTab('stats')}>按日统计</button>
        </div>
      </header>

      <section className="card">
        {tab === 'item' && <ItemForm />}
        {tab === 'trade' && <TradeForm />}
        {tab === 'stats' && <DailyStats />}
      </section>
    </div>
  )
}

export default App
