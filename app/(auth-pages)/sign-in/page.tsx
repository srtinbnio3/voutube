import { FormMessage, Message } from "@/components/form-message";
import { GoogleSignInButton } from "@/components/google-signin-button";

/**
 * ログインページのコンポーネント
 * 
 * 注意: メール認証の機能自体は残したまま、UI上はGoogle認証のみを表示するように変更しています。
 * 
 */
export default async function Login(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex min-h-[80vh] items-center justify-center w-full">
      <div className="w-full max-w-md p-4">
        {/* ログインフォーム */}
        <div className="flex flex-col justify-center p-8 bg-card rounded-2xl shadow-lg border border-border/50">
          <div className="space-y-6">
            {/* ページタイトル */}
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">IdeaTubeへようこそ</h1>
              <p className="text-sm text-muted-foreground">
                アカウントにログインして、推しYoutuberに企画を提案しましょう
              </p>
            </div>

            <div className="space-y-4">
              {/* Googleログインボタン */}
              <GoogleSignInButton />

              {/* エラーメッセージの表示 */}
              <FormMessage message={searchParams} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
