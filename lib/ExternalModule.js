/**
 * @description   rewrite ExternalModuleSoucePlugin.Apply()
 * @author        galenye
 */

var ExternalModule = require("webpack/lib/ExternalModule"),
    OriginalSource = require("webpack-core/lib/OriginalSource"),
    RawSource = require("webpack-core/lib/RawSource"),
    WebpackMissingModule = require("webpack/lib/dependencies/WebpackMissingModule"),
    origin = ExternalModule.prototype.source;

/**
 * rewrite
 */
function overwrite() {
  var _self = this;

  return (_self.type === 'bmd' || _self.type === 'bmd2') ?
    buildBmdExternalModuleSource.call(_self) :
    origin.apply(_self, arguments);
};


/**
 * export bmd External module source
 */
function buildBmdExternalModuleSource() {
    var _self = this,
        code;

    if (_self.optional) {
        code = "if(typeof __WEBPACK_EXTERNAL_MODULE_" + _self.id + "__ === 'undefined') {" + WebpackMissingModule.moduleCode(request) + "}\n";
    }

    code = "module.exports = __WEBPACK_EXTERNAL_MODULE_" + _self.id + "__;";

    return _self.useSourceMap ?
        new OriginalSource(code, _self.identifier()) :
        new RawSource(code);
}

function newApply() {
    ExternalModule.prototype.source = overwrite
}

module.exports = {
    apply: newApply
}