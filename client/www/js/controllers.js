angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, $ionicModal, $ionicPopup, $http, $ionicHistory, $state, $cordovaGeolocation, $ionicLoading, ConfigService) {
        $scope.loggedUser = {
            loggedIn: false,
            userId: 0,
            username: 'anonymous',
            token: 'notoken',
            lat: 0.0,
            lon: 0.0,
            gpsValid: false
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

            $http(req).success(function (response) {
                if (response.status === 200) {
                    localStorage.setItem('loggedIn', 'true');
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('userId', response.user.id);
                    localStorage.setItem('username', response.user.username);

                    $scope.loggedUser.loggedIn = true;
                    $scope.loggedUser.token = response.token;
                    $scope.loggedUser.userId = response.user.id;
                    $scope.loggedUser.username = response.user.username;

                    $ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });

                    $state.go('app.home');

                    $scope.getCategories();

                    $scope.closeLogin();
                } else {
                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Qualcosa é andato storto! Assicurati di aver inserito le informazioni corrette (es. nome utente) e riprova.'
                    });
                }
            }).error(function (response) {
                if (response.status === 401) {
                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Assicurati di aver inserito correttamente username/password e riprova.'
                    });
                } else {
                    console.error('error when logging in');

                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Qualcosa é andato storto! Assicurati di aver inserito le informazioni corrette (es. nome utente) e riprova.'
                    });
                }
            });
        };

        // logout request to server
        $scope.logout = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Logout',
                template: 'Sei sicuro di voler uscire?',
                cancelText: 'No',
                okText: 'Si'
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
                                title: 'Disconnesso!'
                            });
                            alertPopup.then(function () {
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
                    }).error(function (response) {
                        if (response.status === 401) {
                            localStorage.setItem('loggedIn', 'false');
                            $scope.loggedUser.loggedIn = false;

                            var alertPopup = $ionicPopup.alert({
                                title: 'Success!',
                                template: 'You have logged out.'
                            });
                            alertPopup.then(function () {
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

            $http(req).success(function (response) {
                $scope.categories = response;
            }).error(function (response) {
                if (response.status === 401) {
                    $scope.login();
                } else {
                    $scope.categories = [{id: -1, name: "error"}]
                }
            });
        };

        $scope.exit = function () {
            ionic.Platform.exitApp();
        };

        $scope.isAndroid = function () {
            return ionic.Platform.isAndroid();
        };

        $scope.showGPSLoading = function () {
            $ionicLoading.show({
                template: '<ion-spinner class="centered"></ion-spinner>' +
                '<p>Localizzazione GPS in corso...</p>' +
                '<button ng-show="isAndroid()" class="button button-positive" ng-click="exit()">Annulla ed esci</button>',
                scope: $scope
            });
        };

        $scope.hideGPSLoading = function () {
            $ionicLoading.hide();
        };

        $scope.getGPS = function () {
            $cordovaGeolocation.getCurrentPosition({enableHighAccuracy: true})
                .then(
                function (position) {
                    $scope.loggedUser.gpsValid = true;
                    $scope.loggedUser.lat = position.coords.latitude;
                    $scope.loggedUser.lon = position.coords.longitude;
                    $scope.hideGPSLoading();

                    $scope.getCategories();
                },
                function () {
                    $scope.loggedUser.gpsValid = false;

                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Qualcosa é andato storto! Assicurati che il GPS sia attivo e riprova.'
                    }).then(function () {
                        $scope.hideGPSLoading();

                        $ionicHistory.nextViewOptions({
                            disableAnimate: true,
                            disableBack: true
                        });

                        $state.go('app.home');
                    });
                });
        };

        $scope.showGPSLoading();
        $scope.getGPS();
    })

    .controller('SignupCtrl', function ($scope, $ionicHistory, $state, $http, $ionicPopup, ConfigService) {
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
                    template: 'Le password non corrispondono.'
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

            $http(req).success(function (response) {
                if (response.status === 200) {
                    var popup = $ionicPopup.alert({
                        title: 'Congratulazioni!',
                        template: 'Benvenuto su Bobai! Ora puoi effettuare il login.'
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
                        template: 'Qualcosa é andato storto! Riprova.'
                    });
                }
            }).error(function (response) {
                if (response.status === 400) {
                    if (response.duplicates) {
                        var popupAlert = $ionicPopup.alert({
                            title: 'Oops!',
                            template: 'Username, email e/o numero di telefono non disponibili!'
                        });
                        popupAlert.then(function () {
                            $scope.duplicates = response.duplicates;
                        });
                    } else {
                        $ionicPopup.alert({
                            title: 'Oops!',
                            template: 'Qualcosa é andato storto! Riprova.'
                        });
                    }
                } else {
                    console.error('error when signing up');

                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Qualcosa é andato storto! Riprova.'
                    });
                }
            });
        };
    })

    .controller('HomeCtrl', function ($scope, $ionicHistory, $state) {
        $scope.seek = function () {
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });

            $state.go('app.seek');
        };

        $scope.propose = function () {
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });

            $state.go('app.propose');
        };

        $scope.manageAds = function () {
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });

            $state.go('app.myads');
        };
    })

    .controller('SeekCtrl', function ($scope, $ionicPopup, $ionicHistory, $state, $http, $cordovaGeolocation, ConfigService) {
        $scope.seekData = {
            homeDelivery: false,
            radius: 10,
            duration: 24
        };

        $scope.fixRadiusInput = function () {
            $scope.seekData.radius = 100;
        };

        $scope.doSeek = function () {
            if (!$scope.loggedUser.loggedIn) {
                var popup = $ionicPopup.alert({
                    title: 'Oops!',
                    template: 'Devi aver effettuato il login.'
                });
                popup.then(function () {
                    $scope.login();
                });

                return;
            }

            if (!$scope.loggedUser.gpsValid) {
                $ionicPopup.alert({
                    title: 'Oops!',
                    template: 'Abbiamo bisogno della tua posizione corrente.'
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
                    lat: $scope.loggedUser.lat,
                    lon: $scope.loggedUser.lon,
                    duration: $scope.seekData.duration,
                    homeDelivery: ($scope.seekData.homeDelivery ? 1 : 0)
                }
            };

            $http(req).success(function (response) {
                if (response.status === 200) {
                    $ionicPopup.alert({
                        title: 'Congratulazioni!',
                        template: 'Il tuo annuncio é stato pubblicato.'
                    });

                    $ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });

                    $state.go('app.home');
                } else {
                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Qualcosa é andato storto! Riprova.'
                    });
                }
            }).error(function (response) {
                if (response.status === 401) {
                    var popup = $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Devi aver effettuato il login.'
                    });
                    popup.then(function () {
                        $scope.login();
                    });
                } else {
                    console.error('error when posting ad');

                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Qualcosa é andato storto! Riprova.'
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

            $http(req).success(function (response) {
                $scope.myadsData.myads = response;
                $scope.myadsData.myads.forEach(function (ad) {
                    ad.duration = Math.floor((new Date(ad.date_expires) - Date.now()) / 3600000);
                });
            }).error(function (response) {
                if (response.status === 401) {
                    var popup = $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Devi aver effettuato il login.'
                    });
                    popup.then(function () {
                        $scope.login();
                    });
                } else {
                    console.log('error when loading my ads');

                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Qualcosa é andato storto! Riprova.'
                    });
                }
            });
        };

        $scope.$on('$ionicView.afterEnter', function () {
            $scope.getMyAds();
        });
    })

    .controller('MyAdCtrl', function ($scope, $stateParams, $http, $state, $ionicPopup, ConfigService) {
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

        $http(req).success(function (response) {
            $scope.myadData.myad = response;
            $scope.myadData.myad.duration = Math.floor((new Date($scope.myadData.myad.date_expires) - Date.now()) / 3600000);
            $scope.myadData.myad.homeDelivery = $scope.myadData.myad.homeDelivery ? 'si' : 'no';
            $scope.categories.forEach(function (cat) {
                if (cat.id === $scope.myadData.myad.category) {
                    $scope.myadData.myad.category = cat.name;
                }
            });
        }).error(function (response) {
            if (response.status === 401) {
                var popup = $ionicPopup.alert({
                    title: 'Oops!',
                    template: 'Devi aver effettuato il login.'
                });
                popup.then(function () {
                    $scope.login();
                });
            } else {
                console.log('error when loading my ads');

                $ionicPopup.alert({
                    title: 'Oops!',
                    template: 'Qualcosa é andato storto! Riprova.'
                });
            }
        });

        $scope.gotoAdProps = function () {
            $state.go('app.myadprops', {
                data: $scope.myadData
            });
        };
    })

    .controller('MyAdPropsCtrl', function ($scope, $stateParams, $http, $ionicPopup, ConfigService) {
        $scope.myad = $stateParams.data.myad;

        $scope.getAdProps = function () {
            var req = {
                method: 'GET',
                url: ConfigService.server + '/api/proposals/' + $scope.myad.id + '/' + $scope.loggedUser.lat + '/' + $scope.loggedUser.lon,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-key': $scope.loggedUser.userId,
                    'x-access-token': $scope.loggedUser.token
                }
            };

            $http(req).success(function (response) {
                $scope.myadprops = response;
                $scope.myadprops.forEach(function (prop) {
                    prop.photo = ConfigService.server + '/' + prop.photo;
                });
            }).error(function (response) {
                if (response.status === 401) {
                    var popup = $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Devi aver effettuato il login.'
                    });
                    popup.then(function () {
                        $scope.login();
                    });
                } else {
                    console.log('error when loading ad props');

                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Qualcosa é andato storto! Riprova.'
                    });
                }
            });
        };

        $scope.$on('$ionicView.afterEnter', function () {
            $scope.getAdProps();
        });
    })

    .controller('MyPropsCtrl', function ($scope, $http, $ionicPopup, ConfigService) {
        $scope.mypropsData = {
            categoryFilter: 0,
            myprops: []
        };

        $scope.getMyProps = function () {
            var req = {
                method: 'GET',
                url: ConfigService.server + '/api/proposalsOf/' + $scope.loggedUser.userId + ($scope.mypropsData.categoryFilter != 0 ? '?category=' + $scope.mypropsData.categoryFilter : ''),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-key': $scope.loggedUser.userId,
                    'x-access-token': $scope.loggedUser.token
                }
            };

            $http(req).success(function (response) {
                $scope.mypropsData.myprops = response;
                $scope.mypropsData.myprops.forEach(function (prop) {
                    prop.photo = ConfigService.server + '/' + prop.photo;
                });
            }).error(function (response) {
                if (response.status === 401) {
                    var popup = $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Devi aver effettuato il login.'
                    });
                    popup.then(function () {
                        $scope.login();
                    });
                } else {
                    console.log('error when loading my props');

                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Qualcosa é andato storto! Riprova.'
                    });
                }
            });
        };

        $scope.$on('$ionicView.afterEnter', function () {
            $scope.getMyProps();
        });
    })

    .controller('ProposeCtrl', function ($scope, $http, $ionicPopup, $ionicLoading, $cordovaGeolocation, $state, $ionicHistory, ConfigService) {
        $scope.proposeData = {
            categoryFilter: 0,
            ads: [],
            lat: null,
            lon: null
        };

        $scope.getNearbyAds = function () {
            var req = {
                method: 'GET',
                url: ConfigService.server + '/api/adsNearby/' + $scope.loggedUser.lat + '/' + $scope.loggedUser.lon + '/' + (localStorage.getItem('adsLimit') || 25) + ($scope.proposeData.categoryFilter != 0 ? '?category=' + $scope.proposeData.categoryFilter : ''),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-key': $scope.loggedUser.userId,
                    'x-access-token': $scope.loggedUser.token
                }
            };

            $http(req).success(function (response) {
                $scope.proposeData.ads = response;
                $scope.proposeData.ads.forEach(function (ad) {
                    ad.duration = Math.floor((new Date(ad.date_expires) - Date.now()) / 3600000);
                });
                $scope.proposeData.ads = $scope.proposeData.ads.filter(function (ad) {
                    return ad.duration >= 0 && ad.userid != $scope.loggedUser.userId;
                });
            }).error(function (response) {
                if (response.status === 401) {
                    var popup = $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Devi aver effettuato il login.'
                    });
                    popup.then(function () {
                        $scope.login();
                    });
                } else {
                    console.log('error when loading nearby ads');

                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Qualcosa é andato storto! Riprova.'
                    });
                }
            });
        };

        $scope.$on('$ionicView.afterEnter', function () {
            $scope.getNearbyAds();
        });
    })

    .controller('ProposeToAdCtrl', function ($scope, $stateParams, $ionicPopup, $ionicLoading, $http, $cordovaGeolocation, $state, $ionicHistory, ConfigService) {
        $scope.proposeToAdData = {
            adId: $stateParams.adid,
            price: 0,
            notes: '',
            lat: $scope.loggedUser.lat,
            lon: $scope.loggedUser.lon
        };

        $scope.photoSelected = false;
        $scope.photoURI = '';

        $scope.doPropose = function () {
            console.log('proposing');

            if (!$scope.loggedUser.loggedIn) {
                var popup = $ionicPopup.alert({
                    title: 'Oops!',
                    template: 'Devi aver effettuato il login.'
                });
                popup.then(function () {
                    $scope.login();
                });

                return;
            }


            if ($scope.photoSelected) {
                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = $scope.photoURI.substr($scope.photoURI.lastIndexOf('/') + 1);
                options.mimeType = "image/jpeg";
                options.params = $scope.proposeToAdData;
                options.headers = {
                    'x-key': $scope.loggedUser.userId,
                    'x-access-token': $scope.loggedUser.token
                };

                var ft = new FileTransfer();
                ft.upload($scope.photoURI, encodeURI(ConfigService.server + '/api/proposals'), function () {
                    $ionicPopup.alert({
                        title: 'Successo!',
                        template: 'Proposta pubblicata.'
                    }).then(function () {
                        $ionicHistory.nextViewOptions({
                            disableAnimate: true,
                            disableBack: true
                        });

                        $state.go('app.myprops');
                    });
                }, function () {
                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: 'Qualcosa é andato storto.'
                    });
                }, options);
            } else {
                var req = {
                    method: 'POST',
                    url: ConfigService.server + '/api/proposals',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'x-key': $scope.loggedUser.userId,
                        'x-access-token': $scope.loggedUser.token
                    },
                    data: $scope.proposeToAdData
                };

                $http(req).success(function (response) {
                    $ionicPopup.alert({
                        title: 'Successo!',
                        template: 'Proposta pubblicata.'
                    }).then(function () {
                        $ionicHistory.nextViewOptions({
                            disableAnimate: true,
                            disableBack: true
                        });

                        $state.go('app.myprops');
                    });
                }).error(function (response) {
                    if (response.status === 401) {
                        var popup = $ionicPopup.alert({
                            title: 'Oops!',
                            template: 'Devi aver effettuato il login.'
                        });
                        popup.then(function () {
                            $scope.login();
                        });
                    } else {
                        console.log('error when loading nearby ads');

                        $ionicPopup.alert({
                            title: 'Oops!',
                            template: 'Qualcosa é andato storto! Riprova.'
                        });
                    }
                });
            }
        };

        $scope.getPhoto = function () {
            console.log('getting photo');

            navigator.camera.getPicture(function (imageUri) {
                    $scope.$apply(function () {
                        $scope.photoURI = imageUri;
                        $scope.photoSelected = true;
                    });
                },
                function () {
                    $scope.$apply(function () {
                        $scope.photoSelected = false;
                    });
                },
                {
                    quality: 50,
                    destinationType: navigator.camera.DestinationType.FILE_URI,
                    sourceType: navigator.camera.PictureSourceType.CAMERA
                }
            );
        };
    })

    .controller('ProposeDetailCtrl', function ($scope, $stateParams, $http, $ionicPopup, ConfigService) {
        $scope.proposeDetailData = {
            id: $stateParams.adid,
            title: '',
            description: '',
            homeDelivery: 'no',
            date_created: '',
            date_expires: '',
            duration: 0,
            category: ''
        };

        var req = {
            method: 'GET',
            url: ConfigService.server + '/api/ads/' + $stateParams.adid,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-key': $scope.loggedUser.userId,
                'x-access-token': $scope.loggedUser.token
            }
        };

        $http(req).success(function (response) {
            $scope.proposeDetailData = response;
            $scope.proposeDetailData.duration = Math.floor((new Date($scope.proposeDetailData.date_expires) - Date.now()) / 3600000);
            $scope.proposeDetailData.homeDelivery = $scope.proposeDetailData.homeDelivery ? 'si' : 'no';
            $scope.categories.forEach(function (cat) {
                if (cat.id === $scope.proposeDetailData.category) {
                    $scope.proposeDetailData.category = cat.name;
                }
            });
        }).error(function (response) {
            if (response.status === 401) {
                var popup = $ionicPopup.alert({
                    title: 'Oops!',
                    template: 'Devi aver effettuato il login.'
                });
                popup.then(function () {
                    $scope.login();
                });
            } else {
                console.log('error when loading propose detail');

                $ionicPopup.alert({
                    title: 'Oops!',
                    template: 'Qualcosa é andato storto! Riprova.'
                });
            }
        });
    })

    .factory('ConfigService', function () {
        return {
            server: 'http://192.168.1.110:3000'
        }
    });
