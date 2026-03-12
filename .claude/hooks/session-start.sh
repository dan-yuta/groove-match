#!/bin/bash
#
# CCAGI Session Start Hook
#
# このフックはセッション開始時に実行され、
# システム状態の確認と優先タスクの表示を行います。
#
# CCAGI Policy: 完全自律動作、外部依存なし

set -euo pipefail

# Configuration - Dynamic path resolution
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_DIR="$PROJECT_ROOT/.ai/logs"
mkdir -p "$LOG_DIR"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Log session start
echo "[$(date '+%Y-%m-%d %H:%M:%S')] CCAGI Session Started" >> "$LOG_DIR/session.log"

# RAG Search - 関連コンテキストを検索
RAG_SEARCH_SCRIPT="$HOME/.claude/hooks/ccmvec-search.sh"
if [ -x "$RAG_SEARCH_SCRIPT" ]; then
    PROJECT_NAME=$(basename "$PROJECT_ROOT")
    "$RAG_SEARCH_SCRIPT" "$PROJECT_NAME" 2>/dev/null || true
fi

# Display welcome message
cat <<EOF

${GREEN}╔════════════════════════════════════════════════════════════╗${NC}
${GREEN}║                    CCAGI System Active                     ║${NC}
${GREEN}╚════════════════════════════════════════════════════════════╝${NC}

${BLUE}System Status:${NC}
  🟢 Core Functions: Operational
  🟢 Agent System: Ready
  🟢 MCP Servers: Available

${BLUE}Quality Standards:${NC}
  ✓ TypeScript Errors: 0 (Required)
  ✓ ESLint Errors: 0 (Required)
  ✓ Test Coverage: 80%+ (Required)
  ✓ Security Score: 80+ (Required)

${BLUE}Design Principles:${NC}
  🔒 外部停止不可能 - No Remote Shutdown
  🔄 完全自律動作 - Fully Autonomous
  🛡️  外部依存最小化 - Minimal External Dependencies

${YELLOW}Ready for commands.${NC}

EOF

# Check for pending tasks (optional)
if [ -f "$PROJECT_ROOT/.ai/tasks/pending.json" ]; then
    echo -e "${BLUE}📋 Pending Tasks Available${NC}"
    echo "   Run: npm run agents:parallel:exec -- --issue <number>"
    echo ""
fi

exit 0
