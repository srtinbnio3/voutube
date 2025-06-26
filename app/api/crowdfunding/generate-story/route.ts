import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()

    // 必須パラメータのチェック
    if (!description) {
      return NextResponse.json(
        { error: 'プロジェクト概要が必要です' },
        { status: 400 }
      )
    }

    // Google AI Studio API キーの確認
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API設定エラー' },
        { status: 500 }
      )
    }

    // Gemini API へのリクエスト
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `以下のプロジェクト概要を基に、クラウドファンディングプロジェクトの魅力的なストーリー・詳細説明を生成してください。

プロジェクト概要：
${description}

要件：
- 800-1500文字程度
- プロジェクトの背景・動機を含める
- 支援者にとっての価値や意義を説明
- 親しみやすく読みやすい文章
- 具体的で魅力的な内容

ストーリー・詳細説明：`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        }),
      }
    )

    if (!response.ok) {
      console.error('Gemini API エラー:', await response.text())
      return NextResponse.json(
        { error: 'ストーリー生成に失敗しました' },
        { status: 500 }
      )
    }

    const data = await response.json()
    
    // レスポンスからテキストを抽出
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!generatedText) {
      return NextResponse.json(
        { error: 'ストーリーの生成に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ story: generatedText })

  } catch (error) {
    console.error('ストーリー生成エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
} 