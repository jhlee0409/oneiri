// custom-emoji-analyzer.js

/**
 * Gitmoji 기반 semantic-release 커밋 분석기
 * @see https://gitmoji.dev
 */

const EMOJI_RELEASE_MAP = {
  "✨": "minor", // feat
  "🐛": "patch", // fix
  "🔒": "patch", // security
  "♻️": "patch", // refactor
  "🔥": "major", // breaking
  "📝": "patch", // docs
  "🎨": "patch", // style
  "🚑️": "patch", // hotfix
  "⚡️": "patch", // performance
  "✅": "patch", // test
  "📦️": false, // build
  "🔧": false, // config
  "🚧": false, // work in progress
  "👷": false, // CI
  "🗑️": false, // remove
};

module.exports = {
  analyzeCommits: ({ commits }) => {
    for (const commit of commits) {
      const emoji = commit.message.trim().charAt(0);
      const release = EMOJI_RELEASE_MAP[emoji];
      if (release) return release;
    }
    return null; // no release
  },
};
