/**
 * パスワードが要件を満たしているかチェックする関数
 * @param password チェックするパスワード
 * @returns バリデーション結果と、エラーメッセージ（エラーがある場合）
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  // 8文字以上であることをチェック
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'パスワードは8文字以上である必要があります'
    };
  }

  // 大文字を含むことをチェック
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'パスワードは大文字を1文字以上含める必要があります'
    };
  }

  // 小文字を含むことをチェック
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'パスワードは小文字を1文字以上含める必要があります'
    };
  }

  // 数字を含むことをチェック
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      error: 'パスワードは数字を1文字以上含める必要があります'
    };
  }

  return { isValid: true };
} 