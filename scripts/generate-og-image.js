import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// キャンバスの作成
const width = 1200;
const height = 630;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// 背景色の設定
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, width, height);

// テキストの設定
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// タイトル
ctx.font = 'bold 48px Helvetica';
ctx.fillStyle = '#FF0000';
ctx.fillText('IdeaTube', width / 2, height / 2 - 100);

// サブタイトル
ctx.font = '32px Helvetica';
ctx.fillStyle = '#333333';
ctx.fillText('YouTuberと視聴者を繋ぐ企画プラットフォーム', width / 2, height / 2 + 20);

// 説明文
ctx.font = '24px Helvetica';
ctx.fillText('あなたのアイデアが、次のバズる動画を創ります。', width / 2, height / 2 + 80);

// 画像の保存
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, '../public/og-image.png'), buffer);

console.log('OGP画像が生成されました: public/og-image.png'); 