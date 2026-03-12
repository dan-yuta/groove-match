# Phase 5.5: Quality Gate Workflow

CCAGI SDK Phase 5.5 品質ゲートワークフロー定義

## 概要

Phase 5テスト完了後、デプロイ前の品質ゲートとしてモック検出とUI品質レビューを行うフェーズです。
AIが生成したコードに残置されるモック・テストデータ・仮実装を検出し、UI品質をdesign-requirements.mdの基準と照合します。

## 品質ゲートコマンド

| コマンド | 用途 | 検証内容 |
|---------|------|----------|
| `/mock-detector` | モック検出 | ハードコード、ダミーデータ、TODO |
| `/ui-skills` | UI品質レビュー | アクセシビリティ、アニメーション、レイアウト |

両方のコマンドをPASSすることでPhase 6以降へ進めます。

## DAGフロー位置づけ

```
Phase 5: テスト (/test --mode all)
    ↓
Phase 5.5: 品質ゲート ★本フェーズ
    ├── /mock-detector（モック検出）
    └── /ui-skills（UI品質レビュー）
    ↓
Phase 6: ドキュメント (/generate-docs)
    ↓
Phase 7: デプロイ (/deploy-dev, /deploy-prod)
```

## 統合コマンド

```bash
/mock-detector [--mode <mode>] [--policy <policy>] [options]
```

### モード一覧 (--mode)

| モード | 説明 | 出力 |
|--------|------|------|
| `scan` | スキャンのみ（デフォルト） | レポート出力 |
| `plan` | 置換計画立案 | 修正計画YAML |
| `issue` | Issue自動起票 | GitHub Issue |
| `all` | 全実行 | レポート+計画+Issue |

### ゲートポリシー (--policy)

| ポリシー | 用途 | fail条件 |
|---------|------|----------|
| `lenient` | dev環境 | Critical のみ |
| `standard` | staging/PR | Critical + High |
| `strict` | prod環境 | すべて検出でfail |

### 使用例

```bash
# 基本スキャン
/mock-detector

# 置換計画立案
/mock-detector --mode plan

# Issue自動起票
/mock-detector --create-issues

# 本番環境用（strictポリシー）
/mock-detector --policy strict

# CI/CD用（検出時エラー終了）
/mock-detector --strict

# 特定ディレクトリのみ
/mock-detector --path src/api
```

## エージェントフロー

| Phase | Agent | キャラクター | 役割 |
|-------|-------|-------------|------|
| C1 | CoordinatorAgent | 統 (Subaru) | タスク分解・全体統括・ポリシー決定 |
| C2 | CodeGenAgent | 源 (Gen) | コードベースストラクチャ作成 |
| C3 | ReviewAgent | 剣持謙二 (Kenji) | ファイル解析・モック検出・品質判定 |
| C4 | IssueAgent | 析 (Seki) | 検出結果分類・Issue起票 |
| C5 | QAAgent | - | ゲート判定・再スキャン判定 |

## 実行フロー

```
Human Request: /mock-detector
    │
Phase C1: CoordinatorAgent (統)
    ├── タスク分解
    ├── エージェント割り当て
    └── ゲートポリシー決定
    │
Phase C2: CodeGenAgent (源) - コードベースストラクチャ作成
    ├── find/tree でファイルリスト作成
    ├── .ai/codebase-structure.txt 出力
    └── .ai/dir-tree.txt 出力
    │
Phase C3: ReviewAgent (謙二) - ファイル解析・モック検出
    ├── 各ファイルの目的解析
    ├── mock_status判定 (clean/mock_detected)
    ├── レイヤー別集計 (presentation/business/data)
    ├── .ai/codebase-analysis.yml 出力
    └── .ai/codebase-overview.yml 出力
    │
Phase C4: IssueAgent (析) - 分類・Issue起票
    ├── 検出パターンマッチング
    ├── Severity判定 (critical/high/medium/low)
    ├── .ai/mock-detection-report.yml 出力
    └── Issue自動起票 (--create-issues時)
    │
Phase C5: QAAgent - ゲート判定
    ├── ゲートポリシー適用
    ├── PASS/FAIL判定
    └── 最終レポート生成
    │
    ├── PASS → 次フェーズへ (Phase 6 or Phase 7)
    └── FAIL → 修正必要（Issue起票済み）
```

## 検出対象

### 1. モックデータ

```javascript
const mockPatterns = [
  /mock[A-Z]/,           // mockData, mockUser
  /dummy[A-Z]/,          // dummyData, dummyUser
  /fake[A-Z]/,           // fakeData, fakeResponse
  /test[A-Z].*Data/,     // testData, testUserData
  /sample[A-Z]/,         // sampleData, sampleUser
  /placeholder/i,        // placeholder
  /lorem\s*ipsum/i,      // lorem ipsum
];
```

