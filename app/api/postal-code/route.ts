import { NextRequest, NextResponse } from "next/server";

/**
 * 郵便番号検索API
 * CORS対応の日本郵便サードパーティAPI（https://digital-address.app/）を使用
 * クエリパラメータ:
 * - zip: 郵便番号（7桁、ハイフンあり・なし両対応）
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const zipCode = searchParams.get("zip") || "";

  // 空のクエリの場合は空の結果を返す
  if (!zipCode.trim()) {
    return NextResponse.json({ 
      error: "郵便番号を入力してください",
      address: null 
    });
  }

  // 郵便番号の正規化（ハイフンを除去し、7桁にする）
  const normalizedZip = zipCode.replace(/[^0-9]/g, '');
  
  // 郵便番号の形式チェック（7桁）
  if (normalizedZip.length !== 7) {
    return NextResponse.json({ 
      error: "郵便番号は7桁で入力してください",
      address: null 
    });
  }

  try {
    // CORS対応版日本郵便APIから住所情報を取得
    const response = await fetch(`https://digital-address.app/${normalizedZip}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'voutube-app/1.0'
      },
      // キャッシュを1時間保持
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      // 404の場合は該当なし、それ以外はエラー
      if (response.status === 404) {
        return NextResponse.json({
          error: "該当する住所が見つかりません",
          address: null
        });
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // レスポンスデータの整形
    if (data.addresses && data.addresses.length > 0) {
      const addr = data.addresses[0];
      
      return NextResponse.json({
        success: true,
        address: {
          zip_code: addr.zip_code || zipCode,
          prefecture: addr.pref_name || "",
          city: addr.city_name || "", 
          town: addr.town_name || "",
          // 都道府県 + 市区町村 + 町域の組み合わせ
          formatted_address: `${addr.pref_name || ""}${addr.city_name || ""}${addr.town_name || ""}`,
          // 完全な住所（番地などを含む場合）
          full_address: addr.address || `${addr.pref_name || ""}${addr.city_name || ""}${addr.town_name || ""}`
        },
        source: "digital-address.app"
      });
    } else {
      return NextResponse.json({
        error: "該当する住所が見つかりません",
        address: null
      });
    }
  } catch (error) {
    console.error("郵便番号検索エラー:", error);
    
    return NextResponse.json({
      error: "郵便番号検索中にエラーが発生しました",
      address: null
    }, { status: 500 });
  }
} 