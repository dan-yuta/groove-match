# Phase 2: Design Workflow

CCAGI SDK Phase 2 設計ワークフロー定義

## 概要

Phase 2は機能設計とデザインシステム構築を行うフェーズです。
Phase 1の要件定義（特に`design-requirements.md`）をベースに、実装可能な設計書を作成します。

## 入出力

### 入力（Phase 1から）

```
docs/requirements/
├── requirements.md           # 機能要件
├── non-functional.md         # 非機能要件
└── design-requirements.md    # デザイン要件 ★
```

### 出力

```
docs/design/
├── spec.md                   # 機能仕様書
├── design-system.yml         # デザインシステム ★
├── ui-guidelines.md          # UI設計方針 ★
├── component-library.md      # コンポーネントライブラリ設定 ★
├── responsive-guidelines.md  # レスポンシブガイドライン ★
├── component-specs/          # コンポーネント詳細仕様 ★
│   ├── button.md
│   ├── card.md
│   └── ...
├── visual-concepts/          # ビジュアルコンセプト（オプション）
└── architecture/             # アーキテクチャ図
```

## コマンド一覧

| コマンド | 必須 | 説明 | 入力 | 出力 |
|---------|------|------|------|------|
| `/spec-create` | ✅ | 機能仕様書作成 | requirements.md | spec.md |
| `/design-system` | ✅ | デザインシステム生成 | design-requirements.md | design-system.yml |
| `/frontend-design` | ✅ | UI設計方針策定 | design-system.yml | ui-guidelines.md |
| `/canvas-design` | ⚪ | ビジュアルアート作成 | design-system.yml | visual-concepts/ |
| `/generate-test-design` | ✅ | テスト設計書作成 | spec.md | test-design/ |

## 実行順序

```
Phase 1完了（design-requirements.md存在）
    │
    ├─ /spec-create ─────────────────────┐
    │   └─ spec.md                       │
    │                                    │ 並行実行可能
    ├─ /design-system ───────────────────┤
    │   ├─ design-system.yml             │
    │   ├─ component-library.md          │
    │   └─ responsive-guidelines.md      │
    │                                    │
    └────────────────────────────────────┘
                    │
                    ↓
    ┌─ /frontend-design ─────────────────┐
    │   ├─ ui-guidelines.md              │
    │   └─ component-specs/              │
    │                                    │ 順次実行
    ├─ /canvas-design（オプション）───────┤
    │   └─ visual-concepts/              │
    │                                    │
    └─ /generate-test-design ────────────┘
        └─ test-design/
                    │
                    ↓
              Phase 3へ
```

## design-system.yml 構造

```yaml
version: "1.0.0"
generated_at: "2026-01-18T12:00:00Z"
source: "docs/requirements/design-requirements.md"

aesthetic:
  direction: luxury-refined       # トーン
  mood: professional              # ムード
  differentiation: "洗練されたミニマリズムと高級感の融合"

colors:
  primary: "#1a1a1a"
  secondary: "#f5f5f5"
  accent: "#d97757"
  accent_secondary: "#6a9bcc"
  accent_tertiary: "#788c5d"
  muted: "#b0aea5"
  subtle: "#e8e6dc"
  background:
    light: "#faf9f5"
    dark: "#141413"
  text:
    primary: "#141413"
    secondary: "#b0aea5"

typography:
  heading:
    family: "Poppins"
    fallback: "Arial, sans-serif"
    weights: [600, 700]
    sizes:
      h1: "2.5rem"
      h2: "2rem"
      h3: "1.5rem"
      h4: "1.25rem"
  body:
    family: "Lora"
    fallback: "Georgia, serif"
    weights: [400, 500]
    sizes:
      regular: "1rem"
      large: "1.125rem"
      small: "0.875rem"

spacing:
  unit: "8px"
  scale:
    xs: "4px"
    sm: "8px"
    md: "16px"
    lg: "24px"
    xl: "32px"
    2xl: "48px"
    3xl: "64px"

borders:
  radius:
    none: "0"
    sm: "4px"
    md: "8px"
    lg: "12px"
    xl: "16px"
    full: "9999px"
  width:
    thin: "1px"
    medium: "2px"
    thick: "4px"

shadows:
  sm: "0 1px 2px rgba(0, 0, 0, 0.05)"
  md: "0 4px 6px rgba(0, 0, 0, 0.1)"
  lg: "0 10px 15px rgba(0, 0, 0, 0.1)"
  xl: "0 20px 25px rgba(0, 0, 0, 0.1)"

components:
  library: "shadcn/ui"
  styling: "tailwind"
  animation: "motion/react"
  icons: "lucide-react"

responsive:
  mobile_first: true
  breakpoints:
    sm: "640px"
    md: "768px"
    lg: "1024px"
    xl: "1280px"
    2xl: "1536px"

quality:
  lighthouse:
    performance: 90
    accessibility: 100
    best_practices: 100
    seo: 100
  wcag_level: "AA"
  dark_mode: true
```

