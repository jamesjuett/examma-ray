const path = require('path');

module.exports = {
  // mode: "development",
  entry: {
    'frontend': './frontend',
  },
  output: {
    path: path.join(__dirname, '/out/students/js/'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'ExammaRay',
    umdNamedDefine: true
  },
  optimization: {
    minimize: false
  },
  devtool: "source-map",
  // optimization: {
  //   minimizer: [
  //     new TerserPlugin({
  //       cache: true,
  //       parallel: true,
  //       sourceMap: true, // Must be set to true if using source-maps in production
  //       terserOptions: {
  //         // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
  //       },
  //       include: /\.min\.js$/,
  //     }),
  //   ]
  // },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  }
};