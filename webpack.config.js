const path = require('path');

module.exports = {
  mode: "production",
  entry: {
    'frontend': './frontend',
  },
  output: {
    path: path.join(__dirname, '/out/js/'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'ExammaRay',
    umdNamedDefine: true
  },
  optimization: {
    minimize: false,
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  }
};