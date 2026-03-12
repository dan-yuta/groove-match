# CCAGI SDK Phase Overview

全Phaseの統合ワークフロー定義

## Phase構造

```
Phase 1:   要件定義 ★デザイン要件セクション含む
Phase 2:   設計（機能設計 + デザインシステム）
Phase 3:   計画 + UXレビュー
Phase 4:   実装（デザイン実装含む）
Phase 5:   テスト
Phase 5.5: 品質ゲート（モック検出 + UI品質レビュー）
Phase 6:   ドキュメント
Phase 7:   デプロイ
Phase 8:   Platform連携
```

## Phase別コマンド一覧

| Phase | 名称 | コマンド | 出力 |
|-------|------|----------|------|
| 1 | 要件定義 | `/generate-requirements` | requirements.md, **design-requirements.md** |
| 2 | 設計 | `/spec-create`, `/design-system`, `/frontend-design`, `/generate-test-design` | spec.md, **design-system.yml**, ui-guidelines.md |
| 3 | 計画 | `/create-ssot-issue`, `/ux-review` | SSOT Issue |
| 4 | 実装 | `/implement-app`, `/ui-styling`, `/responsive-design` | src/ |
| 5 | テスト | `/test --mode <mode>` | test-results/ |
| 5.5 | 品質ゲート | `/mock-detector`, `/ui-skills` | quality-report.md |
| 6 | ドキュメント | `/generate-docs` | docs/ |
| 7 | デプロイ | `/deploy-dev`, `/deploy-prod`, `/aws-fast-deploy` | - |
| 8 | Platform連携 | `/setup-platform-auth`, `/setup-platform-billing`, `/cc-auth-integration` | - |

## ドキュメントファーストフロー

```
Phase 1: 要件定義
    │
    ├─ docs/requirements/requirements.md
    ├─ docs/requirements/non-functional.md
    └─ docs/requirements/design-requirements.md ★ デザインの精度を上げる
           │
           ↓
Phase 2: 設計
    │
    ├─ docs/design/spec.md（機能仕様）
    ├─ docs/design/design-system.yml ★ design-requirements.mdベース
    ├─ docs/design/ui-guidelines.md
    ├─ docs/design/component-library.md
    └─ docs/design/responsive-guidelines.md
           │
           ↓
Phase 3: 計画
    │
    └─ SSOT Issue（全ドキュメントを参照）
           │
           ↓
Phase 4: 実装
    │
    └─ src/（ドキュメントベースで実装）
           │
           ↓
Phase 5: テスト
    │
    └─ テスト結果
           │
           ↓
Phase 5.5: 品質ゲート
    │
    └─ 要件定義の品質基準と照合
           │
           ↓
Phase 6-8: ドキュメント → デプロイ → Platform連携
```

## Phase 1: 要件定義

### 入出力

```
入力: URL / ドキュメント / 自然言語
    ↓
/generate-requirements
    ↓
出力:
├── docs/requirements/requirements.md（機能要件）
├── docs/requirements/non-functional.md（非機能要件）
└── docs/requirements/design-requirements.md ★新規
```

### design-requirements.md の内容

- 美的方向性（トーン、ムード、参照サイト）
- ブランドガイドライン（カラー、タイポグラフィ）
- UIコンポーネント方針（ライブラリ、スタイリング）
- レスポンシブ方針（ブレークポイント、モバイルファースト）
- 品質基準（Lighthouse、WCAG）

### ⚠️ 必須設定

| 設定項目 | 説明 |
|---------|------|
| dev_subdomain | 開発環境: `{project}-dev.aidreams-factory.com` |
| prod_subdomain | 本番環境: `{project}.aidreams-factory.com` |
| localhost URLs | ローカル開発用CC-Auth URL |

## Phase 2: 設計

### 入出力

```
入力: docs/requirements/*
    ↓
/spec-create（機能設計）
/design-system（デザインシステム生成）
/frontend-design（UI設計方針）
/canvas-design（ビジュアルアート - オプション）
/generate-test-design（テスト設計）
    ↓
出力:
├── docs/design/spec.md
├── docs/design/design-system.yml ★
├── docs/design/ui-guidelines.md ★
├── docs/design/component-library.md ★
├── docs/design/responsive-guidelines.md ★
├── docs/design/component-specs/ ★
└── docs/test-design/
```

### 関連ワークフロー

- [phase-2-design.md](./phase-2-design.md) - Phase 2詳細ワークフロー

## Phase 3: 計画 + UXレビュー

### 入出力

```
入力: docs/requirements/*, docs/design/*
    ↓
/create-ssot-issue
/ux-review
    ↓
出力:
├── SSOT Issue（GitHub）
└── docs/UX-REVIEW/
```

