const config = {
    // Ignore __mocks__, __stories__, etc.
    ignore: [/\/__\w+__\//],
    plugins: [
        ['@babel/plugin-proposal-class-properties', { loose: false }],
        ['@babel/plugin-syntax-jsx'],
        ['@babel/plugin-transform-react-jsx']
    ],
    presets: [['@babel/preset-env', { targets: 'node 10' }]]
};

module.exports = config;
