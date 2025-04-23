import { FormMessage, Message } from "@/components/form-message";
import { GoogleSignInButton } from "@/components/google-signin-button";

/**
 * ログインページのコンポーネント
 * 
 * 注意: メール認証の機能自体は残したまま、UI上はGoogle認証のみを表示するように変更しています。

 */
export default async function Login(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex-1 flex flex-col min-w-64 max-w-64 mx-auto mt-12">
      {/* ページタイトル */}
      <h1 className="text-2xl font-medium">ログイン</h1>

      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        {/* Googleログインボタン */}
        <GoogleSignInButton />

        {/* エラーメッセージの表示 */}
        <FormMessage message={searchParams} />
      </div>
    </div>
  );
}
