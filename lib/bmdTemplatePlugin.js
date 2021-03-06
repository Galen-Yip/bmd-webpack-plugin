/**
 * @description   bmd template plugin
 * @authors       galenye
 */

var ConcatSource = require("webpack-sources").ConcatSource;
var OriginalSource = require("webpack-sources").OriginalSource;

function accessorToObjectAccess(accessor) {
    return accessor.map(function(a) {
        return "[" + JSON.stringify(a) + "]";
    }).join("");
}

function accessorAccess(base, accessor) {
    accessor = [].concat(accessor);
    return accessor.map(function(a, idx) {
        a = base + accessorToObjectAccess(accessor.slice(0, idx + 1));
        if(idx === accessor.length - 1) return a;
        return a + " = " + a + " || {}";
    }).join(", ");
}


function bmdTemplatePlugin(name, options) {
    this.name = name;
    this.optionalAmdExternalAsGlobal = options.optionalAmdExternalAsGlobal;
    this.namedDefine = options.namedDefine;
};

bmdTemplatePlugin.prototype.apply = function(compilation) {

    var mainTemplate = compilation.mainTemplate;

    // bind render-with-entry event
    compilation.templatesPlugin("render-with-entry", function(source, chunk, hash) {
        var externals, externalsDepsArray, variable, prefix, name;
        var optionalExternals = [],
            requiredExternals = [];

        externals = chunk.getModules().filter(function(module) {
            return module.external;
        });

        if(this.optionalAmdExternalAsGlobal) {
            externals.forEach(function(m) {
                if(m.optional) {
                    optionalExternals.push(m);
                } else {
                    requiredExternals.push(m);
                }
            });
            externals = requiredExternals.concat(optionalExternals);
        } else {
            requiredExternals = externals;
        }

        function replaceKeys(str) {
            return mainTemplate.applyPluginsWaterfall("asset-path", str, {
                hash: hash,
                chunk: chunk
            });
        }

        function externalsDepsArray(modules) {
            return "[" + replaceKeys(modules.map(function(m) {
                return JSON.stringify(typeof m.request === "object" ? m.request.amd : m.request);
            }).join(", ")) + "]";
        }

        function externalsRootArray(modules) {
            return replaceKeys(modules.map(function(m) {
                var request = m.request;
                if(typeof request === "object") request = request.root;
                return "root" + accessorToObjectAccess([].concat(request));
            }).join(", "));
        }

        function externalsRequireArray(type) {
            return replaceKeys(externals.map(function(m) {
                var request = m.request;
                if(typeof request === "object") request = request[type];
                if(typeof request === "undefined") throw new Error("Missing external configuration for type:" + type);
                if(Array.isArray(request)) {
                    var expr = "require(" + JSON.stringify(request[0]) + ")" + accessorToObjectAccess(request.slice(1));
                } else
                    var expr = "require(" + JSON.stringify(request) + ")";
                if(m.optional) {
                    expr = "(function webpackLoadOptionalExternalModule() { try { return " + expr + "; } catch(e) {} }())";
                }
                return expr;
            }).join(", "));
        }

        function externalsArguments(modules) {
            return modules.map(function(m) {
                return "__WEBPACK_EXTERNAL_MODULE_" + m.id + "__";
            }).join(", ");
        }

        function libraryName(library) {
            return JSON.stringify(replaceKeys([].concat(library).pop()));
        }

        var amdFactory;
        if(optionalExternals.length > 0) {
            var wrapperArguments = externalsArguments(requiredExternals);
            var factoryArguments = requiredExternals.length > 0 ?
                    externalsArguments(requiredExternals) + ", " + externalsRootArray(optionalExternals) :
                    externalsRootArray(optionalExternals);

            amdFactory = "function webpackLoadOptionalExternalModuleAmd(" + wrapperArguments + ") {\n" +
                "           return factory(" + factoryArguments + ");\n" +
                "       }";
        } else {
            amdFactory = "factory";
        }

        return new ConcatSource(new OriginalSource(
                    "(function webpackUniversalModuleDefinition(root, factory) {\n" +
                    "   if(typeof exports === 'object' && typeof module === 'object')\n" +
                    "       module.exports = factory(" + externalsRequireArray("commonjs2") + ");\n" +
                    "   else if(typeof define === 'function' && (define.amd || define.cmd))\n" +
                    (requiredExternals.length > 0 ?
                        (this.name && this.namedDefine === true ?
                            "       define(" + libraryName(this.name) + ", " + externalsDepsArray(requiredExternals) + ", " + amdFactory + ");\n" :
                            "       define(" + externalsDepsArray(requiredExternals) + ", " + amdFactory + ");\n"
                        ) :
                        (this.name && this.namedDefine === true ?
                            "       define(" + libraryName(this.name) + ", [], " + amdFactory + ");\n" :
                            "       define([], " + amdFactory + ");\n"
                        )
                    ) +
                    (this.name ?
                        "   else if(typeof exports === 'object')\n" +
                        "       exports[" + libraryName(this.name) + "] = factory(" + externalsRequireArray("commonjs") + ");\n" +
                        "   else\n" +
                        "       " + replaceKeys(accessorAccess("root", this.name)) + " = factory(" + externalsRootArray(externals) + ");\n" :
                        "   else {\n" +
                        (externals.length > 0 ?
                            "       var a = typeof exports === 'object' ? factory(" + externalsRequireArray("commonjs") + ") : factory(" + externalsRootArray(externals) + ");\n" :
                            "       var a = factory();\n"
                        ) +
                        "       for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];\n" +
                        "   }\n"
                    ) +
                    "})(this, function(" + externalsArguments(externals) + ") {\nreturn ", "webpack/universalModuleDefinition"), source, "\n});\n");
                        
    }.bind(this));
  
    mainTemplate.plugin("global-hash-paths", function(paths) {
        if (this.name) paths.push(this.name);
        return paths;
    }.bind(this));

    mainTemplate.plugin("hash", function(hash) {
        hash.update("exports cmd");
        hash.update(this.name + "");
    }.bind(this));
};


module.exports = bmdTemplatePlugin;