### 2. ハードコード値

```javascript
const hardcodePatterns = [
  /['"]test@/,           // test@example.com
  /['"]admin123/,        // 仮パスワード
  /localhost:\d+/,       // ローカルホスト
  /127\.0\.0\.1/,        // ローカルIP
  /['"]xxx/,             // プレースホルダー
  /TODO.*implement/i,    // TODO: implement
  /FIXME/,               // FIXME
];
```

### 2.1 CC-Auth URL モック検出（Phase 1設定との整合性）

本番コードにハードコードされたCC-Auth URLを検出します。
Phase 1で`.ccagi.yml`に設定したドメインと一致するか検証します。

```javascript
const ccAuthMockPatterns = [
  // ハードコードされたCallback URL（環境変数を使うべき）
  /CallbackURL.*=.*['"]http:\/\/localhost/,
  /redirect_uri.*=.*['"]http:\/\/localhost/,
  /REDIRECT_URI.*=.*['"]http:\/\/localhost/,

  // ハードコードされたCognito設定（.ccagi.ymlから読むべき）
  /userPoolId.*=.*['"]ap-northeast-1_[a-zA-Z0-9]+['"]/,
  /clientId.*=.*['"][a-z0-9]{26}['"]/,

  // テスト用のCC-Auth URL（本番で残っている）
  /cc-auth-dev\.aidreams-factory\.com/,  // 本番コードにdev環境URL
  /cc-auth\.aidreams-factory\.com/,      // 開発コードに本番URL

  // Mock認証トークン
  /mock.*[Tt]oken/,
  /fake.*[Tt]oken/,
  /test.*[Jj]wt/,
];
```

### CC-Auth URL整合性チェック

```bash
#!/bin/bash
# CC-Auth URL整合性チェック

echo "📋 CC-Auth URL整合性チェック..."

# .ccagi.ymlの設定を取得
DEV_SUBDOMAIN=$(grep "dev_subdomain:" .ccagi.yml | head -1 | awk -F: '{gsub(/^[ \t]+|[ \t]+$|"/, "", $2); print $2}')
PROD_SUBDOMAIN=$(grep "prod_subdomain:" .ccagi.yml | head -1 | awk -F: '{gsub(/^[ \t]+|[ \t]+$|"/, "", $2); print $2}')

# ソースコード内のURL検出
echo "📋 ソースコード内のCC-Auth URL参照..."

# 本番コードにlocalhost URLがハードコードされている
LOCALHOST_IN_SRC=$(grep -rE "http://localhost:[0-9]+" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir="__tests__" \
  src/ 2>/dev/null | grep -v ".test." | grep -v ".spec." | wc -l | tr -d ' ')

if [ "$LOCALHOST_IN_SRC" -gt 0 ]; then
  echo "⚠️ High: localhost URLがソースコードにハードコードされています (${LOCALHOST_IN_SRC}件)"
  echo "   → 環境変数 NEXT_PUBLIC_REDIRECT_URI を使用してください"
fi

# 環境変数を使わずにCognito IDがハードコードされている
HARDCODED_COGNITO=$(grep -rE "(userPoolId|clientId).*=.*['\"]ap-northeast-1_" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules \
  src/ 2>/dev/null | grep -v "process.env" | wc -l | tr -d ' ')

if [ "$HARDCODED_COGNITO" -gt 0 ]; then
  echo "⚠️ High: Cognito IDがハードコードされています (${HARDCODED_COGNITO}件)"
  echo "   → .ccagi.yml のcc_auth設定から読み込んでください"
fi

echo "✅ CC-Auth URL整合性チェック完了"
```

### 3. 仮実装

```javascript
const stubPatterns = [
  /throw new Error\(['"]Not implemented/,
  /console\.log\(['"]DEBUG/,
  /\/\/ TODO:/,
  /\/\/ FIXME:/,
  /\/\/ HACK:/,
  /return \[\];?\s*\/\/ TODO/,
  /return null;?\s*\/\/ TODO/,
];
```

## Severity判定基準

| Severity | 検出パターン | 例 | 対応緊急度 |
|----------|------------|-----|----------|
| Critical | ハードコード認証情報 | `password: 'test123'` | 即時修正 |
| Critical | 本番APIキー露出 | `sk-ant-xxx` | 即時修正 |
| High | モックデータ変数 | `mockUsers`, `dummyData` | デプロイ前修正 |
| High | localhost参照 | `localhost:3000` | デプロイ前修正 |
| Medium | デバッグコード | `console.log('DEBUG')` | 推奨修正 |
| Medium | TODO/FIXME | `// TODO: implement` | 推奨修正 |
| Low | プレースホルダー | `Lorem ipsum` | 任意修正 |

