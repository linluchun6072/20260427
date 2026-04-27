import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Shuffle, 
  Trash2, 
  Copy, 
  Check, 
  Settings2,
  LayoutGrid,
  UsersRound,
  FileUp
} from 'lucide-react';

type GroupingMode = 'count' | 'size';

interface Group {
  id: number;
  members: string[];
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<GroupingMode>('count');
  const [value, setValue] = useState(2);
  const [groups, setGroups] = useState<Group[]>([]);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const testNames = ["張小明", "李華", "王大同", "陳美玲", "林志成", "吳依婷", "蔡文雅", "黃宇軒", "趙雲", "孫尚香", "關羽", "張飛", "劉備", "曹操", "諸葛亮", "周瑜", "小喬", "大喬", "司馬懿", "魯肅"];

  const handleLoadTestData = () => {
    setInputText(testNames.join('\n'));
    setGroups([]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setInputText(content);
        setGroups([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const names = useMemo(() => {
    return inputText
      .split(/[\n,，\s]+/)
      .map(name => name.trim())
      .filter(name => name.length > 0);
  }, [inputText]);

  const handleGenerate = () => {
    if (names.length === 0) return;
    const shuffled = [...names];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let resultGroups: Group[] = [];
    if (mode === 'count') {
      const groupCount = Math.max(1, Math.min(value, names.length));
      for (let i = 0; i < groupCount; i++) {
        resultGroups.push({ id: i + 1, members: [] });
      }
      shuffled.forEach((name, index) => {
        resultGroups[index % groupCount].members.push(name);
      });
    } else {
      const groupSize = Math.max(1, value);
      const groupCount = Math.ceil(names.length / groupSize);
      for (let i = 0; i < groupCount; i++) {
        const start = i * groupSize;
        resultGroups.push({
          id: i + 1,
          members: shuffled.slice(start, start + groupSize)
        });
      }
    }
    setGroups(resultGroups);
  };

  const handleClear = () => {
    setInputText('');
    setGroups([]);
  };

  const copyToClipboard = () => {
    const text = groups
      .map(g => `第 ${g.id} 組: ${g.members.join(', ')}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const groupColors = ['bg-rose-400', 'bg-emerald-400', 'bg-indigo-400', 'bg-amber-400', 'bg-cyan-400', 'bg-purple-400'];

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 overflow-hidden">
      {/* Navigation Bar */}
      <nav className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center text-white font-bold">G</div>
          <span className="text-xl font-bold tracking-tight text-slate-900 uppercase">GroupArchitect</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
            <span className="text-indigo-600 border-b-2 border-indigo-600 pb-1">主要面板</span>
            <span className="hover:text-slate-800 cursor-pointer transition-colors">分組記錄</span>
            <span className="hover:text-slate-800 cursor-pointer transition-colors">範本</span>
          </div>
          <button 
            onClick={handleClear}
            className="px-5 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-md shadow-sm hover:bg-slate-50 transition-colors"
          >
            重置名單
          </button>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-80 border-r border-slate-200 bg-white p-6 flex flex-col gap-6 shrink-0 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">成員名單輸入</label>
              <div className="flex gap-2">
                <button 
                  onClick={handleLoadTestData}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded transition-colors"
                >
                  測試名單
                </button>
                <button 
                  onClick={triggerFileInput}
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-700 bg-slate-100 px-2 py-1 rounded transition-colors"
                >
                  <FileUp className="h-3 w-3" />
                  導入文件
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".txt,.csv" 
                  className="hidden" 
                />
              </div>
            </div>
            <div className="relative">
              <textarea 
                className="w-full h-56 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none" 
                placeholder="請輸入姓名（換行、逗號或空格分隔）..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded shadow-sm">
                已偵測 {names.length} 人
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">分組配置設定</label>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('count')}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  mode === 'count' 
                    ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className={`text-[10px] font-bold uppercase mb-1 ${mode === 'count' ? 'text-indigo-600' : 'text-slate-400'}`}>
                  總組數
                </div>
                <div className="text-xl font-bold">{mode === 'count' ? value : '-'}</div>
              </button>
              <button
                onClick={() => setMode('size')}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  mode === 'size' 
                    ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className={`text-[10px] font-bold uppercase mb-1 ${mode === 'size' ? 'text-indigo-600' : 'text-slate-400'}`}>
                  每組人數
                </div>
                <div className="text-xl font-bold">{mode === 'size' ? value : '-'}</div>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">調整數值</span>
                <span className="text-xs font-bold text-indigo-600">{value}</span>
              </div>
              <input
                type="range"
                min="1"
                max={Math.max(10, names.length)}
                value={value}
                onChange={(e) => setValue(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          <div className="mt-auto pt-4">
            <button 
              onClick={handleGenerate}
              disabled={names.length === 0}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:bg-slate-200 disabled:shadow-none transition-all active:scale-95"
            >
              生成分組結果
            </button>
          </div>
        </aside>

        {/* Results Area */}
        <section className="flex-1 p-10 bg-[#F8FAFC] overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">分組面板</h2>
              <p className="text-sm text-slate-500 mt-1">
                {groups.length > 0 ? `目前顯示 ${groups.length} 個組別` : '準備好開始進行隨機分組'}
              </p>
            </div>
            {groups.length > 0 && (
              <div className="flex gap-2">
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? '已複製' : '複製結果'}
                </button>
              </div>
            )}
          </div>

          {!groups.length ? (
            <div className="h-full max-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm mb-6">
                <Users className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">隨機分組已就緒</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                在左側邊欄輸入成員名單，調整您偏好的分組方式後點擊「生成」按鈕。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {groups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-indigo-200 transition-all"
                  >
                    <div className={`h-1.5 ${groupColors[index % groupColors.length]}`}></div>
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-900 tracking-tight">第 {group.id} 組</h3>
                      <span className="text-[10px] bg-slate-50 text-slate-500 font-bold px-2 py-1 rounded-sm uppercase">
                        {group.members.length} 成員
                      </span>
                    </div>
                    <div className="p-5 flex flex-col gap-3">
                      {group.members.map((member, mIdx) => (
                        <div key={mIdx} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {member.substring(0, 2)}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{member}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {groups.length > 0 && (
            <div className="mt-10 p-6 bg-slate-900 rounded-2xl text-white flex items-center justify-between shadow-xl">
              <div>
                <h4 className="font-bold">分組完成！</h4>
                <p className="text-slate-400 text-sm">小組已根據您的設定平衡分配完畢。</p>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                  匯出清單
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Status Footer */}
      <footer className="h-12 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
        <div className="flex gap-6 uppercase tracking-widest font-bold">
          <span>版本 1.0.0</span>
          <span>隨機演算法已啟動</span>
        </div>
        <div className="flex items-center gap-2 uppercase tracking-widest font-bold">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span>系統狀態：正常運行</span>
        </div>
      </footer>
    </div>
  );
}
