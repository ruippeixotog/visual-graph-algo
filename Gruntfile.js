/* This file is heavily inspired (not to say copied) from the Gruntfile.js in
 * https://github.com/trek/ember-todos-with-build-tools-tests-and-other-modern-conveniences */

/*jshint camelcase: false */
/*global module:false */
module.exports = function(grunt) {

  grunt.initConfig({
    // uglify: {
    //   'dist/built.min.js': 'dist/built.js'
    // },

    /*
       A simple ordered concatenation strategy.
       This will start at app/app.js and begin
       adding dependencies in the correct order
       writing their string contents into
       'build/application.js'

       Additionally it will wrap them in evals
       with @ sourceURL statements so errors, log
       statements and debugging will reference
       the source files by line number.

       You would set this option to false for
       production.
    */
    neuter: {
      options: {
        includeSourceURL: true
      },
      'build/application.js': ['app/app.js']
    },

    /*
      Watch files for changes.

      Changes in dependencies/ember.js or application javascript
      will trigger the neuter task.

      Changes to any templates will trigger the emberTemplates
      task (which writes a new compiled file into dependencies/)
      and then neuter all the files again.
    */
    watch: {
      application_code: {
        files: ['dependencies/**/*.js', 'app/**/*.js'],
        tasks: ['neuter']
      },
      css_stylesheets: {
        files: ['css/**/*.css'],
        tasks: ['cssmin']
      },
      handlebars_templates: {
        files: ['app/templates/**/*.hbs'],
        tasks: ['emberTemplates', 'neuter']
      }
    },

    /*
      Reads the projects .jshintrc file and applies coding
      standards. Doesn't lint the dependencies or test
      support files.
    */
    jshint: {
      all: ['Gruntfile.js', 'app/**/*.js', 'test/**/*.js', '!dependencies/*.*', '!test/support/*.*'],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    /*
      Finds Handlebars templates and precompiles them into functions.
      The provides two benefits:

      1. Templates render much faster
      2. We only need to include the handlebars-runtime microlib
         and not the entire Handlebars parser.

      Files will be written out to dependencies/compiled/templates.js
      which is required within the project files so will end up
      as part of our application.

      The compiled result will be stored in
      Ember.TEMPLATES keyed on their file path (with the 'app/templates' stripped)
    */
    emberTemplates: {
      options: {
        templateName: function(sourceFile) {
          return sourceFile.replace(/app\/templates\//, '');
        }
      },
      'dependencies/compiled/templates.js': ["app/templates/**/*.hbs"]
    },

    cssmin: {
      combine: {
        files: {
          'build/application.min.css': ['app/css/sb-admin.css', 'app/css/visual_graph.css']
        }
      }
    }
  });

  // grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-neuter');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-ember-templates');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  /*
    Default task. Compiles templates, neuters application code, and begins
    watching for changes.
  */
  grunt.registerTask('default', ['emberTemplates', 'cssmin', 'neuter', 'watch']);

  /*
    Build task. Runs everything as the default task, but without the watch.
   */
  grunt.registerTask('build', ['emberTemplates', 'cssmin', 'neuter']);
};
