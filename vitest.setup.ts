import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import matchers from '@testing-library/jest-dom/matchers'
import dotenv from 'dotenv'

// .env.testファイルから環境変数を読み込む
dotenv.config({ path: '.env.test' })

// テストライブラリのマッチャーを追加
expect.extend(matchers)

// 各テスト後にクリーンアップ
afterEach(() => {
  cleanup()
}) 