## Phase 4: 実装

### 入出力

```
入力: docs/requirements/*, docs/design/*, SSOT Issue
    ↓
/implement-app
/ui-styling（design-system.ymlベース）
/responsive-design（design-requirements.mdベース）
    ↓
出力: src/
```

### デザイン実装コマンド

| コマンド | 入力ドキュメント | 出力 |
|---------|-----------------|------|
| `/ui-styling` | design-system.yml, ui-guidelines.md | tailwind.config.ts, components/ui/ |
| `/responsive-design` | design-requirements.md, responsive-guidelines.md | レスポンシブ対応コンポーネント |

## Phase 5: テスト

### 入出力

```
入力: src/, docs/test-design/
    ↓
/test --mode <mode> --env <env>
    ↓
出力: .test-logs/
```

### テストモード

| モード | 説明 | Docker |
|--------|------|--------|
| `unit` | ユニットテスト | No |
| `integration` | 結合テスト | Yes |
| `e2e` | E2Eテスト | Yes |
| `flow` | フローテスト | Yes |
| `billing` | 課金テスト | Yes |
| `all` | 全テスト | Yes |

## Phase 5.5: 品質ゲート

### 入出力

```
入力: src/, docs/requirements/design-requirements.md
    ↓
/mock-detector（モック検出）
/ui-skills（UI品質レビュー）
    ↓
出力: docs/quality/
```

### ゲートポリシー

| ポリシー | 用途 | fail条件 |
|---------|------|----------|
| lenient | dev環境 | Criticalのみ |
| standard | staging/PR | Critical + High |
| strict | prod環境 | すべて検出 |

### UI品質カテゴリ

| カテゴリ | 検証内容 |
|---------|---------|
| Tech Stack | Tailwind, motion/react, cn utility |
| Accessibility | aria-label, プリミティブ |
| Animation | 200ms制限, compositor props |
| Typography | text-balance, tabular-nums |
| Layout | h-dvh, z-index, グラデーション禁止 |
| Performance | blur制限, will-change |

## Phase 6: ドキュメント

### 入出力

```
入力: src/, docs/*
    ↓
/generate-docs
    ↓
出力: docs/（更新）
```

## Phase 7: デプロイ

### 入出力

```
入力: src/, .ccagi.yml
    ↓
/deploy-dev（開発環境）
/deploy-prod（本番環境）
/aws-fast-deploy（高速デプロイ）
    ↓
出力: AWS環境
```

### デプロイ先

| 環境 | ドメイン | CodePipeline |
|------|---------|--------------|
| dev | `{project}-dev.aidreams-factory.com` | 自動 |
| prod | `{project}.aidreams-factory.com` | 承認付き |

## Phase 8: Platform連携

### 入出力

```
入力: .ccagi.yml
    ↓
/setup-platform-auth（認証設定）
/setup-platform-billing（課金設定）
/cc-auth-integration（統合）
    ↓
出力: CC-Auth連携完了
```

## スキル一覧

### デザイン関連スキル

| スキル | Phase | 用途 |
|--------|-------|------|
| frontend-design-suite | 2, 4, 5.5 | デザイン統合スキル |
| human-centered-design-suite | 3 | UX分析 |
| design-reviewer | 3 | デザインレビュー |

### frontend-design-suite モード

| モード | Phase | 説明 |
|--------|-------|------|
| aesthetic | 2 | 美的分析 |
| brand | 2 | ブランドガイドライン |
| canvas | 2 | ビジュアルアート |
| styling | 4 | shadcn/ui + Tailwind |
| responsive | 4 | レスポンシブ |
| quality | 5.5 | UI品質レビュー |
| full | - | 全モード統合 |

## 品質基準

### Lighthouse

| 項目 | 目標値 |
|------|--------|
| Performance | 90+ |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

### Core Web Vitals

| 項目 | 目標値 |
|------|--------|
| FCP | < 1.8s |
| LCP | < 2.5s |
| CLS | < 0.1 |

### アクセシビリティ

| 項目 | 基準 |
|------|------|
| WCAG準拠レベル | AA |
| コントラスト比 | 4.5:1以上 |
| タッチターゲット | 44px以上 |

## 次のステップ

各Phaseの詳細ワークフロー:

- [phase-2-design.md](./phase-2-design.md) - Phase 2: 設計
- [phase-5-testing.md](./phase-5-testing.md) - Phase 5: テスト
- [phase-5.5-mock-detection.md](./phase-5.5-mock-detection.md) - Phase 5.5: 品質ゲート

---

*CCAGI SDK - Phase Overview*