## ui-guidelines.md 構造

```markdown
# UI Guidelines

## Aesthetic Direction

**Tone**: luxury-refined
**Mood**: professional

## Differentiation

洗練されたミニマリズムと高級感の融合。
余白を恐れず、各要素に呼吸の空間を与える。

## Typography Guidelines

### Principles
- 特徴的で個性的なフォント選択
- **禁止**: Inter, Roboto, Arial

### Application
| 要素 | フォント | サイズ |
|------|---------|--------|
| Hero Title | Poppins 700 | 3.5rem |
| Body | Lora 400 | 1rem |

## Color Guidelines

### Principles
- 支配的な色と鋭いアクセント
- **禁止**: 紫グラデーション on 白背景

## Motion Guidelines

### Principles
- 200ms以下のインタラクション
- Compositor props のみ（transform, opacity）
- **禁止**: レイアウトプロパティのアニメーション

## Anti-Patterns (NEVER)

- Inter, Roboto, Arial
- 紫グラデーション
- 予測可能なレイアウト
- 過剰なドロップシャドウ
```

## スキル使用

### frontend-design-suite

| モード | コマンド | 用途 |
|--------|---------|------|
| aesthetic | `/frontend-design` | 美的分析 |
| brand | `/design-system` | ブランドガイドライン |
| canvas | `/canvas-design` | ビジュアルアート |

### 使用エージェント

| Agent | キャラクター | 役割 |
|-------|-------------|------|
| CodeGenAgent | 源 (Gen) | 設計書生成 |
| UXReviewAgent | UX | UXレビュー |

## Design Thinking Framework

### 1. Purpose（目的）
- このインターフェースが解決する問題は何か？
- 誰が使うのか？

### 2. Tone（トーン）
- **BOLD**な美的方向性を選択
- 中間を避け、明確な方向性を持つ

### 3. Constraints（制約）
- 技術要件（フレームワーク、パフォーマンス）
- アクセシビリティ要件

### 4. Differentiation（差別化）
- 何がこのデザインを**忘れられないもの**にするか？
- 一つのことを覚えてもらうなら何か？

## Anti-Patterns（禁止事項）

以下はPhase 2で**絶対に使用しない**:

| カテゴリ | 禁止パターン | 理由 |
|---------|------------|------|
| フォント | Inter, Roboto, Arial | AI slop |
| カラー | 紫グラデーション on 白背景 | AI slop |
| レイアウト | 予測可能なパターン | 差別化不足 |
| エフェクト | 過剰なドロップシャドウ | AI slop |
| エフェクト | グロー効果 | AI slop |

## 品質基準

| 項目 | 基準 |
|------|------|
| design-system.yml | YAML検証PASS |
| ui-guidelines.md | 全セクション記載 |
| component-specs/ | 必須コンポーネント定義 |
| 禁止パターン | 0件 |

## 検証

```bash
# YAML検証
cat docs/design/design-system.yml | yq .

# 必須ファイル確認
ls docs/design/
# design-system.yml
# ui-guidelines.md
# component-library.md
# responsive-guidelines.md

# 禁止パターン検索
grep -r "Inter\|Roboto\|Arial" docs/design/
# 0件であること
```

## 次のステップ

Phase 2完了後:

- Phase 3: `/create-ssot-issue` - SSOT Issue作成
- Phase 3: `/ux-review` - UXレビュー

## 関連ワークフロー

- [phase-overview.md](./phase-overview.md) - 全Phase概要
- [phase-5.5-mock-detection.md](./phase-5.5-mock-detection.md) - Phase 5.5品質ゲート

---

*CCAGI SDK - Phase 2: Design Workflow*
