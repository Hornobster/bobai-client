angular.module('starter.controllers', [ ])

    .controller('AppCtrl', function ($scope, $ionicModal, $ionicPopup, $http, $ionicHistory, $state, ConfigService, $timeout) {
        $scope.loggedUser = {
            loggedIn: false,
            userId: 0,
            username: 'anonymous',
            token: 'notoken'
        };

        if (localStorage.getItem('loggedIn') !== undefined) {
            $scope.loggedUser.loggedIn = localStorage.getItem('loggedIn') === 'true';
        }

        if (localStorage.getItem('userId') !== undefined) {
            $scope.loggedUser.userId = localStorage.getItem('userId');
        }

        if (localStorage.getItem('username') !== undefined) {
            $scope.loggedUser.username = localStorage.getItem('username');
        }

        if (localStorage.getItem('token') !== undefined) {
            $scope.loggedUser.token = localStorage.getItem('token');
        }

        // Form data for the login modal
        $scope.loginData = {};

        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;

            $scope.getCategories(); // this will also guarantee we are logged in
        });

        // Triggered in the login modal to close it
        $scope.closeLogin = function () {
            $scope.modal.hide();
        };

        // Open the login modal
        $scope.login = function () {
            $scope.modal.show();
        };

        // login request to server
        $scope.doLogin = function () {
            var req = {
                method: 'POST',
                url: ConfigService.server + '/login',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                data: {
                    username: $scope.loginData.username,
                    password: $scope.loginData.password
                }
            };

            $http(req).success(function(response){
                if (response.status === 200) {
                    localStorage.setItem('loggedIn', 'true');
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('userId', response.user.id);
                    localStorage.setItem('username', response.user.username);

                    $scope.loggedUser.loggedIn = true;
                    $scope.loggedUser.token = response.token;
                    $scope.loggedUser.userId = response.user.id;
                    $scope.loggedUser.username = response.user.username;

                    $scope.getCategories();

                    $scope.closeLogin();
                } else {
                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Something went wrong! Please check that you inserted the correct information (e.g. username) and try again.'
                    });
                }
            }).error(function(response) {
                if (response.status === 401) {
                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Wrong credentials! Make sure you entered the correct username/password and try again.'
                    });
                } else {
                    console.error('error when logging in');

                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Something went wrong! Please check that you inserted the correct information (e.g. username) and try again.'
                    });
                }
            });
        };

        // logout request to server
        $scope.logout = function() {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Logout',
                template: 'Are you sure you want to logout?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    var req = {
                        method: 'POST',
                        url: ConfigService.server + '/logout',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'x-key': $scope.loggedUser.userId,
                            'x-access-token': $scope.loggedUser.token
                        }
                    };

                    $http(req).success(function (response) {
                        if (response.status === 200) {
                            localStorage.setItem('loggedIn', 'false');
                            $scope.loggedUser.loggedIn = false;

                            var alertPopup = $ionicPopup.alert({
                                title: 'Success!',
                                template: 'You have logged out.'
                            });
                            alertPopup.then(function() {
                                $scope.login();
                            });
                        } else {
                            $ionicPopup.alert({
                                title: 'Oops!',
                                template: 'Something went wrong! Please try again.'
                            });
                        }
                    }).error(function (response) {
                        if (response.status === 401) {
                            localStorage.setItem('loggedIn', 'false');
                            $scope.loggedUser.loggedIn = false;

                            var alertPopup = $ionicPopup.alert({
                                title: 'Success!',
                                template: 'You have logged out.'
                            });
                            alertPopup.then(function() {
                                $scope.login();
                            });
                        } else {
                            console.error('error when logging out');

                            $ionicPopup.alert({
                                title: 'Oops!',
                                template: 'Something went wrong! Please try again.'
                            });
                        }
                    });
                }
            });
        };

        $scope.gotoSignup = function () {
            $scope.closeLogin();

            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });

            $state.go('app.signup');
        };

        $scope.getCategories = function () {
            var req = {
                method: 'GET',
                url: ConfigService.server + '/api/categories',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-key': $scope.loggedUser.userId,
                    'x-access-token': $scope.loggedUser.token
                }
            };

            $http(req).success(function(response){
                $scope.categories = response;
            }).error(function(response) {
                if (response.status === 401) {
                    $scope.login();
                } else {
                    $scope.categories = [{id: -1, name: "error"}]
                }
            });
        };
    })

    .controller('SignupCtrl', function($scope, $ionicHistory, $state, $http, $ionicPopup, ConfigService) {
        $scope.signupData = {};
        $scope.duplicates = {
            username: false,
            email: false,
            phone: false
        };

        $scope.gotoLogin = function () {
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });

            $state.go('app.home');

            $scope.login();
        };

        $scope.doSignup = function () {
            if ($scope.signupData.password !== $scope.signupData.repeat) {
                $ionicPopup.alert({
                    title: 'Oops!',
                    template: 'Passwords don\'t match.'
                });

                return;
            }

            var req = {
                method: 'POST',
                url: ConfigService.server + '/signup',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                data: {
                    username: $scope.signupData.username,
                    email: $scope.signupData.email,
                    phone: $scope.signupData.mobile,
                    password: $scope.signupData.password
                }
            };

            $http(req).success(function(response){
                if (response.status === 200) {
                    var popup = $ionicPopup.alert({
                        title: 'Congratulations!',
                        template: 'Welcome to Bobai! You can now login.'
                    });
                    popup.then(function () {
                        $ionicHistory.nextViewOptions({
                            disableAnimate: true,
                            disableBack: true
                        });

                        $state.go('app.home');
                        $scope.login();
                    });
                } else {
                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Something went wrong! Please try again.'
                    });
                }
            }).error(function(response) {
                if (response.status === 400) {
                    if (response.duplicates) {
                        var popupAlert = $ionicPopup.alert({
                            title: 'Oops!',
                            template: 'Someone already used your username, email or mobile number! Please try another.'
                        });
                        popupAlert.then(function () {
                            $scope.duplicates = response.duplicates;
                        });
                    } else {
                        $ionicPopup.alert({
                            title: 'Oops!',
                            template: 'Something went wrong! Please try again.'
                        });
                    }
                } else {
                    console.error('error when signing up');

                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Something went wrong! Please try again.'
                    });
                }
            });
        };
    })

    .controller('HomeCtrl', function($scope, $ionicHistory, $state) {
        $scope.seek = function () {
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });

            $state.go('app.seek');
        };

        $scope.manageAds = function () {
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });

            $state.go('app.myads');
        };
    })

    .controller('SeekCtrl', function($scope, $ionicPopup, $ionicHistory, $state, $http, $cordovaGeolocation, ConfigService) {
        $scope.seekData = {
            homeDelivery: false,
            radius: 10,
            duration: 24
        };

        $scope.gpsFound = false;
        $scope.spinning = false;

        $scope.getGPS = function () {
            $scope.spinning = true;
            $cordovaGeolocation.getCurrentPosition({enableHighAccuracy: true})
                .then(
                function (position) {
                    $scope.seekData.lat = position.coords.latitude;
                    $scope.seekData.lon = position.coords.longitude;
                    $scope.gpsFound = true;
                    $scope.spinning = false;
                },
                function () {
                    $scope.gpsFound = false;
                    $scope.spinning = false;
                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Something went wrong! Please make sure GPS is enabled and try again.'
                    });
                });
        };

        $scope.fixRadiusInput = function () {
            $scope.seekData.radius = 100;
        };

        $scope.doSeek = function () {
            if (!$scope.loggedUser.loggedIn) {
                var popup = $ionicPopup.alert({
                    title: 'Oops!',
                    template: 'You need to be logged in.'
                });
                popup.then(function() {
                    $scope.login();
                });

                return;
            }

            if (!$scope.gpsFound) {
                $ionicPopup.alert({
                    title: 'Oops!',
                    template: 'We need your current position.'
                });

                return;
            }

            var req = {
                method: 'POST',
                url: ConfigService.server + '/api/ads',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-key': $scope.loggedUser.userId,
                    'x-access-token': $scope.loggedUser.token
                },
                data: {
                    title: $scope.seekData.title,
                    description: $scope.seekData.description,
                    category: $scope.seekData.category,
                    radius: $scope.seekData.radius / 2,
                    lat: $scope.seekData.lat,
                    lon: $scope.seekData.lon,
                    duration: $scope.seekData.duration
                }
            };

            $http(req).success(function(response){
                if (response.status === 200) {
                    $ionicPopup.alert({
                        title: 'Congratulations!',
                        template: 'Your ad has been posted.'
                    });

                    $ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });

                    $state.go('app.home');
                } else {
                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Something went wrong! Please try again.'
                    });
                }
            }).error(function(response) {
                if (response.status === 401) {
                    var popup = $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'You need to be logged in.'
                    });
                    popup.then(function() {
                        $scope.login();
                    });
                } else {
                    console.error('error when posting ad');

                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Something went wrong! Please try again.'
                    });
                }
            });
        };
    })

    .controller('MyAdsCtrl', function ($scope, $http, $ionicPopup, ConfigService) {
        $scope.myadsData = {
            categoryFilter: 0,
            myads: []
        };

        $scope.getMyAds = function () {
            var req = {
                method: 'GET',
                url: ConfigService.server + '/api/adsOf/' + $scope.loggedUser.userId + ($scope.myadsData.categoryFilter != 0 ? '?category=' + $scope.myadsData.categoryFilter : ''),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-key': $scope.loggedUser.userId,
                    'x-access-token': $scope.loggedUser.token
                }
            };

            $http(req).success(function(response){
                $scope.myadsData.myads = response;
                $scope.myadsData.myads.forEach(function (ad) {
                    ad.duration = Math.floor((new Date(ad.date_expires) - Date.now()) / 3600000);
                });
            }).error(function(response) {
                if (response.status === 401) {
                    var popup = $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'You need to be logged in.'
                    });
                    popup.then(function() {
                        $scope.login();
                    });
                } else {
                    console.log('error when loading my ads');

                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Something went wrong! Please try again.'
                    });
                }
            });
        };
        $scope.getMyAds();
    })

    .controller('MyAdCtrl', function ($scope, $stateParams, $http, $ionicPopup, ConfigService) {
        $scope.myadData = {};

        var req = {
            method: 'GET',
            url: ConfigService.server + '/api/ads/' + $stateParams.id,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-key': $scope.loggedUser.userId,
                'x-access-token': $scope.loggedUser.token
            }
        };

        $http(req).success(function(response){
            $scope.myadData.myad = response;
            $scope.myadData.myad.duration = Math.floor((new Date($scope.myadData.myad.date_expires) - Date.now()) / 3600000);
            $scope.categories.forEach(function (cat) {
                if (cat.id === $scope.myadData.myad.category) {
                    $scope.myadData.myad.category = cat.name;
                }
            });
        }).error(function(response) {
            if (response.status === 401) {
                var popup = $ionicPopup.alert({
                    title: 'Oops!',
                    template: 'You need to be logged in.'
                });
                popup.then(function() {
                    $scope.login();
                });
            } else {
                console.log('error when loading my ads');

                $ionicPopup.alert({
                    title: 'Oops!',
                    template: 'Something went wrong! Please try again.'
                });
            }
        });
    })

    .controller('MyAdPropsCtrl', function ($scope, $stateParams, $http, $ionicPopup, ConfigService) {
        $scope.test = $stateParams.adid;
    })

    .factory('ConfigService', function() {
        return {
            server: 'http://192.168.1.110:3000'
        }
    });
