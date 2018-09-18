require('dotenv').config();

const webpack = require('webpack');
const {
    WebpackTools: {
        MagentoRootComponentsPlugin,
        ServiceWorkerPlugin,
        DevServerReadyNotifierPlugin,
        MagentoResolver,
        PWADevServer
    }
} = require('@magento/pwa-buildpack');
const path = require('path');

const UglifyPlugin = require('uglifyjs-webpack-plugin');
const configureBabel = require('./babel.config.js');

const themePaths = {
    src: path.resolve(__dirname, 'src'),
    assets: path.resolve(__dirname, 'web'),
    output: path.resolve(__dirname, 'web/js')
};

// mark dependencies for vendor bundle
const libs = [
    'apollo-boost',
    'react',
    'react-dom',
    'react-redux',
    'react-router-dom',
    'redux'
];

module.exports = async function(env) {
    const { phase } = env;

    const babelOptions = configureBabel(phase);

    const enableServiceWorkerDebugging = Boolean(
        process.env.ENABLE_SERVICE_WORKER_DEBUGGING
    );
    const serviceWorkerFileName = process.env.SERVICE_WORKER_FILE_NAME;

    const config = {
        context: __dirname, // Node global for the running script's directory
        entry: {
            client: path.resolve(themePaths.src, 'index.js')
        },
        output: {
            path: themePaths.output,
            publicPath: process.env.MAGENTO_BACKEND_PUBLIC_PATH,
            filename: '[name].js',
            chunkFilename: '[name]-[chunkhash].js',
            pathinfo: true
        },
        module: {
            rules: [
                {
                    include: [themePaths.src],
                    test: /\.js$/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: { ...babelOptions, cacheDirectory: true }
                        }
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 1,
                                localIdentName:
                                    '[name]-[local]-[hash:base64:3]',
                                modules: true
                            }
                        }
                    ]
                },
                {
                    test: /\.(jpg|svg)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {}
                        }
                    ]
                }
            ]
        },
        resolve: await MagentoResolver.configure({
            paths: {
                root: __dirname
            }
        }),
        plugins: [
            new MagentoRootComponentsPlugin({ phase }),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(phase),
                // Blank the service worker file name to stop the app from
                // attempting to register a service worker in index.js.
                // Only register a service worker when in production or in the
                // special case of debugging the service worker itself.
                'process.env.SERVICE_WORKER': JSON.stringify(
                    phase === 'production' || enableServiceWorkerDebugging
                        ? serviceWorkerFileName
                        : false
                ),
                /**
                 * TODO: This env var can override the hardcoded product media
                 * path, which we need to hardcode due to
                 * https://github.com/magento/graphql-ce/issues/88
                 */
                'process.env.MAGENTO_BACKEND_PRODUCT_MEDIA_PATH': JSON.stringify(
                    process.env.MAGENTO_BACKEND_PRODUCT_MEDIA_PATH
                )
            }),
            new ServiceWorkerPlugin({
                env,
                enableServiceWorkerDebugging,
                serviceWorkerFileName,
                paths: themePaths
            })
        ]
    };
    if (phase === 'development') {
        config.devtool = 'eval-source-map';

        config.devServer = await PWADevServer.configure({
            serviceWorkerFileName,
            publicPath: process.env.MAGENTO_BACKEND_PUBLIC_PATH,
            backendDomain: process.env.MAGENTO_BACKEND_DOMAIN,
            paths: themePaths,
            id: 'magento-venia'
        });

        // A DevServer generates its own unique output path at startup. It needs
        // to assign the main outputPath to this value as well.

        config.output.publicPath = config.devServer.publicPath;

        config.plugins.push(
            new webpack.NamedChunksPlugin(),
            new webpack.NamedModulesPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new DevServerReadyNotifierPlugin(config.devServer)
        );
    } else if (phase === 'production') {
        config.performance = {
            hints: 'warning'
        };
        config.entry.vendor = libs;
        config.plugins.push(
            new webpack.optimize.CommonsChunkPlugin({
                names: ['vendor']
            }),
            new UglifyPlugin({
                parallel: true,
                uglifyOptions: {
                    ecma: 8,
                    keep_fnames: true
                }
            })
        );
    } else {
        throw Error(`Unsupported environment phase in webpack config: `);
    }
    return config;
};