## ログ出力構造

```
.ai/
├── codebase-structure.txt     # C2: ファイルリスト
├── dir-tree.txt               # C2: ディレクトリツリー
├── codebase-analysis.yml      # C3: ファイル別解析結果
├── codebase-overview.yml      # C3: 構造化サマリー
├── mock-detection-report.yml  # C4: 検出レポート
└── mock-detection-summary.md  # C5: 最終サマリー

.mock-logs/
├── {timestamp}/
│   ├── scan-results.json      # 検出結果JSON
│   ├── issues-created.json    # 起票Issue一覧
│   └── summary.md             # 実行サマリー
└── latest -> {timestamp}/     # 最新へのシンボリックリンク
```

## ゲートポリシー定義

```yaml
gate_policies:
  strict:  # prod環境用
    fail_on:
      critical: true
      high: true
      medium: true
    mock_detected: true

  standard:  # staging環境用
    fail_on:
      critical: true
      high: true
      medium: false
    mock_detected: false  # 警告のみ

  lenient:  # dev環境用
    fail_on:
      critical: true
      high: false
      medium: false
    mock_detected: false  # 警告のみ
```

## 自動実行トリガー

| トリガー | 実行タイミング | ポリシー |
|---------|---------------|---------|
| `/test --mode all` | 全テストPASS後 | standard |
| `/review-execute` | レビュー完了後 | standard |
| `/deploy-dev` | θ₀プリフライトチェック | standard |
| `/deploy-prod` | θ₀プリフライトチェック | strict |

## 依存スキル

| スキル | 用途 |
|--------|------|
| mock-detector | 単体実行 |
| quality-gateway-engine | mode: mockで統合実行 |
| issue-analysis | Issue分類・ラベル付与 |
| debugging-troubleshooting | エラー修正支援 |

## 品質基準

| 項目 | 基準 |
|------|------|
| Criticalモック | 0件 |
| Highモック（strictモード） | 0件 |
| 検出精度 | 95%以上（False Positive率5%以下） |
| Issue起票成功率 | 100% |

## CI/CD統合

```yaml
# .github/workflows/mock-check.yml
name: Mock Detection

on: [pull_request]

jobs:
  mock-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Mock Detector
        run: |
          npx ccagi-sdk mock-detector --strict
```

## 次のステップ

品質ゲート完了後:

- **PASS（両方）**: Phase 6 `/generate-docs` またはPhase 7 `/deploy-dev`
- **FAIL（いずれか）**: 検出Issueの修正 → 再スキャン

---

## UI品質レビュー (/ui-skills)

Phase 1の `design-requirements.md` の品質基準と実装を照合し、UI品質レポートを生成します。

### 検証カテゴリ

| カテゴリ | 検証内容 | 主要ルール |
|---------|---------|-----------|
| Tech Stack | 技術スタック要件 | Tailwind, motion/react, cn utility |
| Accessibility | アクセシビリティ | aria-label, プリミティブ使用 |
| Animation | アニメーション | 200ms制限, compositor props |
| Typography | タイポグラフィ | text-balance, tabular-nums |
| Layout | レイアウト | h-dvh, グラデーション禁止 |
| Performance | パフォーマンス | blur制限, will-change |

### 使用例

```bash
# 基本実行（design-requirements.mdと照合）
/ui-skills

# 特定カテゴリのみ
/ui-skills --category accessibility

# 自動修正
/ui-skills --auto-fix
```

### 出力レポート

```
docs/quality/ui-review-report.md
```

### 詳細

- [/ui-skills](../../commands/ui-skills.md) - UI品質レビューコマンド
- [ui-quality-checklist.md](../../skills/frontend-design-suite/references/ui-quality-checklist.md) - チェックリスト

---

## 関連コマンド

- [/mock-detector](../../commands/mock-detector.md) - モック検出コマンド
- [/ui-skills](../../commands/ui-skills.md) - UI品質レビューコマンド
- [/review-execute](../../commands/review-execute.md) - コードレビュー実行
- [/deploy-dev](../../commands/deploy-dev.md) - 開発環境デプロイ
- [/deploy-prod](../../commands/deploy-prod.md) - 本番環境デプロイ

## 関連ワークフロー

- [phase-overview.md](./phase-overview.md) - 全Phase概要
- [phase-2-design.md](./phase-2-design.md) - Phase 2設計

---

CCAGI SDK v7.2.0 - Phase 5.5: Quality Gate Workflow
