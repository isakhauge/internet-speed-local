const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  target: "node",
  mode: "production",
  entry: "./run.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "speedtest.js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [new CleanWebpackPlugin()],
  resolve: {
    extensions: [".ts", ".js"],
    preferRelative: true,
    modules: ["node_modules"],
  },
};
