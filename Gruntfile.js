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

    // concatenates and minifies CSS files
    cssmin: {
      combine: {
        files: {
          'dist/application.min.css': ['app/css/sb-admin.css', 'app/css/visual_graph.css',
            'build/less/*.css']
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
      'build/templates/templates.js': ["app/templates/**/*.hbs"]
    },

    // concatenate JavaScript code in one file
    neuter: {
      options: {
        includeSourceMap: true,
        sourceRoot: "..",
        template: "{%= src %}"
      },
      'build/application.es6.js': ['app/app.js']
    },

    traceur: {
      options: {
        debug: true,
        sourceMaps: false,
        freeVariableChecker: false
      },
      'build/application.js': ['build/application.es6.js']
    },

    uglify: {
      options: {
        sourceMap: true,
        sourceMapIn: "build/application.es6.js.map"
      },
      'dist/application.min.js': 'build/application.js'
    },

    // watch files for changes
    watch: {
      application_code: {
        files: ['dependencies/**/*.js', 'app/**/*.js'],
        tasks: ['neuter', 'traceur']
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
        tasks: ['emberTemplates', 'neuter', 'traceur']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-ember-templates');
  grunt.loadNpmTasks('grunt-neuter');
  grunt.loadNpmTasks('grunt-traceur');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  /*
    Default task. Compiles templates, neuters application code, and begins
    watching for changes.
  */
  grunt.registerTask('default', ['less', 'cssmin', 'emberTemplates', 'neuter', 'traceur', 'uglify', 'watch']);

  /*
    Build task. Runs everything as the default task, but without the watch.
   */
  grunt.registerTask('build', ['less', 'cssmin', 'emberTemplates', 'neuter', 'traceur', 'uglify']);
};
