/**
 * HTMLをサニタイズして安全に描画できる形へ変換するユーティリティ。
 * 依存ライブラリを追加せず、最低限の対策のみを実装しています。
 * 想定ユースケース: 生成AIや自分たちのエディタで作成した説明文/ストーリーの表示。
 * 注意: 本格的なXSS対策が必要な場合は DOMPurify などの導入を検討してください。
 */

const ALLOWED_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'strong', 'em', 'blockquote', 'code', 'pre',
  'br', 'hr', 'a'
])

/**
 * 最低限のHTMLサニタイズを行う
 * - script/style/iframe など危険な要素の除去
 * - on* ハンドラ属性の除去
 * - javascript: スキームの無効化
 * - 許可タグ以外のタグ除去（テキストは残す）
 * - a要素は href のみ許可（javascript: は無効化）し、rel/target を付与
 */
export function sanitizeHtml(input: string): string {
  if (!input) return ''

  let html = input

  // 危険な要素を丸ごと除去
  html = html.replace(/<\s*(script|style|iframe|object|embed|meta|link)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')

  // on* ハンドラ属性を除去
  html = html.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')

  // javascript: スキームを無効化
  html = html.replace(/javascript\s*:/gi, '')

  // 許可タグ以外のタグを除去（テキストは残す）＆許可タグの属性を制限
  html = html.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, rawTag: string) => {
    const tag = rawTag.toLowerCase()
    const isClosing = match.startsWith('</')

    if (!ALLOWED_TAGS.has(tag)) {
      // タグ自体を落としてテキストのみ残す
      return ''
    }

    if (isClosing) return `</${tag}>`

    if (tag === 'a') {
      // href のみ許可。javascript: は前段で除去済みだが再度保険でフィルタ
      const hrefMatch = match.match(/href\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i)
      let href = hrefMatch ? hrefMatch[1] : '"#"'
      // 引用符除去
      href = href.replace(/^['"]|['"]$/g, '')
      if (!href || /^\s*$/.test(href)) href = '#'
      if (/^javascript:/i.test(href)) href = '#'
      return `<a href="${href}" rel="nofollow noopener" target="_blank">`
    }

    // それ以外は属性をすべて落とす
    return `<${tag}>`
  })

  return html
}

export default sanitizeHtml


