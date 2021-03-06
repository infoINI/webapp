var path = require("path");
var webpack = require("webpack");
module.exports = {
    cache: true,
    entry: {
        bundle: "./src/bundle.coffee"
    },
    output: {
        path: path.join(__dirname, "build/"),
        publicPath: "build/",
        filename: "[name].js",
        chunkFilename: "[chunkhash].js"
    },
    module: {
        loaders: [
            { test: /\.json$/, loader: "json" },
            { test: /\.coffee$/, loader: "nginjector!coffee-loader" },
            { test: /\.(coffee\.md|litcoffee)$/, loader: "nginjector!coffee-loader?literate" },
            { test: /\.css$/,    loader: "style-loader!css-loader" },
            { test: /\.html$/, loader: "ngtemplate?relativeTo=" + (path.resolve(__dirname, './src')) + "/!html" }
        ]
    },
    plugins: [
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /de|en/)
    ]
};
