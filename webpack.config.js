const path = require("path");

module.exports = (e, argv) => {
  const mode = argv.mode;
  let base = {
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [
            path.resolve(__dirname, "index.js")
          ],
          use: {
            loader: "babel-loader"
          }
        }
      ]
    }
  };

  //IF MODE IS PRODUCTION
  if (mode === "production") {
    base.output = {
      path: __dirname + "/dist",
      filename: "index.js",
      library: "",
      libraryTarget: "commonjs"
    }
  } else {
    base.devtool = "source-map";
    base.entry="./src/dev"
  }

  return base;
};
