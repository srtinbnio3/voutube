'use client'

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  Download,
  MessageSquare,
  Filter,
  Calendar,
  Users,
  TrendingUp,
  Eye,
  MoreVertical,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { formatAmountForDisplay } from "@/app/lib/stripe";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SupportersManagementProps {
  userId: string;
}

interface Supporter {
  id: string;
  amount: number;
  payment_status: string;
  created_at: string;
  campaign: {
    id: string;
    title: string;
  };
  reward: {
    id: string;
    title: string;
  } | null;
  user: {
    id: string;
    username: string;
    user_handle: string;
  };
}

interface SupporterStats {
  total: number;
  completed: number;
  pending: number;
  totalAmount: number;
}

// 支援者管理コンポーネント
export function SupportersManagement({ userId }: SupportersManagementProps) {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [stats, setStats] = useState<SupporterStats>({
    total: 0,
    completed: 0,
    pending: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [projects, setProjects] = useState<Array<{id: string, title: string}>>([]);

  const supabase = createClient();

  // 支援者データの取得
  useEffect(() => {
    fetchSupporters();
  }, [userId]);

  const fetchSupporters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ユーザーのプロジェクトに対する支援者データを取得
      const { data: supportersData, error: supportersError } = await supabase
        .from('crowdfunding_supporters')
        .select(`
          *,
          campaign:crowdfunding_campaigns!inner(
            id,
            title,
            channel:channels!inner(owner_user_id)
          ),
          reward:crowdfunding_rewards(id, title),
          user:profiles(id, username, user_handle)
        `)
        .eq('campaign.channel.owner_user_id', userId)
        .order('created_at', { ascending: false });

      if (supportersError) {
        throw new Error(supportersError.message);
      }

      const supporters = supportersData || [];
      setSupporters(supporters);
      
      // 統計の計算
      const total = supporters.length;
      const completed = supporters.filter(s => s.payment_status === 'completed').length;
      const pending = supporters.filter(s => s.payment_status === 'pending').length;
      const totalAmount = supporters
        .filter(s => s.payment_status === 'completed')
        .reduce((sum, s) => sum + s.amount, 0);
      
      setStats({ total, completed, pending, totalAmount });

      // プロジェクト一覧を取得（フィルタ用）
      const uniqueProjects = Array.from(
        new Map(supporters.map(s => [s.campaign.id, s.campaign])).values()
      );
      setProjects(uniqueProjects);

    } catch (error) {
      console.error('Error fetching supporters:', error);
      setError('支援者データの取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // フィルタリング済みの支援者データ
  const filteredSupporters = supporters.filter(supporter => {
    const matchesSearch = searchTerm === '' || 
      supporter.campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supporter.user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || supporter.payment_status === statusFilter;
    const matchesProject = projectFilter === 'all' || supporter.campaign.id === projectFilter;
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  // CSV出力関数
  const exportToCSV = () => {
    const csvData = filteredSupporters.map(supporter => ({
      '支援日': new Date(supporter.created_at).toLocaleDateString('ja-JP'),
      'プロジェクト名': supporter.campaign.title,
      '支援者': supporter.user.username,
      '支援金額': supporter.amount,
      'リターン': supporter.reward?.title || 'なし',
      'ステータス': supporter.payment_status
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'supporters.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ステータスラベルの関数
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">完了</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">処理中</Badge>;
      case 'failed':
        return <Badge variant="destructive">失敗</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <Card className="p-8 text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-muted-foreground">支援者データを読み込み中...</p>
        </Card>
      </div>
    );
  }

  if (error) {
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
              {error}
            </p>
            <Button 
              onClick={fetchSupporters} 
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

  return (
    <div className="p-4 lg:p-8">
      {/* ヘッダー部分 */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              支援者管理
            </h1>
            <p className="text-muted-foreground">
              プロジェクトの支援者情報を管理できます
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportToCSV} disabled={filteredSupporters.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              CSVエクスポート
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <MessageSquare className="h-4 w-4 mr-2" />
              一斉メッセージ
            </Button>
          </div>
        </div>
        
        {/* 統計カード */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card className="p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
                <p className="text-sm text-muted-foreground">総支援者</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">完了</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">処理中</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatAmountForDisplay(stats.totalAmount)}
                </p>
                <p className="text-sm text-muted-foreground">総支援額</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* フィルター部分 */}
      <Card className="p-6 mb-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="プロジェクト名・支援者名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="ステータスでフィルタ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのステータス</SelectItem>
              <SelectItem value="completed">完了</SelectItem>
              <SelectItem value="pending">処理中</SelectItem>
              <SelectItem value="failed">失敗</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger>
              <SelectValue placeholder="プロジェクトでフィルタ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのプロジェクト</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* 支援者一覧 */}
      {filteredSupporters.length === 0 ? (
        <Card className="p-12 text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              支援者が見つかりません
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || projectFilter !== 'all' 
                ? 'フィルター条件に一致する支援者がありません。検索条件を変更してみてください。'
                : 'まだ支援者がいません。プロジェクトが承認されて公開されると、支援者が表示されます。'
              }
            </p>
          </div>
        </Card>
      ) : (
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    支援日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    プロジェクト
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    支援者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    リターン
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSupporters.map((supporter) => (
                  <tr key={supporter.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {new Date(supporter.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div className="max-w-xs truncate">
                        {supporter.campaign.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {supporter.user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatAmountForDisplay(supporter.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div className="max-w-xs truncate">
                        {supporter.reward?.title || 'なし'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(supporter.payment_status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
} 