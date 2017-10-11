const parser = require('properties-parser');
const through2 = require('through2');
const File = require('vinyl');
const path = require('path');

const DEFAULT_CONFIG = {
    primary: 'en',
    langs: ['en_AU'],
    destMask: '{lang}/{bundle}.json',
    process: function(properties) {
        return JSON.stringify(properties);
    }
};

const transform = function(config) {
    const options = Object.assign({}, DEFAULT_CONFIG, config);

    const re = /^(.*)\/([^\/]+)_([a-z]{2}(_[A-Z]{2})?).properties$/;

    const primary = options.primary;
    const langs = options.langs.map(function(lang) {
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

    function bufferContents(file, enc, next) {
        const properties = parser.parse(file.contents);
        const parts = file.path.match(re);
        const bundleId = parts[2];
        const lang = parts[3];

        bundles[bundleId] = bundles[bundleId] || {};
        bundles[bundleId][lang] = properties;

        next();
    }

    function endStream(cb) {
        const bundleIds = Object.keys(bundles);
        const updatedFiles = this;

        bundleIds.forEach(function(bundleId) {
            langs.forEach(function(lang) {
                const properties = {};
                const bundle = bundles[bundleId];

                lang.order.forEach(function(langRef) {
                    if (langRef in bundle) {
                        Object.keys(bundle[langRef]).forEach(function(k) {
                            properties[k] = bundle[langRef][k];
                        });
                    }
                });

                if (Object.keys(properties).length > 0) {
                    const outPath = options.destMask.replace('{lang}', lang.key).replace('{bundle}', bundleId);

                    const updatedFile = new File({
                        path: outPath,
                        contents: new Buffer(options.process(properties, lang))
                    });

                    updatedFiles.push(updatedFile);
                }
            });
        });
        cb();
    }

    return through2.obj(bufferContents, endStream);
};

module.exports = transform;
