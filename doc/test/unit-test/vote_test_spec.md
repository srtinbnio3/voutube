# 投票機能テスト仕様書

## 概要
このテスト仕様書は、IdeaTubeアプリケーションの投票機能に関する単体テストの内容を定義します。

## テスト対象機能
- いいね投票（VOTE-01）
- よくないね投票（VOTE-02）
- 投票取り消し（VOTE-03）
- 投票切り替え（VOTE-04）
- 投票スコア表示（VOTE-05）

## テスト仕様

### VOTE-01: いいね投票

| テストID | テスト内容 | 入力値 | 期待される結果 | 前提条件 |
|---------|-----------|--------|--------------|---------|
| VOTE-01-01 | 未投票の投稿にいいね投票 | いいねボタンクリック | いいね投票成功、ボタン状態変更、スコア+1 | ログイン済みユーザー、未投票の投稿 |
| VOTE-01-02 | 自分の投稿にいいね投票 | いいねボタンクリック | いいね投票成功、ボタン状態変更、スコア+1 | ログイン済みユーザー、自分の投稿 |
| VOTE-01-03 | 非ログイン状態でいいね投票 | いいねボタンクリック | ログインページへリダイレクト | 非ログインユーザー |
| VOTE-01-04 | 同時に複数ユーザーがいいね投票 | 複数ユーザーが同時にいいねボタンクリック | すべての投票が正しく処理され、スコアが正確に更新 | 複数ログイン済みユーザー |
| VOTE-01-05 | ネットワーク接続不安定時のいいね投票 | いいねボタンクリック（接続不安定） | エラーメッセージ表示、リトライ機能提供 | ログイン済みユーザー、ネットワーク不安定 |

### VOTE-02: よくないね投票

| テストID | テスト内容 | 入力値 | 期待される結果 | 前提条件 |
|---------|-----------|--------|--------------|---------|
| VOTE-02-01 | 未投票の投稿によくないね投票 | よくないねボタンクリック | よくないね投票成功、ボタン状態変更、スコア-1 | ログイン済みユーザー、未投票の投稿 |
| VOTE-02-02 | 自分の投稿によくないね投票 | よくないねボタンクリック | よくないね投票成功、ボタン状態変更、スコア-1 | ログイン済みユーザー、自分の投稿 |
| VOTE-02-03 | 非ログイン状態でよくないね投票 | よくないねボタンクリック | ログインページへリダイレクト | 非ログインユーザー |
| VOTE-02-04 | 同時に複数ユーザーがよくないね投票 | 複数ユーザーが同時によくないねボタンクリック | すべての投票が正しく処理され、スコアが正確に更新 | 複数ログイン済みユーザー |
| VOTE-02-05 | ネットワーク接続不安定時のよくないね投票 | よくないねボタンクリック（接続不安定） | エラーメッセージ表示、リトライ機能提供 | ログイン済みユーザー、ネットワーク不安定 |

### VOTE-03: 投票取り消し

| テストID | テスト内容 | 入力値 | 期待される結果 | 前提条件 |
|---------|-----------|--------|--------------|---------|
| VOTE-03-01 | いいね投票の取り消し | いいね済み投稿のいいねボタン再クリック | いいね投票取り消し成功、ボタン状態変更、スコア-1 | ログイン済みユーザー、いいね済み投稿 |
| VOTE-03-02 | よくないね投票の取り消し | よくないね済み投稿のよくないねボタン再クリック | よくないね投票取り消し成功、ボタン状態変更、スコア+1 | ログイン済みユーザー、よくないね済み投稿 |
| VOTE-03-03 | 投票取り消し後の再投票 | 投票取り消し後の再投票 | 再投票成功、ボタン状態変更、スコア更新 | ログイン済みユーザー、投票取り消し済み投稿 |
| VOTE-03-04 | 同時に複数ユーザーが投票取り消し | 複数ユーザーが同時に投票取り消し | すべての取り消しが正しく処理され、スコアが正確に更新 | 複数ログイン済みユーザー、投票済み投稿 |
| VOTE-03-05 | ネットワーク接続不安定時の投票取り消し | 投票ボタン再クリック（接続不安定） | エラーメッセージ表示、リトライ機能提供 | ログイン済みユーザー、ネットワーク不安定 |

### VOTE-04: 投票切り替え

| テストID | テスト内容 | 入力値 | 期待される結果 | 前提条件 |
|---------|-----------|--------|--------------|---------|
| VOTE-04-01 | いいねからよくないねへの切り替え | いいね済み投稿のよくないねボタンクリック | よくないねに切り替え成功、両ボタン状態変更、スコア-2 | ログイン済みユーザー、いいね済み投稿 |
| VOTE-04-02 | よくないねからいいねへの切り替え | よくないね済み投稿のいいねボタンクリック | いいねに切り替え成功、両ボタン状態変更、スコア+2 | ログイン済みユーザー、よくないね済み投稿 |
| VOTE-04-03 | 短時間での複数回切り替え | 連続して投票タイプ切り替え | すべての切り替えが正しく処理され、スコアが正確に更新 | ログイン済みユーザー、投票済み投稿 |
| VOTE-04-04 | 同時に複数ユーザーが投票切り替え | 複数ユーザーが同時に投票タイプ切り替え | すべての切り替えが正しく処理され、スコアが正確に更新 | 複数ログイン済みユーザー、投票済み投稿 |
| VOTE-04-05 | ネットワーク接続不安定時の投票切り替え | 反対の投票ボタンクリック（接続不安定） | エラーメッセージ表示、リトライ機能提供 | ログイン済みユーザー、ネットワーク不安定 |

### VOTE-05: 投票スコア表示

| テストID | テスト内容 | 入力値 | 期待される結果 | 前提条件 |
|---------|-----------|--------|--------------|---------|
| VOTE-05-01 | 投票なしの投稿のスコア表示 | 投稿一覧表示 | スコア「0」または「-」表示 | 投票のない投稿 |
| VOTE-05-02 | いいね投票のみの投稿のスコア表示 | 投稿一覧表示 | いいね数と同じスコア表示 | いいね投票のみの投稿 |
| VOTE-05-03 | よくないね投票のみの投稿のスコア表示 | 投稿一覧表示 | よくないね数のマイナス値と同じスコア表示 | よくないね投票のみの投稿 |
| VOTE-05-04 | いいねとよくないね混在の投稿のスコア表示 | 投稿一覧表示 | （いいね数 - よくないね数）のスコア表示 | いいね・よくないね両方の投稿 |
| VOTE-05-05 | リアルタイムのスコア更新 | 投票操作 | 投票後即座にスコア表示が更新される | 投稿一覧表示中 |
| VOTE-05-06 | ゼロスコアの投稿表示 | 投稿一覧表示 | いいね数とよくないね数が等しい場合「0」表示 | いいね・よくないね数が同数の投稿 |
| VOTE-05-07 | 高スコアの表示形式 | 投稿一覧表示 | 大きな数値でも正確に表示（桁数による表示崩れなし） | 多数の投票がある投稿 |

## 特記事項
- 投票スコアは「いいね数 - よくないね数」で計算される
- 各ユーザーは1つの投稿に対して1つの投票（いいねまたはよくないね）のみ可能
- 投票操作はデータベーストリガーによって投稿のスコアフィールドを自動更新する
- 非ログインユーザーには投票ボタンが表示されるが、クリック時にはログインページにリダイレクトされる
- 投票操作は楽観的UIを採用し、ユーザー操作に対して即座に視覚的フィードバックを提供する 