module.exports = function(grunt) {

  grunt.initConfig({

    // concatenates and minifies CSS files
    cssmin: {
      combine: {
        files: {
          'build/application.min.css': ['app/css/sb-admin.css', 'app/css/visual_graph.css']
        }
      }
    },

    // finds Handlebars templates and precompiles them into functions
    emberTemplates: {
      options: {
        templateName: function(sourceFile) {
          return sourceFile.replace(/app\/templates\//, '');
        }
      },
      'dependencies/compiled/templates.js': ["app/templates/**/*.hbs"]
    },

    // concatenate JavaScript code in one file
    neuter: {
      options: {
        includeSourceURL: true
      },
      'build/application.js': ['app/app.js']
    },

    // uglify: {
    //   'build/application.min.js': 'build/application.js'
    // },

    // watch files for changes
    watch: {
      application_code: {
        files: ['dependencies/**/*.js', 'app/**/*.js'],
        tasks: ['neuter']
      },
      css_stylesheets: {
        files: ['app/**/*.css'],
        tasks: ['cssmin']
      },
      handlebars_templates: {
        files: ['app/templates/**/*.hbs'],
        tasks: ['emberTemplates', 'neuter']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-ember-templates');
  grunt.loadNpmTasks('grunt-neuter');
  // grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  /*
    Default task. Compiles templates, neuters application code, and begins
    watching for changes.
  */
  grunt.registerTask('default', ['cssmin', 'emberTemplates', 'neuter', 'watch']);

  /*
    Build task. Runs everything as the default task, but without the watch.
   */
  grunt.registerTask('build', ['cssmin', 'emberTemplates', 'neuter']);
};
