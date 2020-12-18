const path = require('path');


module.exports = {
    entry: './js/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.scss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /index.html$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'index.html'
                        }
                    }
                ]
            }

        ]
    }
};
