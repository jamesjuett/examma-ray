const path = require('path');

module.exports = {
  mode: "production",
  entry: {
    'frontend': './src/frontend',
    'frontend-graded': './src/frontend-graded',
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
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  }
};