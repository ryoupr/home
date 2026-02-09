import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine as RechartReferenceLine, ReferenceArea as RechartReferenceArea, LabelList } from 'recharts';
import { Upload, FileText, BarChart2, TrendingUp, Activity, Trash2, Settings, Table as TableIcon, Download, Plus, X, ScanLine, Palette, Type } from 'lucide-react';
import { useCsvGraphViewer } from './csvGraph/useCsvGraphViewer';

export function CsvGraphViewerPage() {
  const h = useCsvGraphViewer();

  const renderReferenceLines = () => h.referenceLines.map(line => (
    <RechartReferenceLine key={line.id} y={line.value} label={{ position: 'right', value: line.label, fill: line.color, fontSize: 12, fontWeight: 'bold' }} stroke={line.color} strokeDasharray="3 3" strokeWidth={2} />
  ));
  const renderReferenceAreas = () => h.referenceAreas.map(area => (
    <RechartReferenceArea key={area.id} y1={area.y1} y2={area.y2} label={{ position: 'insideTopRight', value: area.label, fill: '#92400e', fontSize: 12, fontWeight: 'bold' }} fill={area.color} fillOpacity={0.2} strokeOpacity={0} />
  ));

  const renderChart = () => {
    const common = { data: h.chartData, margin: { top: 10, right: 30, left: 0, bottom: 0 } };
    const axisProps = { stroke: h.textColor, fontSize: 12, tickLine: false, axisLine: false };
    const tooltipStyle = { contentStyle: { backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#1e293b' }, formatter: (value: number) => value.toLocaleString() };

    if (h.chartType === 'bar') return (
      <BarChart {...common}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={h.textColor} strokeOpacity={0.2} />
        <XAxis dataKey={h.xAxisKey} {...axisProps} /><YAxis {...axisProps} tickFormatter={(v) => v.toLocaleString()} />
        <Tooltip {...tooltipStyle} /><Legend wrapperStyle={{ color: h.textColor }} />
        {h.dataKeys.map((key, i) => (<Bar key={key} dataKey={key} fill={h.currentColors[i % h.currentColors.length]} radius={[4, 4, 0, 0]}>{h.showDataLabels && <LabelList dataKey={key} position="top" fill={h.textColor} fontSize={10} />}</Bar>))}
        {renderReferenceAreas()}{renderReferenceLines()}
      </BarChart>
    );
    if (h.chartType === 'line') return (
      <LineChart {...common}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={h.textColor} strokeOpacity={0.2} />
        <XAxis dataKey={h.xAxisKey} {...axisProps} /><YAxis {...axisProps} tickFormatter={(v) => v.toLocaleString()} />
        <Tooltip {...tooltipStyle} /><Legend wrapperStyle={{ color: h.textColor }} />
        {h.dataKeys.map((key, i) => (<Line key={key} type="monotone" dataKey={key} stroke={h.currentColors[i % h.currentColors.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}>{h.showDataLabels && <LabelList dataKey={key} position="top" fill={h.textColor} fontSize={10} offset={10} />}</Line>))}
        {renderReferenceAreas()}{renderReferenceLines()}
      </LineChart>
    );
    return (
      <AreaChart {...common}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={h.textColor} strokeOpacity={0.2} />
        <XAxis dataKey={h.xAxisKey} {...axisProps} /><YAxis {...axisProps} tickFormatter={(v) => v.toLocaleString()} />
        <Tooltip {...tooltipStyle} /><Legend wrapperStyle={{ color: h.textColor }} />
        {h.dataKeys.map((key, i) => (<Area key={key} type="monotone" dataKey={key} fill={h.currentColors[i % h.currentColors.length]} stroke={h.currentColors[i % h.currentColors.length]} fillOpacity={0.2}>{h.showDataLabels && <LabelList dataKey={key} position="top" fill={h.textColor} fontSize={10} />}</Area>))}
        {renderReferenceAreas()}{renderReferenceLines()}
      </AreaChart>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/tools" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">← ツール一覧</Link>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-lg"><BarChart2 className="w-6 h-6 text-white" /></div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CSV Graph Viewer</h1>
            </div>
          </div>
          {h.fileName && (
            <button onClick={h.resetAll} className="text-sm text-slate-500 hover:text-red-500 flex items-center gap-2 transition-colors">
              <Trash2 className="w-4 h-4" />リセット
            </button>
          )}
        </header>

        {!h.rawData.length && (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center bg-white hover:bg-slate-50 hover:border-indigo-400 transition-all cursor-pointer group shadow-sm" onDragOver={(e) => e.preventDefault()} onDrop={h.handleDrop}>
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><Upload className="w-8 h-8 text-indigo-500" /></div>
              <div className="space-y-1"><p className="text-lg font-medium text-slate-700">CSVファイルをドラッグ＆ドロップ</p><p className="text-sm text-slate-400">または</p></div>
              <label className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer font-medium shadow-md hover:shadow-lg">
                ファイルを選択<input type="file" accept=".csv" className="hidden" onChange={h.handleFileUpload} />
              </label>
            </div>
          </div>
        )}

        {h.rawData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-6">
              {/* グラフ設定 */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Settings className="w-3.5 h-3.5" /> グラフ設定</h3>
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">グラフの種類</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      {([{ id: 'bar' as const, icon: BarChart2, label: '棒' }, { id: 'line' as const, icon: TrendingUp, label: '線' }, { id: 'area' as const, icon: Activity, label: '面' }]).map(type => (
                        <button key={type.id} onClick={() => h.setChartType(type.id)} className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-sm rounded-md transition-all ${h.chartType === type.id ? 'bg-white text-indigo-600 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'}`}>
                          <type.icon className="w-3.5 h-3.5" />{type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">X軸 (カテゴリ)</label>
                    <select value={h.xAxisKey} onChange={(e) => h.setXAxisKey(e.target.value)} className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                      {h.headers.map(hdr => <option key={hdr} value={hdr}>{hdr}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-2 block">Y軸 (データ列)</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                      {h.headers.map(hdr => (
                        <label key={hdr} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                          <input type="checkbox" checked={h.dataKeys.includes(hdr)} onChange={() => h.toggleDataKey(hdr)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300" />
                          <span className="text-sm text-slate-700 truncate">{hdr}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* デザイン設定 */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Palette className="w-3.5 h-3.5" /> デザイン設定</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">カラーテーマ</label>
                    <select value={h.colorTheme} onChange={(e) => h.setColorTheme(e.target.value)} className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg mb-2">
                      <option value="default">デフォルト (インディゴ)</option><option value="cool">寒色系 (ブルー・シアン)</option><option value="warm">暖色系 (レッド・オレンジ)</option><option value="pastel">パステル</option><option value="monochrome">モノクロ</option><option value="custom">カスタムカラー</option>
                    </select>
                    {h.colorTheme === 'custom' && (
                      <div className="flex items-center gap-2"><input type="color" value={h.customPrimaryColor} onChange={(e) => h.setCustomPrimaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" /><span className="text-xs text-slate-600">メインカラーを選択</span></div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">背景色</label>
                    <div className="flex items-center gap-2"><input type="color" value={h.bgColor} onChange={(e) => h.setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0 shadow-sm" /><span className="text-xs text-slate-600">背景を変更</span></div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                      <div className={`w-9 h-5 rounded-full relative transition-colors ${h.showDataLabels ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                        <input type="checkbox" checked={h.showDataLabels} onChange={() => h.setShowDataLabels(!h.showDataLabels)} className="hidden" />
                        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${h.showDataLabels ? 'left-5' : 'left-0.5'}`} />
                      </div>
                      <span className="text-xs text-slate-600 flex items-center gap-1"><Type className="w-3 h-3" /> データラベルを表示</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 目標ライン */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">目標ライン追加</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="値" value={h.newLineValue} onChange={(e) => h.setNewLineValue(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded-lg" />
                    <input type="text" placeholder="ラベル" value={h.newLineLabel} onChange={(e) => h.setNewLineLabel(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded-lg" />
                  </div>
                  <button onClick={h.addReferenceLine} disabled={!h.newLineValue} className="w-full py-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-100 flex items-center justify-center gap-1 disabled:opacity-50"><Plus className="w-3 h-3" /> 追加</button>
                  {h.referenceLines.map(line => (
                    <div key={line.id} className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded border border-slate-100 text-xs">
                      <span className="text-slate-600 truncate max-w-[120px]">{line.label}: {line.value}</span>
                      <button onClick={() => h.removeReferenceLine(line.id)} className="text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* エリア(帯) */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><ScanLine className="w-3 h-3" /> エリア(帯)追加</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="開始" value={h.newAreaStart} onChange={(e) => h.setNewAreaStart(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded-lg" />
                    <input type="number" placeholder="終了" value={h.newAreaEnd} onChange={(e) => h.setNewAreaEnd(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded-lg" />
                  </div>
                  <input type="text" placeholder="ラベル (任意)" value={h.newAreaLabel} onChange={(e) => h.setNewAreaLabel(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded-lg" />
                  <button onClick={h.addReferenceArea} disabled={h.newAreaStart === '' || h.newAreaEnd === ''} className="w-full py-1.5 bg-amber-50 text-amber-600 text-xs font-medium rounded-lg hover:bg-amber-100 flex items-center justify-center gap-1 disabled:opacity-50"><Plus className="w-3 h-3" /> 追加</button>
                  {h.referenceAreas.map(area => (
                    <div key={area.id} className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded border border-slate-100 text-xs">
                      <span className="text-slate-600 truncate max-w-[120px]">{area.label}: {area.y1}-{area.y2}</span>
                      <button onClick={() => h.removeReferenceArea(area.id)} className="text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => h.setShowTable(!h.showTable)} className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 shadow-sm border border-slate-100 text-sm"><TableIcon className="w-4 h-4" /> {h.showTable ? 'グラフに戻る' : 'データ編集'}</button>
                <button onClick={h.downloadGraphImage} className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 shadow-sm border border-slate-100 text-sm"><Download className="w-4 h-4" /> 画像を保存</button>
              </div>
            </div>

            {/* メインエリア */}
            <div className="lg:col-span-3">
              <div className="p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[500px] flex flex-col transition-colors" style={{ backgroundColor: h.bgColor }}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: h.textColor }}>
                    <FileText className="w-5 h-5" style={{ color: h.currentColors[0] }} />{h.fileName}
                  </h2>
                  <div className="text-xs px-3 py-1 rounded-full opacity-80" style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: h.textColor }}>{h.chartData.length} 行のデータ</div>
                </div>
                <div className="flex-1 w-full min-h-[400px]" ref={h.graphRef}>
                  {h.showTable ? (
                    <div className="overflow-x-auto bg-white rounded-lg p-4">
                      <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                          <tr><th className="px-4 py-3 w-10">表示</th>{h.headers.map((hdr, i) => <th key={i} className="px-4 py-3 font-semibold whitespace-nowrap">{hdr}</th>)}</tr>
                        </thead>
                        <tbody>
                          {h.rawData.map((row, i) => (
                            <tr key={i} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${h.excludedRows.has(row._id) ? 'bg-slate-50 opacity-50' : ''}`}>
                              <td className="px-4 py-3 text-center"><input type="checkbox" checked={!h.excludedRows.has(row._id)} onChange={() => h.toggleRowExclusion(row._id)} className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer" /></td>
                              {h.headers.map((hdr, j) => <td key={j} className="px-4 py-3 whitespace-nowrap font-mono text-xs">{row[hdr]}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%" minHeight={400}>
                      {renderChart()}
                    </ResponsiveContainer>
                  )}
                </div>
                {!h.showTable && h.dataKeys.length === 0 && (
                  <div className="text-center text-slate-400 mt-4 text-sm">← 左側のメニューから表示したいデータ（Y軸）を選択してください</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
