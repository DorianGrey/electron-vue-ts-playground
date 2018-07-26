const rxPaths = require("rxjs/_esm5/path-mapping");

module.exports = {
  stats: "minimal",
  devServer: {
    historyApiFallback: true,
    stats: "minimal"
  },
  resolve: {
    alias: rxPaths()
  }
};