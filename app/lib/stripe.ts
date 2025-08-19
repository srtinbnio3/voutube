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

// Stripe Identity関連の関数

// 本人確認セッションを作成
export const createVerificationSession = async (
  options: {
    type: 'document' | 'id_number';
    metadata?: Record<string, string>;
    return_url: string;
  }
): Promise<Stripe.Identity.VerificationSession> => {
  return await stripe.identity.verificationSessions.create({
    type: options.type,
    metadata: options.metadata,
    options: {
      document: {
        allowed_types: ['passport', 'driving_license', 'id_card'],
        require_id_number: true,
        require_live_capture: true,
        require_matching_selfie: true,
      },
    },
    return_url: options.return_url,
  });
};

// 本人確認セッションの状態を取得
export const getVerificationSession = async (
  sessionId: string
): Promise<Stripe.Identity.VerificationSession> => {
  return await stripe.identity.verificationSessions.retrieve(sessionId);
};

// 本人確認セッションをキャンセル
export const cancelVerificationSession = async (
  sessionId: string
): Promise<Stripe.Identity.VerificationSession> => {
  return await stripe.identity.verificationSessions.cancel(sessionId);
};

// 本人確認の結果データを整形
export const formatVerificationData = (
  verificationSession: Stripe.Identity.VerificationSession
) => {
  const verifiedOutputs = verificationSession.verified_outputs;
  
  if (!verifiedOutputs) {
    return null;
  }

  return {
    // 個人情報
    firstName: verifiedOutputs.first_name || null,
    lastName: verifiedOutputs.last_name || null,
    dateOfBirth: verifiedOutputs.dob ? {
      day: verifiedOutputs.dob.day,
      month: verifiedOutputs.dob.month,
      year: verifiedOutputs.dob.year,
    } : null,
    
    // 住所情報
    address: verifiedOutputs.address ? {
      line1: verifiedOutputs.address.line1,
      line2: verifiedOutputs.address.line2,
      city: verifiedOutputs.address.city,
      state: verifiedOutputs.address.state,
      postalCode: verifiedOutputs.address.postal_code,
      country: verifiedOutputs.address.country,
    } : null,
    
    // 身分証明書情報
    idNumber: verifiedOutputs.id_number || null,
    
    // 確認済みフラグ
    verified: verificationSession.status === 'verified',
    verifiedAt: verificationSession.status === 'verified' ? new Date().toISOString() : null,
  };
}; 