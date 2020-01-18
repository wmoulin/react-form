const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const clientContext = [
    [/moment[\/\\]locale$/, /fr|en/],
    [/intl[\/\\]locale-data[\/\\]jsonp$/, /((fr)|(en))$/],
    [/^\.$/, (context) => {
        if (!/\/log4js\/lib\/appenders$/.test(context.context)) return;
        Object.assign(context, {
            regExp: /^console.*$/,
            request: "."
        });
        
    }]
];

const dev = {
    dllEntry: {
        vendor: ["hornet-js-react-components", "hornet-js-components", "hornet-js-utils", "hornet-js-core"]
    }
}

const externals = [
    new RegExp(path.join("src", "services", "data") + "/.*"),
    /src\/middleware\/.*/,
    new RegExp(path.join("src", "services", "data") + "/.*-data-\.*"),
    "config",
    "continuation-local-storage"
]

module.exports = (project, conf, helper, webpackConfigPart, configuration, webpack) => {
    const projectPlugins = [...webpackConfigPart.addContextReplacement(clientContext).plugins];
    if (helper.isDevMode()) {
        conf.dev = dev;
        const dllReference =  webpackConfigPart.addDllReferencePlugins(project, "static", "js", "dll");
        if(dllReference && dllReference.plugins) {
            projectPlugins.push(...dllReference.plugins);
        }
    }
    return {
        ...configuration,
        entry: "./bin/sample/app.js",
        output: {
            path: path.join(project.dir, "static"),
            publicPath: "",
            filename: conf.js + "/[name].js"
        },
        plugins: [
            ...configuration.plugins,
            ...projectPlugins,
            new HtmlWebpackPlugin( {template: "./static/index.html", filename: "index.html"}),
            new webpack.HotModuleReplacementPlugin()
        ],
        externals : (context, request, callback) => {
            if(/log4js\/lib\/appenders/.test(context) && (!/console/.test(request)) && (/^\.\//.test(request))) {
                return callback(null, "{}");
            } 
            for (let i = 0; i < externals.length; i++) {
                let extern = externals[i];
                if (extern.test) { // c'est une regexp'
                    if (extern.test(request)) {
                        return callback(null, "{}");
                    }
                } else if (request == extern) {
                    return callback(null, "{}");
                }
            }

            return callback();
        },
        optimization: {
            splitChunks: {
                chunks: 'all',
                minChunks: 3,
                minSize: 3000000
            },
        },
        watchOptions: {
            aggregateTimeout: 3000
        },
        mode: "development",
        devtool: 'inline-source-map',
        devServer: {
            contentBase: path.join(project.dir, "static"),
            publicPath: '/',
            compress: true,
            port: 9000,
            hot: true,
            watchContentBase: true,
            stats: {
                children: false, // Hide children information
                maxModules: 0 // Set the maximum number of modules to be shown
            },
        }
    }

}
