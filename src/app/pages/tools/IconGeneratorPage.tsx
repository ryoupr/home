import React, { useState } from 'react';
import {
  Download,
  RotateCcw,
  Type,
  Smile,
  Palette,
  Box,
  // --- Enhanced Icon Set ---
  Activity, Airplay, AlertCircle, AlertTriangle, AlignCenter, AlignJustify, AlignLeft, AlignRight,
  Anchor, Aperture, Archive, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, AtSign, Award,
  Banknote, BarChart, BarChart2, Battery, BatteryCharging, Beer, Bell, Bike, Bitcoin, Bluetooth, Bold,
  Book, BookOpen, Bookmark, Briefcase, Bug, Building,
  Calculator, Calendar, CalendarCheck, Camera, Car, Cast, Cat, Check, CheckCircle, CheckSquare,
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Chrome, Circle, Clipboard, Clock, Cloud,
  CloudLightning, CloudRain, CloudSnow, Code, Coffee, Command, Compass, Copy, Cpu, CreditCard, Crop, Crown,
  Database, Diamond, Disc, Dog, DollarSign, DownloadCloud, Droplet,
  Edit, Eye, EyeOff,
  Facebook, Factory, FastForward, Feather, File, FileAudio, FileImage, FileText, FileVideo, Film, Filter, Flag, Flame, FlaskConical, Folder, Frown,
  Gamepad, Ghost, Gift, GitBranch, GitCommit, Github, GitMerge, GitPullRequest, Globe, Grid,
  Hammer, Hand, HardDrive, Hash, Headphones, Heart, HelpCircle, Hexagon, Home, Image as ImageIcon, Inbox, Info, Instagram, Italic,
  Key,
  Laptop, Layers, Layout, Leaf, LifeBuoy, Lightbulb, Link, Link2, Linkedin, List, Loader, Lock, LogOut,
  Mail, Map, MapPin, Maximize, Megaphone, Menu, MessageCircle, MessageSquare, Mic, Minimize, Monitor, Moon, MoreHorizontal, MoreVertical, Mouse, Move, Music,
  Navigation,
  Octagon,
  Package, Paperclip, Pause, PauseCircle, PenTool, Pencil, Percent, Phone, PieChart, Pin, Pizza, Plane, Play, PlayCircle, Plus, PlusCircle, Pocket, Power, Printer,
  Radio, RefreshCw, Repeat, Rewind, Rocket,
  Save, Scissors, Search, Send, Server, Settings, Share, Share2, Shield, Ship, Shirt, ShoppingBag, ShoppingCart, Shuffle, Sidebar, Siren, Skull, Slack, Slash, Sliders, Smartphone, Smile as SmileIcon, Snowflake, Sparkles, Speaker, Square, Star, Stethoscope, StopCircle, Sun, Sword,
  Tablet, Tag, Target, Tent, Terminal, Thermometer, ThumbsDown, ThumbsUp, Ticket, Timer, ToggleLeft, ToggleRight, Train, Trash, Trash2, TrendingDown, TrendingUp, Triangle, Trophy, Truck, Tv, Twitch, Twitter,
  Umbrella, Underline, Unlock, Upload, User, UserCheck, UserMinus, UserPlus, Users, Utensils,
  Video, VideoOff, Voicemail, Volume, Volume1, Volume2, VolumeX,
  Wallet, Wand, Watch, Wifi, WifiOff, Wind, Wine, Wrench,
  X, XCircle,
  Youtube,
  Zap, ZapOff, ZoomIn, ZoomOut
} from 'lucide-react';

