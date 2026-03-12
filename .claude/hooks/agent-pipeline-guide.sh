#!/bin/bash
# ===================================================================
# Agent Pipeline Guide - SessionStart Hook
# Issues: #192, #194, #183
# Purpose: Inject CCAGI development workflow guidance at session start
# ===================================================================

set -euo pipefail

cat <<'GUIDANCE_EOF'

【CCAGI 開発ワークフロー ガイド】

■ Issue-First原則:
  開発作業（Phase 4+）前にIssue起票必須。
  複合タスク（3ステップ以上）→ Epic Issue + Phase/Wave/Cycle分解。
  `gh issue list` で既存Issue確認 → なければ `/create-issue`。

■ Agent Pipeline:
  ソースコード変更 → Agent経由（CoordinatorAgent or CodeGenAgent）。
  設定・ドキュメント変更 → 直接Edit可。

■ 並列度制限:
  subagent同時起動は最大3（.ccagi.yml max_parallel_tasks: 3）。

GUIDANCE_EOF

exit 0
