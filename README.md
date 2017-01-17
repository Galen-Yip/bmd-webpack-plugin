# bmd-webpack-plugin

webpack插件，将文件成兼容umd和seajs的模块文件，我把它叫bmd（Both Module Definition）。

### 为什么写这东西

因为业务的需要，写的组件需要被seajs引用到，所以打包生成的需要是cmd规范  
但是写的examples想尽量的简单，直接以script的方式也被引用，即umd的规范
因此，

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
