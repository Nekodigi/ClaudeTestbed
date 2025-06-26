# Claude Testbed

実験的プロジェクトとクリエイティブコーディングのためのハブ

## 概要

Claude Testbedは、迅速なプロトタイピングと実験のために構築された、独立したミニプロジェクトのコレクションです。各プロジェクトは完全に独立しており、並行開発を可能にします。

## 特徴

- **独立性**: 各ミニプロジェクトは完全に分離され、相互依存関係はありません
- **HTML-First**: 高速読み込みのため、すべてのプロジェクトはプレーンHTMLをベースにしています
- **並行開発**: 複数のアイデアを衝突なしに同時に実装できます
- **シンプルな構造**: 各プロジェクトは`/projects/`下の独自のディレクトリに配置されます

## プロジェクト構造

```
/
├── index.html          # すべてのプロジェクトをリストするメインランディングページ
├── README.md          # このファイル
├── CLAUDE.md          # Claude Code用のガイドライン
└── projects/          # すべてのミニプロジェクトのコンテナ
    ├── project-name/
    │   └── index.html
    └── ...
```

## 主なプロジェクト

### 🧠 ULTRATHINK Collection
- **ULTRATHINK ミーム**: 究極の思考状態を表現するアニメーションミーム
- **Ultrathink 哲学**: 深淵なる思考の探求 - 哲学的な問いとパラドックスを探る
- **ULTRATHINK EXPLOSION**: 超爽快連鎖爆発ゲーム
- **NEURO BLAST MEGA**: 脳汁ドバドバ！超連鎖爆発ゲーム
- **NUMBER FUSION CLICKER DELUXE**: 究極の数字融合クリッカー

### 🎮 WebGL & Shaders
- **Shader Workshop**: GLSLプログラミングの深層へ
- **Ray Marching Demo**: 3D レイマーチング技術による美しいビジュアライゼーション
- **GLSL Fold Art**: 無限に折り畳まれる万華鏡パターン
- **Quantum Particle Field**: 高度な物理シミュレーションとWebGLレンダリング
- **Cosmos Engine Pro**: プロ級WebGL2パーティクルエンジン
- **Cosmic Fractal Journey**: 無限のフラクタル宇宙への壮大な旅

### 🎨 Interactive Art
- **Particle Cosmos**: インタラクティブな粒子アニメーション
- **生成的アート - Generative Art**: マウスに反応する流れるパーティクル

### ✨ Creative Experiments
- **Aesthetics Transformer**: 10種類のデザイン哲学を瞬時に切り替え
- **VECTOR//CORE™**: Vectorheartトレンドに基づく超美麗デジタルアート
- **Japanese Fashion Culture Transformer**: 日本のファッション文化を体験
- **Image Matrix Generator**: 複数のAI APIを使用してキーワードをマトリックス状に組み合わせ、並列で大量の画像を生成 - OpenAI DALL-E 3、Stability AI SDXL、Google Gemini 2.0 Flash/Imagen 4に対応

## 使い方

1. プロジェクトのルートディレクトリでHTTPサーバーを起動します
2. ブラウザで`index.html`を開きます
3. 興味のあるプロジェクトをクリックして体験します

## 新しいプロジェクトの追加

1. `/projects/`下に新しいディレクトリを作成
2. エントリーポイントとして`index.html`ファイルを追加
3. すべてのプロジェクトアセット（CSS、JS、画像）をプロジェクトディレクトリ内に保持
4. メインの`index.html`にプロジェクトへのリンクを追加

## 技術スタック

- HTML5
- CSS3（インラインスタイリング）
- Vanilla JavaScript
- WebGL/WebGL2
- Canvas API

## ライセンス

このプロジェクトは実験的な目的のために作成されました。各プロジェクトの詳細なライセンス情報については、個別のプロジェクトディレクトリを参照してください。