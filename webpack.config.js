

const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const HtmlWebPackPlugin = require("html-webpack-plugin")
module.exports = {
    entry: './src/js/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.bundle.js',
    },

    mode: 'development',
    resolve: {
        alias: {
          Modules: path.resolve(__dirname, 'node_modules/'),
        },
      },
    module: {
        rules: [
          
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
              },
              {
                // Loads the javacript into html template provided.
                // Entry point is set below in HtmlWebPackPlugin in Plugins 
                test: /\.html$/,
                use: [
                  {
                    loader: "html-loader",
                    //options: { minimize: true }
                  }
                ]
              },
              {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
              },
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/html/index.html",
            filename: "./index.html",
            excludeChunks: [ 'server' ]
          })
        
    ]
}

