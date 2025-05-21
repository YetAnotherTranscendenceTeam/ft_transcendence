import path from "path";
import { fileURLToPath } from "url";
import CopyWebpackPlugin from "copy-webpack-plugin";
import webpack from "webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDevelopment = process.env.NODE_ENV !== 'production';
console.log("------------------------------------------------")
console.log(isDevelopment ? "DEVELOPEMENT" : "PRODUCTION");
console.log("------------------------------------------------")
console.log(`BACKEND_URL=${process.env.BACKEND_URL}`);
console.log(`WS_URL=${process.env.WS_URL}`);
console.log(`GOOGLE_CLIENT_ID=${process.env.GOOGLE_CLIENT_ID}`);
console.log("------------------------------------------------", "\n");

export default {
  entry: "./src/index.tsx",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "build"),
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader",
        ],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "public", to: "." }],
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    })
  ],
  devtool: 'inline-source-map',
  mode: isDevelopment ? 'development' : 'production',
  performance: {
    hints: false,
  },
  devServer: {
    historyApiFallback: true,
    allowedHosts: 'all',
    client: {
      overlay: isDevelopment,
    },
  },
};
