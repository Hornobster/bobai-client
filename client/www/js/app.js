// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: 'AppCtrl'
            })

            .state('app.home', {
                url: "/home",
                views: {
                    'menuContent': {
                        templateUrl: "templates/home.html",
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('app.myads', {
                url: "/myads",
                views: {
                    'menuContent': {
                        templateUrl: "templates/myads.html",
                        controller: 'MyAdsCtrl'
                    }
                }
            })

            .state('app.myad', {
                url: "/myads/:id",
                views: {
                    'menuContent': {
                        templateUrl: "templates/myad.html",
                        controller: 'MyAdCtrl'
                    }
                }
            })

            .state('app.myadprops', {
                url: "/myads/:adid/proposals",
                views: {
                    'menuContent': {
                        templateUrl: "templates/myadprops.html",
                        controller: 'MyAdPropsCtrl'
                    }
                }
            })

            .state('app.myprops', {
                url: "/myprops",
                views: {
                    'menuContent': {
                        templateUrl: "templates/myprops.html"
                    }
                }
            })

            .state('app.seek', {
                url: "/seek",
                views: {
                    'menuContent': {
                        templateUrl: "templates/seek.html",
                        controller: 'SeekCtrl'
                    }
                }
            })

            .state('app.propose', {
                url: "/propose",
                views: {
                    'menuContent': {
                        templateUrl: "templates/propose.html",
                        controller: 'ProposeCtrl'
                    }
                }
            })

            .state('app.proposedetail', {
                url: "/propose/:adid",
                views: {
                    'menuContent': {
                        templateUrl: "templates/proposedetail.html",
                        controller: 'ProposeDetailCtrl'
                    }
                }
            })

            .state('app.proposetoad', {
                url: "/propose/:adid/post",
                views: {
                    'menuContent': {
                        templateUrl: "templates/proposetoad.html",
                        controller: 'ProposeToAdCtrl'
                    }
                }
            })

            .state('app.signup', {
                url: "/signup",
                views: {
                    'menuContent': {
                        templateUrl: "templates/signup.html",
                        controller: 'SignupCtrl'
                    }
                }
            })

            .state('app.settings', {
                url: "/settings",
                views: {
                    'menuContent': {
                        templateUrl: "templates/settings.html"
                    }
                }
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/home');
    });
