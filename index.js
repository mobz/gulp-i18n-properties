const parser = require('properties-parser');
const through2 = require('through2');
const File = require('vinyl');
const path = require('path');

var gutil = require('gulp-util');

const DEFAULT_CONFIG = {
    primary: 'en',
    langs: ['en_AU'],
    destMask: "{lang}/{bundle}.json",
    process: function( properties, lang ) {
        return JSON.stringify( properties );
    }
};

const transform = function (config) {
    return through2.obj(function (file, enc, next) {

        options = Object.assign({}, DEFAULT_CONFIG, config );

        const primary = options.primary;
        const langs = options.langs.map(function (lang) {
            const order = [];
            if (primary && lang.indexOf(primary) !== 0) {
                order.push(primary);
            }
            order.push(lang.slice(0, 2));
            if (lang.length === 5) {
                order.push(lang);
            }
            return {
                key: lang,
                order: order
            };
        });

        const bundles = {};
        const re = /^(.*)\/([^\/]+)_([a-z]{2}(_[A-Z]{2})?).properties$/;

        const properties = parser.parse(file.contents);
        const parts = file.path.match(re);
        const bundleId = parts[2];
        const lang = parts[3];

        bundles[bundleId] = bundles[bundleId] || {};
        bundles[bundleId][lang] = properties;

        const bundleIds = Object.keys(bundles);

        const updatedFiles = this;

        bundleIds.forEach(function (bundleId) {
            langs.forEach(function (lang) {
                const properties = {};
                const bundle = bundles[bundleId];

                lang.order.forEach(function (langRef) {
                    if (langRef in bundle) {
                        Object.keys(bundle[langRef]).forEach(function (k) {
                            properties[k] = bundle[langRef][k];
                        });
                    }
                });

                if (Object.keys(properties).length > 0) {
                    const outPath = options.destMask.replace("{lang}", lang.key ).replace("{bundle}", bundleId );
                    const outputFile = path.join(file.base, outPath);

                    const updatedFile = new File({
                        base: file.base,
                        path: outputFile,
                        contents: new Buffer( options.process(properties, lang) )
                    });

                    updatedFiles.push(updatedFile);
                }
            });
        });

        next();
    });
};

module.exports = transform;
