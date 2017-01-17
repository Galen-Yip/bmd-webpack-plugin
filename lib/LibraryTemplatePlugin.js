/**
 * @description rewrite LibraryTemplatePlugin,add libraryTarget: 'bmd'
 * @author      galenye
 */

var LibraryTemplatePlugin = require("webpack/lib/LibraryTemplatePlugin"),
    bmdTemplatePlugin = require('./bmdTemplatePlugin'),
    originApply = LibraryTemplatePlugin.prototype.apply;

function overwrite(compiler) {
    var _self = this;

    // add bmd libraryTarget 
    if (this.target === 'bmd' || this.target === 'bmd2') {
        compiler.plugin("this-compilation", function(compilation) {
            compilation.apply(new bmdTemplatePlugin(_self.name, {
                optionalAmdExternalAsGlobal: _self.target === 'bmd2',
                namedDefine: _self.umdNamedDefine
            }));
        });
        return;
    }

    // else use origin
    originApply.apply(this, arguments);
}

function newApply() {
    LibraryTemplatePlugin.prototype.apply = overwrite
}

module.exports = {
    apply: newApply
}
