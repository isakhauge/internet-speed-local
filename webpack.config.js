const path = require('path')
const relPath = (relativePath) => path.resolve(__dirname, relativePath)
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
	target: 'node',
	mode: 'production',
	entry: './src/run.ts',
	output: {
		path: relPath('dist'),
		filename: 'speedtest.js',
	},
	module: {
		rules: [
			{
				test: /\.(ts)$/,
				use: ['ts-loader'],
				include: relPath('src'),
			},
		],
	},
	plugins: [new CleanWebpackPlugin()],
	resolve: {
		extensions: ['.ts', '.js'],
		preferRelative: true,
		modules: ['node_modules'],
	},
}