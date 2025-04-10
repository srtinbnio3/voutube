#!/bin/bash

# 入力GIFファイル
INPUT_GIF="/Users/kimu/dev/voutube/public/images/SignUpGif.gif"
# 出力GIFファイル
OUTPUT_GIF="/Users/kimu/dev/voutube/public/images/SignUpGif-optimized.gif"

# GIFを最適化
gifsicle -O3 --lossy=30 --colors 256 "$INPUT_GIF" -o "$OUTPUT_GIF"

# 元のファイルをバックアップ
mv "$INPUT_GIF" "${INPUT_GIF}.bak"
# 最適化したファイルを元の名前に
mv "$OUTPUT_GIF" "$INPUT_GIF"

echo "GIFの最適化が完了しました。元のファイルは ${INPUT_GIF}.bak として保存されています。" 