// アイコンマップ
const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>> = {
  Activity, Airplay, AlertCircle, AlertTriangle, AlignCenter, AlignJustify, AlignLeft, AlignRight,
  Anchor, Aperture, Archive, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, AtSign, Award,
  Banknote, BarChart, BarChart2, Battery, BatteryCharging, Beer, Bell, Bike, Bitcoin, Bluetooth, Bold,
  Book, BookOpen, Bookmark, Box, Briefcase, Bug, Building,
  Calculator, Calendar, CalendarCheck, Camera, Car, Cast, Cat, Check, CheckCircle, CheckSquare,
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Chrome, Circle, Clipboard, Clock, Cloud,
  CloudLightning, CloudRain, CloudSnow, Code, Coffee, Command, Compass, Copy, Cpu, CreditCard, Crop, Crown,
  Database, Diamond, Disc, Dog, DollarSign, DownloadCloud, Droplet,
  Edit, Eye, EyeOff,
  Facebook, Factory, FastForward, Feather, File, FileAudio, FileImage, FileText, FileVideo, Film, Filter, Flag, Flame, FlaskConical, Folder, Frown,
  Gamepad, Ghost, Gift, GitBranch, GitCommit, Github, GitMerge, GitPullRequest, Globe, Grid,
  Hammer, Hand, HardDrive, Hash, Headphones, Heart, HelpCircle, Hexagon, Home, ImageIcon, Inbox, Info, Instagram, Italic,
  Key,
  Laptop, Layers, Layout, Leaf, LifeBuoy, Lightbulb, Link, Link2, Linkedin, List, Loader, Lock, LogOut,
  Mail, Map, MapPin, Maximize, Megaphone, Menu, MessageCircle, MessageSquare, Mic, Minimize, Monitor, Moon, MoreHorizontal, MoreVertical, Mouse, Move, Music,
  Navigation,
  Octagon,
  Package, Palette, Paperclip, Pause, PauseCircle, PenTool, Pencil, Percent, Phone, PieChart, Pin, Pizza, Plane, Play, PlayCircle, Plus, PlusCircle, Pocket, Power, Printer,
  Radio, RefreshCw, Repeat, Rewind, Rocket,
  Save, Scissors, Search, Send, Server, Settings, Share, Share2, Shield, Ship, Shirt, ShoppingBag, ShoppingCart, Shuffle, Sidebar, Siren, Skull, Slack, Slash, Sliders, Smartphone, SmileIcon, Snowflake, Sparkles, Speaker, Square, Star, Stethoscope, StopCircle, Sun, Sword,
  Tablet, Tag, Target, Tent, Terminal, Thermometer, ThumbsDown, ThumbsUp, Ticket, Timer, ToggleLeft, ToggleRight, Train, Trash, Trash2, TrendingDown, TrendingUp, Triangle, Trophy, Truck, Tv, Twitch, Twitter,
  Umbrella, Underline, Unlock, Upload, User, UserCheck, UserMinus, UserPlus, Users, Utensils,
  Video, VideoOff, Voicemail, Volume, Volume1, Volume2, VolumeX,
  Wallet, Wand, Watch, Wifi, WifiOff, Wind, Wine, Wrench,
  X, XCircle,
  Youtube,
  Zap, ZapOff, ZoomIn, ZoomOut
};


