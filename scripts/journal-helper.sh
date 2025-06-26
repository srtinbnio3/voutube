#!/bin/bash

# 開発日誌ヘルパースクリプト

show_help() {
    cat << EOF
開発日誌ヘルパーコマンド

使用方法:
  ./scripts/journal-helper.sh <command> [options]

コマンド:
  create [date]     新しい日誌を作成（日付省略時は今日）
  list              すべての日誌一覧を表示
  today             今日の日誌を開く
  yesterday         昨日の日誌を開く
  search <keyword>  日誌内容を検索
  summary <month>   月次サマリーを生成
  setup-alias       エイリアスの設定方法を表示

例:
  ./scripts/journal-helper.sh create
  ./scripts/journal-helper.sh create 2025-06-26
  ./scripts/journal-helper.sh list
  ./scripts/journal-helper.sh search "クラウドファンディング"
  ./scripts/journal-helper.sh summary 2025-06
EOF
}

create_journal() {
    ./scripts/create-journal.sh "$1"
}

list_journals() {
    echo "📝 開発日誌一覧:"
    find doc/development-journal -name "*.md" -not -name "README.md" -not -name "template.md" | sort | while read -r file; do
        # ファイル名から日付を抽出
        basename=$(basename "$file" .md)
        if [[ $basename =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
            # ファイルの最初の非空行を取得（タイトル）
            first_line=$(grep -m 1 -v '^$' "$file" 2>/dev/null | sed 's/^# //')
            echo "  📄 $basename - $first_line"
        fi
    done
}

open_journal() {
    local date="$1"
    local year month
    
    year=$(date -j -f "%Y-%m-%d" "$date" +%Y 2>/dev/null || date +%Y)
    month=$(date -j -f "%Y-%m-%d" "$date" +%m 2>/dev/null || date +%m)
    
    local journal_file="doc/development-journal/${year}/${month}/${date}.md"
    
    if [ -f "$journal_file" ]; then
        if command -v code &> /dev/null; then
            code "$journal_file"
        else
            echo "📝 日誌ファイル: $journal_file"
            echo "手動で開いてください。"
        fi
    else
        echo "❌ 日誌ファイルが見つかりません: $journal_file"
        echo "作成しますか？ (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            create_journal "$date"
        fi
    fi
}

search_journals() {
    local keyword="$1"
    echo "🔍 「$keyword」を検索中..."
    grep -r -l "$keyword" doc/development-journal --include="*.md" --exclude="README.md" --exclude="template.md" | while read -r file; do
        basename=$(basename "$file" .md)
        echo "📄 $basename で見つかりました:"
        grep -n --color=always "$keyword" "$file" | head -3
        echo ""
    done
}

generate_summary() {
    local month="$1"
    local year month_num
    
    if [[ $month =~ ^([0-9]{4})-([0-9]{2})$ ]]; then
        year="${BASH_REMATCH[1]}"
        month_num="${BASH_REMATCH[2]}"
    else
        echo "❌ 月の形式が正しくありません。YYYY-MM形式で指定してください。"
        return 1
    fi
    
    local journal_dir="doc/development-journal/${year}/${month_num}"
    
    if [ ! -d "$journal_dir" ]; then
        echo "❌ 指定された月のディレクトリが見つかりません: $journal_dir"
        return 1
    fi
    
    echo "📊 ${month} 月次サマリー"
    echo "========================="
    echo ""
    
    local file_count
    file_count=$(find "$journal_dir" -name "*.md" | wc -l | tr -d ' ')
    echo "📝 記録日数: ${file_count}日"
    echo ""
    
    echo "📅 日別記録:"
    find "$journal_dir" -name "*.md" | sort | while read -r file; do
        basename=$(basename "$file" .md)
        first_line=$(grep -m 1 "## 📝 今日の作業内容" -A 10 "$file" | grep -v "^#" | grep -v "^$" | head -1)
        echo "  • $basename: $first_line"
    done
}

setup_alias() {
    cat << 'EOF'
エイリアス設定方法:

以下を ~/.zshrc に追加してください:

# 開発日誌のエイリアス
alias journal='cd /Users/kimu/dev/voutube && ./scripts/journal-helper.sh create'
alias journal-today='cd /Users/kimu/dev/voutube && ./scripts/journal-helper.sh today'
alias journal-list='cd /Users/kimu/dev/voutube && ./scripts/journal-helper.sh list'
alias journal-search='cd /Users/kimu/dev/voutube && ./scripts/journal-helper.sh search'

設定後、以下でリロード:
source ~/.zshrc
EOF
}

# メイン処理
case "$1" in
    create)
        create_journal "$2"
        ;;
    list)
        list_journals
        ;;
    today)
        open_journal "$(date +%Y-%m-%d)"
        ;;
    yesterday)
        open_journal "$(date -v-1d +%Y-%m-%d)"
        ;;
    search)
        if [ -z "$2" ]; then
            echo "❌ 検索キーワードを指定してください。"
            exit 1
        fi
        search_journals "$2"
        ;;
    summary)
        if [ -z "$2" ]; then
            echo "❌ 月を指定してください（例: 2025-06）。"
            exit 1
        fi
        generate_summary "$2"
        ;;
    setup-alias)
        setup_alias
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ 無効なコマンドです。"
        show_help
        exit 1
        ;;
esac 