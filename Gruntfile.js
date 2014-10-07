module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        webpack: {
            dev: {
                entry: './src/main.js',
                output: {
                    path: 'build/',
                    filename: 'bundle.js'
                },
                stats: {
                    colors: true,
                    modules: false,
                    reasons: true
                }
            }
        },
        jslint: {
            js: {
                src: [
                    'src/main.js',
                    'src/lib/**/*.js'
                ],
                directives: {
                    plusplus: true,
                    vars: true,
                    newcap: true,
                    predef: [ '$' ],
                    sloppy: true,
                    node: true,
                    white: true,
                    browser: true
                }
            }
        },
        watch: {
            js: {
                files: [
                    'src/**/*.js',
                ],
                tasks: [ 'jslint', 'webpack' ],
                livereload: true
            },
            other: {
                files: [
                    'src/assets/**',
                    'src/*.css',
                    'src/index.html'
                ],
                tasks: [ 'copy' ],
                livereload: true
            }
        },
        copy: {
            main: {
                expand: true,
                cwd: 'src/',
                src: [
                    'assets/**',
                    'index.html',
                    '*.css'
                ],
                dest: 'build/',
                filter: 'isFile'
            }
        },
        connect: {
            server: {
                options: {
                    port: 3000,
                    base: 'build',
                    middleware: function(connect, options) {
                        return [
                            function(req, res, next) {
                                //res.setHeader('Access-Control-Allow-Origin', '*');
                                res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
                                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
                                // don't just call next() return it
                                return next();
                            },
                            // add other middlewares here 
                            connect.static(require('path').resolve('build'))
                        ];
                    }
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-jslint');

    // Default task(s).
    grunt.registerTask('default', ['jslint', 'webpack:dev', 'copy']);
    grunt.registerTask('dist', ['jslint', 'webpack:dist', 'copy']);
    grunt.registerTask('develop', ['connect', 'watch']);
};
