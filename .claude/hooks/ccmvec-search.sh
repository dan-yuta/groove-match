#!/bin/bash
# ccmvec-search.sh - セッション開始時にRAGから関連情報を検索
# Usage: ccmvec-search.sh [query]

CCMVEC_FILE="${CCMVEC_FILE:-$HOME/.ccagi-global.ccm}"
CCMVEC_BIN="${CCMVEC_BIN:-$HOME/.local/bin/ccmvec}"

# クエリがない場合はカレントディレクトリ名を使用
QUERY="${1:-$(basename "$(pwd)")}"

if [ ! -f "$CCMVEC_FILE" ]; then
    echo "RAG file not found: $CCMVEC_FILE"
    exit 0
fi

if [ ! -x "$CCMVEC_BIN" ]; then
    echo "ccmvec not found: $CCMVEC_BIN"
    exit 0
fi

# 検索実行
RESULTS=$("$CCMVEC_BIN" search "$CCMVEC_FILE" --query "$QUERY" --top-k 5 2>/dev/null)

if [ -n "$RESULTS" ]; then
    echo "=== ccmvec RAG: 関連情報 ==="
    echo "$RESULTS"
    echo "=== END ==="
fi
