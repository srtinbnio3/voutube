import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // 認証チェック
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, scheduledPublishAt } = body;

    // アクションの検証
    if (!['publish_now', 'schedule_publish', 'cancel_schedule'].includes(action)) {
      return NextResponse.json({ error: "無効なアクションです" }, { status: 400 });
    }

    // キャンペーンの存在確認と所有者チェック
    const { data: campaign, error: campaignError } = await supabase
      .from("crowdfunding_campaigns")
      .select(`
        id,
        status,
        title,
        channel:channels!inner(id, owner_user_id)
      `)
      .eq("id", id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "キャンペーンが見つかりません" }, { status: 404 });
    }

    // 所有者確認（型アサーション付き）
    const channelData = campaign.channel as unknown as { id: string; owner_user_id: string };
    if (channelData.owner_user_id !== user.id) {
      return NextResponse.json({ error: "このプロジェクトの操作権限がありません" }, { status: 403 });
    }

    // ステータス確認（approved または scheduled のみ操作可能）
    if (!['approved', 'scheduled'].includes(campaign.status)) {
      return NextResponse.json({ 
        error: "承認済みまたは公開予約中のプロジェクトのみ操作できます" 
      }, { status: 400 });
    }

    let updateData: any = {
      updated_at: new Date().toISOString()
    };

    switch (action) {
      case 'publish_now':
        // 即座に公開
        updateData.status = 'active';
        updateData.published_at = new Date().toISOString();
        updateData.scheduled_publish_at = null; // 予約があった場合はクリア
        break;

      case 'schedule_publish':
        // 公開予約
        if (!scheduledPublishAt) {
          return NextResponse.json({ error: "公開予約日時が必要です" }, { status: 400 });
        }

        const scheduleDate = new Date(scheduledPublishAt);
        const now = new Date();

        if (scheduleDate <= now) {
          return NextResponse.json({ error: "公開予約日時は現在時刻より後である必要があります" }, { status: 400 });
        }

        updateData.status = 'scheduled';
        updateData.scheduled_publish_at = scheduleDate.toISOString();
        updateData.auto_publish_enabled = true;
        break;

      case 'cancel_schedule':
        // 公開予約をキャンセル
        if (campaign.status !== 'scheduled') {
          return NextResponse.json({ error: "公開予約中のプロジェクトのみキャンセルできます" }, { status: 400 });
        }
        updateData.status = 'approved';
        updateData.scheduled_publish_at = null;
        updateData.auto_publish_enabled = false;
        break;
    }

    // データ更新
    const { data: updatedCampaign, error: updateError } = await supabase
      .from("crowdfunding_campaigns")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("キャンペーン公開設定更新エラー:", updateError);
      return NextResponse.json({ error: "公開設定の更新に失敗しました" }, { status: 500 });
    }

    // 成功メッセージ
    let message = "";
    switch (action) {
      case 'publish_now':
        message = "プロジェクトを公開しました";
        break;
      case 'schedule_publish':
        message = `プロジェクトの公開を${new Date(scheduledPublishAt).toLocaleString('ja-JP')}に予約しました`;
        break;
      case 'cancel_schedule':
        message = "公開予約をキャンセルしました";
        break;
    }

    // ログ出力
    console.log(`キャンペーン ${id} の公開設定が変更されました`, {
      action,
      userId: user.id,
      campaignTitle: campaign.title,
      newStatus: updateData.status,
      scheduledPublishAt: updateData.scheduled_publish_at,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      message,
      campaign: updatedCampaign
    });

  } catch (error) {
    console.error("公開制御API エラー:", error);
    return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
  }
}
