import { Link } from 'react-router-dom';
import {
  Plus, Trash2, Settings, Download, Upload, FileJson, Presentation,
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, GripVertical,
  Edit2, X, AlertCircle, Loader2, Check, CalendarDays, PlusCircle
} from 'lucide-react';
import { COLORS, VIEW_MODES, SPECIAL_COL_WIDTH } from './yabane/types';
import { formatDate, getISOWeek, getFiscalInfo } from './yabane/utils';
import { useYabaneSchedule } from './yabane/useYabaneSchedule';

export function YabaneSchedulePage() {
  const h = useYabaneSchedule();

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {h.message && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 ${h.message.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'} text-white`}>
          {h.message.type === 'error' ? <AlertCircle size={18}/> : <Check size={18}/>}
          <span className="text-sm font-bold">{h.message.text}</span>
        </div>
      )}

      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-sm z-30">
        <div className="flex items-center space-x-4">
          <Link to="/tools" className="text-sm text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap">← ツール一覧</Link>
          <div className="bg-indigo-600 p-2 rounded-lg text-white"><CalendarIcon size={20} /></div>
          <h1 className="text-lg font-bold tracking-tight hidden lg:block text-slate-700">矢羽スケジュール</h1>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {VIEW_MODES.map(mode => (
              <button key={mode.id} onClick={() => h.setViewMode(mode.id)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${h.viewMode === mode.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{mode.label}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative" ref={h.rangePickerRef}>
            <div className="flex items-center bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
              <button onClick={() => h.shiftView(-1)} className="p-1.5 hover:bg-slate-50 border-r border-slate-200" aria-label="前の期間"><ChevronLeft size={16} /></button>
              <button onClick={() => h.setShowRangePicker(!h.showRangePicker)} className="px-3 py-1.5 text-xs font-bold flex items-center space-x-2 hover:bg-slate-50 transition-colors">
                <CalendarDays size={14} className="text-indigo-500" />
                <span>{h.viewStart.replace(/-/g, '/')} 〜 {h.viewEnd.replace(/-/g, '/')}</span>
              </button>
              <button onClick={() => h.shiftView(1)} className="p-1.5 hover:bg-slate-50 border-l border-slate-200" aria-label="次の期間"><ChevronRight size={16} /></button>
            </div>
            {h.showRangePicker && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-4">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 font-bold text-sm">表示範囲設定<button onClick={() => h.setShowRangePicker(false)}><X size={16}/></button></div>
                <div className="space-y-4">
                  <div className="space-y-1"><label className="text-[10px] text-slate-400 font-bold uppercase">開始日</label><input type="date" value={h.viewStart} onChange={(e) => { if (e.target.value <= h.viewEnd) h.setViewStart(e.target.value); }} className="w-full px-3 py-2 border rounded-lg text-sm" max={h.viewEnd} /></div>
                  <div className="space-y-1"><label className="text-[10px] text-slate-400 font-bold uppercase">終了日</label><input type="date" value={h.viewEnd} onChange={(e) => { if (e.target.value >= h.viewStart) h.setViewEnd(e.target.value); }} className="w-full px-3 py-2 border rounded-lg text-sm" min={h.viewStart} /></div>
                </div>
                <button onClick={() => h.setShowRangePicker(false)} className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">適用</button>
              </div>
            )}
          </div>
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <div className="flex items-center space-x-1">
            <button onClick={() => h.fileInputRef.current?.click()} className="p-2 hover:bg-slate-100 rounded-md text-slate-500" title="JSON読込"><Upload size={18} /></button>
            <input type="file" ref={h.fileInputRef} onChange={h.handleImportJSON} className="hidden" accept=".json" />
            <button onClick={h.handleExportJSON} className="p-2 hover:bg-slate-100 rounded-md text-slate-500" title="JSON保存"><FileJson size={18} /></button>
            <button onClick={h.handleExportPPTX} disabled={h.isExporting || !h.pptxReady} className="p-2 hover:bg-slate-100 rounded-md text-indigo-600 disabled:opacity-50" title={h.pptxReady ? "PowerPoint出力" : "ライブラリ読込中..."}>{h.isExporting ? <Loader2 size={18} className="animate-spin" /> : <Presentation size={18} />}</button>
          </div>
          <button onClick={() => h.setShowSettings(!h.showSettings)} className="p-2 hover:bg-slate-100 rounded-md text-slate-500" title="設定" aria-label="設定"><Settings size={18} /></button>
          <button onClick={() => window.print()} className="bg-slate-700 text-white px-3 py-1.5 rounded-md hover:bg-slate-800 text-xs font-bold flex items-center space-x-1 shadow-sm" aria-label="印刷"><Download size={14} /><span>印刷</span></button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-auto scrollbar-thin" ref={h.timelineRef}>
          <div className="sticky top-0 z-20 flex bg-white border-b border-slate-200 min-w-full w-max">
            <div className="w-40 flex-shrink-0 border-r border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">工程区分</div>
            <div className="flex items-stretch" style={{ width: `${h.totalTimelineWidth}px` }}>
              {h.leftCols.map((c, i) => (<div key={`l-${i}`} style={{ width: `${SPECIAL_COL_WIDTH}px` }} className="flex-shrink-0 border-r border-slate-200 bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">{c}</div>))}
              {h.timelineUnits.map((date, i) => {
                const dateStr = formatDate(date); const isHolidayMode = h.viewMode === 'day';
                const holidayName = (isHolidayMode && h.useJapaneseHolidays) ? h.holidays[dateStr] : null;
                const isSun = isHolidayMode && date.getDay() === 0;
                let mainLabel = "", subLabel = "";
                if (h.viewMode === 'day') { mainLabel = date.getDate() === 1 || i === 0 ? `${date.getMonth() + 1}月` : ""; subLabel = date.getDate().toString(); }
                else if (h.viewMode === 'week') { mainLabel = `${date.getMonth() + 1}月`; subLabel = `W${getISOWeek(date)}`; }
                else if (h.viewMode === 'month') { mainLabel = `${date.getFullYear()}年`; subLabel = `${date.getMonth() + 1}月`; }
                else if (h.viewMode === 'year') { subLabel = `${date.getFullYear()}年`; }
                else if (h.viewMode === 'fy') { subLabel = getFiscalInfo(date).label; }
                return (
                  <div key={i} style={{ width: `${h.unitWidth}px` }} className={`flex-shrink-0 flex flex-col items-center justify-center py-2 border-r border-slate-100 relative ${(holidayName || isSun) ? 'bg-rose-50' : ''}`}>
                    {mainLabel && <span className="absolute top-1 text-[9px] font-bold text-indigo-500 whitespace-nowrap">{mainLabel}</span>}
                    <span className={`text-xs font-bold pt-2 ${(holidayName || isSun) ? 'text-rose-600' : 'text-slate-600'}`}>{subLabel}</span>
                  </div>
                );
              })}
              {h.rightCols.map((c, i) => (<div key={`r-${i}`} style={{ width: `${SPECIAL_COL_WIDTH}px` }} className="flex-shrink-0 border-r border-slate-200 bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">{c}</div>))}
            </div>
          </div>

          <div className="flex-1 min-w-full w-max">
            {h.categories.map((category) => {
              const laneTasks = h.laneTasksByCategory[category] || [];
              const maxLane = Math.max(-1, ...laneTasks.map(t => t.laneIndex));
              const swimlaneHeight = Math.max(70, (maxLane + 1) * (h.TASK_HEIGHT + h.TASK_GAP) + 12);
              return (
                <div key={category} className="flex border-b border-slate-100 group/row" style={{ height: `${swimlaneHeight}px` }}>
                  <div className="w-40 flex-shrink-0 border-r border-slate-200 bg-white sticky left-0 z-10 flex items-center px-4 relative group/cat">
                    <span className="text-sm font-bold text-slate-600 truncate mr-10">{category}</span>
                    <div className="absolute right-1 flex items-center space-x-0.5 opacity-0 group-hover/cat:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm pl-1">
                      <button onClick={() => h.addTask(category)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600"><Plus size={14} /></button>
                      <button onClick={() => h.attemptDeleteCategory(category)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="flex relative items-stretch" style={{ width: `${h.totalTimelineWidth}px` }}>
                    <div className="absolute inset-0 flex items-stretch pointer-events-none">
                      {h.leftCols.map((_, i) => <div key={`lg-${i}`} style={{ width: `${SPECIAL_COL_WIDTH}px` }} className="flex-shrink-0 border-r border-slate-200 bg-slate-50/30" />)}
                      {h.timelineUnits.map((_, i) => <div key={i} style={{ width: `${h.unitWidth}px` }} className="flex-shrink-0 border-r border-slate-100/50" />)}
                      {h.rightCols.map((_, i) => <div key={`rg-${i}`} style={{ width: `${SPECIAL_COL_WIDTH}px` }} className="flex-shrink-0 border-r border-slate-200 bg-slate-50/30" />)}
                    </div>
                    <div className="relative w-full py-4 overflow-hidden">
                      {laneTasks.map((task) => {
                        const top = task.laneIndex * (h.TASK_HEIGHT + h.TASK_GAP);
                        return (
                          <div key={task.id} style={{ left: `${task.xStart + 5}px`, width: `${task.width - 10}px`, top: `${top}px`, height: `${h.TASK_HEIGHT}px`, opacity: h.dragTaskId === task.id ? 0.5 : 1 }}
                            className="absolute transition-all hover:z-10 flex items-center justify-center cursor-move"
                            draggable="true" onDragStart={(e) => h.handleDragStart(e, task.id)} onDragOver={h.handleDragOver} onDrop={(e) => h.handleDrop(e, task.id)} onDragEnd={h.handleDragEnd} onClick={() => h.handleTaskClick(task)}>
                            <div className={`absolute inset-0 ${task.color} opacity-90 shadow-sm ${h.editingTask?.id === task.id ? 'ring-2 ring-indigo-400 ring-offset-1' : ''} group`}
                              style={{ clipPath: 'polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%, 10px 50%)' }}>
                              <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 text-white"><GripVertical size={12} /></div>
                            </div>
                            <span className="relative z-10 text-[9px] font-bold text-white px-6 truncate pointer-events-none drop-shadow-sm w-full text-center">{task.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex border-b border-slate-100 min-h-[48px] bg-slate-50/30">
              <div className="w-40 flex-shrink-0 border-r border-slate-200 bg-white sticky left-0 z-10 flex items-center px-4">
                <button onClick={() => h.setShowAddCategoryModal(true)} className="flex items-center space-x-2 text-indigo-600 font-bold text-xs hover:text-indigo-700 transition-colors"><Plus size={14} /><span>区分追加</span></button>
              </div>
              <div className="flex relative items-stretch" style={{ width: `${h.totalTimelineWidth}px` }}>
                <div className="absolute inset-0 flex items-stretch pointer-events-none">
                  {h.leftCols.map((_, i) => <div key={`lg-${i}`} style={{ width: `${SPECIAL_COL_WIDTH}px` }} className="flex-shrink-0 border-r border-slate-200 bg-slate-50/30" />)}
                  {h.timelineUnits.map((_, i) => <div key={i} style={{ width: `${h.unitWidth}px` }} className="flex-shrink-0 border-r border-slate-100/50" />)}
                  {h.rightCols.map((_, i) => <div key={`rg-${i}`} style={{ width: `${SPECIAL_COL_WIDTH}px` }} className="flex-shrink-0 border-r border-slate-200 bg-slate-50/30" />)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {h.editingTask && (
          <div className="w-72 bg-white border-l border-slate-200 shadow-xl z-30 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50 text-slate-700 font-bold text-sm"><div className="flex items-center space-x-2"><Edit2 size={14}/><span>タスク詳細</span></div><button onClick={() => h.setEditingTask(null)}><X size={18}/></button></div>
            <div className="p-4 space-y-5 overflow-y-auto">
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">タスク名</label><input type="text" value={h.editingTask.title} onChange={(e) => h.updateTask(h.editingTask!.id, { title: e.target.value })} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">開始地点</label>
                <div className="flex rounded-md border border-slate-200 overflow-hidden">
                  <button onClick={() => h.updateTask(h.editingTask!.id, { startType: 'special', start: 'left-0' })} className={`flex-1 py-1 text-[10px] font-bold ${h.editingTask.startType === 'special' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>固定列</button>
                  <button onClick={() => h.updateTask(h.editingTask!.id, { startType: 'date', start: formatDate(new Date(h.viewStart)) })} className={`flex-1 py-1 text-[10px] font-bold ${h.editingTask.startType === 'date' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>カレンダー</button>
                </div>
                {h.editingTask.startType === 'special' ? (
                  <select value={h.editingTask.start} onChange={(e) => h.updateTask(h.editingTask!.id, { start: e.target.value })} className="w-full p-1.5 border rounded text-xs">
                    {h.leftCols.map((c, i) => <option key={`sl-${i}`} value={`left-${i}`}>{c}</option>)}
                    {h.rightCols.map((c, i) => <option key={`sr-${i}`} value={`right-${i}`}>{c}</option>)}
                  </select>
                ) : (<input type="date" value={h.editingTask.start} onChange={(e) => h.updateTask(h.editingTask!.id, { start: e.target.value })} className="w-full p-1.5 border rounded text-xs" />)}
              </div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">終了地点</label>
                <div className="flex rounded-md border border-slate-200 overflow-hidden">
                  <button onClick={() => h.updateTask(h.editingTask!.id, { endType: 'special', end: 'right-0' })} className={`flex-1 py-1 text-[10px] font-bold ${h.editingTask.endType === 'special' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>固定列</button>
                  <button onClick={() => h.updateTask(h.editingTask!.id, { endType: 'date', end: formatDate(new Date(h.viewStart)) })} className={`flex-1 py-1 text-[10px] font-bold ${h.editingTask.endType === 'date' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>カレンダー</button>
                </div>
                {h.editingTask.endType === 'special' ? (
                  <select value={h.editingTask.end} onChange={(e) => h.updateTask(h.editingTask!.id, { end: e.target.value })} className="w-full p-1.5 border rounded text-xs">
                    {h.leftCols.map((c, i) => <option key={`el-${i}`} value={`left-${i}`}>{c}</option>)}
                    {h.rightCols.map((c, i) => <option key={`er-${i}`} value={`right-${i}`}>{c}</option>)}
                  </select>
                ) : (<input type="date" value={h.editingTask.end} onChange={(e) => h.updateTask(h.editingTask!.id, { end: e.target.value })} className="w-full p-1.5 border rounded text-xs" />)}
              </div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400">カラー</label><div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="タスクカラー">{COLORS.map(c => <button key={c.bg} onClick={() => h.updateTask(h.editingTask!.id, { color: c.bg })} className={`h-8 rounded ${c.bg} ${h.editingTask!.color === c.bg ? 'ring-2 ring-slate-400' : ''}`} role="radio" aria-checked={h.editingTask!.color === c.bg} aria-label={c.name} />)}</div></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">工程カテゴリ</label><select value={h.editingTask.category} onChange={(e) => h.updateTask(h.editingTask!.id, { category: e.target.value })} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm bg-white">{h.categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="pt-4 border-t"><button onClick={() => h.deleteTask(h.editingTask!.id)} className="w-full py-2 text-rose-500 text-xs font-bold border border-rose-100 rounded hover:bg-rose-50 flex items-center justify-center space-x-1"><Trash2 size={14}/><span>タスク削除</span></button></div>
            </div>
          </div>
        )}
      </main>

      {h.showAddCategoryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="工程区分の追加">
          <div className="bg-white rounded-xl shadow-2xl w-80 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center space-x-2 text-indigo-600"><PlusCircle size={20}/><span>工程区分の追加</span></h3>
            <div className="space-y-1 mb-6">
              <label className="text-xs font-bold text-slate-400">区分名を入力してください</label>
              <input autoFocus type="text" value={h.newCategoryName} onChange={(e) => h.setNewCategoryName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && h.handleAddCategory()} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="例: テスト工程" />
            </div>
            <div className="flex space-x-3">
              <button onClick={() => { h.setShowAddCategoryModal(false); h.setNewCategoryName(''); }} className="flex-1 py-2 bg-slate-100 rounded-lg text-xs font-bold">キャンセル</button>
              <button onClick={h.handleAddCategory} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-indigo-700">追加する</button>
            </div>
          </div>
        </div>
      )}

      {h.categoryConfirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-label="区分の削除確認">
          <div className="bg-white rounded-xl shadow-2xl w-80 p-6"><h3 className="font-bold text-lg text-rose-600 mb-2">区分の削除</h3><p className="text-sm text-slate-600 mb-6">「{h.categoryConfirmDelete}」内のタスクもすべて削除されます。</p><div className="flex space-x-3"><button onClick={() => h.setCategoryConfirmDelete(null)} className="flex-1 py-2 bg-slate-100 rounded-lg text-xs font-bold">キャンセル</button><button onClick={h.confirmDeleteCategory} className="flex-1 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-md">削除</button></div></div>
        </div>
      )}

      {h.showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="設定">
          <div className="bg-white rounded-xl shadow-2xl w-96 overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 font-bold text-sm">設定<button onClick={() => h.setShowSettings(false)}><X size={18}/></button></div>
            <div className="p-4 space-y-6 overflow-y-auto max-h-[80vh]">
              <div className="space-y-3"><label className="text-xs font-bold text-slate-500 uppercase">固定列（左側）</label><div className="flex flex-wrap gap-2">{h.leftCols.map((c, i) => (<div key={i} className="flex items-center bg-slate-100 rounded px-2 py-1 text-xs font-bold text-slate-600"><span>{c}</span><button onClick={() => h.setLeftCols(h.leftCols.filter((_, idx) => idx !== i))} className="ml-2 text-slate-400 hover:text-rose-500"><X size={12}/></button></div>))}<button onClick={h.addLeftCol} className="text-indigo-600 p-1 border border-indigo-200 rounded hover:bg-indigo-50"><Plus size={12}/></button></div></div>
              <div className="space-y-3"><label className="text-xs font-bold text-slate-500 uppercase">固定列（右側）</label><div className="flex flex-wrap gap-2">{h.rightCols.map((c, i) => (<div key={i} className="flex items-center bg-slate-100 rounded px-2 py-1 text-xs font-bold text-slate-600"><span>{c}</span><button onClick={() => h.setRightCols(h.rightCols.filter((_, idx) => idx !== i))} className="ml-2 text-slate-400 hover:text-rose-500"><X size={12}/></button></div>))}<button onClick={h.addRightCol} className="text-indigo-600 p-1 border border-indigo-200 rounded hover:bg-indigo-50"><Plus size={12}/></button></div></div>
              <div className="space-y-3 pt-4 border-t"><label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={h.useJapaneseHolidays} onChange={(e) => h.setUseJapaneseHolidays(e.target.checked)} className="rounded text-indigo-600" /><span className="text-sm font-medium">日本の祝日を考慮する</span></label><div className="flex justify-between text-xs font-bold text-slate-500"><span>1マスの幅</span><span>{h.unitWidth}px</span></div><input type="range" min="30" max="250" value={h.unitWidth} onChange={(e) => h.setUnitWidth(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end"><button onClick={() => h.setShowSettings(false)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md">閉じる</button></div>
          </div>
        </div>
      )}
      <style>{`
        @media print { header, button, .sidebar, input[type="range"] { display: none !important; } body { background: white; } .scrollbar-thin { overflow: visible !important; } main { height: auto !important; overflow: visible !important; } }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; } .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
