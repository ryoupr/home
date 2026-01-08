/**
 * Projects data for portfolio website
 * Each project contains information about Chrome extensions and tools
 */

const projects = [
  {
    id: 'project-1',
    title: 'タスク管理Chrome拡張機能',
    description: 'ブラウザ上で簡単にタスクを管理できるChrome拡張機能。シンプルなUIで生産性を向上させます。',
    image: 'images/projects/project1.jpg',
    tags: ['JavaScript', 'Chrome API', 'HTML/CSS'],
    links: {
      github: 'https://github.com/username/task-manager-extension',
      demo: 'https://chrome.google.com/webstore/detail/task-manager',
      website: null
    }
  },
  {
    id: 'project-2',
    title: 'スクリーンショットツール',
    description: 'Webページの任意の領域をキャプチャできるツール。注釈機能とクラウド保存に対応しています。',
    image: 'images/projects/project2.jpg',
    tags: ['JavaScript', 'Chrome API', 'Canvas API'],
    links: {
      github: 'https://github.com/username/screenshot-tool',
      demo: 'https://chrome.google.com/webstore/detail/screenshot-tool',
      website: null
    }
  },
  {
    id: 'project-3',
    title: 'パスワードジェネレーター',
    description: '安全で強力なパスワードを生成するChrome拡張機能。カスタマイズ可能な設定で様々なニーズに対応。',
    image: 'images/projects/project3.jpg',
    tags: ['JavaScript', 'Web Crypto API', 'React'],
    links: {
      github: 'https://github.com/username/password-generator',
      demo: 'https://chrome.google.com/webstore/detail/password-generator',
      website: 'https://password-gen-demo.com'
    }
  },
  {
    id: 'project-4',
    title: 'ダークモード切り替えツール',
    description: 'あらゆるWebサイトにダークモードを適用できる拡張機能。目の疲れを軽減し、夜間の閲覧を快適にします。',
    image: 'images/projects/project4.jpg',
    tags: ['JavaScript', 'CSS', 'Chrome Storage API'],
    links: {
      github: 'https://github.com/username/dark-mode-extension',
      demo: 'https://chrome.google.com/webstore/detail/dark-mode',
      website: null
    }
  },
  {
    id: 'project-5',
    title: 'タブマネージャー',
    description: '大量のタブを効率的に管理するツール。グループ化、検索、保存機能で作業効率を大幅に向上させます。',
    image: 'images/projects/project5.jpg',
    tags: ['JavaScript', 'Chrome Tabs API', 'IndexedDB'],
    links: {
      github: 'https://github.com/username/tab-manager',
      demo: 'https://chrome.google.com/webstore/detail/tab-manager',
      website: null
    }
  },
  {
    id: 'project-6',
    title: 'Webページ翻訳ツール',
    description: 'リアルタイムでWebページを翻訳する拡張機能。複数の言語に対応し、学習や調査をサポートします。',
    image: 'images/projects/project6.jpg',
    tags: ['JavaScript', 'Translation API', 'Vue.js'],
    links: {
      github: 'https://github.com/username/web-translator',
      demo: 'https://chrome.google.com/webstore/detail/web-translator',
      website: 'https://web-translator-demo.com'
    }
  }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { projects };
}
