import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Calendar,
  Target,
  Users,
  TrendingUp,
  Eye,
  Edit,
  MoreVertical,
  AlertCircle
} from "lucide-react";
import { formatAmountForDisplay } from "@/app/lib/stripe";

interface ProjectOverviewProps {
  userId: string;
}

// プロジェクト概要コンポーネント - ユーザーのクラウドファンディングプロジェクトを表示
export async function ProjectOverview({ userId }: ProjectOverviewProps) {
  const supabase = await createClient();
  
  // ユーザーのプロジェクト一覧を取得
  const { data: projects, error } = await supabase
    .from("crowdfunding_campaigns")
    .select(`
      *,
      channel:channels!inner(id, name, icon_url, youtube_channel_id),
      post:posts(id, title),
      supporters:crowdfunding_supporters(id, amount, payment_status)
    `)
    .eq("channel.owner_user_id", userId) // 正しいフィールド名を使用
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching projects:", error);
    return (
      <div className="p-4 lg:p-8">
        <Card className="p-8 text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              データの取得中にエラーが発生しました
            </h3>
            <p className="text-muted-foreground mb-6">
              プロジェクト情報を読み込めませんでした。しばらく時間をおいて再度お試しください。
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              再試行
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 統計の計算
  const totalProjects = projects?.length || 0;
  const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
  const totalRaised = projects?.reduce((sum, p) => sum + (p.current_amount || 0), 0) || 0;
  const totalSupporters = projects?.reduce((sum, p) => {
    const supporterCount = p.supporters?.filter((s: any) => s.payment_status === 'completed').length || 0;
    return sum + supporterCount;
  }, 0) || 0;

  // ステータスラベルの関数
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return { label: '下書き', variant: 'secondary' as const };
      case 'under_review': return { label: '審査中', variant: 'default' as const };
      case 'active': return { label: '実行中', variant: 'default' as const };
      case 'completed': return { label: '終了', variant: 'outline' as const };
      case 'rejected': return { label: '審査否認', variant: 'destructive' as const };
      default: return { label: status, variant: 'secondary' as const };
    }
  };

  // 進捗率の計算
  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="p-4 lg:p-8">
      {/* ヘッダー部分 */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              プロジェクト
            </h1>
            <p className="text-muted-foreground">
              あなたのクラウドファンディングプロジェクトを管理しましょう
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 self-start lg:self-auto">
            <Link href="/channels">
              <Plus className="h-4 w-4 mr-2" />
              新規作成は投稿から
            </Link>
          </Button>
        </div>
        
        {/* 統計カード */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card className="p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalProjects}</p>
                <p className="text-sm text-muted-foreground">総プロジェクト</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeProjects}</p>
                <p className="text-sm text-muted-foreground">実行中</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalSupporters}</p>
                <p className="text-sm text-muted-foreground">総支援者</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Target className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatAmountForDisplay(totalRaised)}
                </p>
                <p className="text-sm text-muted-foreground">総調達額</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* プロジェクト一覧 */}
      {!projects || projects.length === 0 ? (
        <Card className="p-12 text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                プロジェクトが見つかりません
              </h3>
              <p className="text-muted-foreground mb-6">
                まだクラウドファンディングプロジェクトがありません。<br />
                チャンネルの投稿詳細ページから「クラウドファンディング開始」ボタンを押して、
                あなたの企画を実現させましょう。
              </p>
            </div>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Link href="/channels">
                チャンネル一覧へ
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const status = getStatusLabel(project.status);
            const progress = getProgress(project.current_amount || 0, project.target_amount);
            const supporterCount = project.supporters?.filter((s: any) => s.payment_status === 'completed').length || 0;
            const daysLeft = Math.max(0, Math.ceil((new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            
            return (
              <Card key={project.id} className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* プロジェクト画像プレースホルダー */}
                  <div className="lg:w-48 lg:h-32 w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">プロジェクト画像</span>
                  </div>
                  
                  {/* プロジェクト詳細 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={status.variant}>{status.label}</Badge>
                          {project.status === 'active' && (
                            <span className="text-xs text-muted-foreground">
                              残り{daysLeft}日
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                          {project.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          チャンネル: {project.channel?.name || 'チャンネル名なし'}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/crowdfunding/${project.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/crowdfunding/${project.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                    
                    {/* 進捗バー */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>進捗</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* 統計情報 */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">目標金額</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatAmountForDisplay(project.target_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">調達金額</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatAmountForDisplay(project.current_amount || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">支援者数</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {supporterCount}人
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 