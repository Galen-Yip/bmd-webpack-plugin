/**
 * @description   rewrite ExternalModuleSoucePlugin.Apply()
 * @author        galenye
 */

var ExternalModule = require("webpack/lib/ExternalModule"),
    OriginalSource = require("webpack-sources").OriginalSource,
    RawSource = require("webpack-sources").RawSource,
    WebpackMissingModule = require("webpack/lib/dependencies/WebpackMissingModule"),
    origin = ExternalModule.prototype.getSourceString;

/**
 * rewrite
 */
function overwrite() {
  var _self = this;

  return (_self.type === 'bmd') ?
    buildBmdExternalModuleSource.call(_self) :
    origin.apply(_self, arguments);
};


/**
 * export bmd External module getSourceString
 */
function buildBmdExternalModuleSource() {
    var _self = this,
        code = '';

    if (_self.optional) {
        code = "if(typeof __WEBPACK_EXTERNAL_MODULE_" + _self.id + "__ === 'undefined') {" + WebpackMissingModule.moduleCode(request) + "}\n";
    }

    code += "module.exports = __WEBPACK_EXTERNAL_MODULE_" + _self.id + "__;";

    return _self.useSourceMap ?
        new OriginalSource(code, _self.identifier()) :
        new RawSource(code);
}

function newApply() {
    ExternalModule.prototype.getSourceString = overwrite
}

module.exports = {
    apply: newApply
}