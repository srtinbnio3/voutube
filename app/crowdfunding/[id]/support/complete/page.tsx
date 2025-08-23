import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { formatAmountForDisplay } from "@/app/lib/stripe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Heart, ArrowLeft } from "lucide-react";

interface SupportCompletePageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    session_id?: string;
    supporter_id?: string;
    canceled?: string;
  }>;
}

export async function generateMetadata({ params }: SupportCompletePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  const supabase = await createClient();
  
  const { data: campaign, error } = await supabase
    .from("crowdfunding_campaigns")
    .select(`
      title,
      channel:channels(name)
    `)
    .eq("id", id)
    .single();
  
  if (error || !campaign) {
    return {
      title: "支援完了 | IdeaTube",
      description: "クラウドファンディングプロジェクトの支援が完了しました。",
    };
  }
  
  return {
    title: `${campaign.title}の支援完了 | IdeaTube`,
    description: `${(campaign.channel as any).name}のプロジェクト「${campaign.title}」の支援が完了しました。`,
  };
}

export default async function SupportCompletePage({ params, searchParams }: SupportCompletePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const { id } = resolvedParams;
  const { session_id, supporter_id, canceled } = resolvedSearchParams;
  
  const supabase = await createClient();

  // キャンセルされた場合
  if (canceled) {
    return (
      <main className="relative overflow-hidden min-h-screen">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container py-6 md:py-10 relative">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowLeft className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h1 className="text-2xl font-bold mb-2">支援がキャンセルされました</h1>
              <p className="text-muted-foreground">
                決済処理がキャンセルされました。再度支援をお試しください。
              </p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button asChild variant="outline">
                <Link href={`/crowdfunding/${id}`}>
                  プロジェクト詳細に戻る
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/crowdfunding/${id}/support`}>
                  再度支援する
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 支援情報を取得
  if (!supporter_id) {
    notFound();
  }

  const { data: supporter, error: supporterError } = await supabase
    .from("crowdfunding_supporters")
    .select(`
      *,
      campaign:crowdfunding_campaigns(
        id,
        title,
        channel:channels(name)
      ),
      reward:crowdfunding_rewards(
        id,
        title,
        description,
        amount
      )
    `)
    .eq("id", supporter_id)
    .single();

  if (supporterError || !supporter) {
    notFound();
  }

  // セッション認証チェック
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.id !== supporter.user_id) {
    notFound();
  }

  const campaign = supporter.campaign as any;
  const reward = supporter.reward as any;

  return (
    <main className="relative overflow-hidden min-h-screen">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-purple-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-spin-slow" />
      </div>

      <div className="container py-6 md:py-10 relative">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">支援完了しました！</h1>
            <p className="text-muted-foreground">
              プロジェクトへの支援ありがとうございました。
            </p>
          </div>

          <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                支援内容
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{campaign.title}</h3>
                <p className="text-sm text-muted-foreground">
                  by {campaign.channel.name}
                </p>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">選択した特典</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{reward.title}</p>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">
                        {formatAmountForDisplay(supporter.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>支援日時:</strong> {new Date(supporter.created_at).toLocaleString('ja-JP')}
                </p>
                {session_id && (
                  <p className="text-sm text-muted-foreground">
                    <strong>決済ID:</strong> {session_id}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg mb-8">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">今後について</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• プロジェクトの進捗はプロジェクト詳細ページで確認できます</li>
                <li>• 特典の配送時期については、プロジェクト運営者からご連絡いたします</li>
                <li>• ご質問等がございましたら、プロジェクト詳細ページからお問い合わせください</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-4">
            <Button asChild variant="outline">
              <Link href="/crowdfunding">
                他のプロジェクトを見る
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/crowdfunding/${id}`}>
                プロジェクト詳細に戻る
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
