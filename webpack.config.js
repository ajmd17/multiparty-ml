var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    app: __dirname + '/lib/public/App'
  },
  output: { 
    path: __dirname + '/lib/public/js', 
    filename: 'dist.js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
};