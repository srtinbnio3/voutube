import { validatePassword } from '../utils/password-validation';
import { createClient } from '@/utils/supabase/server';

/**
 * 認証関連のアクション関数の型定義
 * テスト時のモック用に提供されています
 */

// サインアップ機能
export async function signUpAction(formData: FormData): Promise<{ status: string; message: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // 必須項目チェック
  if (!email) {
    return {
      status: 'error',
      message: 'メールアドレスは必須です'
    };
  }

  if (!password) {
    return {
      status: 'error',
      message: 'パスワードは必須です'
    };
  }

  // メールアドレスの形式チェック
  if (!email.includes('@')) {
    return {
      status: 'error',
      message: '無効なメールアドレス形式です'
    };
  }

  // パスワードバリデーション
  const validation = validatePassword(password);
  if (!validation.isValid) {
    return {
      status: 'error',
      message: validation.error || 'パスワードが要件を満たしていません'
    };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return {
          status: 'error',
          message: 'このメールアドレスは既に登録されています'
        };
      }
      return {
        status: 'error',
        message: error.message
      };
    }

    return {
      status: 'success',
      message: '確認メールを送信しました。メールをご確認ください。'
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'サインアップ中にエラーが発生しました。'
    };
  }
}

// ログイン機能
export async function signInAction(formData: FormData): Promise<{ status: string; message: string }> {
  throw new Error('実装されていません - テスト用のモック専用です');
}

// Googleログイン機能
export async function signInWithGoogleAction(): Promise<{ status: string; message?: string }> {
  throw new Error('実装されていません - テスト用のモック専用です');
}

// ログアウト機能
export async function signOutAction(): Promise<{ status: string; message: string }> {
  throw new Error('実装されていません - テスト用のモック専用です');
}

// パスワードリセットリクエスト機能
export async function resetPasswordRequestAction(formData: FormData): Promise<{ status: string; message: string }> {
  throw new Error('実装されていません - テスト用のモック専用です');
}

// パスワードリセット実行機能
export async function resetPasswordAction(formData: FormData): Promise<{ status: string; message: string }> {
  throw new Error('実装されていません - テスト用のモック専用です');
}

// メール確認機能
export async function verifyEmailAction(token: string, type: string): Promise<{ status: string; message: string }> {
  throw new Error('実装されていません - テスト用のモック専用です');
}

// 確認メール再送信機能
export async function resendVerificationEmailAction(email: string): Promise<{ status: string; message: string }> {
  throw new Error('実装されていません - テスト用のモック専用です');
} 