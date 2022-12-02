const path = require("path");

module.exports = {
  entry: "./src/app.ts",
  mode: "development",
  output: {
    publicPath: "/dist/",
    path: `${__dirname}/dist`,
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: /\.glsl$/,
        exclude: /node_modules/,
        loader: "webpack-glsl-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  devServer: {
    // Serve index.html as the base
    // contentBase: `${__dirname}/public`,
    static: {
      directory: path.join(__dirname, "public"),
    },

    // Enable compression
    compress: true,

    // Enable hot reloading
    hot: true,

    port: 3000,

    // // Public path is root of content base
    // publicPath: "/",
  },
};
