export interface Item {
  id?: number;
  marketHashName: string;
  cnName: string;
  enName: string;
  nameId: number;
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

export interface ImportResult {
  importedCount: number;
  skippedCount: number;
  skippedItems: string[];
  totalItems: number;
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
  createTrade: (trade: Trade) => request<Trade>('/api/trades', {
    method: 'POST',
    body: JSON.stringify(trade),
  }),
  // /api/stats/daily?start=...&end=...
  dailyStats: (startIso: string, endIso: string) =>
    request<DailyFlowDTO[]>(`/api/stats/daily?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`),
}; 