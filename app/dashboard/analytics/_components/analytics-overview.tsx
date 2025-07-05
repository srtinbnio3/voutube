import { createClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp,
  Users,
  Target,
  DollarSign,
  BarChart3,
  AlertTriangle,
  AlertCircle,
  Activity
} from "lucide-react";
import { formatAmountForDisplay } from "@/app/lib/stripe";

interface AnalyticsOverviewProps {
  userId: string;
}

interface Supporter {
  id: string;
  amount: number;
  payment_status: string;
  created_at: string;
}

// 分析・統計コンポーネント
export async function AnalyticsOverview({ userId }: AnalyticsOverviewProps) {
  const supabase = await createClient();
  
  try {
    // ユーザーのプロジェクトデータを取得
    const { data: projects, error: projectsError } = await supabase
      .from("crowdfunding_campaigns")
      .select(`
        *,
        channel:channels!inner(id, name, owner_user_id),
        supporters:crowdfunding_supporters(id, amount, payment_status, created_at)
      `)
      .eq("channel.owner_user_id", userId)
      .order("created_at", { ascending: false });

    if (projectsError) {
      throw new Error(projectsError.message);
    }

    // データが存在しない場合
    if (!projects || projects.length === 0) {
      return (
        <div className="p-4 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              分析・統計
            </h1>
            <p className="text-muted-foreground">
              プロジェクトのパフォーマンスを分析できます
            </p>
          </div>
          
          <Card className="p-12 text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                分析データがありません
              </h3>
              <p className="text-muted-foreground">
                プロジェクトを作成すると、ここに詳細な分析データが表示されます。
              </p>
            </div>
          </Card>
        </div>
      );
    }

    // 統計データの計算
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalRaised = projects.reduce((sum, p) => sum + (p.current_amount || 0), 0);
    const totalTarget = projects.reduce((sum, p) => sum + p.target_amount, 0);
    const averageSuccess = totalTarget > 0 ? (totalRaised / totalTarget) * 100 : 0;

    // 支援者データの集計
    const allSupporters = projects.flatMap(p => p.supporters || []) as Supporter[];
    const completedSupporters = allSupporters.filter((s: Supporter) => s.payment_status === 'completed');
    const totalSupporters = completedSupporters.length;
    const averageSupport = totalSupporters > 0 ? totalRaised / totalSupporters : 0;

    // 月別データの計算（過去6ヶ月）
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7); // YYYY-MM format
      
      const monthSupports = completedSupporters.filter((s: Supporter) => 
        s.created_at.startsWith(monthStr)
      );
      
      monthlyData.push({
        month: date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' }),
        amount: monthSupports.reduce((sum, s) => sum + s.amount, 0),
        count: monthSupports.length
      });
    }

    // トップパフォーマーの算出
    const projectPerformance = projects.map(p => {
      const projectSupporters = (p.supporters || []).filter((s: Supporter) => s.payment_status === 'completed');
      const raised = p.current_amount || 0;
      const successRate = p.target_amount > 0 ? (raised / p.target_amount) * 100 : 0;
      
      return {
        title: p.title,
        raised,
        successRate,
        supporterCount: projectSupporters.length,
        status: p.status
      };
    }).sort((a, b) => b.successRate - a.successRate);

    return (
      <div className="p-4 lg:p-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            分析・統計
          </h1>
          <p className="text-muted-foreground">
            プロジェクトのパフォーマンスを詳しく分析できます
          </p>
        </div>

        {/* 概要統計 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{averageSuccess.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">平均達成率</p>
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
                <DollarSign className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatAmountForDisplay(averageSupport)}
                </p>
                <p className="text-sm text-muted-foreground">平均支援額</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 月別トレンド */}
          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">月別支援トレンド</h3>
            <div className="space-y-3">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{data.month}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{data.count}件</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatAmountForDisplay(data.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* プロジェクト成績 */}
          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">プロジェクト成績</h3>
            <div className="space-y-4">
              {projectPerformance.slice(0, 5).map((project, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-3 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {project.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={project.status === 'active' ? 'default' : 'outline'} className="text-xs">
                          {project.status === 'active' ? '実行中' : 
                           project.status === 'completed' ? '終了' : 
                           project.status === 'draft' ? '下書き' : project.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {project.supporterCount}人の支援者
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {project.successRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatAmountForDisplay(project.raised)}
                      </div>
                    </div>
                  </div>
                  {/* 進捗バー */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(project.successRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 詳細インサイト */}
        <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            <Activity className="h-5 w-5 inline mr-2" />
            インサイト
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">プロジェクト状況</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">実行中プロジェクト:</span>
                  <span className="font-medium">{activeProjects}件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">完了プロジェクト:</span>
                  <span className="font-medium">{completedProjects}件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">総調達金額:</span>
                  <span className="font-medium">{formatAmountForDisplay(totalRaised)}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">支援者統計</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">総支援者数:</span>
                  <span className="font-medium">{totalSupporters}人</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">平均支援額:</span>
                  <span className="font-medium">{formatAmountForDisplay(averageSupport)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">プロジェクト当たり平均支援者:</span>
                  <span className="font-medium">
                    {totalProjects > 0 ? (totalSupporters / totalProjects).toFixed(1) : '0'}人
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );

  } catch (error) {
    console.error("Error fetching analytics:", error);
    return (
      <div className="p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            分析・統計
          </h1>
          <p className="text-muted-foreground">
            プロジェクトのパフォーマンスを分析できます
          </p>
        </div>
        
        <Card className="p-8 text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              データの取得中にエラーが発生しました
            </h3>
            <p className="text-muted-foreground mb-6">
              分析データを読み込めませんでした。しばらく時間をおいて再度お試しください。
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              再試行
            </button>
          </div>
        </Card>
      </div>
    );
  }
} 