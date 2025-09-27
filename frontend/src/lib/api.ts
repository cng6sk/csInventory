export interface Item {
  id?: number;
  marketHashName: string;
  cnName: string;
  enName: string;
  nameId: number;
}

export interface Trade {
  id?: number;
  nameId: number;
  cnName?: string;  // 物品中文名称
  enName?: string;  // 物品英文名称  
  type: 'BUY' | 'SELL';
  unitPrice: string;  // BigDecimal作为字符串
  quantity: number;
  totalAmount?: string;  // BigDecimal作为字符串
  createdAt?: string;
}

export interface Inventory {
  id?: number;
  nameId: number;
  cnName?: string;  // 物品中文名称
  enName?: string;  // 物品英文名称
  currentQuantity: number;
  weightedAverageCost: string;  // BigDecimal作为字符串
  totalInvestmentCost: string;  // BigDecimal作为字符串
  createdAt: string;
  lastUpdatedAt: string;
}

export interface DailyFlowDTO {
  day: string; // ISO date (yyyy-MM-dd)
  totalBuy: string;  // BigDecimal 使用字符串承载
  totalSell: string; // BigDecimal 使用字符串承载
  net: string;
}

export interface ImportResult {
  importedCount: number;
  skippedCount: number;
  skippedItems: string[];
  totalItems: number;
}

export interface SellRequest {
  nameId: number;
  unitPrice: string;  // BigDecimal作为字符串
  quantity: number;
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

// 文件上传专用的请求函数
async function uploadRequest<T>(input: RequestInfo, formData: FormData): Promise<T> {
  const res = await fetch(input, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  // ==================== 物品管理接口 ====================
  getAllItems: () => request<Item[]>('/api/items'),
  
  // 新增：搜索物品
  searchItems: (keyword?: string, limit: number = 15) => {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    params.append('limit', limit.toString());
    return request<Item[]>(`/api/items/search?${params}`);
  },

  createItem: (item: Item) => request<Item>('/api/items', {
    method: 'POST',
    body: JSON.stringify(item),
  }),
  importItems: (jsonData: string) => request<ImportResult>('/api/items/import', {
    method: 'POST',
    body: JSON.stringify({ jsonData }),
  }),
  importItemsFromFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadRequest<ImportResult>('/api/items/import-file', formData);
  },

  // ==================== 交易管理接口 ====================
  createTrade: (trade: Trade) => request<Trade>('/api/trades', {
    method: 'POST',
    body: JSON.stringify(trade),
  }),
  createSellTrade: (sellRequest: SellRequest) => request<Trade>('/api/trades/sell', {
    method: 'POST',
    body: JSON.stringify(sellRequest),
  }),
  getAllTrades: () => request<Trade[]>('/api/trades'),
  getTradeHistory: (nameId: number) => request<Trade[]>(`/api/trades/history/${nameId}`),
  getTradesByDateRange: (start: string, end: string) => 
    request<Trade[]>(`/api/trades/date-range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`),

  // ==================== 库存管理接口 ====================
  getAllInventory: () => request<Inventory[]>('/api/inventory'),
  getInventoryByNameId: (nameId: number) => request<Inventory>(`/api/inventory/${nameId}`),
  getCurrentQuantity: (nameId: number) => request<{nameId: number, quantity: number}>(`/api/inventory/${nameId}/quantity`),

  // ==================== 统计接口 ====================
  dailyStats: (startIso: string, endIso: string) =>
    request<DailyFlowDTO[]>(`/api/stats/daily?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`),
}; 