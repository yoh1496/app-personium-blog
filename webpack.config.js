const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    main: ['@babel/polyfill', './src/app/frontend/index.js'],
    viewer: ['@babel/polyfill', './src/app/frontend/viewer/index.js'],
  },
  output: {
    path: path.resolve(__dirname, 'build/public'),
    filename: '[name].bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        ],
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [{ loader: 'ts-loader' }],
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
  },
  devServer: {
    contentBase: `${__dirname}/tools`,
    publicPath: '/__/public/',
    historyApiFallback: {
      rewrites: [{ from: '/', to: '/dev_index.html' }],
    },
  },
};
