import { NextRequest, NextResponse } from "next/server";

/**
 * 支店検索API
 * 銀行くんAPI（https://bank.teraren.com/）を使用
 * パラメータ:
 * - bank_code: 銀行コード（4桁）
 * クエリパラメータ:
 * - q: 検索クエリ（支店名の一部）
 * - limit: 結果の最大件数（デフォルト: 20）
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bank_code: string }> }
) {
  const resolvedParams = await params;
  const { bank_code } = resolvedParams;
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toLowerCase() || "";
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    // 銀行の存在確認
    const bankResponse = await fetch(`https://bank.teraren.com/banks/${bank_code}.json`);
    
    if (!bankResponse.ok) {
      return NextResponse.json({
        error: "指定された銀行コードの情報が見つかりません"
      }, { status: 404 });
    }

    // 銀行くんAPIから全支店データを一度に取得（per=10000で全支店を取得）
    const branchResponse = await fetch(
      `https://bank.teraren.com/banks/${bank_code}/branches.json?per=10000`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'voutube-app/1.0'
        },
        // キャッシュを30分保持
        next: { revalidate: 1800 }
      }
    );

    if (!branchResponse.ok) {
      throw new Error(`支店API error: ${branchResponse.status}`);
    }

    const allBranches = await branchResponse.json();

    // 検索フィルタリング
    let filteredBranches = allBranches;

    if (query.trim()) {
      filteredBranches = allBranches.filter((branch: any) => {
        return (
          branch.name?.toLowerCase().includes(query) ||
          branch.normalize?.name?.toLowerCase().includes(query) ||
          branch.normalize?.hira?.includes(query) ||
          branch.normalize?.kana?.toLowerCase().includes(query) ||
          branch.hira?.includes(query) ||
          branch.kana?.toLowerCase().includes(query)
        );
      });
    }

    // 結果を制限し、データ形式を整理
    const limitedResults = filteredBranches
      .slice(0, limit)
      .map((branch: any) => ({
        code: branch.code,
        name: branch.normalize?.name || branch.name,
        hiragana: branch.normalize?.hira || branch.hira || "",
        katakana: branch.normalize?.kana || branch.kana || "",
      }));

    return NextResponse.json({
      bank_code,
      branches: limitedResults,
      total: filteredBranches.length,
      source: "bank.teraren.com"
    });
  } catch (error) {
    console.error("支店検索エラー:", error);
    return NextResponse.json(
      { error: "支店検索中にエラーが発生しました" },
      { status: 500 }
    );
  }
} 