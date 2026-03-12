---
description: Docker Desktop Sandbox テンプレート管理
arguments:
  - name: action
    description: アクション（create / list / delete / refresh）
    required: true
  - name: --name
    description: テンプレート名
    required: false
agents:
  - deployment: deployment (航)
skills:
  - sandbox-test
---

# /sandbox-template - Sandboxテンプレート管理

Docker Desktop Sandbox テンプレートのライフサイクル管理コマンド。

## 概要

認証済みSandbox環境をテンプレートとしてスナップショット保存し、
次回テスト実行時に高速起動を実現します。

## 使用方法

```bash
/sandbox-template <action> [--name <template-name>]
```

## アクション

### create - テンプレート作成

認証済みSandbox環境を作成しテンプレートとして保存します。

```bash
/sandbox-template create --name e2e-authenticated
```

**実行フロー:**
1. `docker sandbox create --name template-base --workspace .`
2. `docker sandbox exec template-base npm ci`
3. `docker sandbox exec template-base npx playwright install --with-deps chromium`
4. `docker sandbox exec template-base npx playwright test --project=setup`
5. `docker sandbox save template-base --template e2e-authenticated`
6. `docker sandbox rm template-base`

### list - テンプレート一覧

```bash
/sandbox-template list
```

### delete - テンプレート削除

```bash
/sandbox-template delete --name e2e-authenticated
```

### refresh - テンプレート更新

依存関係と認証を再実行してテンプレートを更新します。

```bash
/sandbox-template refresh --name e2e-authenticated
```

**実行フロー:**
1. 既存テンプレートから一時Sandbox作成
2. `npm ci` で依存関係更新
3. `npx playwright test --project=setup` で認証更新
4. テンプレートを上書き保存
5. 一時Sandbox削除

## 前提条件

- Docker Desktop 4.58+ (Sandboxes有効)

## 関連コマンド

- `/sandbox-test` - Sandboxテスト実行
- `/test --mode e2e --sandbox` - sandboxモードE2Eテスト

---

CCAGI SDK - Sandbox Template Management
