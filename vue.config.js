module.exports = {
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.vue'],
      alias: {
        '@': require('path').resolve(__dirname, 'src')
      }
    }
  }
}
