const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = (e, argv) => {
  const mode = argv.mode;
  let base = {
    devServer: {
      compress: true,
      public: "chat.fanapsoft.ir",
      historyApiFallback: true
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [
            path.resolve(__dirname, "src")
          ],
          use: {
            loader: "babel-loader"
          }
        }
      ]
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: "./index.html",
        filename: "./index.html"
      })
    ],
  };

  //IF MODE IS PRODUCTION
  if (mode === "production") {
    base.output = {
      path: __dirname + "/dist",
      filename: "index.js",
      library: "",
      libraryTarget: "commonjs"
    };
    base.entry="./src/auth";
  } else {
    base.devtool = "source-map";
  }
  return base;
};
