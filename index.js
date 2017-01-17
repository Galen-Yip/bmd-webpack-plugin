var overwrites = [
    require('./lib/ExternalModule'),
    require('./lib/LibraryTemplatePlugin')
]

function bmdWebpackPlugin() {}

bmdWebpackPlugin.prototype.apply = function(compiler) {
    // compiler.plugin('done', function() {
    //     console.log('Hello World!'); 
    // });

    overwrites.forEach(function(item) {
        item.apply()
    })
};

module.exports = bmdWebpackPlugin;