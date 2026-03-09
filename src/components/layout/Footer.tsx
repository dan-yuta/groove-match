import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border-light bg-surface/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
                B
              </div>
              <span className="font-bold gradient-text">BandMatch</span>
            </div>
            <p className="text-sm text-text-muted">初心者バンドマンのための コミュニティアプリ</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">サービス</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link href="/matching" className="hover:text-foreground transition-colors">マッチング</Link></li>
              <li><Link href="/events" className="hover:text-foreground transition-colors">イベント</Link></li>
              <li><Link href="/community" className="hover:text-foreground transition-colors">コミュニティ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">プラン</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link href="/subscription" className="hover:text-foreground transition-colors">料金プラン</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">サポート</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><span className="cursor-default">利用規約</span></li>
              <li><span className="cursor-default">プライバシーポリシー</span></li>
              <li><span className="cursor-default">お問い合わせ</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border-light text-center text-xs text-text-muted">
          &copy; 2026 BandMatch. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
