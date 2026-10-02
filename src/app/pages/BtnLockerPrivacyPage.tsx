import { ArrowLeft, Mail } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

const BASE = import.meta.env.BASE_URL;

const LAST_UPDATED_JA = '2026年10月3日';
const LAST_UPDATED_EN = 'October 3, 2026';
const CONTACT_MAIL = 'mailto:tr120710@gmail.com';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h3 className="mb-3 border-l-4 border-[#c96a00] pl-3 text-xl font-bold text-[#c96a00]">
        {title}
      </h3>
      <div className="space-y-3 text-slate-700">{children}</div>
    </section>
  );
}

function ContactButton({ label }: { label: string }) {
  return (
    <a
      href={CONTACT_MAIL}
      className="inline-flex items-center gap-2 rounded-lg bg-[#c96a00] px-5 py-2.5 font-medium text-white transition-colors hover:bg-[#a85a00]"
    >
      <Mail className="size-4" />
      {label}
    </a>
  );
}

export function BtnLockerPrivacyPage() {
  usePageTitle('btn-locker プライバシーポリシー / Privacy Policy');

  return (
    <div className="min-h-screen bg-[#fff6e8] text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-black/10 bg-[#fff6e8]/90 backdrop-blur-md">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Link
            to="/projects/btn-locker"
            className="rounded-lg p-2 text-[#c96a00] transition-colors hover:bg-black/5"
            aria-label="btn-locker 紹介ページに戻る"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex items-center gap-2">
            <img
              src={`${BASE}btn-locker/icon_128.png`}
              alt="btn-locker アイコン"
              className="size-8 rounded-lg shadow-sm"
            />
            <h1 className="font-bold text-[#c96a00]">
              btn-locker プライバシーポリシー / Privacy Policy
            </h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-12">
        <article
          lang="ja"
          className="container mx-auto mb-10 max-w-3xl rounded-2xl bg-white p-6 shadow-md md:p-10"
        >
          <h2 className="mb-2 text-2xl font-bold text-[#c96a00]">
            プライバシーポリシー（日本語）
          </h2>
          <p className="mb-2 text-sm text-slate-500">
            最終更新日: {LAST_UPDATED_JA}
          </p>
          <p className="mb-8 leading-relaxed text-slate-700">
            本プライバシーポリシーは、Chrome
            拡張機能「btn-locker」（ボタンロッカー。以下「本拡張機能」）における利用者データの取り扱いについて定めるものです。
          </p>

          <Section title="1. 利用する権限と用途">
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>storage</strong>:
                ロックしたボタンの情報（サイトのオリジンごとの CSS
                セレクタ）を、ブラウザの chrome.storage.local
                に保存するために使用します。
              </li>
              <li>
                <strong>activeTab</strong>:
                ツールバーのボタンまたはショートカットキーの操作時に、現在のタブでロックモードを開始するために使用します。
              </li>
              <li>
                <strong>
                  コンテンツスクリプト（全サイト: &lt;all_urls&gt;）
                </strong>
                :
                保存済みのロックを各ページに再適用し、ロックモードを提供するために全サイトで実行されます。ページの内容を収集・送信することはありません。
              </li>
            </ul>
          </Section>

          <Section title="2. 外部への送信">
            <p>
              本拡張機能は、外部サーバーとの通信を一切行いません。アナリティクス、広告、トラッキングも含まれていません。
            </p>
          </Section>

          <Section title="3. 端末内に保存する情報と第三者への提供">
            <p>
              本拡張機能が保存する情報は、利用者がボタンをロックしたサイトのオリジン（例:
              https://example.com）と、ロックしたボタンを特定するための CSS
              セレクタ（ページの要素構造に由来するタグ名・id・class
              名）のみです。これらは利用者の端末のブラウザ内にのみ保存され、ロック機能の提供以外の目的には使用しません。
            </p>
            <p className="mt-3">
              ページの本文や入力内容、ロックしたサイト以外の閲覧履歴、個人情報は保存・収集しません。また、利用者のデータを開発者を含む第三者に送信・提供・販売することはありません。
            </p>
          </Section>

          <Section title="4. データの保持と削除">
            <ul className="list-disc space-y-2 pl-6">
              <li>
                ロック情報は、利用者の端末のブラウザ内にのみ保存されます。
              </li>
              <li>
                ポップアップの一覧または確認モーダルからロックを解除すると、該当する情報が削除されます。
              </li>
              <li>
                本拡張機能をアンインストールすると、保存されたすべてのデータが削除されます。
              </li>
            </ul>
          </Section>

          <Section title="5. Chrome ウェブストアのユーザーデータポリシーへの準拠">
            <p>
              本拡張機能による利用者データの利用は、Limited Use
              （限定的な使用）の要件を含む、Chrome
              ウェブストアのユーザーデータポリシーに準拠します。
            </p>
          </Section>

          <Section title="6. 本ポリシーの変更">
            <p>
              本ポリシーは、機能追加や法令の変更に応じて改定される場合があります。重要な変更がある場合は、本ページの更新をもって通知とします。
            </p>
          </Section>

          <Section title="7. お問い合わせ">
            <p>
              本ポリシーに関するご質問は、下記のメールアドレスまでご連絡ください。
            </p>
            <ContactButton label="メールで問い合わせる" />
          </Section>
        </article>

        <article
          lang="en"
          className="container mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-md md:p-10"
        >
          <h2 className="mb-2 text-2xl font-bold text-[#c96a00]">
            Privacy Policy (English)
          </h2>
          <p className="mb-2 text-sm text-slate-500">
            Last updated: {LAST_UPDATED_EN}
          </p>
          <p className="mb-8 leading-relaxed text-slate-700">
            This Privacy Policy describes how the Chrome extension
            &quot;btn-locker&quot; (the &quot;Extension&quot;) handles user
            data.
          </p>

          <Section title="1. Permissions and Their Purposes">
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>storage</strong>: Used to save information about the
                buttons you lock (CSS selectors, stored per site origin) in
                chrome.storage.local in your browser.
              </li>
              <li>
                <strong>activeTab</strong>: Used to start lock mode on the
                current tab when you click the toolbar button or use the
                keyboard shortcut.
              </li>
              <li>
                <strong>Content scripts on all sites (&lt;all_urls&gt;)</strong>
                : Run on all sites in order to re-apply your saved locks to each
                page and to provide lock mode. The Extension does not collect or
                transmit page content.
              </li>
            </ul>
          </Section>

          <Section title="2. External Transmission">
            <p>
              The Extension does not communicate with any external server. It
              contains no analytics, advertising, or tracking.
            </p>
          </Section>

          <Section title="3. Data Stored on Your Device and Third Parties">
            <p>
              The only data the Extension stores is the origin of each site
              where you lock a button (for example, https://example.com) and a
              CSS selector that identifies each locked button (tag names, ids
              and class names derived from the page&apos;s element structure).
              This data is stored only inside the browser on your device and is
              used solely to provide the locking feature.
            </p>
            <p className="mt-3">
              The Extension does not store or collect page text, form input,
              browsing history beyond the sites where you lock buttons, or
              personal information. It never transmits, shares or sells user
              data to anyone, including the developer.
            </p>
          </Section>

          <Section title="4. Data Retention and Deletion">
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Lock data is stored only inside the browser on your device.
              </li>
              <li>
                Unlocking a button from the popup list or from the confirmation
                modal deletes the corresponding data.
              </li>
              <li>Uninstalling the Extension deletes all stored data.</li>
            </ul>
          </Section>

          <Section title="5. Compliance with Chrome Web Store User Data Policy">
            <p>
              The use of user data by the Extension complies with the Chrome Web
              Store User Data Policy, including the Limited Use requirements.
            </p>
          </Section>

          <Section title="6. Changes to This Policy">
            <p>
              This policy may be updated when features are added or laws change.
              Any significant change will be announced by updating this page.
            </p>
          </Section>

          <Section title="7. Contact">
            <p>
              If you have any questions about this policy, please contact us at
              the email address below.
            </p>
            <ContactButton label="Contact by email" />
          </Section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-[#c96a00] px-4 py-8">
        <div className="container mx-auto max-w-5xl text-center text-white/90">
          <nav className="mb-4 flex justify-center gap-6 text-sm">
            <Link to="/projects/btn-locker" className="hover:underline">
              btn-locker について
            </Link>
            <Link to="/projects" className="hover:underline">
              プロジェクト一覧
            </Link>
          </nav>
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()} Ryoichiro Teshima. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
