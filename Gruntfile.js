module.exports = function(grunt) {

  grunt.initConfig({

    // compile LESS files
    less: {
      compile: {
        files: [
          {
            expand: true,
            cwd: 'app/less',
            src: ['*.less'],
            dest: 'build/less/',
            ext: '.css'
          }
        ]
      }
    },

    // concatenate and minify CSS files
    cssmin: {
      combine: {
        files: {
          'dist/application.min.css': ['app/css/application.css', 'build/less/*.css']
        }
      }
    },

    // find Handlebars templates and precompile them into functions
    emberTemplates: {
      options: {
        templateName: function(sourceFile) {
          return sourceFile.replace(/app\/templates\//, '');
        }
      },
      'build/templates/templates.js': ["app/templates/**/*.hbs"]
    },

    // concatenate JavaScript code in one file
    neuter: {
      options: {
        includeSourceMap: true,
        sourceRoot: "..",
        template: "{%= src %}"
      },
      'dist/application.es6.js': ['app/app.js']
    },

    // uglify: {
    //   'build/application.min.js': 'build/application.js'
    // },

    // compile ECMAScript 6 generators into ES5 code
    regenerator: {
      options: {
        includeRuntime: true
      },
      'dist/application.js': 'dist/application.es6.js'
    },

    // watch files for changes
    watch: {
      application_code: {
        files: ['dependencies/**/*.js', 'app/**/*.js'],
        tasks: ['neuter', 'regenerator']
      },
      css_stylesheets: {
        files: ['app/css/*.css'],
        tasks: ['cssmin']
      },
      less_stylesheets: {
        files: ['app/less/*.less'],
        tasks: ['less', 'cssmin']
      },
      handlebars_templates: {
        files: ['app/templates/**/*.hbs'],
        tasks: ['emberTemplates', 'neuter', 'regenerator']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-ember-templates');
  grunt.loadNpmTasks('grunt-neuter');
  grunt.loadNpmTasks('grunt-regenerator');
  // grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  /*
    Default task. Compiles templates, neuters application code, and begins
    watching for changes.
  */
  grunt.registerTask('default', ['less', 'cssmin', 'emberTemplates', 'neuter', 'regenerator', 'watch']);

  /*
    Build task. Runs everything as the default task, but without the watch.
   */
  grunt.registerTask('build', ['less', 'cssmin', 'emberTemplates', 'neuter', 'regenerator']);
};
