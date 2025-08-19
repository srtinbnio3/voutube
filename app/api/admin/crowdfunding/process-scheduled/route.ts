import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// サービスロール用のSupabaseクライアントを作成（RLS回避）
const createServiceRoleClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

// 公開予約処理API - 定期実行用
export async function POST(req: NextRequest) {
  // セキュリティ: 内部からのリクエストのみ許可
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET_TOKEN;
  
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  try {
    console.log("🕒 公開予約処理開始:", new Date().toISOString());

    // 公開予約時刻を過ぎたプロジェクトを取得
    const { data: scheduledCampaigns, error: fetchError } = await supabase
      .from("crowdfunding_campaigns")
      .select("id, title, scheduled_publish_at")
      .eq("status", "scheduled")
      .eq("auto_publish_enabled", true)
      .lte("scheduled_publish_at", new Date().toISOString());

    if (fetchError) {
      console.error("公開予約キャンペーン取得エラー:", fetchError);
      return NextResponse.json({ error: "データ取得に失敗しました" }, { status: 500 });
    }

    if (!scheduledCampaigns || scheduledCampaigns.length === 0) {
      console.log("✅ 公開予約処理完了: 処理対象なし");
      return NextResponse.json({ 
        message: "処理対象のキャンペーンがありません",
        processed: 0
      });
    }

    // 対象キャンペーンを公開状態に変更
    const campaignIds = scheduledCampaigns.map(c => c.id);
    const { data: updatedCampaigns, error: updateError } = await supabase
      .from("crowdfunding_campaigns")
      .update({
        status: 'active',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .in("id", campaignIds)
      .select("id, title, published_at");

    if (updateError) {
      console.error("キャンペーン公開更新エラー:", updateError);
      return NextResponse.json({ error: "公開状態の更新に失敗しました" }, { status: 500 });
    }

    // 処理結果をログ出力
    console.log("✅ 公開予約処理完了:", {
      processedCount: updatedCampaigns?.length || 0,
      campaigns: updatedCampaigns?.map(c => ({
        id: c.id,
        title: c.title,
        publishedAt: c.published_at
      })),
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      message: `${updatedCampaigns?.length || 0}件のキャンペーンを公開しました`,
      processed: updatedCampaigns?.length || 0,
      campaigns: updatedCampaigns
    });

  } catch (error) {
    console.error("公開予約処理API エラー:", error);
    return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
  }
}

// 手動実行用のGETエンドポイント（開発時のテスト用）
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: "本番環境では無効です" }, { status: 403 });
  }

  // 開発環境ではPOSTと同じ処理を実行
  const postRequest = new NextRequest(req.url, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${process.env.CRON_SECRET_TOKEN}`,
      'content-type': 'application/json'
    }
  });

  return POST(postRequest);
}
