# Phase 5: Testing Workflow

CCAGI SDK Phase 5 テストワークフロー定義

## 概要

Phase 5はアプリケーションの品質を保証するテストフェーズです。
統合 `/test` コマンドで全テストモードと全環境をサポートします。

## 統合テストコマンド

```bash
/test [--mode <mode>] [--env <environment>] [options]
```

### テストモード (--mode)

| モード | 説明 | Docker使用 | 対象 |
|--------|------|-----------|------|
| `unit` | ユニットテスト | No | Vitest単体テスト |
| `integration` | 結合テスト | Yes | API/DB連携テスト |
| `e2e` | E2Eテスト | Yes | Playwrightブラウザテスト |
| `flow` | フローテスト | Yes | ユーザージャーニーシナリオ |
| `billing` | 課金テスト | Yes | CC-Auth課金フローテスト |
| `all` | 全テスト | Yes | 上記すべて順次実行 |

### 実行環境 (--env)

| 環境 | BASE_URL | 用途 |
|------|----------|------|
| `local` | `http://localhost:3000` | ローカルDocker環境 |
| `dev` | AWS SSMから取得 | AWS開発環境テスト |
| `prod` | AWS SSMから取得 | AWS本番環境テスト |

### 使用例

```bash
# ユニットテスト（デフォルト）
/test

# AWS開発環境でE2Eテスト
/test --mode e2e --env dev

# 課金テスト（CC-Auth）
/test --mode billing --env dev

# 全テスト + 自動修正
/test --mode all --auto-fix
```

## テスト設計書生成

Phase 2で `/generate-test-design` を使用してテスト設計書を生成します。

```bash
/generate-test-design [--type <type>]
```

| タイプ | 入力ソース | 出力 |
|--------|-----------|------|
| `unit` | データフロー図 | unit-test-design.md |
| `integration` | シーケンス図 | integration-test-design.md |
| `gui` | シーケンス図+アーキテクチャ図 | gui-test-design.md |
| `e2e` | 全設計図 | e2e-test-design.md |
| `flow` | 要件定義書+シーケンス図 | flow-test-design.md |
| `all` | 全設計図 | 全テスト設計書一括生成 |

## docker-test-loop スキル

### 概要

Docker/AWS環境でのテスト実行→エラー収集→AI分析→自動修正の完全ループを実現。

### 特徴

- **エージェント全員集合型オーケストレーション**
- 結合テスト、E2Eテスト、フローテスト、課金テストを網羅
- ローカルDocker、AWS開発、AWS本番環境対応
- ブラウザ操作録画とネットワークエラー収集
- VSCodeで確認可能なログディレクトリ

### 使用エージェント

| Agent | キャラクター | 役割 |
|-------|-------------|------|
| CoordinatorAgent | 統 (Subaru) | タスク分解・全体統括 |
| TestAgent | - | テスト実行 |
| BrowserAutomationAgent | 瀬良 (Seira) | E2Eテスト・ブラウザ操作 |
| IssueAgent | 析 (Seki) | エラー分類・Issue起票 |
| CodeGenAgent | 源 (Gen) | コード修正生成 |
| ReviewAgent | 剣持謙二 (Kenji) | コードレビュー |
| QAAgent | - | 品質保証 |
| DeploymentAgent | 航 (Wataru) | Docker環境制御 |

### 実行フロー

```
Phase 0: CoordinatorAgent (統) - タスク分解・環境判定
    │
Phase 1: DeploymentAgent (航) - 環境起動 (Docker/AWS)
    │
Phase 2: TestAgent + BrowserAutomationAgent (瀬良) - テスト実行
    │
Phase 3: IssueAgent (析) - エラー分類
    │
Phase 4: CodeGenAgent (源) + ReviewAgent (謙二) - 修正
    │
Phase 5: QAAgent - 再テスト判定
    │
Phase 6: DeploymentAgent (航) - クリーンアップ
```

### ログ出力

```
.test-logs/latest/
├── docker/           # Dockerコンテナログ
├── tests/            # テスト結果JSON
│   ├── unit-results.json
│   ├── integration-results.json
│   ├── e2e-results.json
│   ├── flow-results.json
│   └── billing-results.json
├── browser/          # ブラウザログ・録画
│   ├── console.log
│   ├── network.har
│   ├── screenshots/
│   └── videos/
├── errors/           # エラー解析
│   ├── all-errors.json
│   ├── classified.json
│   └── analysis.md
├── coverage/         # カバレッジレポート
└── summary.md        # 実行サマリー
```

## 依存スキル

| スキル | 用途 |
|--------|------|
| docker-test-loop | Docker/AWS環境テストループ |
| tdd-workflow | Red-Green-Refactorサイクル |
| quality-gateway-engine | 統合品質検証 |
| debugging-troubleshooting | エラー診断・修正 |

## 前提条件（Phase 1で設定必須）

Phase 5のテストを実行する前に、以下がPhase 1で設定されている必要があります：

| 項目 | 確認方法 | 未設定時の対処 |
|------|---------|---------------|
| ドメイン設定 | `.ccagi.yml`に`domain:`セクションあり | `/generate-requirements`を再実行 |
| CC-Auth設定 | `.ccagi.yml`に`cc_auth:`セクションあり | `/generate-requirements`を再実行 |
| localhost URL | CC-Auth開発環境にlocalhost登録済み | `/aws-fast-deploy --register-cc-auth` |

### 前提条件チェックスクリプト

```bash
#!/bin/bash
# Phase 5 前提条件チェック

echo "📋 Phase 5 前提条件チェック..."
ERRORS=0

# ドメイン設定確認
if grep -q "^domain:" .ccagi.yml 2>/dev/null; then
  echo "✅ ドメイン設定: あり"
else
  echo "❌ ドメイン設定がありません"
  ERRORS=$((ERRORS + 1))
fi

# CC-Auth設定確認
if grep -q "^cc_auth:" .ccagi.yml 2>/dev/null; then
  echo "✅ CC-Auth設定: あり"
  # localhost URL確認
  if grep -q "localhost:3000" .ccagi.yml 2>/dev/null; then
    echo "✅ localhost URL: 設定済み"
  else
    echo "⚠️ localhost URLが未設定（flowテストで必要）"
  fi
else
  echo "❌ CC-Auth設定がありません"
  ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -gt 0 ]; then
  echo ""
  echo "❌ 前提条件未満足: Phase 1で /generate-requirements を実行してください"
  exit 1
fi

echo "✅ 前提条件チェック完了: テストを続行できます"
```

## 品質基準

| 項目 | 基準 |
|------|------|
| TypeScriptエラー | 0件 |
| テストカバレッジ | 80%以上 |
| 全テスト合格率 | 100% |
| E2Eシナリオ合格率 | 100% |
| フローテスト合格率 | 100% |
| 課金テスト合格率 | 100% |

## 次のステップ

テスト完了後:

- Phase 6: `/generate-docs` でドキュメント生成
- Phase 7: `/deploy-dev` で開発環境デプロイ

---
CCAGI SDK v7.1.0 - Phase 5: Testing Workflow
