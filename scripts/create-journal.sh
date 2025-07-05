#!/bin/bash

# 開発日誌作成スクリプト
# 使用方法: ./scripts/create-journal.sh [日付]
# 日付を指定しない場合は今日の日付を使用

# 日付の設定
if [ "$1" ]; then
    DATE="$1"
else
    DATE=$(date +%Y-%m-%d)
fi

YEAR=$(date -j -f "%Y-%m-%d" "$DATE" +%Y 2>/dev/null || date +%Y)
MONTH=$(date -j -f "%Y-%m-%d" "$DATE" +%m 2>/dev/null || date +%m)

# ファイルパスの設定
JOURNAL_DIR="doc/development-journal/${YEAR}/${MONTH}"
JOURNAL_FILE="${JOURNAL_DIR}/${DATE}.md"
TEMPLATE_FILE="doc/development-journal/template.md"

# ディレクトリの作成
mkdir -p "$JOURNAL_DIR"

# 既存ファイルのチェック
if [ -f "$JOURNAL_FILE" ]; then
    echo "📝 日誌ファイルが既に存在します: $JOURNAL_FILE"
    echo "編集しますか？ (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        code "$JOURNAL_FILE"
    fi
    exit 0
fi

# Git情報の取得
CURRENT_BRANCH=$(git branch --show-current)
TODAY_COMMITS=$(git log --oneline --since="$DATE 00:00:00" --until="$DATE 23:59:59" --pretty=format:"- %s (%h)")
COMMIT_COUNT=$(git log --since="$DATE 00:00:00" --until="$DATE 23:59:59" --oneline | wc -l | tr -d ' ')

# コミット情報の整形
if [ -z "$TODAY_COMMITS" ]; then
    COMMITS_SECTION="今日はまだコミットがありません。"
else
    # 改行を\\nに変換してsedで安全に処理できるようにする
    COMMITS_SECTION=$(echo "$TODAY_COMMITS" | sed 's/$/\\/')
fi

# テンプレートからファイル作成
if [ -f "$TEMPLATE_FILE" ]; then
    cp "$TEMPLATE_FILE" "$JOURNAL_FILE"
    
    # macOS対応のsed（改行を考慮した安全な置換）
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/{{DATE}}/$DATE/g" "$JOURNAL_FILE"
        sed -i '' "s/{{BRANCH}}/$CURRENT_BRANCH/g" "$JOURNAL_FILE"
        sed -i '' "s/{{COMMIT_COUNT}}/$COMMIT_COUNT/g" "$JOURNAL_FILE"
        # コミット情報は一時ファイルを使用して安全に置換
        echo "$COMMITS_SECTION" > /tmp/commits_temp.txt
        sed -i '' "/{{COMMITS}}/r /tmp/commits_temp.txt" "$JOURNAL_FILE"
        sed -i '' "/{{COMMITS}}/d" "$JOURNAL_FILE"
        rm -f /tmp/commits_temp.txt
    else
        sed -i "s/{{DATE}}/$DATE/g" "$JOURNAL_FILE"
        sed -i "s/{{BRANCH}}/$CURRENT_BRANCH/g" "$JOURNAL_FILE"
        sed -i "s/{{COMMIT_COUNT}}/$COMMIT_COUNT/g" "$JOURNAL_FILE"
        echo "$COMMITS_SECTION" > /tmp/commits_temp.txt
        sed -i "/{{COMMITS}}/r /tmp/commits_temp.txt" "$JOURNAL_FILE"
        sed -i "/{{COMMITS}}/d" "$JOURNAL_FILE"
        rm -f /tmp/commits_temp.txt
    fi
    
    echo "✅ 開発日誌を作成しました: $JOURNAL_FILE"
    echo "📝 内容を編集してください。"
    
    # エディタで開く（Cursor、VS Codeの順で確認）
    if command -v cursor &> /dev/null; then
        cursor "$JOURNAL_FILE"
    elif command -v code &> /dev/null; then
        code "$JOURNAL_FILE"
    else
        echo "エディタでファイルを開けませんでした。手動で編集してください: $JOURNAL_FILE"
    fi
else
    echo "❌ テンプレートファイルが見つかりません: $TEMPLATE_FILE"
    exit 1
fi 