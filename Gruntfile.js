module.exports = function (grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    coffee: {
      lib: {
        options: { bare: false },
        files: {
          'growlyflash.js': ['build/growlyflash.coffee']
        }
      },
    },
    concat: {
      'build/growlyflash.coffee': {
        src: [
          'lib/growlyflash/alert.coffee',
          'lib/growlyflash/listener.coffee',
          'lib/growlyflash.coffee',
        ],
        dest: 'build/growlyflash.coffee'
      },
    },
    less: {
      all: {
        src: 'less/*.less',
        dest: 'growlyflash.css',
        options: {
          compress: true
        }
      }
    },
    uglify: {
      build: {
        options: {
          preserveComments: 'some'
        },
        files: {
          'growlyflash.min.js': 'growlyflash.js'
        }
      }
    },
    watch: {
      all: {
        files: ['lib/**/*.coffee', 'less/**/*.less'],
        tasks: 'default'
      },
      dev: {
        files:  'lib/*.coffee' ,
        tasks: ['concat:build/growlyflash.coffee', 'coffee:lib']
      }
    },
  });

  grunt.registerTask('default', ['concat', 'coffee', 'less', 'uglify']);
};
