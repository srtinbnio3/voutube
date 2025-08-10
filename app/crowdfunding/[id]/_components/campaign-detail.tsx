import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { formatAmountForDisplay } from "@/app/lib/stripe";
import { CampaignProgress } from "../../_components/campaign-progress";
import { CampaignRewardList } from "./campaign-reward-list";
import { SupportButton } from "./support-button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, Edit } from "lucide-react";
import { checkAdminPermission } from "@/app/lib/admin-auth";

interface CampaignDetailProps {
  id: string;
}

// キャンペーン詳細コンポーネント
export async function CampaignDetail({ id }: CampaignDetailProps) {
  const supabase = await createClient();
  
  // 管理者権限をチェック
  const adminCheck = await checkAdminPermission();
  
  // キャンペーン詳細を取得
  const { data: campaign, error } = await supabase
    .from("crowdfunding_campaigns")
    .select(`
      *,
      channel:channels(*),
      post:posts(id, title)
    `)
    .eq("id", id)
    .single();
  
  if (error || !campaign) {
    return <div>キャンペーンの取得中にエラーが発生しました。</div>;
  }

  // アクティブでないキャンペーンの場合は表示を制限（管理者は除く）
  const isPubliclyVisible = campaign.status === 'active' || campaign.status === 'completed';
  const canViewAsAdmin = adminCheck.isAdmin && (campaign.status === 'under_review' || campaign.status === 'draft');
  
  if (!isPubliclyVisible && !canViewAsAdmin) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            このプロジェクトは現在公開されていません
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {campaign.status === 'draft' && 'プロジェクトは編集中です'}
            {campaign.status === 'under_review' && 'プロジェクトは運営チームによる確認中です'}
            {campaign.status === 'rejected' && 'プロジェクトは修正が必要な状態です'}
            {campaign.status === 'cancelled' && 'プロジェクトはキャンセルされました'}
          </p>
        </div>
      </div>
    );
  }
  
  // 関連する特典を取得
  const { data: rewards } = await supabase
    .from("crowdfunding_rewards")
    .select("*")
    .eq("campaign_id", id)
    .order("amount", { ascending: true });
  
  // 支援者数を取得
  const { count: supportersCount } = await supabase
    .from("crowdfunding_supporters")
    .select("*", { count: "exact", head: true })
    .eq("campaign_id", id);
  
  // 残り日数を計算
  const endDate = new Date(campaign.end_date);
  const today = new Date();
  const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  // 進捗率を計算（最大100%）
  const progress = Math.min(100, Math.round((campaign.current_amount / campaign.target_amount) * 100));
  
  // チャンネルアイコンのURLまたはデフォルト
  const iconUrl = campaign.channel.icon_url || "https://placehold.co/64x64?text=Ch";
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* メインコンテンツ（左側2/3） */}
      <div className="lg:col-span-2">
        <div>
          <Link 
            href="/crowdfunding"
            className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block"
          >
            ← クラウドファンディング一覧に戻る
          </Link>
          
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold">{campaign.title}</h1>
            <div className="flex gap-2">
              {campaign.status === 'active' && (
                <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-3 w-3" />
                  公開中
                </Badge>
              )}
              {campaign.status === 'completed' && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  完了
                </Badge>
              )}
              {adminCheck.isAdmin && campaign.status === 'under_review' && (
                <Badge variant="destructive" className="gap-1 bg-orange-600 hover:bg-orange-700">
                  <Clock className="h-3 w-3" />
                  審査中（管理者表示）
                </Badge>
              )}
              {adminCheck.isAdmin && campaign.status === 'draft' && (
                <Badge variant="secondary" className="gap-1">
                  <Edit className="h-3 w-3" />
                  下書き（管理者表示）
                </Badge>
              )}
            </div>
          </div>
          
          {/* チャンネル情報 */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={iconUrl}
                alt={campaign.channel.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div>
              <Link
                href={`/channels/${campaign.channel.id}`}
                className="font-medium hover:text-primary"
              >
                {campaign.channel.name}
              </Link>
              <div className="text-sm text-muted-foreground">
                チャンネル登録者: {campaign.channel.subscriber_count?.toLocaleString() || "非公開"}
              </div>
            </div>
          </div>
          
          {/* プロジェクト画像 */}
          <div className="relative bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 aspect-video mb-6 rounded-lg overflow-hidden border">
            {campaign.main_image ? (
              <Image
                src={campaign.main_image}
                alt={`${campaign.title}のメイン画像`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-lg shadow-sm backdrop-blur-sm">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-center font-medium">{campaign.title}</p>
                  <p className="text-center text-sm mt-2">プロジェクト画像</p>
                </div>
              </div>
            )}
          </div>
          
          {/* 投稿内容リンク */}
          <div className="mb-6 p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-medium mb-2">元の投稿</h3>
            <Link
              href={`/channels/${campaign.channel.id}/posts/${campaign.post.id}`}
              className="text-primary hover:underline"
            >
              {campaign.post.title}
            </Link>
          </div>
          
          {/* プロジェクト説明 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
              プロジェクトについて
            </h2>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {campaign.description.split("\n").map((paragraph: string, index: number) => (
                <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 last:mb-0">
                  {paragraph || '\u00A0'}
                </p>
              ))}
            </div>
            
            {/* ストーリー追加部分（将来的に使用） */}
            {campaign.story && (
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3 text-purple-900 dark:text-purple-100">プロジェクトストーリー</h3>
                <div className="prose max-w-none dark:prose-invert">
                  {campaign.story.split("\n").map((paragraph: string, index: number) => (
                    <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 last:mb-0">
                      {paragraph || '\u00A0'}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* サイドバー（右側1/3） */}
      <div className="lg:col-span-1">
        <div className="sticky top-4 border rounded-lg p-6 shadow-sm">
          {/* 進捗状況 */}
          <CampaignProgress progress={progress} />
          
          <div className="mt-4 mb-6">
            <div className="text-2xl font-bold">
              {formatAmountForDisplay(campaign.current_amount)}
            </div>
            <div className="text-muted-foreground">
              目標: {formatAmountForDisplay(campaign.target_amount)}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <div className="font-semibold text-lg">{supportersCount}</div>
              <div className="text-muted-foreground">支援者</div>
            </div>
            
            <div>
              <div className="font-semibold text-lg">
                {campaign.status === "active" ? `${remainingDays}日` : "終了"}
              </div>
              <div className="text-muted-foreground">
                {campaign.status === "active" ? "残り" : "キャンペーン"}
              </div>
            </div>
          </div>
          
          {/* 支援ボタン */}
          {campaign.status === "active" && (
            <SupportButton campaignId={id} />
          )}
          
          {campaign.status !== "active" && (
            <div className="p-4 text-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="mb-2">
                {campaign.status === "completed" && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    プロジェクト完了
                  </div>
                )}
                {campaign.status === "under_review" && adminCheck.isAdmin && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    審査待ち
                  </div>
                )}
                {campaign.status === "draft" && adminCheck.isAdmin && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-sm font-medium">
                    <Edit className="h-4 w-4" />
                    下書き
                  </div>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                {campaign.status === "completed" && "このプロジェクトは目標を達成して終了しました"}
                {campaign.status === "under_review" && "運営チームによる確認中です"}
                {campaign.status === "draft" && "プロジェクトは編集中です"}
                {campaign.status === "cancelled" && "このプロジェクトはキャンセルされました"}
                {campaign.status === "rejected" && "このプロジェクトは修正が必要です"}
              </p>
            </div>
          )}
          
          {/* 管理者向けアクションパネル */}
          {adminCheck.isAdmin && (campaign.status === 'under_review' || campaign.status === 'draft') && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                管理者機能
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  このプロジェクトは{campaign.status === 'under_review' ? '審査待ち' : '下書き'}状態です。
                </p>
                <div className="flex gap-2 pt-2">
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    管理画面で処理
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* リワード一覧 */}
        {rewards && rewards.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">特典一覧</h3>
            <CampaignRewardList 
              rewards={rewards}
              campaignId={id}
              campaignStatus={campaign.status}
            />
          </div>
        )}
      </div>
    </div>
  );
} 