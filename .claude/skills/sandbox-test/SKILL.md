---
name: sandbox-test
description: |
  Docker Desktop Sandboxes (microVM) を使った隔離E2Eテスト環境。
  Playwright storageStateによるセッション永続化、sharding並列実行、
  障害分離されたmicroVMでテストを並列実行し結果を統合する。
  認証済みSandboxテンプレートで高速起動をサポート。
allowed-tools: Bash Read Write Edit Grep Glob Task
model: sonnet
user-invocable: true
triggers:
  - "sandbox test"
  - "sandbox e2e"
  - "isolated test"
  - "parallel e2e"
  - "microvm test"
  - "sandbox sharding"
---

# Sandbox Test Skill

Docker Desktop Sandboxes (microVM) を使った隔離並列E2Eテスト環境。

## 概要

- **目的**: microVM分離された環境でE2Eテストを並列実行
- **セッション管理**: Playwright storageStateで1回ログイン→全テスト共有
- **並列化**: shard分割 + sandbox分離で安全な並列実行
- **障害分離**: sandbox毎にカーネルが独立、テスト間の影響なし
- **テンプレート**: 認証済み環境をスナップショット保存し高速起動

## コンテキスト変数

| 変数 | 説明 | デフォルト |
|------|------|-----------|
| `${SHARD_COUNT}` | 並列shard数 | 3 |
| `${SANDBOX_TEMPLATE}` | 使用テンプレート名 | "" (新規作成) |
| `${AUTH_MODE}` | 認証モード (storageState/fresh/skip) | storageState |
| `${CLEANUP_POLICY}` | クリーンアップ (always/on_success/never) | always |
| `${SAVE_TEMPLATE}` | テスト後テンプレート保存 (true/false) | false |
| `${BROWSER_PROJECT}` | Playwrightプロジェクト名 | chromium |
| `${TEST_FILTER}` | テストフィルタ (grep pattern) | "" (全テスト) |
| `${TIMEOUT_PER_SHARD}` | shard毎タイムアウト(秒) | 300 |

## エージェントオーケストレーション

### 使用エージェント一覧

| Phase | Agent | キャラクター | 役割 |
|-------|-------|-------------|------|
| S0 | **coordinator** | 統 (Subaru) | タスク分解・Sandbox計画 |
| S1 | **deployment** | 航 (Wataru) | Sandbox環境構築 |
| S2 | **browser-automation** | 瀬良 (Seira) | 認証セットアップ |
| S3 | **test** + **browser-automation** | 瀬良 (Seira) | 並列テスト実行 |
| S4 | **issue** + **qa** | 析 (Seki) | 結果集約・品質判定 |
| S5 | **deployment** | 航 (Wataru) | クリーンアップ |

### 実行フロー

```
Human Request: /sandbox-test
    |
Phase S0: CoordinatorAgent (統) - タスク分解・Sandbox計画
    ├── shard数決定（テスト件数 / CPU数ベース）
    ├── テンプレート有無チェック
    ├── storageState有効期限チェック
    └── エージェント割り当て
    |
Phase S1: DeploymentAgent (航) - Sandbox環境構築
    ├── テンプレート存在 → docker sandbox create --template
    ├── テンプレートなし → docker sandbox create + 依存インストール
    ├── 各sandbox健全性チェック
    └── workspace同期確認
    |
Phase S2: BrowserAutomationAgent (瀬良) - 認証セットアップ
    ├── storageState有効 → スキップ（キャッシュ利用）
    ├── storageState期限切れ → auth.setup.ts実行
    ├── playwright/.auth/user.json 生成
    └── workspace syncで全sandboxに反映
    |
Phase S3: TestAgent + BrowserAutomationAgent (瀬良) - 並列テスト実行
    ├── shard-1: docker sandbox exec e2e-shard-1 npx playwright test --shard=1/N
    ├── shard-2: docker sandbox exec e2e-shard-2 npx playwright test --shard=2/N
    ├── shard-N: docker sandbox exec e2e-shard-N npx playwright test --shard=N/N
    └── 各shardのblob-reportを収集
    |
Phase S4: IssueAgent (析) + QAAgent - 結果集約・品質判定
    ├── npx playwright merge-reports（全shardマージ）
    ├── 失敗テスト分類（57ラベル体系）
    ├── PASS/FAIL判定
    └── Issue起票（--auto-fix時）
    |
Phase S5: DeploymentAgent (航) - クリーンアップ
    ├── cleanup_policy: always → 全sandbox削除
    ├── cleanup_policy: on_success → PASS時のみ削除
    ├── cleanup_policy: never → 保持（デバッグ用）
    └── テンプレート更新（--save-template時）
```

## Sandbox ライフサイクル管理

### 作成

```bash
# 新規作成（テンプレートなし）
docker sandbox create --name e2e-shard-1 --workspace .

# テンプレートから作成（高速）
docker sandbox create --name e2e-shard-1 --template e2e-authenticated
```

### テンプレート管理

```bash
# テンプレート作成
docker sandbox create --name template-base --workspace .
docker sandbox exec template-base npm ci
docker sandbox exec template-base npx playwright install --with-deps chromium
docker sandbox exec template-base npx playwright test --project=setup
docker sandbox save template-base --template e2e-authenticated
docker sandbox rm template-base

# テンプレートから起動
docker sandbox create --name e2e-shard-1 --template e2e-authenticated
```

### クリーンアップ

```bash
docker sandbox rm e2e-shard-1
```

## 障害分離ポリシー

- 各sandboxはmicroVM（独自カーネル）で完全分離
- shard-1の障害がshard-2/3に伝播しない
- ネットワーク: フィルタリングプロキシ経由（外部API呼び出し可能）
- ファイルシステム: workspace双方向sync（テスト結果はホストで確認可能）

## ログディレクトリ構造

```
.test-logs/
├── sandbox-{timestamp}/
│   ├── shard-1.log          # shard 1 実行ログ
│   ├── shard-2.log          # shard 2 実行ログ
│   ├── shard-3.log          # shard 3 実行ログ
│   ├── auth-setup.log       # 認証セットアップログ
│   ├── merge.log            # レポートマージログ
│   ├── summary.md           # 実行サマリー
│   └── blob-report-shard-*/ # 各shardのblob report
├── sandbox-active.json      # 実行中のsandbox情報
└── sandbox-latest -> sandbox-{timestamp}/
```

## 使用例

```bash
# 基本実行（3 shard並列）
./scripts/sandbox-test.sh

# shard数指定
./scripts/sandbox-test.sh --shard 5

# テンプレート使用（高速起動）
./scripts/sandbox-test.sh --template e2e-authenticated

# デバッグ用（sandbox保持）
./scripts/sandbox-test.sh --cleanup never

# テスト後にテンプレート保存
./scripts/sandbox-test.sh --save-template

# 特定テストのみ
./scripts/sandbox-test.sh --filter "login|checkout"
```

## 前提条件

- Docker Desktop 4.58+ インストール済み
- Docker Desktop Sandboxes 機能が有効化済み
- Playwright インストール済み (`npx playwright install`)

## 関連スキル

- `docker-test-loop` - 従来のDocker環境テストループ（sandbox非使用）
- `tdd-workflow` - Red-Green-Refactorサイクル

## 関連コマンド

- `/sandbox-test` - Sandboxテスト実行
- `/sandbox-template` - テンプレート管理
- `/test --mode e2e --sandbox` - sandbox経由E2Eテスト
