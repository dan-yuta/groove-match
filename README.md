# Groove Match

初心者コピバン向けコミュニティアプリ。
好きなバンドの曲をコピーしたい仲間を見つけて、コピバンを結成し、コピバンライブに出るまでをサポートする**コピバンメンバーマッチング**＆**ライブ出演促進**プラットフォームです。
やりたい曲・好きなアーティストでマッチングし、同じ曲をやりたい仲間とすぐに繋がれます。

| リンク | URL |
|--------|-----|
| デモアプリ | https://groove-match.netlify.app/ |
| ドキュメント | https://dan-yuta.github.io/groove-match/ |

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| アニメーション | Framer Motion |
| データ管理 | localStorage（モック） |
| 決済 | Stripe / App Store / Google Play（モックUI） |
| モバイル | Capacitor (iOS / Android) |

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# モバイルビルド（iOS）
npm run mobile:ios

# モバイルビルド（Android）
npm run mobile:android
```

http://localhost:3000 でアクセスできます。

## モバイルアプリ

Capacitor を使用して iOS / Android ネイティブアプリとしてもビルドできます。

### 前提条件
- iOS: macOS + Xcode 15+
- Android: Android Studio + JDK 17+

### ビルド手順
```bash
# 初回セットアップ
npm install
npx cap add ios      # iOS プロジェクト追加
npx cap add android  # Android プロジェクト追加

# ビルド＆起動
npm run mobile:ios     # iOS シミュレータで起動
npm run mobile:android # Android エミュレータで起動
```

## テストアカウント

| 役割 | メール | パスワード |
|------|--------|-----------|
| 管理者 | admin@groovematch.jp | admin1234 |
| 一般ユーザー | tanaka@example.com | pass1234 |

## 主な機能

> **ゴール = コピバンを組んでライブに出ること。** 練習トラッカーやフレンド機能は、そのゴールに到達するまでの挫折を防ぐサポート機能です。

### メイン機能（仲間探し → コピバン結成 → ライブ出演）
- **コピバンマッチング** - やりたい曲・アーティスト・地域・楽器・スケジュールを基にしたスコアリング
- **コピバン管理・セットリスト** - セットリスト管理・楽器スロット制でメンバー募集・管理
- **ライブイベントボード** - イベント一覧・コピバン登録・初心者歓迎フィルター

### サポート機能（挫折防止）
- **練習トラッカー・ゲーミフィケーション** - Duolingo型の継続支援。曲ごとの練習時間記録・ストリーク・週間目標・バッジ
- **フレンド＆ランキング** - フレンド間の練習状況共有・週間ランキング・応援機能
- **コミュニティ** - タイムライン・練習ログ・マイルストーン
- **SNS連携** - X / Instagram / LINE / YouTube アカウント連携・プロフィール表示

### その他
- **サブスクリプション** - Free（¥0） / Pro（¥500/月、初回Proトライアル。招待コードで1ヶ月に延長）
- **管理ダッシュボード** - ユーザー管理・売上・サブスク統計

## プロジェクト構成

```
src/
├── app/           # ページ（App Router）
│   ├── (auth)/    # ログイン・登録
│   ├── (main)/    # メイン機能（要認証）
│   └── (admin)/   # 管理画面（要管理者権限）
├── components/
│   ├── ui/        # 汎用UIコンポーネント
│   └── layout/    # レイアウトコンポーネント
├── lib/           # ユーティリティ・型定義・認証
└── data/          # モックデータ
```

## ドキュメント

`docs/` フォルダに詳細ドキュメントがあります。
`docs/md/00-00_ドキュメント一覧.md` を参照してください。

## ライセンス

Private
