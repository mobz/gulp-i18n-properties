# gulp-i18n-properties

> gulp plugin to convert java i18n property files to json

## Installation

Install package with NPM and add it to your development dependencies:

`npm install --save-dev gulp-i18n-properties`

## Usage

```js
var gulp = require('gulp');
var i18nProperties = require('gulp-i18n-properties');

gulp.task('i18n', function () {
    return gulp.src('src/bundles/*.properties')
        .pipe(i18nProperties( options ))
        .pipe(gulp.dest('dest/locale'))
});

```

## Overview

i18n converts a bunch of java i18n property files into locale specific json files. A `bundle` of i18n files have a three level hierarchy:

1. specific localisations for regional language variations ( eg `en_AU`, `pt_BR` ) - usually only some keys are localised
2. a file for each supported language ( eg `es`, `it`, `jp`, `zh`) - most keys are translated
3. the primary development (fallback) language (often English `en`) - all keys are available in the development language

Project_en.properties

	Project.Name = gulp-i18n-properties
	Project.Description = A great little project

Project_es.properties

	Project.Description = Un pequeño gran proyecto

Project_en_AU.properties

	Project.Description = A little ripper of a project

gulp-i18n-properties provides the best available translation from any of the three levels that are available

for example

generating an `en_AU` file will produce

	Project.Name = gulp-i18n-properties
	Project.Description = A little ripper of a project

selecting the `Project.Name` from the generic `en` file, and the `Project.Description` from the region specific `en_AU` file.

generating a `pt_BR` file will produce results just from the `en` file ( providing Brazilian portuguese users with english ), since neither `pt` nor `pt_BR` files are available.


## Options

- `primary`

	Defaults to  `"en"`. The primary development language. Eg the fallback language used when a key has not been translated yet. `primary` may also be `false` in which case no fallback is used and untranslated keys will be missing

- `langs`

	Default value: `["en_AU"]`

	An array of all the languages you wish to support. Typically you would provide languages with the regional component, though this is not required.

	a typical example might look like `["en_US", "en_UK", "en_AU", "fr_FR", "de_DE", "it_IT", "es_ES" "pt_PT", "zh_CN", "ja_JP", "ko_KR", "ar_EG"]`

- `process`

	Default value: `function(properties, lang) { return JSON.stringify( properties ) }`

	A function that transforms the final properties map into the string that is written to the language file. 

- `destMask`

	Default value is `"{lang}/{bundle}.json"`

	Since gulp-i18n-properties generates a file for each lang / bundle compination. This allows you to define the way these files are output



