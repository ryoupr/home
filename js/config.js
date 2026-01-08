/**
 * Site configuration for portfolio website
 * Contains developer information, theme settings, and animation preferences
 */

const config = {
  // Developer information
  developer: {
    name: 'あなたの名前',
    role: 'フルスタック開発者 | Chrome拡張機能クリエイター',
    bio: 'Web開発とChrome拡張機能の作成に情熱を注いでいます。ユーザーの生産性を向上させ、日常のタスクを簡単にするツールを開発しています。モダンな技術スタックを使用して、使いやすく美しいアプリケーションを作ることを目指しています。',
    avatar: 'images/hero/avatar.jpg',
    email: 'your.email@example.com',
    social: {
      github: 'https://github.com/yourusername',
      twitter: 'https://twitter.com/yourusername',
      linkedin: 'https://linkedin.com/in/yourusername'
    }
  },

  // Theme configuration (colors defined in tailwind.config.js)
  theme: {
    colors: {
      primary: '#2563eb',    // blue-600 - Primary brand color
      secondary: '#1e40af',  // blue-800 - Secondary brand color
      accent: '#3b82f6'      // blue-500 - Accent color for highlights
    }
  },

  // Animation settings
  animation: {
    scrollDuration: 800,  // Duration for smooth scroll in milliseconds
    fadeInDuration: 600   // Duration for fade-in animations in milliseconds
  },

  // Site metadata
  meta: {
    title: 'ポートフォリオ | あなたの名前',
    description: 'Chrome拡張機能とWebツールを開発するフルスタック開発者のポートフォリオサイト',
    keywords: 'Chrome拡張機能, Web開発, JavaScript, フルスタック開発者, ポートフォリオ'
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { config };
}
