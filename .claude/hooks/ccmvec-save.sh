#!/bin/bash
# ccmvec-save.sh - セッション終了時に情報をRAGに保存
# Usage: ccmvec-save.sh --title "タイトル" --content "内容" [--label "ラベル"]

CCMVEC_FILE="${CCMVEC_FILE:-$HOME/.ccagi-global.ccm}"
CCMVEC_BIN="${CCMVEC_BIN:-$HOME/.local/bin/ccmvec}"

TITLE=""
CONTENT=""
LABEL=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --title)
            TITLE="$2"
            shift 2
            ;;
        --content)
            CONTENT="$2"
            shift 2
            ;;
        --label)
            LABEL="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

if [ -z "$TITLE" ] || [ -z "$CONTENT" ]; then
    echo "Usage: ccmvec-save.sh --title \"タイトル\" --content \"内容\" [--label \"ラベル\"]"
    exit 1
fi

if [ ! -f "$CCMVEC_FILE" ]; then
    "$CCMVEC_BIN" create "$CCMVEC_FILE" 2>/dev/null
fi

# 保存実行
if [ -n "$LABEL" ]; then
    "$CCMVEC_BIN" put "$CCMVEC_FILE" --title "$TITLE" --text "$CONTENT" --label "$LABEL"
else
    "$CCMVEC_BIN" put "$CCMVEC_FILE" --title "$TITLE" --text "$CONTENT"
fi

echo "Saved to RAG: $TITLE"
