import { Stripe } from 'stripe';

// Stripeクライアントの初期化
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15', // 適切なAPIバージョンを使用
});

// 支払い額を日本円に変換する（Stripeは最小単位で計算するため）
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount);
};

// 支払い額を表示用にフォーマット
export const formatAmountForDisplay = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}; 