const GRADIENTS = [
  { name: 'Solid', value: 'none' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  { name: 'Purple', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { name: 'Midnight', value: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
  { name: 'Cherry', value: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)' },
  { name: 'Nature', value: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
  { name: 'Slick', value: 'linear-gradient(135deg, #434343 0%, black 100%)' },
];

interface IconConfig {
  type: 'icon' | 'text';
  text: string;
  iconKey: string;
  bgColor: string;
  fgColor: string;
  gradient: string;
  size: number;
  radius: number;
  rotation: number;
  offsetY: number;
  shadow: boolean;
}

const defaultConfig: IconConfig = {
  type: 'icon',
  text: 'A',
  iconKey: 'Rocket',
  bgColor: '#3b82f6',
  fgColor: '#ffffff',
  gradient: 'none',
  size: 60,
  radius: 20,
  rotation: 0,
  offsetY: 0,
  shadow: false,
};

export default function IconGeneratorPage() {
  const [config, setConfig] = useState<IconConfig>(defaultConfig);

  const handleDownload = async () => {
    const canvas = document.createElement('canvas');
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 背景の描画
    ctx.save();
    const r = (config.radius / 100) * size;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();

    // 背景塗りつぶし
    if (config.gradient !== 'none') {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      if (config.gradient.includes('Sunset')) { grad.addColorStop(0, '#f6d365'); grad.addColorStop(1, '#fda085'); }
      else if (config.gradient.includes('Ocean')) { grad.addColorStop(0, '#84fab0'); grad.addColorStop(1, '#8fd3f4'); }
      else if (config.gradient.includes('Purple')) { grad.addColorStop(0, '#a18cd1'); grad.addColorStop(1, '#fbc2eb'); }
      else if (config.gradient.includes('Midnight')) { grad.addColorStop(0, '#30cfd0'); grad.addColorStop(1, '#330867'); }
      else if (config.gradient.includes('Cherry')) { grad.addColorStop(0, '#eb3349'); grad.addColorStop(1, '#f45c43'); }
      else if (config.gradient.includes('Nature')) { grad.addColorStop(0, '#d4fc79'); grad.addColorStop(1, '#96e6a1'); }
      else if (config.gradient.includes('Slick')) { grad.addColorStop(0, '#434343'); grad.addColorStop(1, '#000000'); }
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = config.bgColor;
    }
    ctx.fill();
    ctx.restore();

    // アイコン/テキストの描画
    const previewElement = document.getElementById('preview-icon-container');
    if (!previewElement) return;

    const svgNode = previewElement.querySelector('svg');
    if (config.type === 'icon' && svgNode) {
      const svgData = new XMLSerializer().serializeToString(svgNode);
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.save();
        ctx.translate(size / 2, size / 2 + (config.offsetY * size / 200));
        ctx.rotate((config.rotation * Math.PI) / 180);
        if (config.shadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = size * 0.05;
          ctx.shadowOffsetY = size * 0.02;
        }
        const s = (config.size / 100) * size;
        ctx.drawImage(img, -s / 2, -s / 2, s, s);
        ctx.restore();
        triggerDownload(canvas);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } else if (config.type === 'text') {
      ctx.save();
      ctx.translate(size / 2, size / 2 + (config.offsetY * size / 200));
      ctx.rotate((config.rotation * Math.PI) / 180);
      if (config.shadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = size * 0.05;
        ctx.shadowOffsetY = size * 0.02;
      }
      const contentSize = (config.size / 100) * size;
      ctx.fillStyle = config.fgColor;
      ctx.font = `bold ${contentSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.text, 0, contentSize * 0.05);
      ctx.restore();
      triggerDownload(canvas);
    }
  };

  const triggerDownload = (canvas: HTMLCanvasElement) => {
    const link = document.createElement('a');
    link.download = 'icon.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const SelectedIcon = iconMap[config.iconKey] || iconMap.Zap;


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <Box size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight">
              IconMaker<span className="text-blue-600">.</span>
            </h1>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full font-medium transition-all shadow-sm active:scale-95"
          >
            <Download size={18} />
            <span>Download PNG</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Controls */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto max-h-[calc(100vh-6rem)] pb-20 custom-scrollbar">
          {/* Content Type Selector */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Type size={14} /> Content
            </h3>
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl mb-4">
              <button
                onClick={() => setConfig({ ...config, type: 'icon' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${config.type === 'icon' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Smile size={16} /> Icon
              </button>
              <button
                onClick={() => setConfig({ ...config, type: 'text' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${config.type === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Type size={16} /> Text
              </button>
            </div>

            {config.type === 'text' ? (
              <input
                type="text"
                value={config.text}
                onChange={(e) => setConfig({ ...config, text: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg text-center font-bold"
                placeholder="Type here..."
                maxLength={4}
              />
            ) : (
              <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto p-1">
                {Object.keys(iconMap).map((key) => {
                  const IconComponent = iconMap[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setConfig({ ...config, iconKey: key })}
                      className={`p-2 rounded-lg flex items-center justify-center transition-all ${config.iconKey === key ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500 ring-offset-1' : 'hover:bg-slate-100 text-slate-500'}`}
                      title={key}
                    >
                      <IconComponent size={20} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Style Controls */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Palette size={14} /> Style
            </h3>

            {/* Background Color */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-slate-500 mb-2 block">Background</label>
              <div className="flex gap-3 mb-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                  <input
                    type="color"
                    value={config.bgColor}
                    onChange={(e) => setConfig({ ...config, bgColor: e.target.value, gradient: 'none' })}
                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                  />
                </div>
                <div className="flex-1 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {GRADIENTS.map((g) => (
                    <button
                      key={g.name}
                      onClick={() => setConfig({ ...config, gradient: g.value })}
                      className={`w-10 h-10 rounded-full flex-shrink-0 border-2 transition-all ${config.gradient === g.value ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ background: g.value === 'none' ? config.bgColor : g.value }}
                      title={g.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Foreground Color */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-slate-500 mb-2 block">Icon / Text Color</label>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                  <input
                    type="color"
                    value={config.fgColor}
                    onChange={(e) => setConfig({ ...config, fgColor: e.target.value })}
                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={config.fgColor}
                  onChange={(e) => setConfig({ ...config, fgColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg uppercase"
                />
              </div>
            </div>

            {/* Adjustments */}
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-500">Size</label>
                  <span className="text-xs text-slate-400">{config.size}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  value={config.size}
                  onChange={(e) => setConfig({ ...config, size: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-500">Corner Radius</label>
                  <span className="text-xs text-slate-400">{config.radius}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={config.radius}
                  onChange={(e) => setConfig({ ...config, radius: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-500">Rotation</label>
                  <span className="text-xs text-slate-400">{config.rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={config.rotation}
                  onChange={(e) => setConfig({ ...config, rotation: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-500">Vertical Offset</label>
                  <span className="text-xs text-slate-400">{config.offsetY}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={config.offsetY}
                  onChange={(e) => setConfig({ ...config, offsetY: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-sm font-medium text-slate-700">Drop Shadow</label>
                <button
                  onClick={() => setConfig({ ...config, shadow: !config.shadow })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${config.shadow ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${config.shadow ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center bg-slate-100 rounded-2xl border border-slate-200 min-h-[500px] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />

          <div className="relative z-10 flex flex-col items-center gap-8">
            <div className="text-slate-400 text-sm font-medium uppercase tracking-widest">Preview</div>

            {/* The Icon Canvas */}
            <div
              className="relative shadow-2xl transition-all duration-300 ease-out"
              style={{
                width: '320px',
                height: '320px',
                borderRadius: `${config.radius}%`,
                background: config.gradient === 'none' ? config.bgColor : config.gradient,
              }}
            >
              <div
                id="preview-icon-container"
                className="w-full h-full flex items-center justify-center transition-all duration-300"
                style={{
                  color: config.fgColor,
                  transform: `rotate(${config.rotation}deg) translateY(${config.offsetY}px)`,
                  filter: config.shadow ? 'drop-shadow(0px 10px 10px rgba(0,0,0,0.3))' : 'none'
                }}
              >
                {config.type === 'text' ? (
                  <span
                    className="preview-text font-bold select-none"
                    style={{ fontSize: `${320 * (config.size / 100)}px`, lineHeight: 1 }}
                  >
                    {config.text}
                  </span>
                ) : (
                  <SelectedIcon
                    size={320 * (config.size / 100)}
                    strokeWidth={1.5}
                    style={{ color: config.fgColor }}
                  />
                )}
              </div>
            </div>

            <div className="text-slate-400 text-xs">Output: 1024 x 1024 PNG</div>
          </div>

          <div className="absolute bottom-6 right-6 flex gap-2">
            <button
              onClick={() => setConfig(defaultConfig)}
              className="p-2 bg-white text-slate-500 rounded-full shadow-sm hover:text-red-500 transition-colors"
              title="Reset"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
