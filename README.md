# bmd-webpack-plugin

webpack插件，将文件打包成兼容umd和seajs的模块文件，我把它叫bmd（Both Module Definition）。

### 为什么写这东西

因为业务的需要，写的组件需要被seajs引用到，所以打包生成的需要是cmd规范  
但是webpack只支持`umd`，有一个插件支持打包成seajs的`cmd`，但是没法兼容两者  
组件写的examples希望尽量的简单，希望除了`umd`的规范，以script的方式也被引用，
因此，有了这个插件bmd

### 安装

npm:

```
  npm install bmd-webpack-plugin --save
```


### 使用

webpack.config.js

```

var bmdWebpackPlugin = require('bmd-webpack-plugin');


module.exports = {

  output: {

    // ..

    libraryTarget: 'bmd'

  },

  // 插件
  plugins: [
    new bmdWebpackPlugin()
  ]
}

```
