---
description: Docker Desktop Sandboxes (microVM) を使った隔離並列E2Eテスト
arguments:
  - name: --shard
    description: 並列shard数（デフォルト: 3）
    required: false
  - name: --template
    description: 使用するSandboxテンプレート名
    required: false
  - name: --auth
    description: 認証モード（storageState / fresh / skip）
    required: false
  - name: --cleanup
    description: クリーンアップポリシー（always / on_success / never）
    required: false
  - name: --save-template
    description: テスト後にテンプレートとして保存
    required: false
  - name: --browser
    description: ブラウザプロジェクト（chromium / firefox / webkit）
    required: false
  - name: --filter
    description: テストフィルタ（grep pattern）
    required: false
  - name: --env
    description: 実行環境（local / dev / prod）
    required: false
agents:
  - orchestration: coordinator (統)
  - deployment: deployment (航)
  - browser: browser-automation (瀬良)
  - test: test
  - issue: issue (析)
  - qa: qa
skills:
  - sandbox-test
  - tdd-workflow
  - docker-test-loop
---

# /sandbox-test - 隔離並列E2Eテストコマンド

Docker Desktop Sandboxes (microVM) を使った隔離並列E2Eテスト実行コマンド。

## 概要

microVM分離された環境でPlaywright E2Eテストを並列実行します。
Playwright storageStateによるセッション永続化で認証を1回に最適化し、
shard分割によるテスト並列化を実現します。

## 使用方法

```bash
/sandbox-test [options]
```

## オプション

| オプション | 説明 | デフォルト |
|-----------|------|-----------|
| `--shard <N>` | 並列shard数 | 3 |
| `--template <name>` | Sandboxテンプレート名 | なし (新規作成) |
| `--auth <mode>` | 認証モード | storageState |
| `--cleanup <policy>` | クリーンアップ | always |
| `--save-template` | テスト後テンプレート保存 | false |
| `--browser <project>` | ブラウザ | chromium |
| `--filter <pattern>` | テストフィルタ | 全テスト |
| `--env <env>` | 実行環境 | local |

### 認証モード (--auth)

| モード | 説明 |
|--------|------|
| `storageState` | 既存のstorageStateを再利用。なければ自動生成 |
| `fresh` | 毎回auth.setup.tsを実行して新規セッション生成 |
| `skip` | 認証をスキップ（認証不要テスト向け） |

### クリーンアップポリシー (--cleanup)

| ポリシー | 説明 |
|---------|------|
| `always` | テスト完了後、常にsandboxを削除 |
| `on_success` | テスト成功時のみ削除、失敗時は保持（デバッグ用） |
| `never` | sandboxを保持（手動デバッグ用） |

## 使用例

```bash
# 基本実行（3 shard並列）
/sandbox-test

# shard数指定
/sandbox-test --shard 5

# テンプレート使用（高速起動）
/sandbox-test --template e2e-authenticated

# デバッグ用（sandbox保持）
/sandbox-test --cleanup never

# テスト後にテンプレート保存
/sandbox-test --save-template

# AWS開発環境向け
/sandbox-test --env dev

# 特定テストのみ
/sandbox-test --filter "login|checkout"

# Firefox + 5並列
/sandbox-test --browser firefox --shard 5
```

## エージェントオーケストレーション

```
Phase S0: CoordinatorAgent (統) - タスク分解・Sandbox計画
Phase S1: DeploymentAgent (航) - Sandbox環境構築
Phase S2: BrowserAutomationAgent (瀬良) - 認証セットアップ
Phase S3: TestAgent + BrowserAutomationAgent (瀬良) - 並列テスト実行
Phase S4: IssueAgent (析) + QAAgent - 結果集約・品質判定
Phase S5: DeploymentAgent (航) - クリーンアップ
```

## 実行手順

1. `scripts/sandbox-test.sh` を引数付きで実行
2. 結果は `.test-logs/sandbox-{timestamp}/` に出力
3. 失敗時はIssue自動起票（IssueAgent連携）

## ログ出力

```
.test-logs/sandbox-{timestamp}/
├── shard-{N}.log           # 各shard実行ログ
├── auth-setup.log          # 認証セットアップログ
├── summary.md              # 実行サマリー
├── blob-report-shard-*/    # 各shardのblob report
└── playwright-report/      # マージ済みHTMLレポート
```

## 前提条件

- Docker Desktop 4.58+ (Sandboxes有効)
- Playwright インストール済み
- テスト対象環境へのアクセス

## 関連コマンド

- `/test --mode e2e --sandbox` - sandboxモードでE2Eテスト（本コマンドに委譲）
- `/sandbox-template` - テンプレート管理
- `/test --mode e2e` - 従来のdocker-test-loopベースE2Eテスト

---

CCAGI SDK - Sandbox Test Command
