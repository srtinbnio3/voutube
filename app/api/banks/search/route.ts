import { NextRequest, NextResponse } from "next/server";

/**
 * 銀行検索API
 * 銀行くんAPI（https://bank.teraren.com/）を使用
 * クエリパラメータ:
 * - q: 検索クエリ（銀行名の一部）
 * - limit: 結果の最大件数（デフォルト: 10）
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "10");

  // 空のクエリの場合は空の結果を返す
  if (!query.trim()) {
    return NextResponse.json({ banks: [] });
  }

  try {
    // 銀行くんAPIから全銀行リストを取得（per=10000で全銀行を一度に取得）
    const response = await fetch("https://bank.teraren.com/banks.json?per=10000", {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'voutube-app/1.0'
      },
      // キャッシュを1時間保持
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`銀行くんAPI error: ${response.status}`);
    }

    const banks = await response.json();

    // クライアントサイドで検索フィルタリング
    const filteredBanks = banks
      .filter((bank: any) => {
        const searchLower = query.toLowerCase();
        return (
          bank.name?.toLowerCase().includes(searchLower) ||
          bank.normalize?.name?.toLowerCase().includes(searchLower) ||
          bank.normalize?.hira?.includes(searchLower) ||
          bank.normalize?.kana?.toLowerCase().includes(searchLower) ||
          bank.hira?.includes(searchLower) ||
          bank.kana?.toLowerCase().includes(searchLower)
        );
      })
      .slice(0, limit)
      .map((bank: any) => ({
        code: bank.code,
        name: bank.normalize?.name || bank.name,
        hiragana: bank.normalize?.hira || bank.hira || "",
        katakana: bank.normalize?.kana || bank.kana || "",
      }));

    return NextResponse.json({
      banks: filteredBanks,
      total: filteredBanks.length,
      source: "bank.teraren.com"
    });
  } catch (error) {
    console.error("銀行検索エラー:", error);
    
    // フォールバック: 主要銀行のハードコードデータ（福岡銀行を含む）
    const fallbackBanks = [
      { code: "0001", name: "みずほ銀行", hiragana: "みずほぎんこう", katakana: "ミズホギンコウ" },
      { code: "0005", name: "三菱UFJ銀行", hiragana: "みつびしゆーえふじぇいぎんこう", katakana: "ミツビシユーエフジェイギンコウ" },
      { code: "0009", name: "三井住友銀行", hiragana: "みついすみともぎんこう", katakana: "ミツイスミトモギンコウ" },
      { code: "0177", name: "福岡銀行", hiragana: "ふくおかぎんこう", katakana: "フクオカギンコウ" },
      { code: "0178", name: "筑邦銀行", hiragana: "ちくほうぎんこう", katakana: "チクホウギンコウ" },
      { code: "0179", name: "佐賀銀行", hiragana: "さがぎんこう", katakana: "サガギンコウ" },
      { code: "0181", name: "十八親和銀行", hiragana: "じゅうはちしんわぎんこう", katakana: "ジュウハチシンワギンコウ" },
      { code: "0182", name: "肥後銀行", hiragana: "ひごぎんこう", katakana: "ヒゴギンコウ" },
      { code: "0183", name: "大分銀行", hiragana: "おおいたぎんこう", katakana: "オオイタギンコウ" },
      { code: "0184", name: "宮崎銀行", hiragana: "みやざきぎんこう", katakana: "ミヤザキギンコウ" },
      { code: "0185", name: "鹿児島銀行", hiragana: "かごしまぎんこう", katakana: "カゴシマギンコウ" },
      { code: "0187", name: "琉球銀行", hiragana: "りゅうきゅうぎんこう", katakana: "リュウキュウギンコウ" },
      { code: "0188", name: "沖縄銀行", hiragana: "おきなわぎんこう", katakana: "オキナワギンコウ" }
    ];

    const filteredFallback = fallbackBanks
      .filter(bank => {
        const searchLower = query.toLowerCase();
        return (
          bank.name.toLowerCase().includes(searchLower) ||
          bank.hiragana.includes(searchLower) ||
          bank.katakana.toLowerCase().includes(searchLower)
        );
      })
      .slice(0, limit);

    return NextResponse.json({
      banks: filteredFallback,
      total: filteredFallback.length,
      source: "fallback",
      error: "Primary API unavailable, using fallback data"
    });
  }
} 