/**
 * 認証関連のアクション関数の型定義
 * テスト時のモック用に提供されています
 */

// サインアップ機能
export async function signUpAction(formData: FormData): Promise<{ status: string; message: string }> {
  throw new Error('実装されていません - テスト用のモック専用です');
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