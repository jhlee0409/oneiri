// custom-emoji-analyzer.js

const EMOJI_RELEASE_MAP = {
  '✨': 'minor',    // feat
  '🐛': 'patch',    // fix
  '🔒': 'patch',    // security
  '♻️': 'patch',    // refactor
  '🔥': 'major',    // breaking
  '📝': 'patch',    // docs
  '🎨': 'patch',    // style
  '🚑️': 'patch',   // hotfix
  '⚡️': 'patch',    // perf
  '✅': 'patch',    // test
  '📦️': false,     // build
  '🔧': false,      // config
  '🚧': false,      // wip
  '👷': false,      // ci
  '🗑️': false       // remove
};

module.exports = {
  analyzeCommits: async (context = {}) => {
    const commits = context.commits || [];
    const log = context.logger?.log || console.log;

    for (const commit of commits) {
      const message = commit.message?.trim() || '';
      const emoji = message.charAt(0);
      const release = EMOJI_RELEASE_MAP[emoji];

      if (release) {
        log(`🔍 Detected release type "${release}" from emoji "${emoji}" in commit: ${message}`);
        return release;
      }
    }

    log("🚫 No relevant emoji-based commit found. No release triggered.");
    return null;
  },
};
