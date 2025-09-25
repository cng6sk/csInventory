export interface Item {
  id?: number;
  name: string;
  exterior?: string;
  game?: string;
  marketId?: string;
}

export interface Trade {
  id?: number;
  item: { id: number };
  // 其余字段后端暂未展示，先预留可扩展
}

export interface DailyFlowDTO {
  day: string; // ISO date (yyyy-MM-dd)
  totalBuy: string;  // BigDecimal 使用字符串承载
  totalSell: string; // BigDecimal 使用字符串承载
  net: string;
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  createItem: (item: Item) => request<Item>('/api/items', {
    method: 'POST',
    body: JSON.stringify(item),
  }),
  createTrade: (trade: Trade) => request<Trade>('/api/trades', {
    method: 'POST',
    body: JSON.stringify(trade),
  }),
  // /api/stats/daily?start=...&end=...
  dailyStats: (startIso: string, endIso: string) =>
    request<DailyFlowDTO[]>(`/api/stats/daily?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`),
}; 