import { useState, useRef } from 'react';
import { api } from '../lib/api';
import type { ImportResult } from '../lib/api';

export function ItemForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'file' | 'text'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.json')) {
        setError('请选择JSON文件');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('文件大小不能超过50MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90; // 停在90%，等待实际完成
        }
        return prev + Math.random() * 10;
      });
    }, 200);
    return interval;
  };

  const handleFileImport = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setResult(null);
    setError(null);
    
    const progressInterval = simulateProgress();

    try {
      const importResult = await api.importItemsFromFile(selectedFile);
      clearInterval(progressInterval);
      setProgress(100);
      setResult(importResult);
      
      // 清空选择的文件
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setProgress(0);
      setError(err.message || '导入失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTextImport = async () => {
    if (!jsonData.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);
    
    const progressInterval = simulateProgress();

    try {
      // 验证JSON格式
      JSON.parse(jsonData);
      
      const importResult = await api.importItems(jsonData);
      clearInterval(progressInterval);
      setProgress(100);
      setResult(importResult);
      
      // 如果导入成功，清空输入框
      if (importResult.importedCount > 0) {
        setJsonData('');
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setProgress(0);
      if (err instanceof SyntaxError) {
        setError('JSON格式错误，请检查数据格式');
      } else {
        setError(err.message || '导入失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExampleData = () => {
    const exampleData = {
      "AK-47 | Aquamarine Revenge (Battle-Scarred)": {
        "en_name": "AK-47 | Aquamarine Revenge (Battle-Scarred)",
        "cn_name": "AK-47 | 深海复仇 (战痕累累)",
        "name_id": 49359087
      },
      "AK-47 | Aquamarine Revenge (Factory New)": {
        "en_name": "AK-47 | Aquamarine Revenge (Factory New)",
        "cn_name": "AK-47 | 深海复仇 (崭新出厂)",
        "name_id": 49399568
      }
    };
    setJsonData(JSON.stringify(exampleData, null, 2));
  };

  const closeError = () => {
    setError(null);
  };

  const resetProgress = () => {
    setProgress(0);
    setResult(null);
  };

  return (
    <div className="form">
      <h3>导入物品数据</h3>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
        支持JSON文件上传或直接粘贴JSON数据，系统将自动解析并导入到数据库中。
      </p>
      
      {/* 导入模式选择 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '20px' }}>
          <input
            type="radio"
            value="file"
            checked={importMode === 'file'}
            onChange={(e) => setImportMode(e.target.value as 'file')}
            style={{ marginRight: '8px' }}
          />
          文件上传
        </label>
        <label>
          <input
            type="radio"
            value="text"
            checked={importMode === 'text'}
            onChange={(e) => setImportMode(e.target.value as 'text')}
            style={{ marginRight: '8px' }}
          />
          文本输入
        </label>
      </div>

      {/* 文件上传模式 */}
      {importMode === 'file' && (
        <div>
          <label className="label">
            选择JSON文件
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="input"
              style={{ padding: '8px' }}
            />
          </label>
          
          {selectedFile && (
            <div style={{ margin: '12px 0', padding: '8px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
              <strong>已选择文件：</strong> {selectedFile.name}<br/>
              <strong>文件大小：</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          )}

          <button 
            className="button" 
            onClick={handleFileImport}
            disabled={loading || !selectedFile}
            style={{ width: '100%', marginTop: '12px' }}
          >
            {loading ? '导入中...' : '开始导入'}
          </button>
        </div>
      )}

      {/* 文本输入模式 */}
      {importMode === 'text' && (
        <div>
          <label className="label">
            JSON数据
            <textarea
              className="input"
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              rows={12}
              placeholder="粘贴您的JSON数据..."
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
          </label>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button 
              className="button" 
              onClick={handleTextImport}
              disabled={loading || !jsonData.trim()}
            >
              {loading ? '导入中...' : '导入数据'}
            </button>
            <button 
              type="button" 
              className="button" 
              onClick={handleExampleData}
              style={{ backgroundColor: '#f0f0f0', color: '#333' }}
            >
              填入示例数据
            </button>
          </div>
        </div>
      )}

      {/* 进度条 */}
      {loading && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>导入进度</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${progress}%`, 
              height: '100%', 
              backgroundColor: '#4CAF50',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* 错误弹窗 */}
      {error && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#e74c3c' }}>导入错误</h4>
            <p style={{ margin: '0 0 16px 0', wordBreak: 'break-word' }}>{error}</p>
            <button 
              className="button"
              onClick={closeError}
              style={{ backgroundColor: '#e74c3c', color: 'white' }}
            >
              确定
            </button>
          </div>
        </div>
      )}

      {/* 导入结果 */}
      {result && (
        <div style={{
          padding: '16px',
          backgroundColor: '#d1f2eb',
          border: '1px solid #58d68d',
          borderRadius: '4px',
          marginTop: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#27ae60' }}>导入完成</h4>
            <button 
              onClick={resetProgress}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '18px', 
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>
          <p style={{ margin: '4px 0' }}>📊 总计：{result.totalItems} 个物品</p>
          <p style={{ margin: '4px 0' }}>✅ 成功导入：{result.importedCount} 个物品</p>
          <p style={{ margin: '4px 0' }}>⏭️ 跳过：{result.skippedCount} 个物品</p>
          
          {result.skippedItems.length > 0 && (
            <details style={{ marginTop: '12px' }}>
              <summary style={{ cursor: 'pointer', color: '#e67e22' }}>
                查看跳过的物品 ({result.skippedItems.length})
              </summary>
              <div style={{ 
                maxHeight: '200px', 
                overflowY: 'auto', 
                marginTop: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '8px'
              }}>
                {result.skippedItems.map((item, index) => (
                  <div key={index} style={{ 
                    fontSize: '12px', 
                    color: '#7f8c8d',
                    padding: '2px 0',
                    borderBottom: index < result.skippedItems.length - 1 ? '1px solid #eee' : 'none'
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
      
      <div style={{ 
        marginTop: '24px', 
        padding: '12px', 
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#6c757d'
      }}>
        <strong>JSON格式说明：</strong>
        <br />• Key: 物品的market_hash_name
        <br />• en_name: 英文名称
        <br />• cn_name: 中文名称  
        <br />• name_id: Steam API中的物品ID
        <br />• 支持文件大小：最大50MB
      </div>
    </div>
  );
} 