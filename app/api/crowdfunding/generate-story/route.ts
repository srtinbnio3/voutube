import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json()

    // 必須パラメータのチェック
    if (!title) {
      return NextResponse.json(
        { error: 'プロジェクトタイトルが必要です' },
        { status: 400 }
      )
    }
    if (!description) {
      return NextResponse.json(
        { error: 'プロジェクト概要が必要です' },
        { status: 400 }
      )
    }

    // Google AI Studio API キーの確認
    const apiKey = process.env.GOOGLE_AI_API_KEY
    
    // 開発環境でのみデバッグ情報を出力（APIキーの値は出力しない）
    if (process.env.NODE_ENV === 'development') {
      console.log('APIキー設定状況:', apiKey ? '設定済み' : '未設定')
      if (apiKey) {
        // セキュリティのため、最初の4文字のみ表示
        console.log('APIキープレフィックス:', apiKey.substring(0, 4) + '...')
      }
    }
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google AI Studio API キーが設定されていません。.env.devファイルにGOOGLE_AI_API_KEY=your_api_keyを追加してください。' },
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
                  text: `以下のYouTube企画アイデアのタイトルと概要を基に、IdeaTubeクラウドファンディングプロジェクトの魅力的なストーリー・詳細説明をHTML形式で生成してください。

【プラットフォーム背景】
IdeaTubeは、視聴者が投稿したYouTube企画アイデアをコミュニティが評価し、YouTuberが魅力的な企画を発見してクラウドファンディングで実現するプラットフォームです。

【企画情報】
プロジェクトタイトル：
${title}

プロジェクト概要：
${description}

【生成要件】
文字数：800-1500文字程度

必須要素：
- なぜこのYouTube動画が必要なのか、視聴者にとっての価値
- 企画の面白さ・独創性・視聴者の期待感
- 制作に必要な理由（設備、ロケ、出演者など）
- 完成した動画がもたらす視聴体験の魅力
- 支援者（視聴者）が企画実現に参加する特別感
- リターンの内容
- 具体的な制作スケジュールや公開予定

文体・トーン：
- YouTube視聴者にとって親しみやすく、わくわくする文章
- コミュニティ全体で企画を実現する一体感を演出
- 専門用語は避け、誰でも理解できる表現を使用
- 支援への感謝の気持ちを込めた温かみのある文章

出力形式：
- HTMLタグを使用してください（<h2>、<h3>、<p>、<strong>、<em>、<ul>、<li>など）
- マークダウン記法（##、**など）は使用しないでください
- 見出しは<h2>または<h3>タグを使用してください
- 段落は<p>タグで囲んでください
- 強調したい部分は<strong>タグを使用してください
- コードブロック（\`\`\`html）は使用せず、直接HTMLコンテンツのみを出力してください

ストーリー・詳細説明（HTML形式）：`
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
      const errorText = await response.text()
      
      // 開発環境でのみ詳細なエラー情報をログ出力
      if (process.env.NODE_ENV === 'development') {
        console.error('Gemini API エラー:', errorText)
        console.error('ステータス:', response.status)
        console.error('APIキーの状態:', apiKey ? '設定済み' : '未設定')
      } else {
        // 本番環境では基本情報のみログ出力
        console.error('Gemini API エラー - ステータス:', response.status)
      }
      
      // ユーザーには一般的なエラーメッセージを返す
      const userErrorMessage = process.env.NODE_ENV === 'development' 
        ? `ストーリー生成に失敗しました (${response.status}): ${errorText}`
        : 'ストーリー生成に失敗しました。しばらく時間をおいてから再試行してください。'
      
      return NextResponse.json(
        { error: userErrorMessage },
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
    // 開発環境でのみ詳細なエラー情報をログ出力
    if (process.env.NODE_ENV === 'development') {
      console.error('ストーリー生成エラー:', error)
    } else {
      // 本番環境では一般的なエラー情報のみ
      console.error('ストーリー生成でエラーが発生しました')
    }
    
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
} 