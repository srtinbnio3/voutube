import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'あなたのサービス <noreply@yourapp.com>',
      to: email,
      subject: '【アカウント確認】メールアドレスを確認してください',
      html: `
        <h2>メールアドレスの確認</h2>
        <p>以下のリンクをクリックしてアカウントを有効化してください：</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}">アカウントを確認する</a>
      `,
    });

    if (error) {
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}
