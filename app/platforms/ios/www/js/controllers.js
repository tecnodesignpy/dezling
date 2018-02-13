angular.module('starter.controllers', ["angucomplete-alt",])

.controller('AppCtrl', function ($rootScope, $scope, $ionicHistory, $ionicModal, $timeout,
 $ionicScrollDelegate, StorageService, $state, $ionicPopup, $ionicSlideBoxDelegate, $ionicLoading, 
 Auth, Profile, Favoritos, $cordovaDevice, $localStorage, Notificaciones) {

  //amMoment.changeTimezone('America/Asuncion');
  $scope.AuthData = Auth.AuthData;

  $scope.$on("$ionicView.enter", function (event, data) {
    //  Chequeamos las notificaciones y lo guardamos en el cache dentro del Service
    // modificamos el BADGE de la campana de notificaciones
    CheckNotificaciones();
  });

  $scope.$on("$ionicView.beforeEnter", function (event, data) {
    loadWallet();
  });

    // Creamos una funcion para ir categorias, donde limpiamos el cache en el caso de que el usuario
    // haya entrado a algun comercio desde el buscador, porque dentro de CategoriaContent usamos IonicHistory
    $scope.goToCategorias = function(){
      $ionicHistory.clearCache().then(function(){ $state.go('app.categorias');});
    }
    $scope.goToPerfil = function(){
      $ionicHistory.clearCache().then(function(){ $state.go('app.perfil');});
    }
    $scope.goToHome = function(){
      $ionicHistory.clearCache().then(function(){ $state.go('app.editorial');});
    }

  $scope.$on("$ionicView.afterLeave", function (event, data) {
    // handle event
    $ionicScrollDelegate.scrollTop();

    //  Chequeamos las notificaciones y lo guardamos en el cache dentro del Service
    // modificamos el BADGE de la campana de notificaciones
    CheckNotificaciones();

  });

  // Cuando
  $scope.$on('modal.shown', function(event, data) {
    if(data.id === 'notificaciones'){
      CheckNotificaciones();
    }
  });

  function CheckNotificaciones() {
    $scope.lista_notificaciones = [];
    $scope.hay_nuevas = false;
    $scope.hay_vigentes = false;
    $scope.error = false;
    $scope.campana = 0;
    if (window.cordova){
      cordova.plugins.notification.badge.set($scope.campana);
    }
    //////console.log("Check Notificaciones");
    // Check si esta habilitado recibir notificaciones
    
    $scope.AuthData = Auth.AuthData;
    Profile.notificaciones($scope.AuthData.uid).then(function(success){
      //console.log(success);
      if(success != null || success != 'null'){
        //console.log(success);
        //console.log(Profile.notificacion);
        if(success.activada == true && (success != null || success != 'null')){
          //////console.log("Habilitado para recibir notificaciones " + Profile.notificacion.activada );
          // Obtenemos las notificaciones
          Profile.GetNotificaciones(Auth.AuthData.uid).then(function(result){
            //////console.log(result);
            var timeNow = new Date();
            if(result != null){
              // Recorremos las notificaciones para obtener las nuevas y las vigentes
              angular.forEach(result,function (detalles,key) {
                ////console.log(detalles);
                const [day, month, year] = detalles.fechainicio.split("/")
                const [day1, month1, year1] = detalles.fechafin.split("/")
                //////console.log(detalles);
                if(new Date(year, month - 1, day).getTime() == timeNow.getTime() || new Date(year, month - 1, day).getTime() < timeNow.getTime()){
                  if(new Date(year1, month1 - 1, day1).getTime() == timeNow.getTime() || new Date(year1, month1 - 1, day1).getTime() > timeNow.getTime()){
                    if(detalles.estado == 'nueva'){
                      // Cambiamos la variable para mostrar el label de Nuevas, despues debemos cambiar de posicion al hacer el filtro por fecha
                      setTimeout(function(){
                          $scope.hay_nuevas = true;
                          $scope.$apply();
                      }, 0);  
                      $scope.campana = $scope.campana + 1; 
                      if (window.cordova){
                        cordova.plugins.notification.badge.set($scope.campana);
                      }
                      $scope.lista_notificaciones.push({datos: detalles.detalle, estado: detalles.estado, avatar: detalles.avatar || detalles.icono, id:key});

                    }else{
                      // Cambiamos la variable para mostrar el label de Nuevas, despues debemos cambiar de posicion al hacer el filtro por fecha
                      setTimeout(function(){
                          $scope.hay_vigentes = true;
                          $scope.$apply();
                      }, 0);  
                      $scope.lista_notificaciones.push({datos: detalles.detalle, estado: detalles.estado, avatar: detalles.avatar || detalles.icono, id:key});

                    }
                  }
                }
              });
            }else{
              $scope.hay_nuevas = false;
              $scope.hay_vigentes = false;
            }
          },function(error){
              //error
              $scope.error = true;
          });
        }else{
          //////console.log("NO Habilitado para recibir notificaciones");
        }
      }
    },function(error){
        //////console.log(error);
    });

  };

  $scope.MarcarVigentes = function(){
    //////console.log("Vamos a poner como vigente la notificacion");

    angular.forEach($scope.lista_notificaciones,function (detalles,key) {
      //////console.log(detalles)
      if(detalles.estado == "nueva"){
        // Ahora ponemos como Vigente en Firebase
        Notificaciones.UpdateNotificaciones(Auth.AuthData.uid,detalles.id).then(function(success){
          //////console.log(success);
        });
        setTimeout(function(){
            $scope.hay_nuevas = false;
            $scope.$apply();
        }, 0);     
      }
    });

  };




  // ---------------------------------------------------------------------------
  // Favoritos
  $scope.WalletList = Favoritos.CachedList;
  function loadWallet() {
    Favoritos.load($scope.AuthData).then(
      function(success){
        $scope.WalletList = Favoritos.CachedList;
      });
  };


  // Modal de Notificaciones
  $ionicModal.fromTemplateUrl('templates/modal/notificaciones.html', {
    id: 'notificaciones',
    scope: $scope
  }).then(function (modal) {
    $scope.NotificacionesModal = modal;
  });
  $scope.closeNotificaciones = function () {
    $scope.NotificacionesModal.hide();
  };
  $scope.irPerfil = function () {
    $scope.NotificacionesModal.hide();
    $state.go('app.perfil');
  };

  $scope.OpenNotificaciones = function () {
    //Verificamos si esta la sesion iniciada
    var user = firebase.auth().currentUser;
    if (user != null) {
      $scope.NotificacionesModal.show();
    }else{
      $state.go('mensaje_login');
    }
  };



  // Create the search modal that we will use later
  $ionicModal.fromTemplateUrl('templates/modal/search-product.html', {
    id: 'search',
    scope: $scope
  }).then(function (modal) {
    $scope.searchModal = modal;
  });
  $scope.closeSearchModal = function () {
    $scope.searchModal.hide();
  };

  $scope.openSearchModal = function () {
    //Verificamos si esta la sesion iniciada
    var user = firebase.auth().currentUser;
    if (user != null) {
      $scope.searchModal.show();
    }else{
      $state.go('mensaje_login');
    }
  };

  // Create the settings modal
  $ionicModal.fromTemplateUrl('templates/modal/settings.html', {
    id: 'settings',
    scope: $scope
  }).then(function (modal) {
    $scope.settingsModal = modal;
  });

  $scope.closeSettingsModal = function () {
    $scope.settingsModal.hide();
  };

  $scope.openSettingsModal = function () {
    $scope.settingsModal.show();
  };

  // Create the edit profile modal
  $ionicModal.fromTemplateUrl('templates/modal/edit-profile.html', {
    id: 'edit-profile',
    scope: $scope
  }).then(function (modal) {
    $scope.editProfileModal = modal;
  });
  $scope.closeEditProfileModal = function () {
    $scope.editProfileModal.hide();
  };

  $scope.openEditProfileModal = function () {
    $scope.editProfileModal.show();
  };

  // Create the change password modal
  $ionicModal.fromTemplateUrl('templates/modal/change-password.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.changePasswordModal = modal;
  });
  $scope.closeChangePasswordModal = function () {
    $scope.changePasswordModal.hide();
  };

  $scope.openChangePasswordModal = function () {
    $scope.changePasswordModal.show();
  };



  // Terms and conditions modal
  $ionicModal.fromTemplateUrl('templates/modal/terms.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.termsModal = modal;
  });
  $scope.closeTermsModal = function () {
    $scope.termsModal.hide();
  };

  $scope.openTermsModal = function () {
    //////console.log('clicked');
    $scope.termsModal.show();
  };


  //image zoom modal
  $scope.allImages = [];
  $scope.zoomMin = 1;
  $scope.showImages = function(index, images) {
    //////console.log('clicked to show gallery');
    $scope.activeSlide = index;
    $scope.allImages = images;
    $scope.showModal('templates/modal/gallery-zoomview.html');
  };

  $scope.showModal = function(templateUrl) {
    $ionicModal.fromTemplateUrl(templateUrl, {
      scope: $scope
    }).then(function(modal) {
      $scope.galleryModal = modal;
      $scope.galleryModal.show();
    });
  }

  $scope.closeGalleryModal = function() {
    $scope.galleryModal.hide();
    $scope.galleryModal.remove()
  };


  $scope.openPromocion = function (titulo,descripcion,imagen) {

          var alertPopup = $ionicPopup.alert({
           template: '<div class="content">'
                        +'<img width="25%" src="'+imagen+'">'
                        +'<h4 class="normal-font">'+titulo+'</h4>'
                        +'<h4 class="light-font"><br><br>'+descripcion+'<br><br></h4>'
                        +'</div>',
           buttons: [{ 
            text: 'Ok',
            type: 'button-default boton-cerrar',
          }]
         });
  };
})

.controller('SignUpCtrl', function ($scope, $stateParams, $rootScope, $state, $ionicModal, $ionicPopup, Auth, Profile) {
    

    $scope.user = {};
    // Funcion para Registrar usuario
    $scope.Registrarse = function() {
      //////console.log($scope.user.email);
      showLoading();
      if($scope.user.email && $scope.user.user_pass) {
        Auth.signUpPassword($scope.user.email, $scope.user.user_pass).then(function(User){
          proceedLogin(User);
          $scope.AuthData = User;
          $scope.notificaciones();
          hideLoading();
        })
        .catch(function(error) {
          if(error.code == 'auth/network-request-failed') {
              error['message'] = "Oops... It seems that your browser is not supported. Please download Google Chrome or Safari and try again."
          };
          //////console.log(error);
          hideLoading();
        });
      }
    };

    function proceedLogin(AuthData) {
      broadcastAuthChange();
      // handle logged in
      $state.go('app.editorial');
    };


    // update auth status in other controllers
    function broadcastAuthChange() {
      $rootScope.$broadcast('rootScope:authChange', {});
    };

    $scope.notificaciones = {};  
    $scope.AuthData = Auth.AuthData;
    $scope.notificaciones = function(){
          Profile.notificaciones($scope.AuthData.uid).then(
              function(success){
                  if(Profile.notificacion != null) {
                    $scope.notificaciones.promociones = Profile.notificacion;
          
                    //////console.log($scope.notificaciones.promociones);
                    if($scope.notificaciones.promociones.activada == true){
                      $scope.notificaciones.mensaje = "Activada";
                      $scope.notificaciones.promociones = true;
                    }else{
                      $scope.notificaciones.mensaje = "Desactivada";
                      $scope.notificaciones.promociones = false;
                    }
                  }else if(Profile.notificacion == null){
                    //////console.log("No tiene configurado las notificaciones, vamos a poner Activada");
                    Profile.UpdateNotificaciones($scope.AuthData.uid,true);
                  }
              },
              function(error){
                  //////console.log(error);
                  $scope.notificaciones.mensaje = "Activada";
              }
          );
          
    }


      var showLoading = function(){
        $scope.popup = $ionicPopup.show({
          templateUrl: "templates/common/loading.html"
        });
      }

      var hideLoading = function(){
        $scope.popup.close();
      }

       // Terms and conditions modal
    $ionicModal.fromTemplateUrl('templates/modal/terms.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.termsModal = modal;
    });
    $scope.closeTermsModal = function () {
      $scope.termsModal.hide();
    };

    $scope.openTermsModal = function () {
      //////console.log('clicked');
      $scope.termsModal.show();
    };

})
.controller('LoginCtrl', function ($rootScope, $scope, IonicClosePopupService, $stateParams, $dataService, $ionicModal, StorageService, $state, $pinroUiService, Auth, Codes, Utils, $ionicPopup, $timeout,$http, Profile) {


    	// Revisamos si ya esta logrado, en el caso de que SI
    	// le redireccionamos al inicio.
      $scope.$on('$ionicView.beforeEnter', function(e) {
        // global variables
        $scope.AuthData = Auth.AuthData;
        checkAuth();
      });

      $scope.next = function () {
        $scope.slider._slideNext();
      };

      $scope.prev = function () {
        $scope.slider._slidePrev();
      };

      $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
        // data.slider is the instance of Swiper
        $scope.slider = data.slider;
      });

      $scope.$on("$ionicSlides.slideChangeStart", function(event, data){
      });

      $scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
        // note: the indexes are 0-based

        $scope.activeIndex = data.slider.activeIndex;
        $scope.previousIndex = data.slider.previousIndex;
      });

      // monitor and redirect the user based on its authentication state
      function checkAuth() {
        showLoading();
        $scope.AuthData = Auth.AuthData;
        if(!$scope.AuthData.hasOwnProperty('uid')){
          Auth.getAuthState().then(
            function(AuthData){
              $scope.AuthData = AuthData;
              hideLoading();
              $state.go('app.editorial');
            },
            function(notLoggedIn){
              handleLoggedOut();
              hideLoading();
            }
          )
        } else {
          hideLoading();
        	$state.go('app.editorial');
        };
      }; // ./ checkAuth()

      
      // handles when the user is logged out
      function handleLoggedOut() {
        
        if($state.current.name == 'signin') {
        	$state.go('signin');
        };
      };


      // update auth status in other controllers
      function broadcastAuthChange() {
        $rootScope.$broadcast('rootScope:authChange', {});
      };


      var showLoading = function(){
        $scope.popup = $ionicPopup.show({
          templateUrl: "templates/common/loading.html"
        });
      }

      var hideLoading = function(){
        $scope.popup.close();
      }

            //Aca debemos colocar para resetear el password


     		 $scope.loginData = {};
            //Iniciamos Sesion          
              $scope.doLoginSocial = function() {
                showLoading();
                IonicClosePopupService.register($scope.popup);
      		        var provider = new firebase.auth.FacebookAuthProvider();
          		      provider.addScope('user_friends');
                    provider.addScope('user_birthday');
                    provider.addScope('public_profile');
                    provider.setCustomParameters({
                      'display': 'popup'
                    });
                    firebase.auth().signInWithRedirect(provider).then(function() {
                      firebase.auth().getRedirectResult().then(function(result) {
                        
                        ////console.log("Entro con Facebook");
                          // This gives you a Google Access Token.
                          // You can use it to access the Google API.
                          var token = result.credential.accessToken;
                          // The signed-in user info.
                          var user = result.user;
                          ////console.log(result.credential);
                          if (result.credential) {
                            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
                            var token = result.credential.accessToken;

                            Profile.get(result.user.uid).then(
                              function(ProfileData) {    
                                hideLoading();
                                proceedLogin(result);   
                                // bind to scope
                                //////console.log(ProfileData);
                                if(ProfileData == null) {
                                    $http.get('https://graph.facebook.com/v2.5/me?access_token='+token+'&fields=id,name,friends{name,gender,picture},birthday,email,cover,link,age_range,first_name,last_name')
                                    .success(function(jsonService){
                                       $scope.user= jsonService;
                                       //////console.log(result.user);
                                      // ...
                                      Auth.CargarPerfil(result,jsonService)
                                    });
                          
                                };
                              }
                              ),
                              function(error){   
                                hideLoading();
                              }
                          }else{
                            hideLoading();
                          }
                      }).catch(function(error) {
                        hideLoading();
                      });
                    }).catch(function(error) {
                        hideLoading();
                      });
              };
              /*
              ionic cordova -d plugin add https://github.com/Wizcorp/phonegap-facebook-plugin.git --variable APP_ID="1830593113933558"--variable APP_NAME="Dezling"
              */

              $scope.doLogin = function() {
                showLoading();

                if($scope.loginData.userEmail && $scope.loginData.userPassword) {
                  Auth.signInPassword($scope.loginData.userEmail, $scope.loginData.userPassword).then(
                    function(AuthData){
                      ////console.log(AuthData)
                      
                      // -->
                      hideLoading();
                      proceedLogin(AuthData);
                      
                    },
                    function(error){
                      $scope.loginError = Codes.getErrorMessage(error);
                      hideLoading();
                    }
                  )
                }
              };


              // wrapper for email and social login
              function proceedLogin(AuthData) {

                // handle logged in
                $scope.AuthData = AuthData;
                $state.go('app.editorial');
                broadcastAuthChange();
              };

            // Terms and conditions modal
            $ionicModal.fromTemplateUrl('templates/modal/terms.html', {
              scope: $scope
            }).then(function (modal) {
              $scope.termsModal = modal;
            });
            $scope.closeTermsModal = function () {
              $scope.termsModal.hide();
            };

            $scope.openTermsModal = function () {
              //////console.log('clicked');
              $scope.termsModal.show();
            };




      $scope.user = {};
      $scope.resetPassword = function () {
        showLoading();
        var auth = firebase.auth();
        var emailAddress = $scope.user.user_email;
        //////console.log(emailAddress);

        auth.sendPasswordResetEmail(emailAddress).then(function() {
          $scope.resetError = null;
          $scope.resetSuccess = "Revisa tu correo electronico.";
          //////console.log($scope.resetSuccess);
          hideLoading();
        }, function(error) {
          $scope.resetSuccess = null;
          $scope.resetError = Codes.getErrorMessage(error);
          hideLoading();
        });
      };
 })
.controller('MainCtrl', function ($scope, $state, $ionicHistory, $ionicScrollDelegate, Maestro, $dataService,
 $pinroUiService, $ionicLoading, $ionicPopup, Sponsor, Visitas, Destacados, $window) {

      $scope.$on("$ionicView.enter", function (event, data) {
        /*
          Chequeamos si el usuario tiene alguna notificaion o mensaje en el buzon de entrada
        */
        // Cargamos los banners de sponsor
          CargarBannerSponsors();
        // Cargamos los banner de Destacados
          CargarBannerDestacados()
        // Obtenes los numeros de visita en cada categoria, ordenamos por cantidad y filtramos solo 5 por categorias
          VisitasShoppings();
          VisitasMultimarcas();
          VisitasSupermercados();
      });

      var showLoading = function(){
        
        $scope.popup = $ionicPopup.show({
          templateUrl: "templates/common/loading.html"
        });
      }

     var hideLoading = function(){
        $scope.popup.close();
      }



      $scope.sponsors = ['1','2','3','4','5','6']

      $scope.opciones = {
        autoplay:2000,
        loop: false,
        free:false,
        speed:2000,
        initialSlide: 5,
        direction: 'horizontal',
        autoplayDisableOnInteraction: false,
        slidesPerView: '1', 
        showNavButtons: false, 
      };

      $scope.sliderDelegate;

      //detect when sliderDelegate has been defined, and attatch some event listeners
      $scope.$watch('sliderDelegate', function(newVal, oldVal){
        if(newVal != null){ 
          $scope.sliderDelegate.on('slideChangeEnd', function(){
            ////console.log('updated slide to ' + $scope.sliderDelegate.activeIndex);
            $scope.$apply();
          });
        }
      });

    
      /*
          Funcion para cargar Banner Destacados
      */
      function CargarBannerDestacados() {
          $scope.destacados = [];
          //showLoading();
          Destacados.get().then(
              function(success){
                  if(Destacados.listado != null) {
                    angular.forEach(Destacados.listado, function(item, key){
                          var dt1   = parseInt(item.fechainicio.substring(0,2));
                          var mon1  = parseInt(item.fechainicio.substring(3,5));
                          var yr1   = parseInt(item.fechainicio.substring(6,10));
                          var date1 = new Date(yr1, mon1-1, dt1);
                          var dt1   = parseInt(item.fechafin.substring(0,2));
                          var mon1  = parseInt(item.fechafin.substring(3,5));
                          var yr1   = parseInt(item.fechafin.substring(6,10));
                          var date2 = new Date(yr1, mon1-1, dt1); 
                          if(date1 <= new Date() && date2 >= new Date()){
                            var randomvalue = 0.5 - Math.random();
                            $scope.destacados.push({item:item, random:randomvalue, key:key});
                          }
                    });
                    $scope.cargado_destacados = true;
                    // Cargamos el avatar de cada Comercio
                    //hideLoading();  
                    //comercios.CategoriesForm = CentrosComerciales.all;
                  }else{
                    $scope.cargado_destacados = false;
                  }
              },
              function(error){
                  //////console.log(error);
                    $scope.cargado_destacados = false;
              }
          );
      };

    
      /*
          Funcion para cargar Centro Comercial
      */
      function CargarBannerSponsors() {
          $scope.listado = [];
          $scope.sponsors = [];
          $scope.cantidadSponsor = 1;
          //showLoading();
          Sponsor.get().then(
              function(success){
                  if(Sponsor.listado != null) {
                    setTimeout(function() {
                        //$scope.sponsors = Sponsor.listado;
                        angular.forEach(Sponsor.listado, function(item, key){
                          const [day, month, year] = item.fechainicio.split("/");
                          const [day1, month1, year1] = item.fechafin.split("/");
                          var date1 = new Date(year, month - 1, day); 
                          var date2 = new Date(year1, month1 - 1, day1);

                          if(date1 <= new Date() && date2 >= new Date() && $scope.cantidadSponsor <= 5){
                            var randomvalue = 0.5 - Math.random();
                            $scope.sponsors.push({item:item, random:randomvalue, key:key});
                            $scope.cantidadSponsor ++;
                          }
                        });

                        $scope.$apply();
                    });
                    $scope.cargado = true;
                  }else{
                    $scope.cargado = false;
                  }
              },
              function(error){
                  //////console.log(error);
                    $scope.cargado = false;
              }
          );
      };
      // Funcion para Visitas del Shopping
      function VisitasShoppings() {
      $scope.visitas_shopping = [];
          //showLoading();
          Visitas.getShoppings().then(
              function(success){
                  if(Visitas.shoppings != null) {
                    angular.forEach(Visitas.shoppings, function(item, key){
                      if(item.online == true ){
                        $scope.visitas_shopping.push(item);
                      }
                    });

                    $scope.visitas_shopping.sort(function(a, b){return a.visitas-b.visitas}).reverse();
                  }
              },
              function(error){
                  //////console.log(error);
              }
          );
      };
      // Funcion para Visitas Multitiendas
      function VisitasMultimarcas() {
      $scope.visitas_multimarcas = [];
          //showLoading();
          Visitas.getMultitiendas().then(
              function(success){
                  if(Visitas.multimarcas != null) {
                    angular.forEach(Visitas.multimarcas, function(item, key){
                      if(item.online == true ){
                        $scope.visitas_multimarcas.push(item);
                      }
                    });

                    $scope.visitas_multimarcas.sort(function(a, b){return a.visitas-b.visitas}).reverse();
                  }
              },
              function(error){
                  //////console.log(error);
              }
          );
      };
      // Funcion para Visitas Supermercados
      function VisitasSupermercados() {
      $scope.visitas_supermercados = [];
          //showLoading();
          Visitas.getSupermercados().then(
              function(success){
                  if(Visitas.supermercados != null) {
                    angular.forEach(Visitas.supermercados, function(item, key){
                      if(item.online == true ){
                        $scope.visitas_supermercados.push(item);
                      }
                    });

                    $scope.visitas_supermercados.sort(function(a, b){return a.visitas-b.visitas}).reverse();
                  }
              },
              function(error){
                  //////console.log(error);
              }
          );
      };
      $scope.SumarClick =  function(categoria, key){
        if(categoria == 'sponsor'){
          ////console.log("Es Sponsor");
          Sponsor.sumarClicks(key);
        }else{
          ////console.log("Es Destacado");
          Destacados.sumarClicks(key);
        }
      }

      $scope.openSponsor = function (titulo,descripcion,imagen) {

              var alertPopup = $ionicPopup.alert({
               template: '<div class="content">'
                            +'<h4 class="normal-font">'+titulo+'</h4>'
                            +'<h4 class="light-font" style="text-align:justify"><br><br>'+descripcion+'<br><br></h4>'
                            +'</div>',
               buttons: [{ 
                text: 'Ok',
                type: 'button-default boton-cerrar',
              }]
             });
      };

})
.controller('ProductListCtrl', function ($scope, $stateParams, $state, $ionicScrollDelegate, $pinroUiService, Maestro) {
                        $scope.order = 'name'; //for product list filtering

                                 // $scope.loading = true;
                               $scope.productList = []
                                  $scope.layout = 'grid'; // for layout controll
                              $scope.$on("$ionicView.enter", function(event, data){
                                 // handle event
                                 //////console.log("State Params: ", data.stateParams);

                                 $scope.categoryName = data.stateParams.catagoryName;

                                // $ionicLoading.show(); // show ionicLoading
                                //$pinroUiService.showLoading();

                              Maestro.$getProductsByCategory(data.stateParams.categoryId).then(function(res){
                                //////console.log(res.data); 
                                $scope.productList = res.data;
                               // $ionicLoading.hide();
                               $pinroUiService.hideLoading();
                                 // $scope.loading = false; //hide ionicLoading
                              }, function(err){
                                //////console.log(err);
                                //$ionicLoading.hide();
                                $pinroUiService.hideLoading();
                                 // $scope.loading = false; //hide ionicLoading
                              })

                              });

                                  $scope.scrollToTop = function () {
                                    $ionicScrollDelegate.scrollTop();
                                  }



                                  $scope.goToProduct = function (id) { //close all open modal and go to product page
                                    //////console.log('clicked');
                                    $scope.cartModal.isShown() ? $scope.cartModal.hide() : null;
                                    $scope.searchModal.isShown() ? $scope.searchModal.hide() : null;
                                    $scope.profileModal.isShown() ? $scope.profileModal.hide() : null;
                                    $scope.wishlistModal.isShown() ? $scope.wishlistModal.hide() : null;
                                    $state.go('app.single', {
                                      id: id
                                    });
                                  }

})

.controller('SingleProductCtrl', function ($scope, $stateParams, $window, $timeout, $ionicLoading, $ionicScrollDelegate, Maestro, CartService, WishlistService, $pinroUiService) {

                //////console.log($stateParams);

                $scope.selectedProduct = {}; // to get Selected Product to Cart
                $scope.productImages = []; // to show data on slider

                //$ionicLoading.show(); // show $ionicLoading
               //$scope.loading = true;

               $pinroUiService.showLoading();



                Maestro.$getProductsById($stateParams.id).then(function (res) {
                  //////console.log(res.data)
                  if(res.data.id){

                    $scope.product = res.data;
                    
                    $scope.selectedProduct = { //populate selected product with initial data
                      name: $scope.product.name,
                      product_id: $scope.product.id,
                      price: $scope.product.price, // selected product price, will be updated if it has variation
                      imgUrl: $scope.product.images[0].src,
                      quantity: 1
                    }

                   $scope.productImages = angular.copy($scope.product.images);

                   // $ionicLoading.hide(); // hide $ionicLoading
                    //$scope.loading = false;
                    $pinroUiService.hideLoading();

                  }else{
                    alert('no product found');
                    //$ionicLoading.hide(); //hide $ionicLoading
                    // $scope.loading = false;
                     $pinroUiService.hideLoading();
                  }



                }, function (err) {
                  //////console.log(err);
                  // $scope.loading = false;
                   $pinroUiService.hideLoading();
                })


                //update price and get variation details

                $scope.updatePriceAndVariation = function (selectedProduct) {

                  var keepGoing = true;
                  angular.forEach($scope.product.variations, function (variation) {
                    if (keepGoing) {
                      var selectedSize = false,
                        selectedColor = false;
                      angular.forEach(variation.attributes, function (singleVariation) {
                        if (selectedProduct.color && singleVariation.option === selectedProduct.color) {
                          selectedColor = true;
                          return
                        }

                        if (selectedProduct.size && singleVariation.option === selectedProduct.size) {
                          selectedSize = true;
                          return
                        }

                      })

                      if (selectedColor && selectedSize) {
                        //////console.log(variation.id);
                        $scope.selectedProduct.variation_id = variation.id; // set selected product variation id;
                        $scope.selectedProduct.price = variation.price; //update price with variation
                        keepGoing = false;

                        if(variation.image.length){
                          $scope.productImages = variation.image; // to show selected item images on slider
                          $scope.selectedProduct.imgUrl = variation.image[0].src;
                      }else{
                          $scope.productImages = $scope.product.images;
                        }
                        
                      }
                    } else {
                      return; //strop running forEach if variation id is found
                    }
                  })

                }


                  //add item to cart
                    $scope.addToCart = function (selectedProduct) {
                      //////console.log(selectedProduct);

                  var itemToPushToCart = angular.copy(selectedProduct);
                      //$scope.updatePriceAndVariation(selectedProduct);
                      CartService.push(itemToPushToCart);

                      //Animation for Cart
                      addToCartAnimation();

                    }


                  //wishlist
                    $scope.wishListButtonText = "Add to wishlist";
                    $scope.itemAddedToWishList = false;

                    //add item to wishlist
                    $scope.addToWishlist = function(selectedProduct){
                      selectedProduct.category = $scope.product.categories[0].name;
                      WishlistService.push(selectedProduct);
                      $scope.wishListButtonText = "Added to wishlist";
                    $scope.itemAddedToWishList = true;
                    }

                    //Animation function for Add to Cart
                      var cart = angular.element(document.getElementsByClassName("shopping-cart"));
                    var addToCartAnimation = function () {
                      cart.css({
                        'opacity': '1',
                        'animation': 'bounceIn 0.5s linear'
                      });
                  $ionicScrollDelegate.scrollTop(); // scroll to Top

                      $timeout(function () {
                        cart.css({
                          'animation': ''
                        });
                        
                        //$scope.selectedProduct.reset();
                        
                      }, 500)
                    }

})

.controller('CartCtrl', function ($scope, $state, $stateParams, $timeout, Maestro, CartService, StorageService, $pinroUiService) {

          //CartService.getAll();
          $scope.CartItemList = [];




          //Get CartItemList function
          var getCartItems = function(){
              //////console.log('cart');
              if(CartService.getAll().length){
                  $scope.CartItemList = CartService.getAll();
                  addToCartAnimation();
                }
            }

            $scope.$on('modal.shown', function(event, data) {
            //////console.log('Modal is shown!'+ data.id);
            if(data.id === 'cart'){

              getCartItems(); //populate CartItemList from CartService
            }
          });

          //Animation function for Add to Cart
              var cart = angular.element(document.getElementsByClassName("shopping-cart"));
            var addToCartAnimation = function () {
              cart.css({
                'opacity': '1',
                'animation': 'bounceIn 0.5s linear'
              });

              $timeout(function () {
                cart.css({
                  'animation': ''
                });
              }, 500)
            }



          $scope.goToCheckout = function(){ 
            var user = StorageService.getUserObj();
            if(user && user.cookie){
              
              $state.go('app.payment_step1');
            }else{
              $pinroUiService.showConfirm('signin', "Please login to continue with your order");
            }
            $scope.closeCartModal();
          }

            


          //remove item from cart function
          $scope.removeItem = function(item){
            CartService.remove(item);

            if(!$scope.CartItemList.length){
              $scope.closeCartModal();
              cart.css({
                  'opacity': '0'
                });
            }

          }



          // get subtotal 
          		$scope.getSubtotal = function () {
          			var total = total || 0;
          			angular.forEach($scope.CartItemList, function (item) {
          				total += parseInt(item.price) * item.quantity;
          			});
          			return total;
          		};


          		// Calculates the tax of the invoice
          		$scope.calculateTax = function (rate) {
          			return ((rate * $scope.getSubtotal()) / 100);
          		};

          		// Calculates the grand total of the invoice
          		$scope.calculateGrandTotal = function (vatRate) {
          			
          			if(vatRate){
          				return ($scope.calculateTax(vatRate) + $scope.getSubtotal())
          			} else{
          				return $scope.getSubtotal();
          			}
          		};   

})

.controller('OrderCtrl', function ($scope, $stateParams, $ionicHistory, $state, StorageService, Maestro, CartService, $pinroUiService) {


        $scope.user = {};

        $scope.order = {
          "status": "pending",
          "set_paid": false,
          "currency": "GBP",

          "line_items": []
        };

        $scope.order.shipping = {};
        $scope.order.billing = {};
        $scope.order.line_items = [];


        $scope.order.shipping_lines = [
            {
              "method_id": "flat_rate",
              "method_title": "Flat Rate",
              "total": 0
            }
          ];


         //$scope.countryList = countries;
         ////////console.log($scope.countryList);

        var getUserInfo = function(user_id){
           //$scope.loading = true;
           $pinroUiService.showLoading();
            Maestro.$getCustomerById(user_id).then(function(res){
            //////console.log(res);
         //$scope.loading = false;
         $pinroUiService.hideLoading();
        if(res.data.id){
            $scope.user = res.data;
            $scope.order.shipping = $scope.user.shipping || {};
        }else{
         // alert(`There's been an error`);
        };

        if(!$scope.order.shipping.country){
              $scope.order.shipping.country = "GB";
            }

          }, function(err){
            // $scope.loading = false;
            $pinroUiService.hideLoading();
            //////console.log(err);
          })
        }

        var user = {};

         $scope.$on("$ionicView.enter", function(event, data){
           // handle event
           //////console.log(StorageService.getUserObj());
           //////console.log("State Params: ", data.stateParams);

           //get user_id
           var user = StorageService.getUserObj();
           //////console.log(user);
              if(user && user.user_id){

              $scope.order.customer_id = StorageService.getUserObj().user_id; //assing customer id
              //////console.log($scope.order);
              getUserInfo($scope.order.customer_id); //get user info
              }


         });




        //get cart items



        var cartItems = CartService.getAll();

        angular.forEach(cartItems, function(item){
          var itemToPush = {
            product_id: item.product_id,
            quantity: item.quantity
          }
          if(item.variation_id){
            itemToPush.variation_id = item.variation_id;
          }
          //////console.log(itemToPush);

          $scope.order.line_items.push(itemToPush);

        })




        //confirm order
        $scope.confirmOrder = function(){

          $pinroUiService.showLoading();

          $scope.order.billing = $scope.order.shipping;

        if(user && user.user_id){
          $scope.order.customer_id = user.user_id;

        }

         // $scope.order.billing = $scope.order.shipping;
        //////console.log($scope.order);

        Maestro.$createOrder($scope.order).then(function(res){
          //////console.log(res);
          if(res.data.id){
            CartService.removeAll(); //remove all item in cart
            $state.go('app.payment_step2', {orderId: res.data.id, amount: res.data.total, currency: res.data.currency});
          }else{
            alert(`Order couldn't be processed`);
          }

        $pinroUiService.hideLoading();

        }, function(err){
          //////console.log(err);
          $pinroUiService.hideLoading();
        })

        };


        //go to main screen
         $scope.goToMain = function () {
            $ionicHistory.nextViewOptions({
              disableBack: true
            });

            $state.go('app.editorial');
          }

})

.controller('PaymentCtrl', function ($scope, $stateParams, $ionicHistory, $state, StorageService, Maestro, CartService,$cordovaNgCardIO, $pinroUiService ) {
  

      var orderId;

       $scope.cardType = {};
          $scope.card = {};

          var dataForStripe = {};

       $scope.$on("$ionicView.enter", function(event, data){
         // handle event
         //////console.log("State Params: ", data.stateParams);

         orderId = data.stateParams.orderId;

        // pass order and amount details for stripe
        dataForStripe.amount = parseInt(data.stateParams.amount) * 100; // amount is in cents/pence for stripe so * 100
            dataForStripe.currency = data.stateParams.currency;
            dataForStripe.description =  "Payment for Maestro Order #"+ orderId;

       });

      //Stripe card payment_method

         $scope.makeStripePayment =  function (_cardInformation) {

            //////console.log('clicked');
           // $scope.loading = true;
      $pinroUiService.showLoading();

            dataForStripe.card = {
                  "number": _cardInformation.number,
                  "exp_month": _cardInformation.exp_month,
                  "exp_year": _cardInformation.exp_year,
                  "cvc": _cardInformation.cvc,
                  "name": _cardInformation.name
                }
                //////console.log(dataForStripe);

            if (!window.stripe) {
              alert("stripe plugin not installed");
              return;
            }

            if (!_cardInformation) {
              alert("Invalid Card Data");
              return;
            }

            // charge card with card and order data
            stripe.charges.create(dataForStripe,
              function(response) {
               // $scope.loading = false;
               $pinroUiService.hideLoading();
                //////console.log(JSON.stringify(response, null, 2));
                //alert(JSON.stringify(response, null, 2));
                $state.go('app.payment_step3', {orderId: orderId, transactionId: response.id});
              },
              function(response) {
                //$scope.loading = false;
                $pinroUiService.hideLoading();
                alert(JSON.stringify(response))
              } // error handler
            );
          }

      $scope.payCashOnDelivery = function(){
        $state.go('app.payment_step3', {orderId: orderId, payByCash: true})
      }

      $scope.scanCard = function(){
          $cordovaNgCardIO.scanCard()
              .then(function (response) {
                      //Success response - it`s an object with card data
                      //////console.log(response);
                      $scope.card.number = response.card_number;
                      $scope.card.exp_month = response.expiry_month;
                      $scope.card.exp_year = response.short_expiry_year;
                      $scope.card.cvc = response.cvv;


                    },
                    function (response) {
                      //We will go there only when user cancel a scanning.
                      //response always null
                      //////console.log(response);
                    }
              );
      }

})

.controller('OrderConfirmCtrl', function ($scope, $stateParams, $ionicHistory, $state, StorageService, Maestro, CartService, $pinroUiService) {



    var order = {};


    var updateOrder = function(data){
      $pinroUiService.showLoading();
      //$scope.loading = true;
      Maestro.$updateOrder(data).then(function(res){
        //////console.log(res)
       // $scope.loading = false;
       $pinroUiService.hideLoading();
      }, function(err){
        //////console.log(err);
        //$scope.loading = false;
        $pinroUiService.hideLoading();
      })
    }




     $scope.$on("$ionicView.enter", function(event, data){
       // handle event
       //////console.log("State Params: ", data.stateParams);

        if(data.stateParams.payByCash){
            order = {
                  id: data.stateParams.orderId,
                  payment_method: 'Cash on delivery',
                  payment_method_title: 'Cash on delivery',
                  status: 'processing'
              }
          }else{
            order = {
                id: data.stateParams.orderId,
                transaction_id: data.stateParams.transactionId,
                payment_method: 'Stripe',
                payment_method_title: 'Card Payment',
                set_paid: true,
                status: 'processing'
            }
      
       }
      

        

       updateOrder(order); // update order

     });


    //go to main screen
     $scope.goToMain = function () {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });

        $state.go('app.editorial');
      }

})

.controller('WishlistCtrl', function ($scope, $stateParams, $state, $timeout, Maestro, WishlistService) {
      //CartService.getAll();
        $scope.WishListItems = [];


        $scope.editWishlist = false;


      //Get CartItemList function
      var getWishlistItems = function(){
          if(WishlistService.getAll().length){
              $scope.WishListItems = WishlistService.getAll();
             
            }
        }

        $scope.$on('modal.shown', function(event, data) {
        //////console.log('Modal is shown!'+ data.id);
        if(data.id === 'wishlist'){

          getWishlistItems(); //populate WishListItems from WishlistService
        }
      });

      $scope.makeListEditable = function(){
        $scope.editWishlist = true;
      }


      //remove item from wishlist function
      $scope.removeSelectedItems = function(){
        angular.forEach($scope.WishListItems, function(item){
          if(item.selected){
            WishlistService.remove(item);
          }
        });
        $scope.editWishlist = false;
        getWishlistItems(); 
      }


      //go to product

          $scope.goToProduct = function (id) { //close all open modal and go to product page
            //////console.log('clicked');
            $scope.wishlistModal.isShown() ? $scope.wishlistModal.hide() : null;
            $state.go('app.single', {
              id: id
            });
          }

})

.controller('SearchCtrl', function ($scope, $stateParams, $state, $ionicScrollDelegate, $ionicLoading,
 $ionicPopup, Buscador, $timeout, $ionicFilterBar) {

    
    var filterBarInstance;
    var filterBarInstance2;

      $scope.$on('$ionicView.enter', function(e) {

        getSearchListItems();
      });


    $scope.scrollToTop = function () {
      $ionicScrollDelegate.scrollTop();
    }
    
    var closeSearchModal = function () {
      $scope.searchModal.hide();
    };

    // Funcion para obtener los locales con sus promociones (SHOPPING'S)
    var getSearchListItems = function(){
      var items = [];
      $scope.promos = [];
      $scope.comercios = [];
      $scope.productList = [];
      $scope.timeNow = new Date();

      $scope.showFilterBar();
      showLoading();

      // Shopping's
      Buscador.GetComercios().then(function(success){
        $scope.productList = Buscador.CentrosComerciales;
        angular.forEach($scope.productList,function (detalles, slug) {
          //////console.log(slug);
          $scope.comercios.push({detalles:detalles.perfil,categoria:'centros_comerciales',slug:slug});
          if(detalles.locales){
            angular.forEach(detalles.locales,function (datos, key) {
              ////console.log(datos);
              $scope.comercios.push({detalles:datos.perfil,categoria:'locales',slug:key,'shopping':slug});
              angular.forEach(datos.promociones,function (success) {
                var timeNow = new Date();
                const [day, month, year] = success.fechainicio.split("/");
                const [day1, month1, year1] = success.fechafin.split("/");
                var date1 = new Date(year, month - 1, day); 
                var date2 = new Date(year1, month1 - 1, day1);
                if(date1 <= new Date() && date2 >= new Date()){
                  $scope.comercios.push({detalle:success, perfil:datos.perfil, categoria:'promocion'});
                }
              });
            });
          }

          if(detalles.promociones){
            angular.forEach(detalles.promociones,function (success) {
              var timeNow = new Date();
              const [day, month, year] = success.fechainicio.split("/");
              const [day1, month1, year1] = success.fechafin.split("/");
              var date1 = new Date(year, month - 1, day); 
              var date2 = new Date(year1, month1 - 1, day1);
              if(date1 <= new Date() && date2 >= new Date()){
                $scope.comercios.push({detalle:success, perfil:detalles.perfil, categoria:'promocion'});
              }
            });
          }
        }); 
        hideLoading();
      }, function(err){
        //////console.log(err);
        hideLoading();
      })

      //Multimarcas
      Buscador.GetMultimarcas().then(function(success){
        $scope.productList = Buscador.Multimarcas;
        angular.forEach($scope.productList,function (detalles, slug) {
          //////console.log(slug);
          $scope.comercios.push({detalles:detalles,categoria:'multimarcas',slug:slug});
          if(detalles.promociones){
            angular.forEach(detalles.promociones,function (success) {
              var timeNow = new Date();
              const [day, month, year] = success.fechainicio.split("/");
              const [day1, month1, year1] = success.fechafin.split("/");
              var date1 = new Date(year, month - 1, day); 
              var date2 = new Date(year1, month1 - 1, day1);
              if(date1 <= new Date() && date2 >= new Date()){
                $scope.comercios.push({detalle:success, perfil:detalles.perfil, categoria:'promocion'});
              }
            });
          }
          if(detalles.locales){
            angular.forEach(detalles.locales,function (locales) {
              if(locales.promociones){
                angular.forEach(locales.promociones,function (success) {
                  var timeNow = new Date();
                  const [day, month, year] = success.fechainicio.split("/");
                  const [day1, month1, year1] = success.fechafin.split("/");
                  var date1 = new Date(year, month - 1, day); 
                  var date2 = new Date(year1, month1 - 1, day1);
                  if(date1 <= new Date() && date2 >= new Date()){
                    $scope.comercios.push({detalle:success, perfil:detalles.perfil, categoria:'promocion'});
                  }
                });
              }
            });
          }
        }); 
        hideLoading();
      }, function(err){
        //////console.log(err);
        hideLoading();
      })

      //Supermercados
      Buscador.GetSupermercados().then(function(success){
        $scope.productList = Buscador.Supermercados;
        angular.forEach($scope.productList,function (detalles, slug) {
          //////console.log(slug);
          $scope.comercios.push({detalles:detalles,categoria:'supermercados',slug:slug});
          if(detalles.promociones){
            angular.forEach(detalles.promociones,function (success) {
              var timeNow = new Date();
              const [day, month, year] = success.fechainicio.split("/");
              const [day1, month1, year1] = success.fechafin.split("/");
              var date1 = new Date(year, month - 1, day); 
              var date2 = new Date(year1, month1 - 1, day1);
              if(date1 <= new Date() && date2 >= new Date()){
                $scope.comercios.push({detalle:success, perfil:detalles.perfil, categoria:'promocion'});
              }
            });
          }
          if(detalles.locales){
            angular.forEach(detalles.locales,function (locales) {
              if(locales.promociones){
                angular.forEach(locales.promociones,function (success) {
                  var timeNow = new Date();
                  const [day, month, year] = success.fechainicio.split("/");
                  const [day1, month1, year1] = success.fechafin.split("/");
                  var date1 = new Date(year, month - 1, day); 
                  var date2 = new Date(year1, month1 - 1, day1);
                  if(date1 <= new Date() && date2 >= new Date()){
                    $scope.comercios.push({detalle:success, perfil:detalles.perfil, categoria:'promocion'});
                  }
                });
              }
            });
          }
        }); 
        hideLoading();
      }, function(err){
        //////console.log(err);
        hideLoading();
      })
    }
    
    $scope.showFilterBar = function () {
      ////console.log($scope.comercios);
      $ionicFilterBar.show({
        items: $scope.comercios,
        update: function (filteredItems) {
          $scope.comercios = filteredItems;
          //////console.log($scope.promos)
        }
      });
    };
    

    $scope.refreshItems = function () {
      if (filterBarInstance) {
        filterBarInstance();
        filterBarInstance = null;
      }

      $timeout(function () {
        getSearchListItems();
        $scope.$broadcast('scroll.refreshComplete');
      }, 1000);
    };

    var showLoading = function(){
      $scope.popup = $ionicPopup.show({
        templateUrl: "templates/common/loading.html"
      });
    }

    var hideLoading = function(){
      $scope.popup.close();
    }


     /*
      Funcion para refrescar, donde vuelve a llamar a la funcion CargarCentros()
    */

    $scope.doRefresh = function() {
      $timeout( function() {
        getSearchListItems();

        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      
      }, 1000);
    };
    $scope.goToProduct = function (id) { //close open modal and go to product page
          //////console.log(id);
          
          $scope.searchModal.isShown() ? $scope.searchModal.hide() : null;
          
          $state.go('app.single', {
            id: id
          });
    };

    $scope.openPromocion = function (titulo,descripcion,imagen) {

            var alertPopup = $ionicPopup.alert({
             template: '<div class="content">'
                          +'<img width="25%" src="'+imagen+'">'
                          +'<h4 class="normal-font">'+titulo+'</h4>'
                          +'<h4 class="light-font"><br><br>'+descripcion+'<br><br></h4>'
                          +'</div>',
             buttons: [{ 
              text: 'Ok',
              type: 'button-default boton-cerrar',
            }]
           });
    };

})

.controller('ConsultasCtrl', function ($scope, $stateParams, $state, $ionicScrollDelegate, $ionicLoading, $ionicPopup, $timeout, $http, Auth) {
    $scope.consulta = {};
    $scope.EnviarMensaje = function (mensaje) { 
      //////console.log(mensaje);
      var usuario = Auth.AuthData.uid + " - " + Auth.AuthData.displayName+ " - " + Auth.AuthData.providerData[0].providerId;
      ////console.log(usuario);
      var link = 'http://www.dezling.com/app/consultas.php';
      var mensaje_nuevo = mensaje + "\n" + usuario ;
      showLoading();
      var config = {
          method:'POST',
          url:'http://www.dezling.com/app/consultas.php',
          data:'mensaje='+mensaje_nuevo,
          headers:{'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
      }

      var response = $http(config);
      response.success(function(data,status){
          ////console.log('Done', data);
          ////console.log('Done', status);

          hideLoading();
          if(data.error == 'true'){
            $ionicPopup.alert({
             template: '<div class="content">'
                          +'<h4 class="normal-font">Consulta</h4>'
                          +'<h4 class="light-font"><br><br>No hemos podido enviar el correo. Intenta nuevamente<br><br></h4>'
                          +'</div>',
             buttons: [{ 
              text: 'Ok',
              type: 'button-default boton-cerrar',
            }]
           });
          }else{
            $scope.consulta.mensaje ="";
            $ionicPopup.alert({
             template: '<div class="content">'
                          +'<h4 class="normal-font">Consulta</h4>'
                          +'<h4 class="light-font"><br><br>¡Gracias por escribirnos! Estaremos respondiendo tu mensaje en la brevedad.<br><br></h4>'
                          +'</div>',
             buttons: [{ 
              text: 'Ok',
              type: 'button-default boton-cerrar',
            }]
           });
          }
      });

      response.error(function(data,status){
          //////console.log('Error');
          hideLoading();
          $ionicPopup.alert({
           template: '<div class="content">'
                        +'<h4 class="normal-font">Consulta</h4>'
                        +'<h4 class="light-font"><br><br>No hemos podido enviar el correo. Intenta nuevamente<br><br></h4>'
                        +'</div>',
           buttons: [{ 
            text: 'Ok',
            type: 'button-default boton-cerrar',
          }]
         });
      });
    }


    var showLoading = function(){
      $scope.popup = $ionicPopup.show({
        templateUrl: "templates/common/enviando_mail.html"
      });
    }

    var hideLoading = function(){
      $scope.popup.close();
    }
})

//profile controller
.controller('ProfileCtrl', function ($rootScope, $scope, $stateParams, $ionicHistory, $state, Auth, Profile, $ionicActionSheet, $ionicPopup, $timeout, CentrosComerciales, Favoritos,
  Multimarcas, LocalesAdheridos, $localStorage,$interval, Supermercados, $q, $ionicModal) {

  $scope.AuthData = Auth.AuthData;
  $scope.$on('$ionicView.beforeEnter', function(e) {
    // global variables
    $scope.AuthData = Auth.AuthData;
    if (window.cordova){
      //devicePush.putAdditionalData({user: Auth.AuthData});
      //window.plugins.OneSignal.sendTags({perfil: Profile.ProfileData});
    }
    $scope.ProfileData = {};
    checkAuth();
    if($state.current.name == "app.puntos" ) {
      puntos();
    }
    if($state.current.name == "app.check" ) {
      $scope.check();
    }
  });

  $scope.favoritos = function(){
    $ionicHistory.clearCache().then(function(){ $state.go('app.favoritos');});
  }

  //Chequea si el usuario esta logeado
  function checkAuth() {
    $scope.AuthData = Auth.AuthData;
    if(!$scope.AuthData.hasOwnProperty('uid')){
      Auth.getAuthState().then(
        function(AuthData){
          $scope.AuthData = AuthData;
          loadProfileData();
        },
        function(notLoggedIn){
          //Para que le muestre el template de login
          $scope.AuthData = "";
        }
      )
    }else{
      loadProfileData();
    };
  };
  	function loadProfileData() {
      //console.log($scope.AuthData);
	    if($scope.AuthData.hasOwnProperty('uid')){
	      Profile.get($scope.AuthData.uid).then(
	        function(ProfileData) {	          
	          // bind to scope
	          if(ProfileData != null) {
                setTimeout(function(){
                    $scope.ProfileData = ProfileData;
                    $scope.$apply();
                    //////console.log($scope.ProfileData);
                    $q.all($scope.ProfileData).then(function(){
                      if($scope.ProfileData.hasOwnProperty('favoritos')){
                        //window.plugins.OneSignal.sendTags({Favoritos: ProfileData.favoritos});
                        $scope.Favoritos = ProfileData.favoritos;
                        ////console.log($scope.Favoritos);
                        //Obtenemos el detalle de cada favorito de la base de datos Comercios, en base a su categoria
                        $scope.detalle_Favorito = [];
                        $scope.quitar_fav = [];
                        angular.forEach($scope.Favoritos,function (detalles) {
                          if(detalles.categoria == "centros_comerciales"){
                            $timeout(function() {
                              CentrosComerciales.getShopping(detalles.slug).then(
                                function(success){
                                  if(success.perfil.online == true){
                                    $scope.detalle_Favorito.push(CentrosComerciales.shopping);
                                    //Guardamos en un Scope el slug para quitar del fav luego
                                    $scope.quitar_fav.push( {slug: detalles.slug});
                                  }
                              });
                            }, 500);
                          }
                          if(detalles.categoria == "centros_comerciales_local"){
                            $timeout(function() {
                              CentrosComerciales.getLocal(detalles.slug,detalles.comercio).then(
                                function(success){
                                  console.log(success);
                                  if(success.perfil.online == true){
                                    $scope.detalle_Favorito.push(CentrosComerciales.local);
                                    //Guardamos en un Scope el slug para quitar del fav luego
                                    $scope.quitar_fav.push( {slug: detalles.slug});
                                  }
                              });
                            }, 500);
                          }
                          if(detalles.categoria == "multimarcas"){
                            $timeout(function() {
                              Multimarcas.getShopping(detalles.slug).then(
                                function(success){
                                  //////console.log(Multimarcas.shopping);
                                  $scope.detalle_Favorito.push(Multimarcas.shopping);
                                  //Guardamos en un Scope el slug para quitar del fav luego
                                  $scope.quitar_fav.push( {slug: detalles.slug});
                              });
                            }, 500);
                          }
                          if(detalles.categoria == "multimarcas_local"){
                            $timeout(function() {
                              //////console.log(detalles.slug,detalles.comercio);
                              Multimarcas.getLocal(detalles.slug,detalles.comercio).then(
                                function(success){
                                  $scope.detalle_Favorito.push(Multimarcas.local);
                                  //Guardamos en un Scope el slug para quitar del fav luego
                                  $scope.quitar_fav.push( {slug: detalles.slug});
                              });
                            }, 500);
                          }
                          if(detalles.categoria == "supermercados"){
                            $timeout(function() {
                              Supermercados.getShopping(detalles.slug).then(
                                function(success){
                                  //////console.log(Multimarcas.shopping);
                                  $scope.detalle_Favorito.push(Supermercados.shopping);
                                  //Guardamos en un Scope el slug para quitar del fav luego
                                  $scope.quitar_fav.push( {slug: detalles.slug});
                              });
                            }, 500);
                          }
                          if(detalles.categoria == "supermercados_local"){
                            $timeout(function() {
                              //////console.log(detalles.slug,detalles.comercio);
                              Supermercados.getLocal(detalles.slug,detalles.comercio).then(
                                function(success){
                                  $scope.detalle_Favorito.push(Supermercados.local);
                                  //Guardamos en un Scope el slug para quitar del fav luego
                                  $scope.quitar_fav.push( {slug: detalles.slug});
                              });
                            }, 500);
                          }
                          
                        });
                        ////console.log($scope.detalle_Favorito);
                      }else{
                        //////console.log("No tiene favs");
                        $scope.Favoritos=false;
                      }
                      //////console.log($scope.AuthData.providerData[0].providerId);
                      if($scope.AuthData.providerData[0].providerId == 'facebook.com'){
                        setTimeout(function(){
                            $scope.foto_perfil =  'https://graph.facebook.com/'+$scope.AuthData.providerData[0].uid+'/picture?width=500';
                            $scope.$apply();
                        }, 0);      
                      }else if($scope.AuthData.providerData[0].providerId == 'password' && $scope.ProfileData.perfil.hasOwnProperty(['foto_perfil'])){
                        setTimeout(function(){
                            $scope.foto_perfil =  $scope.ProfileData.perfil.foto_perfil || 'img/avatar-default.jpg' ;
                            $scope.$apply();
                        }, 0); 
                      }else{
                        setTimeout(function(){
                            $scope.foto_perfil =  'img/avatar-default.jpg';
                            $scope.$apply();
                        }, 0);
                      }
                      //////console.log(ProfileData);
                      if($scope.ProfileData.hasOwnProperty(['perfil.nacimiento'])){
                        $scope.ProfileData.perfil.nacimiento = new Date($scope.ProfileData.perfil.nacimiento);
                      }
                    })
                }, 0); 
              
              var user = firebase.auth().currentUser;
              if (user != null) {
                user.providerData.forEach(function (profile) {
                  if(profile.providerId == "facebook.com"){
                      $scope.LogeadoConFacebook = false;
                      //////console.log("Logeado con Facebook");
                  }
                  if(profile.providerId == "password"){
                      $scope.LogeadoConPassword = true;
                      //////console.log("Logeado con Email");
                      if($scope.LogeadoConFacebook){
                        $scope.LogeadoConFacebook = true;
                        $scope.LogeadoConPassword = false;
                        //////console.log("Logeado con Facebook y Correo");
                      }else{
                        $scope.LogeadoConFacebook = false;
                      }
                  }
                });
              }
	          };
	        }
	      ),
	      function(error){
	      }
	    }else{
			   $scope.AuthData = "";
	    }
  	};

  // Logout
  $scope.logout = function () {
    Auth.unAuth();
    
    $scope.AuthData = {};
    $scope.ProfileData = {};
    $scope.loginData = {}; 
    $scope.foto_perfil = '';
    $scope.LogeadoConFacebook= '';
    
    broadcastAuthChange();
    $state.go('sesion_cerrada');
  }


  // update auth status in other controllers
  function broadcastAuthChange() {
    $rootScope.$broadcast('rootScope:authChange', {});
  };
  	

	  // fn update profile picture
	  $scope.changeProfilePicture = function() {
	    // Show the action sheet
	    $ionicActionSheet.show({
	        buttons: [
	            { text: 'Tomar nueva foto' },
	            { text: 'Elegir de la Galeria' },
	        ],
	        titleText: 'Cambiar foto de perfil',
	        cancelText: 'Cancelar',
	        cancel: function() {
	            // add cancel code..
	        },
	        buttonClicked: function(sourceTypeIndex) {
	            proceed(sourceTypeIndex)
	            return true;
	        }
	    });
	    function proceed(sourceTypeIndex) {
	      Profile.changeProfilePicture(sourceTypeIndex, $scope.AuthData.uid).then(
	        function(successCallback){
              loadProfileData();  
              $ionicPopup.alert({
               template: '<div class="content">'
                            +'<h4 class="normal-font">Perfil</h4>'
                            +'<h4 class="light-font"><br><br>Actualizado correctamente.<br><br></h4>'
                            +'</div>',
               buttons: [{ 
                text: 'Ok',
                type: 'button-default boton-cerrar',
              }]
             });
	        }, function(error){
              loadProfileData(); 
              $ionicPopup.alert({
               template: '<div class="content">'
                            +'<h4 class="normal-font">Perfil</h4>'
                            +'<h4 class="light-font"><br><br>Ocurrió un error.<br><br></h4>'
                            +'</div>',
               buttons: [{ 
                text: 'Ok',
                type: 'button-default boton-cerrar',
              }]
             });
          });
	    };
	  };

	  // fn change username
	  $scope.UpdatePerfil = function() {
      //////console.log($scope.ProfileData.hasOwnProperty(['perfil.nombre']));
        if($scope.ProfileData.hasOwnProperty(['perfil.nombre']) || ($scope.ProfileData.perfil.nombre != undefined && $scope.ProfileData.perfil.nombre != null)) {
          Profile.UpdatePerfil($scope.AuthData.uid,$scope.ProfileData.perfil).then(
            function(success){
              //////console.log("Actualizado");
              var mensaje = $ionicPopup.show({
                title: 'Perfil',
                template: 'Actualizado',
              });

              $timeout(function() {
                mensaje.close(); //close the popup after 3 seconds for some reason
              }, 2000);
              localStorage.setItem('completar_perfil',true);
           }
          )
        }else{
          $ionicPopup.alert({
           template: '<div class="content">'
                        +'<h4 class="normal-font">Error</h4>'
                        +'<h4 class="light-font"><br><br>Debes completar tus datos antes de guardar.<br><br></h4>'
                        +'</div>',
           buttons: [{ 
            text: 'Ok',
            type: 'button-default boton-cerrar',
          }]
         });
        }
	}



  
    $scope.notificaciones = {};  
    $scope.notificaciones = function(){
          Profile.notificaciones($scope.AuthData.uid).then(
              function(success){
                  if(Profile.notificacion != null) {
                    $scope.notificaciones.promociones = Profile.notificacion;
          
                    //////console.log($scope.notificaciones.promociones);
                    if($scope.notificaciones.promociones.activada == true){
                      $scope.notificaciones.mensaje = "Activada";
                      $scope.notificaciones.promociones = true;
                    }else{
                      $scope.notificaciones.mensaje = "Desactivada";
                      $scope.notificaciones.promociones = false;
                    }
                  }else if(Profile.notificacion == null){
                    //////console.log("No tiene configurado las notificaciones, vamos a poner Activada");
                    Profile.UpdateNotificaciones($scope.AuthData.uid,true);
                  }
              },
              function(error){
                  //////console.log(error);
                  $scope.notificaciones.mensaje = "Activada";
              }
          );
          
    }

    $scope.CambiarNotificaciones = function(){
          //////console.log("Cambiamos Noti",$scope.notificaciones.promociones);
          Profile.UpdateNotificaciones($scope.AuthData.uid,$scope.notificaciones.promociones);
          if($scope.notificaciones.promociones == true){
            $scope.notificaciones.mensaje = "Activada";
          }else{
            $scope.notificaciones.mensaje = "Desactivada";
          }
    }

  
  var showLoading = function(){
    $scope.popup = $ionicPopup.show({
      templateUrl: "templates/common/loading.html"
    });
  }

  var hideLoading = function(){
    $scope.popup.close();
  }

  $scope.UnLinkearConFacebook = function () {
    showLoading();
    var user = firebase.auth().currentUser;
    var providerId = "facebook.com";
    user.unlink(providerId).then(function(success) {
      broadcastAuthChange();
      // handle logged in
      $scope.AuthData = success;
      hideLoading();
      $state.go('app.perfil');
              var mensaje = $ionicPopup.show({
                title: 'Desconexion',
                template: 'Exitosa',
              });

              $timeout(function() {
                mensaje.close(); //close the popup after 3 seconds for some reason
              }, 2000);
    }, function(error) {
      // An error happened
      hideLoading();
    });
  }

  $scope.LinkearConFacebook = function () {
    showLoading();
    var provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().currentUser.linkWithPopup(provider).then(function(result) {
      broadcastAuthChange();
      // handle logged in
      $scope.AuthData = result;
      hideLoading();
      $state.go('app.perfil');
              var mensaje = $ionicPopup.show({
                title: 'Conexion a Facebook',
                template: 'Exitosa',
              });

              $timeout(function() {
                mensaje.close(); //close the popup after 3 seconds for some reason
              }, 2000);
    },
              function(error){
                  //////console.log(error);
                  if(error.code =="auth/credential-already-in-use"){
                        var mensaje = $ionicPopup.show({
                          title: 'Conexion a Facebook',
                          template: 'Esta cuenta ya esta asociado con otro usuario.',
                        });
                        hideLoading();

                        $timeout(function() {
                          mensaje.close(); //close the popup after 3 seconds for some reason
                        }, 3000);
                  }
              });
  };

    /*
      FUNCIONES PARA HACER CHECK-IN
    */

    $scope.check = function(){
      // Chequeamos cuando fue la ultima vez que hice check
      $scope.last_check = localStorage.getItem('last_check');
      $scope.CheckOk = true;
      ////console.log($scope.last_check);
      $scope.hora = new Date().getTime();
      ////console.log($scope.hora);
      
      if($scope.last_check == null){
          $scope.CheckOk = true;
          CargarCentros();
      }else{
        //localStorage.setItem('completar_perfil',true); ||
        var horaInicial = $scope.last_check;
        var horaFinal = $scope.hora;
        ////console.log((horaFinal-horaInicial)/1000/60);
        if(((horaFinal-horaInicial)/1000/60) >= 15){
          ////console.log(horaFinal-horaInicial);
          $scope.CheckOk = true;
          CargarCentros();
        }else{
          $scope.espera = parseInt(15-((horaFinal-horaInicial)/1000/60));
          $scope.CheckOk = false;
        }
      }

    }

    function devolverMinutos(horaMinutos)
    {
      return (parseInt(horaMinutos.split(":")[0])*60)+parseInt(horaMinutos.split(":")[1]);
    }
    
    /*
        Funcion para cargar Centro Comercial
    */
    function CargarCentros() {
        $scope.items = [];
        $scope.hay_lugares= false;
        showLoading();
        CentrosComerciales.get().then(
            function(success){
                if(CentrosComerciales.all != null) {
                  $scope.comercios = CentrosComerciales.all;
                  ////console.log($scope.comercios);
                  // Obtenemos la distacia
                    //Obtenemos la ubicacion actual
                    navigator.geolocation.getCurrentPosition(function(pos) {
                        $scope.posicion = pos.coords.latitude+","+ pos.coords.longitude;
                        angular.forEach($scope.comercios,function (detalles,key) {

                          angular.forEach(detalles.locales,function (locales,key) {
                            var dist = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metrics&origins='+$scope.posicion+'&destinations='+locales.perfil.mapa.latitud || 0+','+locales.perfil.mapa.longitud || 0+'&key=AIzaSyCUn0MtaWaYfO2eW7wlIW4Ugy-7vZXmZKM'
                            //////console.log(dist);
                            var service = new google.maps.DistanceMatrixService;
                            service.getDistanceMatrix({
                              origins: [pos.coords.latitude+","+ pos.coords.longitude],
                              destinations: [locales.perfil.mapa.latitud+','+locales.perfil.mapa.longitud],
                              travelMode: google.maps.TravelMode.DRIVING,
                              unitSystem: google.maps.UnitSystem.METRIC,
                              avoidHighways: false,
                              avoidTolls: false
                            }, function(response, status) {
                              if (status !== google.maps.DistanceMatrixStatus.OK) {
                                //alert('Error was: ' + status);
                              } else {
                                //console.log(response);
                                if((response.rows[0].elements[0].status !=='ZERO_RESULTS' && response.rows[0].elements[0].status !=='NOT_FOUND' )){
                                  if(response.rows[0].elements[0].distance.value <= 250){
                                    setTimeout(function(){
                                        $scope.items.push({comercios:locales,distancia:response.rows[0].elements[0].distance.text,valor:response.rows[0].elements[0].distance.value, categoria:'centros_comerciales',
                                                          slug: key});
                                        $scope.$apply();
                                    }, 0);
                                    $scope.hay_lugares = true;
                                  }
                                }
                              }
                            });
                          });
                          var dist = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metrics&origins='+$scope.posicion+'&destinations='+detalles.perfil.mapa.latitud || 0+','+detalles.perfil.mapa.longitud || 0+'&key=AIzaSyCUn0MtaWaYfO2eW7wlIW4Ugy-7vZXmZKM'
                          //////console.log(dist);
                          var service = new google.maps.DistanceMatrixService;
                          service.getDistanceMatrix({
                            origins: [pos.coords.latitude+","+ pos.coords.longitude],
                            destinations: [detalles.perfil.mapa.latitud+','+detalles.perfil.mapa.longitud],
                            travelMode: google.maps.TravelMode.DRIVING,
                            unitSystem: google.maps.UnitSystem.METRIC,
                            avoidHighways: false,
                            avoidTolls: false
                          }, function(response, status) {
                            if (status !== google.maps.DistanceMatrixStatus.OK) {
                              //alert('Error was: ' + status);
                            } else {
                              if((response.rows[0].elements[0].status !=='ZERO_RESULTS' && response.rows[0].elements[0].status !=='NOT_FOUND' )){
                                if(response.rows[0].elements[0].distance.value <= 250){
                                  setTimeout(function(){
                                      $scope.items.push({comercios:detalles,distancia:response.rows[0].elements[0].distance.text,valor:response.rows[0].elements[0].distance.value, categoria:'centros_comerciales',
                                                        slug: key});
                                      $scope.$apply();
                                  }, 0);
                                  $scope.hay_lugares = true;
                                }
                              }
                            }
                          });
                        });
                    });
                  //////console.log($scope.items);
                  //comercios.CategoriesForm = CentrosComerciales.all;
                }
            },
            function(error){
                //////console.log(error);
            }
        );
        Multimarcas.get().then(
            function(success){
                if(Multimarcas.all != null) {
                  $scope.multimarcas = Multimarcas.all;
                  // Obtenemos la distacia
                    //Obtenemos la ubicacion actual
                    navigator.geolocation.getCurrentPosition(function(pos) {
                        $scope.posicion = pos.coords.latitude+","+ pos.coords.longitude;
                          //////console.log($scope.multimarcas);
                        angular.forEach($scope.multimarcas,function (detalles1,multimarca) {
                          //////console.log(detalles1);
                          angular.forEach(detalles1.locales,function (detalles,key) {
                            ////////console.log(detalles);
                            detalles.perfil.icono = detalles1.perfil.icono;
                            var dist = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metrics&origins='+$scope.posicion+'&destinations='+detalles.perfil.mapa.latitud || 0+','+detalles.perfil.mapa.longitud || 0+'&key=AIzaSyCUn0MtaWaYfO2eW7wlIW4Ugy-7vZXmZKM'
                            var service = new google.maps.DistanceMatrixService;
                            service.getDistanceMatrix({
                              origins: [pos.coords.latitude+","+ pos.coords.longitude],
                              destinations: [detalles.perfil.mapa.latitud+','+detalles.perfil.mapa.longitud],
                              travelMode: google.maps.TravelMode.DRIVING,
                              unitSystem: google.maps.UnitSystem.METRIC,
                              avoidHighways: false,
                              avoidTolls: false
                            }, function(response, status) {
                              if (status !== google.maps.DistanceMatrixStatus.OK) {
                                //alert('Error was: ' + status);
                              } else {
                                if((response.rows[0].elements[0].status !=='ZERO_RESULTS' && response.rows[0].elements[0].status !=='NOT_FOUND' )){
                                  if(response.rows[0].elements[0].distance.value <= 250){
                                    setTimeout(function(){
                                        $scope.items.push({comercios:detalles,distancia:response.rows[0].elements[0].distance.text,valor:response.rows[0].elements[0].distance.value, categoria:'multimarcas',
                                                          slug: key, multimarca:multimarca});
                                        $scope.$apply();
                                    }, 0);
                                      $scope.hay_lugares = true;
                                  }
                                }
                              }
                            });
                          });
                          //hideLoading();  
                        });
                    });
                  ////console.log($scope.items);
                  //comercios.CategoriesForm = CentrosComerciales.all;
                }
            },
            function(error){
                //////console.log(error);
            }
        );
        Supermercados.get().then(
            function(success){
                if(Supermercados.all != null) {
                  $scope.supermercados = Supermercados.all;
                  // Obtenemos la distacia
                    //Obtenemos la ubicacion actual
                    navigator.geolocation.getCurrentPosition(function(pos) {
                        $scope.posicion = pos.coords.latitude+","+ pos.coords.longitude;
                          //////console.log($scope.supermercados);
                        angular.forEach($scope.supermercados,function (detalles1,multimarca) {
                          //////console.log(detalles1);
                          angular.forEach(detalles1.locales,function (detalles,key) {
                            ////////console.log(detalles);
                            detalles.perfil.icono = detalles1.perfil.icono;
                            var dist = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metrics&origins='+$scope.posicion+'&destinations='+detalles.perfil.mapa.latitud || 0+','+detalles.perfil.mapa.longitud || 0+'&key=AIzaSyCUn0MtaWaYfO2eW7wlIW4Ugy-7vZXmZKM'
                            var service = new google.maps.DistanceMatrixService;
                            service.getDistanceMatrix({
                              origins: [pos.coords.latitude+","+ pos.coords.longitude],
                              destinations: [detalles.perfil.mapa.latitud+','+detalles.perfil.mapa.longitud],
                              travelMode: google.maps.TravelMode.DRIVING,
                              unitSystem: google.maps.UnitSystem.METRIC,
                              avoidHighways: false,
                              avoidTolls: false
                            }, function(response, status) {
                              if (status !== google.maps.DistanceMatrixStatus.OK) {
                                //alert('Error was: ' + status);
                              } else {
                                if((response.rows[0].elements[0].status !=='ZERO_RESULTS' && response.rows[0].elements[0].status !=='NOT_FOUND' )){
                                  if(response.rows[0].elements[0].distance.value <= 250){
                                    setTimeout(function(){
                                        $scope.items.push({comercios:detalles,distancia:response.rows[0].elements[0].distance.text,valor:response.rows[0].elements[0].distance.value, categoria:'supermercados',
                                                          slug: key, supermercado:multimarca});
                                        $scope.$apply();
                                    }, 0);
                                      $scope.hay_lugares = true;
                                  }
                                }
                              }
                            });
                          });
                          hideLoading();  
                        });
                    });
                  ////console.log($scope.items);
                  //comercios.CategoriesForm = CentrosComerciales.all;
                }
            },
            function(error){
                //////console.log(error);
            }
        );
    };
    // A confirm dialog
   $scope.showConfirm = function(puntos,item) {
        var ultimo_check = localStorage.getItem(item.slug);
        ////console.log(ultimo_check);
        var timeNow = new Date().getTime();
        ////console.log(timeNow);


        if(ultimo_check == null){
          if(puntos == true || puntos == 'true'){
             var confirmPopup = $ionicPopup.confirm({
               title: 'Realizar Check-In',
               buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                text: '<i style="font-size: 20px !important;" class="icon-cancel"></i>',
                type: 'button-default boton-cerrar-2',
                onTap: function(e) {
                  // e.preventDefault() will stop the popup from closing when tapped.
                  //////console.log('You are not sure');
                  //e.preventDefault();
                }
              },{
                text: '<i style="font-size: 20px !important;" class="icon-ok"></i>',
                type: 'button-positive button-celeste',
                onTap: function(e) {
                  //Sumamos el punto en el perfil del usuario, seccion CHECKS, asi como dentro del perfil del local, en la parte de Checks
                  //////console.log('You are  sure');
                  LocalesAdheridos.checkin(item);

                          $ionicPopup.confirm({
                            template: '<div class="content">'
                                          +'<h4 class="normal-font">Check-In</h4>'
                                          +'<h4 class="light-font"><br><br>Realizado con exito. <br> Se sumo un punto a tu historial.<br></h4>'
                                          +'</div>',
                             buttons: [{ 
                              text: 'Ok',
                              type: 'button-default boton-cerrar',
                            }]
                          });

                            // Guardamos la hora del ultimo Check
                            $scope.hora = new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds();
                            var timeNow = new Date().getTime();
                            localStorage.setItem('last_check',timeNow);
                            localStorage.setItem(item.slug,timeNow);
                            $scope.check();
                            setTimeout(function(){
                                $scope.CheckOk = false;
                                $scope.$apply();
                            }, 0);
                  
                  //e.preventDefault();
                }
              }]
             });
          }else{
             var confirmPopup = $ionicPopup.confirm({
               templateUrl: "templates/common/no_check.html",
               buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                text: 'Cancelar',
                type: 'button-default boton-cerrar-2',
                onTap: function(e) {
                  // e.preventDefault() will stop the popup from closing when tapped.
                  //////console.log('You are not sure');
                  //e.preventDefault();
                }
              },{
                text: 'Sugerir',
                type: 'button-positive button-celeste',
                onTap: function(e) {
                  LocalesAdheridos.Sugerir(item).then(function(success){
                    $ionicPopup.alert({
                      template: '<div class="content">'
                                    +'<h4 class="normal-font">Sugerir</h4>'
                                    +'<h4 class="light-font"><br><br>Sugerencia exitosa.<br>Gracias por colaborar.<br></h4>'
                                    +'</div>',
                       buttons: [{ 
                        text: 'Ok',
                        type: 'button-default boton-cerrar',
                      }]
                    });
                  });
                }
              }]
             });
          }
        }else{
          var diferencia = ((timeNow - ultimo_check)/1000/60/60);
          ////console.log(diferencia);
          if(diferencia >= 12){
            if(puntos == true || puntos == 'true'){
               var confirmPopup = $ionicPopup.confirm({
                 title: 'Realizar Check-In',
                 buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                  text: '<i style="font-size: 20px !important;" class="icon-cancel"></i>',
                  type: 'button-default boton-cerrar-2',
                  onTap: function(e) {
                    // e.preventDefault() will stop the popup from closing when tapped.
                    //////console.log('You are not sure');
                    //e.preventDefault();
                  }
                },{
                  text: '<i style="font-size: 20px !important;" class="icon-ok"></i>',
                  type: 'button-positive button-celeste',
                  onTap: function(e) {
                    //Sumamos el punto en el perfil del usuario, seccion CHECKS, asi como dentro del perfil del local, en la parte de Checks
                    //////console.log('You are  sure');
                    LocalesAdheridos.checkin(item);

                      $ionicPopup.confirm({
                              template: '<div class="content">'
                                            +'<h4 class="normal-font">Check-In</h4>'
                                            +'<h4 class="light-font"><br><br>Realizado con exito. <br> Se sumo un punto a tu historial.<br></h4>'
                                            +'</div>',
                               buttons: [{ 
                                text: 'Ok',
                                type: 'button-default boton-cerrar',
                              }]
                            });

                              // Guardamos la hora del ultimo Check
                              $scope.hora = new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds();
                              var timeNow = new Date().getTime();
                              localStorage.setItem('last_check',timeNow);
                              localStorage.setItem(item.slug,timeNow);
                              $scope.check();
                              setTimeout(function(){
                                  $scope.CheckOk = false;
                                  $scope.$apply();
                              }, 0);
                    
                    //e.preventDefault();
                  }
                }]
               });
            }else{
               var confirmPopup = $ionicPopup.confirm({
                 templateUrl: "templates/common/no_check.html",
                 buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                  text: 'Cancelar',
                  type: 'button-default boton-cerrar-2',
                  onTap: function(e) {
                    // e.preventDefault() will stop the popup from closing when tapped.
                    //////console.log('You are not sure');
                    //e.preventDefault();
                  }
                },{
                  text: 'Sugerir',
                  type: 'button-positive button-celeste',
                  onTap: function(e) {
                    LocalesAdheridos.Sugerir(item).then(function(success){
                      $ionicPopup.alert({
                        template: '<div class="content">'
                                      +'<h4 class="normal-font">Sugerir</h4>'
                                      +'<h4 class="light-font"><br><br>Sugerencia exitosa.<br>Gracias por colaborar.<br></h4>'
                                      +'</div>',
                         buttons: [{ 
                          text: 'Ok',
                          type: 'button-default boton-cerrar',
                        }]
                      });
                    });
                  }
                }]
               });
            }
          }else{
            $ionicPopup.alert({
              template: '<div class="content" style="line-height: 1.5;">'
                            +'<img src="img/sad-face.svg" width="25%" style="margin-bottom: 12px;">'
                            +'<br>Debes esperar '+parseInt((15-diferencia)) +' horas para volver a hacer check-in en este comercio.'
                            +'</div>',
               buttons: [{ 
                text: 'Ok',
                type: 'button-default boton-cerrar',
              }]
            });
          }
        }
   };

    /*
      FUNCION PARA ELIMINAR FAVORITOS
    */
    $scope.showDelete = false;
    $scope.listCanSwipe = true;
    $scope.show_eliminar =function(){
      ////console.log($scope.showDelete);
      if($scope.showDelete){
        setTimeout(function(){
            $scope.showDelete = false;
            $scope.$apply();
            ////console.log($scope.showDelete);
        }, 0);
      }else{
        setTimeout(function(){
            $scope.showDelete = true;
            $scope.$apply();
            ////console.log($scope.showDelete);
        }, 0);
      }
      //////console.log($scope.showDelete);
    }
    $scope.AuthData = Auth.AuthData;
    $scope.eliminar = function(item){
      ////console.log($scope.quitar_fav[item]);
      $scope.detalle_Favorito.splice(item, 1);
      Favoritos.buttonPressed($scope.AuthData, $scope.quitar_fav[item].slug).then(
      function(success){
        ////console.log("No Fav"+Favoritos.CachedList);
      }, function(error){
        ////console.log(error);
        //hideLoading();
      })
    }

    /*
      FUNCIONES PARA PUNTOS
    */

    function puntos() {
      showLoading();
      $scope.puntos = [];
      // Obtenemos los CHECKS del perfil del usuario, listamos en ion-item, ordenamos por cantidad de puntos
      LocalesAdheridos.Checks().then(function(success){
        $scope.checks = LocalesAdheridos.puntos;
        angular.forEach($scope.checks,function (detalles,key) {
          // Le agregamos el Key para buscar dentro de Checks del perfil del usuario
          detalles.key = key ;
          ////console.log(detalles);
          setTimeout(function(){
              $scope.puntos.push(detalles);
              $scope.$apply();
          }, 0);
        });
        //////console.log($scope.puntos);
        //hideLoading();
      }, function(err){
        ////console.log(err);
        //hideLoading();
      })

      $scope.cupones = [];
      // Obtenemos los Cupones del perfil del usuario, listamos en ion-item
      LocalesAdheridos.Cupones().then(function(success){
        $scope.coupons = LocalesAdheridos.cupones;
        angular.forEach($scope.coupons,function (detalles, key) {
          detalles.slug = key;
          var timeNow = new Date();
          ////console.log(detalles);
          var diferencia = (timeNow.getTime() - detalles.time_generado)/1000/60/60
          ////console.log(diferencia);
          // Filtramos por diferencia de 4 horas, si ya paso el tiempo procedemos a eliminar del perfil
          if(diferencia <= 4){
            ////console.log("Tiene cupon");
            setTimeout(function(){
                $scope.cupones.push(detalles);
                $scope.$apply();
            }, 0);
            ////console.log($scope.cupones);
          }else{
            LocalesAdheridos.eliminarCupon(key);
          }
        });
        //////console.log($scope.puntos);
        hideLoading();
      }, function(err){
        ////console.log(err);
        hideLoading();
      })
      $q.all($scope.puntos).then(function(){
        ////console.log($scope.puntos);
        hideLoading();
      })

    }

    $scope.nocupon = function(){
      $ionicPopup.alert({
                  template: '<div class="content" style="line-height: 1.5;">'
                                +'<img src="img/sad-face.svg" width="25%" style="margin-bottom: 12px;"> <br><strong>Todavía no alcanzaste los puntos suficientes.</strong>'
                                +'<br>¡Seguí sumando puntos haciendo check-in!'
                                +'</div>',
                   buttons: [{ 
                    text: 'Ok',
                    type: 'button-default boton-cerrar',
                  }]
                });
      
      
    }

    // MODAL PARA MOSTRAR LOS BENEFICIOS
    
    $ionicModal.fromTemplateUrl('templates/modal/beneficios.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.BeneficiosModal = modal;
    });
    $scope.closeBeneficiosModal = function () {
      $scope.BeneficiosModal.hide();
    };

    $scope.beneficio_elegido = function(item, key){
      $ionicPopup.confirm({
           title: '¿Estás seguro de realizar el canje?',
           template: 'Te recordamos que el cupón generado podrá ser utilizado únicamente dentro de las 4 horas posteriores al canje, luego el mismo será eliminado y no tendrá validez.',
           buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
            text: 'No',
            type: 'button-default boton-popup',
            onTap: function(e) {
              // e.preventDefault() will stop the popup from closing when tapped.
              //////console.log('You are not sure');
              //e.preventDefault();
            }
          },{
            text: 'Si',
            type: 'button-positive button-celeste',
            onTap: function(e) {
              // Canjear puntos por cupones
              $scope.BeneficiosModal.hide();
              ////console.log(item, key);
              LocalesAdheridos.canjear(item, key).then(function(success){
                //Regcargamos la pagina llamando a la funcion puntos
                $ionicPopup.alert({
                    template: '<div class="content">'
                                  +'<h4 class="normal-font">Canje</h4>'
                                  +'<h4 class="light-font"><br><br>Cupón canjeado con éxito.<br></h4>'
                                  +'</div>',
                     buttons: [{ 
                      text: 'Ok',
                      type: 'button-default boton-cerrar',
                      onTap: function(e) {
                        $timeout(function() {
                          puntos();
                        }, 1000);
                        //e.preventDefault();
                      }
                    }]
                  });
              })
            }
          }]
         });
    };

    $scope.cupon = function(item){

            $scope.item = item;
            ////console.log($scope.item.detalle_beneficio);

            $scope.BeneficiosModal.show();
    }

})

// Controlador de las Categorias
.controller('CategoriaCtrl', function ($scope, $stateParams, $dataService, $ionicHistory, StorageService, $state, $ionicModal, $ionicPopup, CentrosComerciales, Multimarcas,
  $timeout, Auth, $interval, $ionicScrollDelegate, Supermercados) {
 
  var shoppings              =  this;
      shoppings.datos           =  $stateParams.slug;
  /*
    Al entrar a la seccion de categorias
    1) Mostramos un loading
    2) Cargamos los Centros Comerciales, Multimarcas, Supermercados
    3) Cerramos el loading
  */

  $scope.$on("$ionicView.beforeEnter", function (event, data) {
    // global variables
    $scope.AuthData = Auth.AuthData;
    checkAuth();
    });

    // Sube la vista hasta arriba
    $scope.scrollToTop = function () {
      $ionicScrollDelegate.scrollTop();
    }

  //Chequea si el usuario esta logeado
  function checkAuth() {
    //////console.log("Controlamos la sesion");
    $scope.AuthData = Auth.AuthData;
    if(!$scope.AuthData.hasOwnProperty('uid')){
      Auth.getAuthState().then(
        function(AuthData){
          $scope.AuthData = AuthData;
          CargarCentros();
          CargarMultimarcas();
          CargarSupermercados();
        },
        function(notLoggedIn){
          //Para que le muestre el template de login
          $scope.AuthData = "";
          CargarCentros();
          CargarMultimarcas();
          CargarSupermercados();
        }
      )
    }else{
      CargarCentros();
      CargarMultimarcas();
      CargarSupermercados();
    };
  };

  var showLoading = function(){
    $scope.popup = $ionicPopup.show({
      templateUrl: "templates/common/loading.html"
    });
  }

  var hideLoading = function(){
    $scope.popup.close();
  }

    $interval(function(){
      ReCargarCentros();
      //////console.log("Re Cargamos los Comercios");
    }, 60000)

   /*
    Funcion para refrescar, donde vuelve a llamar a la funcion CargarCentros()
  */

    $scope.doRefresh = function() {
      $timeout( function() {
        ReCargarCentros();

        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      
      }, 1000);
    };
    
    /*
        Funcion para cargar Centro Comercial
    */
    function CargarCentros() {
        showLoading();
        CentrosComerciales.get().then(
            function(success){
                if(CentrosComerciales.all != null) {
                  $scope.comercios = CentrosComerciales.all;
                  // Cargamos el avatar de cada Comercio
                  hideLoading();  
                  //comercios.CategoriesForm = CentrosComerciales.all;
                }
            },
            function(error){
                //////console.log(error);
                hideLoading();  
            }
        );
    };
    function CargarMultimarcas() {
        Multimarcas.get().then(
            function(success){
                if(Multimarcas.all != null) {
                  $scope.multimarcas = Multimarcas.all;
                  // Cargamos el avatar de cada Comercio 
                  //comercios.CategoriesForm = CentrosComerciales.all;
                }
            },
            function(error){
                //////console.log(error);
            }
        );
    };
    function CargarSupermercados() {
        Supermercados.get().then(
            function(success){
                if(Supermercados.all != null) {
                  $scope.supermercados = Supermercados.all;
                  // Cargamos el avatar de cada Comercio 
                  //comercios.CategoriesForm = CentrosComerciales.all;
                }
            },
            function(error){
                //////console.log(error);
            }
        );
    };
    function ReCargarCentros() {
        CargarCentros();
        CargarMultimarcas();
        CargarSupermercados();
    };

              $scope.swipe = function (direction) {
                  //////console.log("Back");
                 if(direction == 'right') 
                   $ionicHistory.goBack()
               }

})
// Controlador de los Shoppings
.controller('ShoppingCtrl', function ($scope, $stateParams, $dataService, $ionicHistory, StorageService, $state, $ionicModal, $ionicPopup, CentrosComerciales, $timeout, Auth, Favoritos) {
 
  var shoppings              =  this;
      shoppings.datos        =  $stateParams.slug;

      $scope.banners_destacados = ['1','2'];

      $scope.options = {
        autoplay:2000,
        loop: false,
        free:false,
        speed:2000,
        initialSlide: 2,
        direction: 'horizontal',
        autoplayDisableOnInteraction: false,
        slidesPerView: '1', 
        showNavButtons: false, 
      };

      $scope.sliderDelegate;

      //detect when sliderDelegate has been defined, and attatch some event listeners
      $scope.$watch('sliderDelegate', function(newVal, oldVal){
        if(newVal != null){ 
          $scope.sliderDelegate.on('slideChangeEnd', function(){
            ////console.log('updated slide to ' + $scope.sliderDelegate.activeIndex);
            $scope.$apply();
          });
        }
      });



  $scope.$on("$ionicView.enter", function (event, data) {
    // global variables

    if($state.current.name == "app.shoppings" ) {
      DatosShopping(shoppings.datos);
    }
  });

  var showLoading = function(){
    $scope.popup = $ionicPopup.show({
      templateUrl: "templates/common/loading.html"
    });
  }

  var hideLoading = function(){
    $scope.popup.close();
  }

   /*
    Funcion para refrescar, donde vuelve a llamar a la funcion CargarCentros()
  */

    $scope.doRefresh = function() {
      $timeout( function() {
        //////console.log("Actualizando");
        DatosShopping(shoppings.datos);

        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      
      }, 1000);
    };
    
    /*
        Funcion para cargar Centro Comercial
    */
    function DatosShopping(shopping) {
        $scope.promociones = [];
        $scope.banners_destacados = [];
        // Verificamos si esta como favorito, le pasamos el slug del shopping
        $scope.walletPressedCSS(shoppings.datos);
        showLoading();
        // Obtenemos los datos del comercio y le sumamos una visita a las estadisticas
        CentrosComerciales.getShopping2(shopping).then(
            function(success){
                if(CentrosComerciales.shopping != null) {
                  $scope.slug = shopping;
                  $scope.shopping = CentrosComerciales.shopping;
                  if($scope.shopping.perfil.hasOwnProperty('destacado')){
                    setTimeout(function(){
                        $scope.es_destacado = true;
                        $scope.$apply();
                    }, 0);
                  }else{      
                    setTimeout(function(){
                        $scope.es_destacado = false;
                        $scope.$apply();
                    }, 0);
                  }
                  if($scope.shopping.perfil.mapa_complejo){
                    setTimeout(function(){
                        $scope.svg = $scope.shopping.perfil.mapa_complejo;
                        $scope.mapa_complejo = true;
                        $scope.$apply();
                    }, 0);
                  }else{      
                    setTimeout(function(){
                        $scope.mapa_complejo = false;
                        $scope.$apply();
                    }, 0);
                  }
                  Favoritos.CachedList
                  angular.forEach($scope.shopping.perfil.banners_destacados, function(value,key) {
                    // Array para banner destacados
                      if(value != ""){
                        $scope.banners_destacados.push(value);
                      }
                  });

                  // Listamos las promociones
                  angular.forEach($scope.shopping.promociones, function(value,key) {
                    // Filtro para promociones
                      var timeNow = new Date();
                      const [day, month, year] = value.fechainicio.split("/");
                      const [day1, month1, year1] = value.fechafin.split("/");
                      var date1 = new Date(year, month - 1, day); 
                      var date2 = new Date(year1, month1 - 1, day1);
                      if(date1 <= new Date() && date2 >= new Date()){
                        $scope.promociones.push(value);
                      }

                  });

                  // Cargamos el avatar de cada Comercio
                  hideLoading();  
                  //comercios.CategoriesForm = CentrosComerciales.all;
                }
            },
            function(error){
                //////console.log(error);
            }
        );
    };
  


  $scope.locales = function () {
      carga_locales($stateParams.slug);
   }
    
    /*
        Funcion para cargar Locales del Centro Comercial
    */
    function carga_locales(shopping) {
        showLoading();
        CentrosComerciales.getLocales(shopping).then(
            function(success){
                if(CentrosComerciales.locales != null) {
                  $scope.shopp = shopping;
                  $scope.locales = CentrosComerciales.locales;
                  //////console.log($scope.locales);
                  // Cargamos el avatar de cada Comercio
                  hideLoading();  
                  //comercios.CategoriesForm = CentrosComerciales.all;
                }
            },
            function(error){
                //////console.log(error);
            }
        );
    };

    $scope.local = function () {
      ////console.log($scope.shopping);
      DatosLocal($stateParams.local,$stateParams.slug);
    }
    
    /*
        Funcion para cargar detalles del Local
    */
    function DatosLocal(local,slug) {
        console.log(local);
        ////console.log(slug);
        $scope.promociones = [];
        $scope.banners_destacados = [];
        // Verificamos si esta como favorito, le pasamos el slug del local
        $scope.walletPressedCSS(local);
        $scope.local1= local ;
        showLoading();
        CentrosComerciales.getLocal2(local,slug).then(
            function(success){
                if(CentrosComerciales.local != null) {
                  $scope.shopp = slug;
                  $scope.local = CentrosComerciales.local;
                  console.log($scope.local);
                  // Cargamos el avatar de cada Comercio
                  if($scope.local.perfil.hasOwnProperty('destacado')){
                    setTimeout(function(){
                        $scope.es_destacado = true;
                        $scope.$apply();
                    }, 0);
                  }else{      
                    setTimeout(function(){
                        $scope.es_destacado = false;
                        $scope.$apply();
                    }, 0);
                  }
                  
                  var d = new Date();
                  var n = d.getDay();
                  var now = d.getHours() + ":" + d.getMinutes();
                  var weekdays = [
                      ["Sunday", $scope.local.perfil.horario.domingo.desde, $scope.local.perfil.horario.domingo.hasta],
                      ["Monday", $scope.local.perfil.horario.lunes.desde, $scope.local.perfil.horario.lunes.hasta],
                      ["Tuesday", $scope.local.perfil.horario.martes.desde, $scope.local.perfil.horario.martes.hasta],
                      ["Wednesday", $scope.local.perfil.horario.miercoles.desde, $scope.local.perfil.horario.miercoles.hasta],
                      ["Thursday", $scope.local.perfil.horario.jueves.desde, $scope.local.perfil.horario.jueves.hasta],
                      ["Friday", $scope.local.perfil.horario.viernes.desde, $scope.local.perfil.horario.viernes.hasta],
                      ["Saturday", $scope.local.perfil.horario.sabado.desde,$scope.local.perfil.horario.sabado.hasta] // we are closed, sorry!
                  ];
                  var day = weekdays[n];

                  if (now >= day[1] && now <= day[2]) {
                      $scope.abierto = true
                      //////console.log("Esta ABIERTO");
                  }
                   else {
                      $scope.abierto = false
                      //////console.log("Esta CERRADO");

                  }
                  angular.forEach($scope.local.perfil.banners_destacados, function(value,key) {
                    // Array para banner destacados
                      if(value != ""){
                        $scope.banners_destacados.push(value);
                      }
                  });
                  // Listamos las promociones
                  angular.forEach($scope.local.promociones, function(value,key) {
                    // Filtro para promociones
                      var timeNow = new Date();
                      const [day, month, year] = value.fechainicio.split("/");
                      const [day1, month1, year1] = value.fechafin.split("/");
                      var date1 = new Date(year, month - 1, day); 
                      var date2 = new Date(year1, month1 - 1, day1);
                      if(date1 <= new Date() && date2 >= new Date()){
                        $scope.promociones.push(value);
                      }
                  });
                  
                  hideLoading();  
                  //comercios.CategoriesForm = CentrosComerciales.all;
                }
            },
            function(error){
                //////console.log(error);
            }
        );
    };

    /*
      Funcion para Favorito
    */
    
    var comercio = "";
    $scope.roto = false;
    $scope.AuthData = Auth.AuthData;
    $scope.GuardarFav = function(categoria, comercio, local) {
      $scope.favorito_slug = local;
      var check = local;
      ////console.log($scope.AuthData);
      Favoritos.buttonPressed($scope.AuthData, local, categoria, comercio).then(
        function(success){
          ////console.log(success);
          if(success.hasOwnProperty(check)){
            if(success[check] == false){
              $timeout(function() {
                $scope.$apply(function () {
                  $scope.roto = true;
                });
              });
            }
          }
          $scope.WalletList = Favoritos.CachedList;
          $scope.walletPressedCSS($scope.favorito_slug);
        })
    };

   $scope.walletPressedCSS = function(slug) {
    $scope.roto = false;
    //////console.log(slug);
    //Recargamos los Favoritos 
    $scope.AuthData = Auth.AuthData;
    Favoritos.load($scope.AuthData).then(
      function(success){
        $scope.WalletList = Favoritos.CachedList;
        //////console.log($scope.WalletList);
        if($scope.WalletList.hasOwnProperty(slug)){
          if($scope.WalletList[slug]) {
            $timeout(function() {
              $scope.$apply(function () {
                $scope.favorito = true;
              });
            });
          }else{
            $timeout(function() {
              $scope.$apply(function () {
                $scope.favorito = false;
              });
            });
          }
        }else{
            $timeout(function() {
              $scope.$apply(function () {
                $scope.favorito = false;
              });
            });
        }
      });
  };

  $ionicModal.fromTemplateUrl('templates/modal/horario_plano.html', {
    id: 'horario',
    scope: $scope
  }).then(function (modal) {
    $scope.horarioModal = modal;
  });

  $scope.closeHorarioModal = function () {
    $scope.horarioModal.hide();
  };

  $scope.openHorarioModal = function () {
    $scope.horarioModal.show();
  };


  $ionicModal.fromTemplateUrl('templates/modal/horario.html', {
    id: 'horario',
    scope: $scope
  }).then(function (modal) {
    $scope.horario = modal;
  });

  $scope.closeHorario = function () {
    $scope.horario.hide();
  };

  $scope.openHorario = function () {
    $scope.horario.show();
  };



  $ionicModal.fromTemplateUrl('templates/modal/beneficio.html', {
    id: 'beneficio',
    scope: $scope
  }).then(function (modal) {
    $scope.BeneficioModal = modal;
  });

  $scope.closeBeneficiosModal = function () {
    $scope.BeneficioModal.hide();
  };

  $scope.openBeneficiosModal = function (beneficios) {
    $scope.beneficios = beneficios;
    $scope.BeneficioModal.show();
  };

})
// Controlador de las Multimarcas
.controller('MultimarcasCtrl', function ($scope, $stateParams, $dataService, $ionicHistory, StorageService, $state, $ionicModal, $ionicPopup, Multimarcas, $timeout, Auth, Favoritos) {
 
  var shoppings              =  this;
      shoppings.datos           =  $stateParams.slug;

      $scope.banners_destacados = ['1','2'];

      $scope.options = {
        autoplay:2000,
        loop: false,
        free:false,
        speed:2000,
        initialSlide: 3,
        direction: 'horizontal',
        autoplayDisableOnInteraction: false,
        slidesPerView: '1', 
        showNavButtons: false, 
      };

      $scope.sliderDelegate;

      //detect when sliderDelegate has been defined, and attatch some event listeners
      $scope.$watch('sliderDelegate', function(newVal, oldVal){
        if(newVal != null){ 
          $scope.sliderDelegate.on('slideChangeEnd', function(){
            ////console.log('updated slide to ' + $scope.sliderDelegate.activeIndex);
            $scope.$apply();
          });
        }
      });



  $scope.$on("$ionicView.enter", function (event, data) {
    // global variables
    if($state.current.name == "app.multimarcas" ) {
      DatosShopping(shoppings.datos);
    }
    //$scope.walletPressedCSS(shoppings.datos);
    });

  var showLoading = function(){
    $scope.popup = $ionicPopup.show({
      templateUrl: "templates/common/loading.html"
    });
  }

  var hideLoading = function(){
    $scope.popup.close();
  }

   /*
    Funcion para refrescar, donde vuelve a llamar a la funcion CargarCentros()
  */

    $scope.doRefresh = function() {
      $timeout( function() {
        //////console.log("Actualizando");
        DatosShopping(shoppings.datos);

        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      
      }, 1000);
    };
    
    /*
        Funcion para cargar Centro Comercial
    */
    function DatosShopping(shopping) {
        $scope.promociones = [];
        $scope.banners_destacados = [];
        // Verificamos si esta como favorito, le pasamos el slug del shopping
        $scope.walletPressedCSS(shoppings.datos);
        showLoading();
        Multimarcas.getShopping2(shopping).then(
            function(success){
                if(Multimarcas.shopping != null) {
                  $scope.slug = shopping;
                  $scope.shopping = Multimarcas.shopping;
                  $scope.dato = Multimarcas.shopping;
                  if($scope.shopping.perfil.hasOwnProperty('destacado')){
                    setTimeout(function(){
                        $scope.es_destacado = true;
                        $scope.$apply();
                    }, 0);
                  }else{      
                    setTimeout(function(){
                        $scope.es_destacado = false;
                        $scope.$apply();
                    }, 0);
                  }
                  if($scope.shopping.perfil.mapa_complejo){
                    setTimeout(function(){
                        $scope.svg = $scope.shopping.perfil.mapa_complejo;
                        $scope.mapa_complejo = true;
                        $scope.$apply();
                    }, 0);
                  }else{      
                    setTimeout(function(){
                        $scope.mapa_complejo = false;
                        $scope.$apply();
                    }, 0);
                  }
                  Favoritos.CachedList
                  angular.forEach($scope.shopping.perfil.banners_destacados, function(value,key) {
                    // Array para banner destacados
                      if(value != ""){
                        $scope.banners_destacados.push(value);
                      }
                  });
                  // Cargamos el avatar de cada Comercio
                  // Listamos las promociones
                  angular.forEach($scope.shopping.promociones, function(value,key) {
                      const [day, month, year] = value.fechainicio.split("/");
                      const [day1, month1, year1] = value.fechafin.split("/");
                      var date1 = new Date(year, month - 1, day); 
                      var date2 = new Date(year1, month1 - 1, day1);
                      if(date1 <= new Date() && date2 >= new Date()){
                        $scope.promociones.push(value);
                      }
                  });
                  hideLoading();  
                  //comercios.CategoriesForm = CentrosComerciales.all;
                }
            },
            function(error){
                //////console.log(error);
            }
        );
    };
    
  

  $scope.sucursales = function () {
      carga_locales($stateParams.slug,$scope.shopping);
   }
    
    /*
        Funcion para cargar Locales del Centro Comercial
    */
    function carga_locales(shopping, shopp) {
        showLoading();
        Multimarcas.getLocales(shopping).then(
            function(success){
                if(Multimarcas.locales != null) {
                  $scope.shopp = shopping;
                  $scope.locales = Multimarcas.locales;
                  $scope.shopping = Multimarcas.shopping;
                  //////console.log($scope.shopping);
                  // Cargamos el avatar de cada Comercio
                  hideLoading();  
                  //comercios.CategoriesForm = CentrosComerciales.all;
                }
            },
            function(error){
                //////console.log(error);
            }
        );
    };

    $scope.local = function () {
      $scope.variable =$stateParams.local;
      //////console.log($stateParams.slug);
      DatosLocal($stateParams.local,$stateParams.slug);
    }
    
    /*
        Funcion para cargar detalles del Local
    */
    function DatosLocal(local,slug) {
        $scope.promociones = [];
        $scope.banners_destacados = [];
        // Verificamos si esta como favorito, le pasamos el slug del local
        $scope.walletPressedCSS(local);
        //////console.log("Nombre de la Sucursal " + slug);
        $scope.local1= local ;
        showLoading();
        Multimarcas.getLocal2(local,slug).then(
            function(success){
                if(Multimarcas.local != null) {
                  $scope.shopp = slug;
                  $scope.local = Multimarcas.local;
                  if($scope.local.perfil.hasOwnProperty('destacado')){
                    setTimeout(function(){
                        $scope.es_destacado = true;
                        $scope.$apply();
                    }, 0);
                  }else{      
                    setTimeout(function(){
                        $scope.es_destacado = false;
                        $scope.$apply();
                    }, 0);
                  }
                  
                  var d = new Date();
                  var n = d.getDay();
                  var now = d.getHours() + ":" + d.getMinutes();
                  var weekdays = [
                      ["Sunday", $scope.local.perfil.horario.domingo.desde, $scope.local.perfil.horario.domingo.hasta],
                      ["Monday", $scope.local.perfil.horario.lunes.desde, $scope.local.perfil.horario.lunes.hasta],
                      ["Tuesday", $scope.local.perfil.horario.martes.desde, $scope.local.perfil.horario.martes.hasta],
                      ["Wednesday", $scope.local.perfil.horario.miercoles.desde, $scope.local.perfil.horario.miercoles.hasta],
                      ["Thursday", $scope.local.perfil.horario.jueves.desde, $scope.local.perfil.horario.jueves.hasta],
                      ["Friday", $scope.local.perfil.horario.viernes.desde, $scope.local.perfil.horario.viernes.hasta],
                      ["Saturday", $scope.local.perfil.horario.sabado.desde,$scope.local.perfil.horario.sabado.hasta] // we are closed, sorry!
                  ];
                  //////console.log(weekdays[n]);
                  //////console.log(now);
                  var day = weekdays[n];
                  //////console.log(day[1]);
                  //////console.log(day[2]);


                  $scope.feriado = null;
                  angular.forEach($scope.local.feriados, function(value,key) {
                    const [day, month, year] = value.fechainicio.split("/");
                    var dia = d.getDate();
                    var mes = d.getMonth();
                    var anho = d.getFullYear();
                    var fecha = new Date(year, month - 1, day);
                    var fecha2 = new Date(anho, mes, dia); 
                    if(fecha2.getTime() == fecha.getTime()){
                      //console.log("Hoy hay feriado");
                      if(value.allday == true){
                        //console.log("Hoy es feriado todo el dia");
                        $scope.feriado = value;
                      }else{
                        if(value.diferenciado == true && (now >= value.desde && now <= value.hasta)){
                          //console.log("Hoy es feriado parcialmente");
                          $scope.feriado = value;
                        }else{
                          //console.log("Ya termino");
                        }
                      }
                    }
                  });

                  if (now >= day[1] && now <= day[2]) {
                      $scope.abierto = true
                      //////console.log("Esta ABIERTO");
                  }
                   else {
                      $scope.abierto = false
                      //////console.log("Esta CERRADO");

                  }
                  angular.forEach($scope.local.perfil.banners_destacados, function(value,key) {
                    // Array para banner destacados
                      if(value != ""){
                        $scope.banners_destacados.push(value);
                      }
                  });
                  // Listamos las promociones
                  angular.forEach($scope.local.promociones, function(value,key) {
                      const [day, month, year] = value.fechainicio.split("/");
                      const [day1, month1, year1] = value.fechafin.split("/");
                      var date1 = new Date(year, month - 1, day); 
                      var date2 = new Date(year1, month1 - 1, day1);
                      if(date1 <= new Date() && date2 >= new Date()){
                        $scope.promociones.push(value);
                      }
                  });
                  
                  hideLoading();  
                  //comercios.CategoriesForm = CentrosComerciales.all;
                }
            },
            function(error){
                //////console.log(error);
            }
        );
    };

    /*
      Funcion para Favorito
    */
    
    var comercio = "";
    $scope.roto = false;
    $scope.AuthData = Auth.AuthData;
    $scope.GuardarFav = function(categoria, comercio, local) {
      $scope.favorito_slug = local;
      var check = local;
      Favoritos.buttonPressed($scope.AuthData, local, categoria, comercio).then(
        function(success){
            ////console.log(success);
          if(success.hasOwnProperty(check)){
            //////console.log("Esta en la lista" + success[check]);
            if(success[check] == false){
              //////console.log("Vamos a poner corazon roto");
              $timeout(function() {
                $scope.$apply(function () {
                  $scope.roto = true;
                });
              });
            }
          }
          $scope.WalletList = Favoritos.CachedList;
          $scope.walletPressedCSS($scope.favorito_slug);
        })
    };

   $scope.walletPressedCSS = function(slug) {
    $scope.roto = false;
    //////console.log(slug);
    //Recargamos los Favoritos 
    $scope.AuthData = Auth.AuthData;
    Favoritos.load($scope.AuthData).then(
      function(success){
        $scope.WalletList = Favoritos.CachedList;
        //////console.log($scope.WalletList);
        if($scope.WalletList.hasOwnProperty(slug)){
          if($scope.WalletList[slug]) {
            $timeout(function() {
              $scope.$apply(function () {
                $scope.favorito = true;
              });
            });
          }else{
            $timeout(function() {
              $scope.$apply(function () {
                $scope.favorito = false;
              });
            });
          }
        }else{
            $timeout(function() {
              $scope.$apply(function () {
                $scope.favorito = false;
              });
            });
        }
      });
  };

  $ionicModal.fromTemplateUrl('templates/modal/horario_plano.html', {
    id: 'horario',
    scope: $scope
  }).then(function (modal) {
    $scope.horarioModal = modal;
  });

  $scope.closeHorarioModal = function () {
    $scope.horarioModal.hide();
  };

  $scope.openHorarioModal = function () {
    $scope.horarioModal.show();
  };


  $ionicModal.fromTemplateUrl('templates/modal/horario.html', {
    id: 'horario',
    scope: $scope
  }).then(function (modal) {
    $scope.horario = modal;
  });

  $scope.closeHorario = function () {
    $scope.horario.hide();
  };

  $scope.openHorario = function () {
    $scope.horario.show();
  };



  $ionicModal.fromTemplateUrl('templates/modal/beneficio.html', {
    id: 'beneficio',
    scope: $scope
  }).then(function (modal) {
    $scope.BeneficioModal = modal;
  });

  $scope.closeBeneficiosModal = function () {
    $scope.BeneficioModal.hide();
  };

  $scope.openBeneficiosModal = function () {
    $scope.BeneficioModal.show();
  };

})
// Controlador de las Multimarcas
.controller('SupermercadosCtrl', function ($scope, $stateParams, $dataService, $ionicHistory, StorageService, $state, $ionicModal,
 $ionicPopup, Supermercados, $timeout, Auth, Favoritos) {
 
  var shoppings              =  this;
      shoppings.datos           =  $stateParams.slug;

      $scope.banners_destacados = ['1','2'];

      $scope.options = {
        autoplay:2000,
        loop: false,
        free:false,
        speed:2000,
        initialSlide: 3,
        direction: 'horizontal',
        autoplayDisableOnInteraction: false,
        slidesPerView: '1', 
        showNavButtons: false, 
      };

      $scope.sliderDelegate;

      //detect when sliderDelegate has been defined, and attatch some event listeners
      $scope.$watch('sliderDelegate', function(newVal, oldVal){
        if(newVal != null){ 
          $scope.sliderDelegate.on('slideChangeEnd', function(){
            ////console.log('updated slide to ' + $scope.sliderDelegate.activeIndex);
            $scope.$apply();
          });
        }
      });



  $scope.$on("$ionicView.enter", function (event, data) {
    // global variables
    if($state.current.name == "app.supermercados" ) {
      DatosShopping(shoppings.datos);
    }
    //$scope.walletPressedCSS(shoppings.datos);
    });

  var showLoading = function(){
    $scope.popup = $ionicPopup.show({
      templateUrl: "templates/common/loading.html"
    });
  }

  var hideLoading = function(){
    $scope.popup.close();
  }

   /*
    Funcion para refrescar, donde vuelve a llamar a la funcion CargarCentros()
  */

    $scope.doRefresh = function() {
      $timeout( function() {
        //////console.log("Actualizando");
        DatosShopping(shoppings.datos);

        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      
      }, 1000);
    };
    
    /*
        Funcion para cargar Centro Comercial
    */
    function DatosShopping(shopping) {
        $scope.promociones = [];
        $scope.banners_destacados = [];
        // Verificamos si esta como favorito, le pasamos el slug del shopping
        $scope.walletPressedCSS(shoppings.datos);
        showLoading();
        Supermercados.getShopping2(shopping).then(
            function(success){
                if(Supermercados.shopping != null) {
                  $scope.slug = shopping;
                  $scope.shopping = Supermercados.shopping;
                  $scope.dato = Supermercados.shopping;
                  if($scope.shopping.perfil.hasOwnProperty('destacado')){
                    setTimeout(function(){
                        $scope.es_destacado = true;
                        $scope.$apply();
                    }, 0);
                  }else{      
                    setTimeout(function(){
                        $scope.es_destacado = false;
                        $scope.$apply();
                    }, 0);
                  }
                  if($scope.shopping.perfil.mapa_complejo){
                    setTimeout(function(){
                        $scope.svg = $scope.shopping.perfil.mapa_complejo;
                        $scope.mapa_complejo = true;
                        $scope.$apply();
                    }, 0);
                  }else{      
                    setTimeout(function(){
                        $scope.mapa_complejo = false;
                        $scope.$apply();
                    }, 0);
                  }
                  Favoritos.CachedList
                  angular.forEach($scope.shopping.perfil.banners_destacados, function(value,key) {
                    // Array para banner destacados
                      if(value != ""){
                        $scope.banners_destacados.push(value);
                      }
                  });
                  // Cargamos el avatar de cada Comercio
                  // Listamos las promociones
                  angular.forEach($scope.shopping.promociones, function(value,key) {
                      const [day, month, year] = value.fechainicio.split("/");
                      const [day1, month1, year1] = value.fechafin.split("/");
                      var date1 = new Date(year, month - 1, day); 
                      var date2 = new Date(year1, month1 - 1, day1);
                      if(date1 <= new Date() && date2 >= new Date()){
                        $scope.promociones.push(value);
                      }
                  });
                  hideLoading();  
                  //comercios.CategoriesForm = CentrosComerciales.all;
                }
            },
            function(error){
                //////console.log(error);
            }
        );
    };
    
  

  $scope.sucursales = function () {
      carga_locales($stateParams.slug,$scope.shopping);
   }
    
    /*
        Funcion para cargar Locales del Centro Comercial
    */
    function carga_locales(shopping, shopp) {
        showLoading();
        Supermercados.getLocales(shopping).then(
            function(success){
                if(Supermercados.locales != null) {
                  $scope.shopp = shopping;
                  $scope.locales = Supermercados.locales;
                  $scope.shopping = Supermercados.shopping;
                  //////console.log($scope.shopping);
                  // Cargamos el avatar de cada Comercio
                  hideLoading();  
                  //comercios.CategoriesForm = CentrosComerciales.all;
                }
            },
            function(error){
                //////console.log(error);
            }
        );
    };

    $scope.local = function () {
      $scope.variable =$stateParams.local;
      //////console.log($stateParams.slug);
      DatosLocal($stateParams.local,$stateParams.slug);
    }
    
    /*
        Funcion para cargar detalles del Local
    */
    function DatosLocal(local,slug) {
        $scope.promociones = [];
        $scope.banners_destacados = [];
        // Verificamos si esta como favorito, le pasamos el slug del local
        $scope.walletPressedCSS(local);
        //////console.log("Nombre de la Sucursal " + slug);
        $scope.local1= local ;
        showLoading();
        Supermercados.getLocal2(local,slug).then(
            function(success){
                if(Supermercados.local != null) {
                  $scope.shopp = slug;
                  $scope.local = Supermercados.local;
                  if($scope.local.perfil.hasOwnProperty('destacado')){
                    setTimeout(function(){
                        $scope.es_destacado = true;
                        $scope.$apply();
                    }, 0);
                  }else{      
                    setTimeout(function(){
                        $scope.es_destacado = false;
                        $scope.$apply();
                    }, 0);
                  }
                  
                  var d = new Date();
                  var n = d.getDay();
                  var now = d.getHours() + ":" + d.getMinutes();
                  var weekdays = [
                      ["Sunday", $scope.local.perfil.horario.domingo.desde, $scope.local.perfil.horario.domingo.hasta],
                      ["Monday", $scope.local.perfil.horario.lunes.desde, $scope.local.perfil.horario.lunes.hasta],
                      ["Tuesday", $scope.local.perfil.horario.martes.desde, $scope.local.perfil.horario.martes.hasta],
                      ["Wednesday", $scope.local.perfil.horario.miercoles.desde, $scope.local.perfil.horario.miercoles.hasta],
                      ["Thursday", $scope.local.perfil.horario.jueves.desde, $scope.local.perfil.horario.jueves.hasta],
                      ["Friday", $scope.local.perfil.horario.viernes.desde, $scope.local.perfil.horario.viernes.hasta],
                      ["Saturday", $scope.local.perfil.horario.sabado.desde,$scope.local.perfil.horario.sabado.hasta] // we are closed, sorry!
                  ];
                  //////console.log(weekdays[n]);
                  //////console.log(now);
                  var day = weekdays[n];
                  //////console.log(day[1]);
                  //////console.log(day[2]);


                  $scope.feriado = null;
                  angular.forEach($scope.local.feriados, function(value,key) {
                    const [day, month, year] = value.fechainicio.split("/");
                    var dia = d.getDate();
                    var mes = d.getMonth();
                    var anho = d.getFullYear();
                    var fecha = new Date(year, month - 1, day);
                    var fecha2 = new Date(anho, mes, dia); 
                    if(fecha2.getTime() == fecha.getTime()){
                      //console.log("Hoy hay feriado");
                      if(value.allday == true){
                        //console.log("Hoy es feriado todo el dia");
                        $scope.feriado = value;
                      }else{
                        if(value.diferenciado == true && (now >= value.desde && now <= value.hasta)){
                          //console.log("Hoy es feriado parcialmente");
                          $scope.feriado = value;
                        }else{
                          //console.log("Ya termino");
                        }
                      }
                    }
                  });


                  if (now >= day[1] && now <= day[2]) {
                      $scope.abierto = true
                      ////console.log("Esta ABIERTO");
                  }
                   else {
                      $scope.abierto = false
                      ////console.log("Esta CERRADO");

                  }
                  angular.forEach($scope.local.perfil.banners_destacados, function(value,key) {
                    // Array para banner destacados
                      if(value != ""){
                        $scope.banners_destacados.push(value);
                      }
                  });
                  // Listamos las promociones
                  angular.forEach($scope.local.promociones, function(value,key) {
                      const [day, month, year] = value.fechainicio.split("/");
                      const [day1, month1, year1] = value.fechafin.split("/");
                      var date1 = new Date(year, month - 1, day); 
                      var date2 = new Date(year1, month1 - 1, day1);
                      if(date1 <= new Date() && date2 >= new Date()){
                        $scope.promociones.push(value);
                      }
                  });
                  
                  hideLoading();  
                  //comercios.CategoriesForm = CentrosComerciales.all;
                }
            },
            function(error){
                //////console.log(error);
            }
        );
    };

    /*
      Funcion para Favorito
    */
    
    var comercio = "";
    $scope.roto = false;
    $scope.AuthData = Auth.AuthData;
    $scope.GuardarFav = function(categoria, comercio, local) {
      $scope.favorito_slug = local;
      var check = local;
      ////console.log(local + ' - ' + check);
      ////console.log(categoria + ' - ' + comercio + ' - ' + local);
      Favoritos.buttonPressed($scope.AuthData, local, categoria, comercio).then(
        function(success){
            //////console.log(success);
          if(success.hasOwnProperty(check)){
            //////console.log("Esta en la lista" + success[check]);
            if(success[check] == false){
              //////console.log("Vamos a poner corazon roto");
              $timeout(function() {
                $scope.$apply(function () {
                  $scope.roto = true;
                });
              });
            }
          }
          $scope.WalletList = Favoritos.CachedList;
          $scope.walletPressedCSS($scope.favorito_slug);
        })
    };

   $scope.walletPressedCSS = function(slug) {
    $scope.roto = false;
    //////console.log(slug);
    //Recargamos los Favoritos 
    $scope.AuthData = Auth.AuthData;
    Favoritos.load($scope.AuthData).then(
      function(success){
        $scope.WalletList = Favoritos.CachedList;
        //////console.log($scope.WalletList);
        if($scope.WalletList.hasOwnProperty(slug)){
          if($scope.WalletList[slug]) {
            $timeout(function() {
              $scope.$apply(function () {
                $scope.favorito = true;
              });
            });
          }else{
            $timeout(function() {
              $scope.$apply(function () {
                $scope.favorito = false;
              });
            });
          }
        }else{
            $timeout(function() {
              $scope.$apply(function () {
                $scope.favorito = false;
              });
            });
        }
      });
  };

  $ionicModal.fromTemplateUrl('templates/modal/horario_plano.html', {
    id: 'horario',
    scope: $scope
  }).then(function (modal) {
    $scope.horarioModal = modal;
  });

  $scope.closeHorarioModal = function () {
    $scope.horarioModal.hide();
  };

  $scope.openHorarioModal = function () {
    $scope.horarioModal.show();
  };


  $ionicModal.fromTemplateUrl('templates/modal/horario.html', {
    id: 'horario',
    scope: $scope
  }).then(function (modal) {
    $scope.horario = modal;
  });

  $scope.closeHorario = function () {
    $scope.horario.hide();
  };

  $scope.openHorario = function () {
    $scope.horario.show();
  };



  $ionicModal.fromTemplateUrl('templates/modal/beneficio.html', {
    id: 'beneficio',
    scope: $scope
  }).then(function (modal) {
    $scope.BeneficioModal = modal;
  });

  $scope.closeBeneficiosModal = function () {
    $scope.BeneficioModal.hide();
  };

  $scope.openBeneficiosModal = function () {
    $scope.BeneficioModal.show();
  };

})

// Controlador de los Mapas
.controller('MapaCtrl', function ($scope, $ionicHistory, $stateParams, $cordovaLaunchNavigator, CentrosComerciales) {

  /*
  var map = new Mazemap.Map({
      // container id specified in the HTML
      container: 'map',

      campuses: 121,

      // initial position in lngLat format
      center: {lng: 13.270286316716465, lat: 52.502217640505705},

      // initial zoom
      zoom: 18,

      zLevel: 3
  });

  // Add zoom and rotation controls to the map.
  map.addControl(new Mazemap.mapboxgl.NavigationControl());

        */




          $scope.swipe = function (direction) {
             if(direction == 'right') 
               $ionicHistory.goBack()
          }

          $scope.mapa = function () {
            //Recibimos Los parametros de longitud y latitud
            $scope.latitud           =  $stateParams.lat;
            $scope.longitud           =  $stateParams.long;

            var latLng = new google.maps.LatLng($scope.latitud,$scope.longitud);
            $scope.latLng = new google.maps.LatLng($scope.latitud,$scope.longitud);

            var mapOptions = {
              center: latLng,
              zoom: 15,
              zoomControl: true,
              mapTypeControl: false,
              scaleControl: false,
              streetViewControl: false,
              rotateControl: false,
              fullscreenControl: false,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            };
       
          $scope.mapa = new google.maps.Map(document.getElementById("map"), mapOptions);

                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng($scope.latitud,$scope.longitud),
                        map: $scope.mapa
                    });
       
              
               
                navigator.geolocation.getCurrentPosition(function(pos) {
                    //$scope.mapa.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
                        map: $scope.mapa,
                        icon: new google.maps.MarkerImage('https://maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
                                                            new google.maps.Size(22,22),
                                                            new google.maps.Point(0,18),
                                                            new google.maps.Point(11,11)),

                    });
                    $scope.pos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude); //latitud
                });
          }

          $scope.GetDireccion = function () {
            var directionsService = new google.maps.DirectionsService;
            var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers : true});
            directionsDisplay.setMap($scope.mapa);
            calculateAndDisplayRoute(directionsService,directionsDisplay);
            
          }

          function calculateAndDisplayRoute(directionsService, directionsDisplay) {
            //////console.log("Ahora calculamos la direccion");
            directionsService.route({
              origin: $scope.pos,
              destination: $scope.latLng,
              travelMode: 'DRIVING',
            }, function(response, status) {
              if (status === 'OK') {
                directionsDisplay.setDirections(response);
              } else {
                window.alert('Directions request failed due to ' + status);
              }
            });
          }

        $scope.VerPisos = function(){
          $scope.slug            =  $stateParams.slug;
          $scope.categoria       =  $stateParams.categoria;
          $scope.svg             =  $stateParams.svg;
          $scope.local           =  $stateParams.local;
          $scope.pisos           =  [];
          ////console.log($scope.categoria);
          ////console.log($scope.slug );
          /*
          if($scope.categoria == 'shopping'){
            CentrosComerciales.getShopping($scope.slug).then(
                function(success){
                  angular.forEach(success.perfil.niveles, function(value,key) {
                    $scope.pisos.push(value)
                  })
            })
          }else if($scope.categoria == 'supermercado'){

          }else{

          }
          */
        }

})

// Controlador del MAPA DE PROMOCIONES
.controller('MapaPromocionesCtrl', function ($scope, $ionicHistory, $stateParams,$ionicPopup, $state,
 MapaPromociones, $cordovaGeolocation, $ionicFilterBar) {
 
  $scope.$on("$ionicView.beforeEnter", function (event, data) {

    
    //////console.log("Renderiza el Mapa");

    if($state.current.name == "app.mapaPromociones") {
      $scope.render_mapa();
    }else if($state.current.name == "app.buscadorPromociones") {
      $scope.GetPromociones();
      $scope.showFilterBar();
    }

  });


  $scope.swipe = function () {
    $scope.InfoMapa = false;

  }
  // Obtenemos todas las promociones de los centros comerciales, multimarcas y supermercados
    $scope.GetPromociones = function(){
        showLoading();
        $scope.lista_buscador = [];
        $scope.promo = '';
        var items = [];
        MapaPromociones.GetShoppings().then(function(res){
          ////////console.log(res);
          angular.forEach(res, function(key,index) {
            if(key.promociones){
              var promo = key.promociones;
              angular.forEach(promo, function(detalle) {
                var timeNow = new Date();
                const [day, month, year] = detalle.fechainicio.split("/");
                const [day1, month1, year1] = detalle.fechafin.split("/");
                var date1 = new Date(year, month - 1, day); 
                var date2 = new Date(year1, month1 - 1, day1);
                if(date1 <= new Date() && date2 >= new Date()){
                      detalle.avatar = key.perfil.icono;
                      detalle.nombre = key.perfil.nombre;
                      detalle.latitud = key.perfil.mapa.latitud;
                      detalle.longitud = key.perfil.mapa.longitud;
                      detalle.slug = index;
                      $scope.lista_buscador.push(detalle);
                      //////console.log(promo[llave]);
                      var marker = new google.maps.Marker({
                          position: new google.maps.LatLng(key.perfil.mapa.latitud, key.perfil.mapa.longitud),
                          map: $scope.mapa,
                          icon:"img/pin.png"
                      });

                      marker.addListener('click', function() {
                          $scope.InfoMapa = true;
                          $scope.mapa.setCenter(new google.maps.LatLng(key.perfil.mapa.latitud || 0,key.perfil.mapa.longitud || 0));
                          $scope.shopping = key.perfil.nombre;
                          $scope.direccion = key.perfil.direccion;
                          $scope.latLng = new google.maps.LatLng(key.perfil.mapa.latitud,key.perfil.mapa.longitud);
                          var promos = key.promociones;
                          ////console.log(promos);
                            $scope.array = '';
                            $scope.promocion = [];
                            Object.keys(promos).forEach(function(key,index) {
                                var timeNow = new Date();
                                const [day, month, year] = promos[key].fechainicio.split("/");
                                const [day1, month1, year1] = promos[key].fechafin.split("/");
                                var date1 = new Date(year, month - 1, day); 
                                var date2 = new Date(year1, month1 - 1, day1);
                                if(date1 <= new Date() && date2 >= new Date()){
                                  $scope.promocion.push(promos[key].texto.titulo);
                                  $scope.array = $scope.array + 
                                                '<ion-item style="max-height: 90px; padding: 0px 16px 5px 0px; background-color: transparent; border: none; border-bottom: 1px solid #999999a6; border-top: 1px solid #999999a6;">'+
                                                  '<h4 class="text-left" style="padding-left: 10px; margin-top:10px;">' 
                                                    + promos[key].texto.titulo +
                                                  '</h4>'
                                                + '<p class="text-left" style="white-space: normal; padding-left: 10px; font-weight: lighter;">'+ promos[key].texto.descripcion +'</p>' +
                                                '</ion-item>'
                                }
                            });
                              ////console.log($scope.promocion);
                              setTimeout(() => {
                                $ionicPopup.alert({
                                  scope: $scope,
                                  template:   '<style>.popup-head { padding:0px 10px; }</style>'+
                                              '<div class="content">'
                                              +'<h2 class="normal-font" style="margin-bottom:10px">Promociones<h2>'+
                                                '<h3 class="light-font">'+ $scope.shopping +'<h3>'+
                                                  $scope.array
                                              +'</div>',
                                  buttons: [{ 
                                    text: 'Ok',
                                    type: 'button-default boton-cerrar',
                                  }]
                                });
                              }, 100);
                          $scope.$apply();
                      });
                }
              });
            }

            angular.forEach(key.locales,function (detalles,llaves) {
              //////console.log(detalles.perfil.nombre)
              if(detalles.promociones){
                var promo = detalles.promociones;
                angular.forEach(promo, function(detalle,index) {
                  //////console.log(detalle);
                  var timeNow = new Date();
                  const [day, month, year] = detalle.fechainicio.split("/");
                  const [day1, month1, year1] = detalle.fechafin.split("/");
                  var date1 = new Date(year, month - 1, day); 
                  var date2 = new Date(year1, month1 - 1, day1);
                  if(date1 <= new Date() && date2 >= new Date()){
                        detalle.avatar = detalles.perfil.icono;
                        detalle.nombre = detalles.perfil.nombre;
                        detalle.latitud = detalles.perfil.mapa.latitud;
                        detalle.longitud = detalles.perfil.mapa.longitud;
                        detalle.slug = llaves;
                        $scope.lista_buscador.push(detalle);
                        //////console.log(detalle);
                        
                        var marker = new google.maps.Marker({
                            position: new google.maps.LatLng(detalles.perfil.mapa.latitud || 0, detalles.perfil.mapa.longitud || 0),
                            map: $scope.mapa,
                            icon:"img/pin.png"
                        });     

                        marker.addListener('click', function() {
                            $scope.InfoMapa = true;
                            $scope.mapa.setCenter(new google.maps.LatLng(detalles.perfil.mapa.latitud,detalles.perfil.mapa.longitud));
                            $scope.shopping = detalles.perfil.nombre;
                            $scope.direccion = detalles.perfil.direccion;
                            $scope.latLng = new google.maps.LatLng(detalles.perfil.mapa.latitud,detalles.perfil.mapa.longitud);
                            var promos = detalles.promociones;
                            $scope.array = '';
                            $scope.promocion = [];
                            Object.keys(promos).forEach(function(key,index) {
                                var timeNow = new Date();
                                const [day, month, year] = promos[key].fechainicio.split("/");
                                const [day1, month1, year1] = promos[key].fechafin.split("/");
                                var date1 = new Date(year, month - 1, day); 
                                var date2 = new Date(year1, month1 - 1, day1);
                                if(date1 <= new Date() && date2 >= new Date()){
                                  $scope.promocion.push(promos[key].texto.titulo);
                                  $scope.array = $scope.array + 
                                                '<ion-item style="max-height: 90px; padding: 0px 16px 5px 0px; background-color: transparent; border: none; border-bottom: 1px solid #999999a6; border-top: 1px solid #999999a6;">'+
                                                  '<h4 class="text-left" style="padding-left: 10px; margin-top:10px;">' 
                                                    + promos[key].texto.titulo +
                                                  '</h4>'
                                                + '<p class="text-left" style="white-space: normal; padding-left: 10px; font-weight: lighter;">'+ promos[key].texto.descripcion +'</p>' +
                                                '</ion-item>'
                                }
                            });
                              ////console.log($scope.promocion);
                              setTimeout(() => {
                                $ionicPopup.alert({
                                  scope: $scope,
                                  template:   '<style>.popup-head { padding:0px 10px; }</style>'+
                                              '<div class="content">'
                                              +'<h2 class="normal-font" style="margin-bottom:10px">Promociones<h2>'+
                                                '<h3 class="light-font">'+ $scope.shopping +'<h3>'+
                                                  $scope.array
                                              +'</div>',
                                  buttons: [{ 
                                    text: 'Ok',
                                    type: 'button-default boton-cerrar',
                                  }]
                                });
                              }, 100);
                            $scope.$apply();
                        });
                  }

                });

                hideLoading();
                ////////console.log($scope.lista_buscador);

              }
            });
          });

      }, function(err){
        ////////console.log(err);
      })

        MapaPromociones.GetMultimarcas().then(function(res){
          //////console.log(res);
          angular.forEach(res, function(key,index) {
            //////console.log(res[key].perfil.icono);
            angular.forEach(key.locales,function (detalles,llaves) {
              //////console.log(llaves);
              if(detalles.promociones){
                var promo = detalles.promociones;
                angular.forEach(promo, function(detalle,index) {
                  var timeNow = new Date();
                  const [day, month, year] = detalle.fechainicio.split("/");
                  const [day1, month1, year1] = detalle.fechafin.split("/");
                  var date1 = new Date(year, month - 1, day); 
                  var date2 = new Date(year1, month1 - 1, day1);
                  if(date1 <= new Date() && date2 >= new Date()){
                          detalle.avatar = key.perfil.icono;
                          detalle.nombre = detalles.perfil.nombre;
                          detalle.latitud = detalles.perfil.mapa.latitud;
                          detalle.longitud = detalles.perfil.mapa.longitud;
                           detalle.slug = llaves;
                          $scope.lista_buscador.push(detalle);
                          //////console.log($scope.lista_buscador);

                          var marker = new google.maps.Marker({
                              position: new google.maps.LatLng(detalles.perfil.mapa.latitud || 0, detalles.perfil.mapa.longitud || 0),
                              map: $scope.mapa,
                              icon:"img/pin.png"
                          });

                          marker.addListener('click', function() {
                              $scope.InfoMapa = true;
                              $scope.mapa.setCenter(new google.maps.LatLng(detalles.perfil.mapa.latitud,detalles.perfil.mapa.longitud));
                              $scope.shopping = detalles.perfil.nombre;
                              $scope.direccion = detalles.perfil.direccion;
                              $scope.latLng = new google.maps.LatLng(detalles.perfil.mapa.latitud,detalles.perfil.mapa.longitud);
                              var promos = detalles.promociones;
                              $scope.array = '';
                              $scope.promocion = [];
                              Object.keys(promos).forEach(function(key,index) {
                                ////console.log(key);
                                ////console.log(index);
                                var timeNow = new Date();
                                const [day, month, year] = promos[key].fechainicio.split("/");
                                const [day1, month1, year1] = promos[key].fechafin.split("/");
                                var date1 = new Date(year, month - 1, day); 
                                var date2 = new Date(year1, month1 - 1, day1);
                                if(date1 <= new Date() && date2 >= new Date()){
                                  $scope.promocion.push(promos[key].texto.titulo);
                                  $scope.array = $scope.array + 
                                                '<ion-item style="max-height: 90px; padding: 0px 16px 5px 0px; background-color: transparent; border: none; border-bottom: 1px solid #999999a6; border-top: 1px solid #999999a6;">'+
                                                  '<h4 class="text-left" style="padding-left: 10px; margin-top:10px;">' 
                                                    + promos[key].texto.titulo +
                                                  '</h4>'
                                                + '<p class="text-left" style="white-space: normal; padding-left: 10px; font-weight: lighter;">'+ promos[key].texto.descripcion +'</p>' +
                                                '</ion-item>'
                                }
                              });
                                ////console.log($scope.promocion);
                                setTimeout(() => {
                                  $ionicPopup.alert({
                                    scope: $scope,
                                  template:   '<style>.popup-head { padding:0px 10px; }</style>'+
                                              '<div class="content">'
                                              +'<h2 class="normal-font" style="margin-bottom:10px">Promociones<h2>'+
                                                '<h3 class="light-font">'+ $scope.shopping +'<h3>'+
                                                    $scope.array
                                                +'</div>',
                                    buttons: [{ 
                                      text: 'Ok',
                                      type: 'button-default boton-cerrar',
                                    }]
                                  });
                                }, 100);
                              $scope.$apply();
                          });
                      }

                    });

                    hideLoading();
                    ////////console.log($scope.lista_buscador);

                  }
            });
          });

      }, function(err){
        ////////console.log(err);
        hideLoading();
      })

        MapaPromociones.GetSupermercados().then(function(res){
          //////console.log(res);
          angular.forEach(res, function(key,index) {
            //////console.log(res[key].perfil.icono);
            angular.forEach(key.locales,function (detalles,llaves) {
              //////console.log(llaves);
              if(detalles.promociones){
                var promo = detalles.promociones;
                angular.forEach(promo, function(detalle,index) {
                  var timeNow = new Date();
                  const [day, month, year] = detalle.fechainicio.split("/");
                  const [day1, month1, year1] = detalle.fechafin.split("/");
                  var date1 = new Date(year, month - 1, day); 
                  var date2 = new Date(year1, month1 - 1, day1);
                  if(date1 <= new Date() && date2 >= new Date()){
                          detalle.avatar = key.perfil.icono;
                          detalle.nombre = detalles.perfil.nombre;
                          detalle.latitud = detalles.perfil.mapa.latitud;
                          detalle.longitud = detalles.perfil.mapa.longitud;
                          detalle.slug = llaves;
                          $scope.lista_buscador.push(detalle);
                          //////console.log($scope.lista_buscador);

                          var marker = new google.maps.Marker({
                              position: new google.maps.LatLng(detalles.perfil.mapa.latitud || 0, detalles.perfil.mapa.longitud || 0),
                              map: $scope.mapa,
                              icon:"img/pin.png"
                          });

                          marker.addListener('click', function() {
                              $scope.InfoMapa = true;
                              $scope.mapa.setCenter(new google.maps.LatLng(detalles.perfil.mapa.latitud,detalles.perfil.mapa.longitud));
                              $scope.shopping = detalles.perfil.nombre;
                              $scope.direccion = detalles.perfil.direccion;
                              $scope.latLng = new google.maps.LatLng(detalles.perfil.mapa.latitud,detalles.perfil.mapa.longitud);
                              var promos = detalles.promociones;
                              $scope.array = '';
                              $scope.promocion = [];
                              Object.keys(promos).forEach(function(key,index) {
                                var timeNow = new Date();
                                const [day, month, year] = promos[key].fechainicio.split("/");
                                const [day1, month1, year1] = promos[key].fechafin.split("/");
                                var date1 = new Date(year, month - 1, day); 
                                var date2 = new Date(year1, month1 - 1, day1);
                                if(date1 <= new Date() && date2 >= new Date()){
                                  $scope.promocion.push(promos[key].texto.titulo);
                                  $scope.array = $scope.array + 
                                                '<ion-item style="max-height: 90px; padding: 0px 16px 5px 0px; background-color: transparent; border: none; border-bottom: 1px solid #999999a6; border-top: 1px solid #999999a6;">'+
                                                  '<h4 class="text-left" style="padding-left: 10px; margin-top:10px;">' 
                                                    + promos[key].texto.titulo +
                                                  '</h4>'
                                                + '<p class="text-left" style="white-space: normal; padding-left: 10px; font-weight: lighter;">'+ promos[key].texto.descripcion +'</p>' +
                                                '</ion-item>'
                                }
                              });
                                ////console.log($scope.promocion);
                                setTimeout(() => {
                                  $ionicPopup.alert({
                                    scope: $scope,
                                  template:   '<style>.popup-head { padding:0px 10px; }</style>'+
                                              '<div class="content">'
                                              +'<h2 class="normal-font" style="margin-bottom:10px">Promociones<h2>'+
                                                '<h3 class="light-font">'+ $scope.shopping +'<h3>'+
                                                    $scope.array
                                                +'</div>',
                                    buttons: [{ 
                                      text: 'Ok',
                                      type: 'button-default boton-cerrar',
                                    }]
                                  });
                                }, 100);
                              $scope.$apply();
                          });
                      }

                    });

                    hideLoading();
                    ////////console.log($scope.lista_buscador);

                  }
            });
          });

      }, function(err){
        ////////console.log(err);
        hideLoading();
      })
    };


  $scope.GetDireccion = function () {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers : true});
    directionsDisplay.setMap($scope.mapa);
    calculateAndDisplayRoute(directionsService,directionsDisplay);
  }

  function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    //////console.log("Ahora calculamos la direccion");
    directionsService.route({
      origin: $scope.pos,
      destination: $scope.latLng,
      travelMode: 'DRIVING',
    }, function(response, status) {
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
      } else {
              $ionicPopup.alert({
               template: '<div class="content">'
                            +'<h4 class="normal-font">Error</h4>'
                            +'<h4 class="light-font"><br><br>No se pudo obtener la dirección.<br><br></h4>'
                            +'</div>',
               buttons: [{ 
                text: 'Ok',
                type: 'button-default boton-cerrar',
              }]
             });
      }
    });
  }

  $scope.centrar = function(selected) {
      if (selected) {
        angular.forEach($scope.lista_buscador, function(detalle,index) {
          if(detalle.nombre === selected.title){
            $scope.$broadcast('angucomplete-alt:clearInput');
            $scope.mapa.setCenter(new google.maps.LatLng(detalle.latitud,detalle.longitud));
          }
        });
      } else {
        /*
          $ionicPopup.alert({
           template: '<div class="content">'
                        +'<h4 class="normal-font">Error</h4>'
                        +'<h4 class="light-font"><br><br>No se pudo obtener la dirección.<br><br></h4>'
                        +'</div>',
           buttons: [{ 
            text: 'Ok',
            type: 'button-default boton-cerrar',
          }]
         });
         */
      }
    };


    
    $scope.showFilterBar = function () {
      //////console.log("Buscador de Promociones " + $scope.lista_buscador);
      $ionicFilterBar.show({
        items: $scope.lista_buscador,
        update: function (filteredItems) {
          $scope.lista_buscador = filteredItems;
          //////console.log("Actualizado " + $scope.lista_buscador);
        }
      });
    };

  $scope.buscar = function(detalles){
    //////console.log(detalles);
    $scope.InfoMapa = true;
    $scope.mapa.setCenter(new google.maps.LatLng(detalles.perfil.mapa.latitud,detalles.perfil.mapa.longitud));
    $scope.shopping = detalles.perfil.nombre;
    $scope.direccion = detalles.perfil.direccion;
    var promos = detalles.promociones;
    if(promos == undefined){
      $scope.promocion = 'No hay promociones vigentes.';
    }else{
      Object.keys(promos).forEach(function(key,index) {
        $scope.promocion = promos[key].texto.titulo;
      });
    }
    $scope.$apply();
  }

  $scope.render_mapa = function () {
    showLoading();
    $scope.InfoMapa = false;
    if (navigator.geolocation) {
      var options = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
      };
      navigator.geolocation.getCurrentPosition(function(pos) {
      //////console.log("Obtenemos la ubicacion");
        //////console.log(pos);
        var latitud = pos.coords.latitude || '0';
        var longitud = pos.coords.longitude || '0';
        var myLatlng = new google.maps.LatLng(latitud, longitud);
        $scope.pos = myLatlng
        var mapOptions = {
          center: myLatlng,
          zoom: 14,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };


            $scope.mapa = new google.maps.Map(document.getElementById("map"),mapOptions);

                $scope.mapa.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
                    map: $scope.mapa,
                    //icon:"img/bluecircle.png"
                    clickable: false,
                    icon: new google.maps.MarkerImage('https://maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
                                                      new google.maps.Size(22,22),
                                                      new google.maps.Point(0,18),
                                                      new google.maps.Point(11,11)),
                    shadow: null,
                    zIndex: 999,
                });


                hideLoading();
                $scope.GetPromociones();
      }, function(error) {
        ////console.log(error);
        hideLoading();
              $ionicPopup.alert({
               template: '<div class="content">'
                            +'<h4 class="normal-font">Error</h4>'
                            +'<h4 class="light-font"><br><br>No se pudo obtener la dirección.<br><br></h4>'
                            +'</div>',
               buttons: [{ 
                text: 'Ok',
                type: 'button-default boton-cerrar',
              }]
             });
      },options);
    }else{
      //////console.log("No funciona la geolocalizacion");
    }

      
          
  }



  var showLoading = function(){
    $scope.popup = $ionicPopup.show({
      templateUrl: "templates/common/loading.html"
    });
  }

  var hideLoading = function(){
    $scope.popup.close();
  }
   $scope.getClearButtonClass = function(){
    ////console.log("limpiar");
    $scope.$broadcast('angucomplete-alt:clearInput');
   }

})

//Settings controller
.controller('SettingsCtrl', function ($scope, $stateParams, $ionicHistory, $ionicPopup, $state, StorageService, $dataService, Maestro, CartService) {

      $scope.user = $scope.user || {}; // to assign and display user Data


      var getUserInfo = function(user_id){
         $scope.loading = true;
          Maestro.$getCustomerById(user_id).then(function(res){
          //////console.log(res);
       $scope.loading = false;
      if(res.data.id){
          $scope.user = res.data;
          $scope.user.shipping = $scope.user.shipping || {};
          if(!$scope.user.shipping.country){
            $scope.user.shipping.country = "GB";
          }
          
      }else{
          //////console.log("No funca");
      }

        }, function(err){
           $scope.loading = false;
          //////console.log(err);
        })
      }

      $scope.updateProfile = function(){
        $scope.loading = true;
        Maestro.$updateCustomer($scope.user).then(function(res){
          //////console.log(res.data);

          if(res.data.id){
             $scope.loading = false;
            //error pop up dialog
          $ionicPopup.alert({
           title: 'Success',
           template: `Your profile has been updated`,
           buttons: [
             { text: '<b>CLOSE</<b>',
            type: 'button-small button-dark' }
           ]
         });
         closeModals();
          }

        }, function(err){
          //////console.log(err);
           $scope.loading = false;

      //error pop up dialog
          $ionicPopup.alert({
           title: 'Error',
           template: `There's been an error. Please log out and try again.`,
           buttons: [
             { text: '<b>CLOSE</<b>',
            type: 'button-small button-assertive' }
           ]
         });

        })
      }

      var closeModals = function(){

            $scope.changePasswordModal.isShown() ? $scope.changePasswordModal.hide() : null;
            $scope.editProfileModal.isShown() ? $scope.editProfileModal.hide() : null;
      }

})

.controller('NotificacionesCtrl', function ($scope, $stateParams, $state, $ionicScrollDelegate, $ionicLoading,
 $localStorage, $ionicPopup, Buscador, Profile, Auth, $timeout, CentrosComerciales, Multimarcas, Favoritos, $q, Notificaciones ) {
 
  $scope.shouldShowDelete = false;
  $scope.shouldShowReorder = false;
  $scope.listCanSwipe = true

  $scope.array = [];
  $scope.loading = false;
  $scope.no_hay_nuevas = true;
  var defer = $q.defer();


  $scope.$on('modal.shown', function(event, data) {
    ////////console.log('Modal is shown!'+ data.id);
    if(data.id === 'notificaciones'){

      //Chequeamos si tiene notificacion de completar perfil
      $scope.notificaciones = JSON.parse(localStorage.getItem('notificaciones'));
      //////console.log($scope.notificaciones);
      if($scope.notificaciones == '' || $scope.notificaciones == null){
        // No tiene notificaciones, entonces vamos a enviar la notificacion de completar perfil
        $scope.array.push({titulo:'Completa tu perfil', mensaje:'¡Podes ganarte puntos en los locales adheridos!',estado:'nuevas', hora:'11:00', fecha:'05/10/2017',funcion:'irPerfil()',logo:'img/dezling-logo.png'});
        //localStorage.setItem('notificaciones',JSON.stringify($scope.array));
        //$scope.notificaciones = JSON.parse(localStorage.getItem('notificaciones'));
      }
    }
  });
    var showLoading = function(){
      $scope.popup = $ionicPopup.show({
        templateUrl: "templates/common/loading.html"
      });
    }

    var hideLoading = function(){
      $scope.popup.close();
    }


    $scope.openSponsor = function (titulo,descripcion,imagen) {

            var alertPopup = $ionicPopup.alert({
             template: '<div class="content">'
                          +'<h4 class="normal-font">'+titulo+'</h4>'
                          +'<h4 class="light-font" style="text-align:justify"><br><br>'+descripcion+'<br><br></h4>'
                          +'</div>',
             buttons: [{ 
              text: 'Ok',
              type: 'button-default boton-cerrar',
            }]
           });
    };

})

.controller('ListaComprasCtrl', function ($scope, $stateParams, $state, $ionicScrollDelegate, 
  $ionicHistory, $ionicPopup, ListaCompras, Auth, $timeout) {

        //Realiza funciones al entrar en la vista
        $scope.AuthData = Auth.AuthData;
        $scope.$on('$ionicView.enter', function(e) {

          $ionicHistory.clearCache();
          //Declaramos la variable donde se cargaran las listas
          $scope.Listado = {};
          //Buscamos en la base de datos el listado que ya tiene el usuario
          //$scope.CargarListado();
          $scope.AuthData = Auth.AuthData;
          checkAuth();
        });

        $scope.shouldShowDelete = false;
        $scope.shouldShowReorder = false;
        $scope.listCanSwipe = true;
        //Chequea si el usuario esta logeado
        function checkAuth() {
          $scope.AuthData = Auth.AuthData;
          if(!$scope.AuthData.hasOwnProperty('uid')){
            Auth.getAuthState().then(
              function(AuthData){
                $scope.AuthData = AuthData;
                $scope.CargarListado();
              },
              function(notLoggedIn){
                //Para que le muestre el template de login
                $scope.AuthData = "";
              }
            )
          }else{
            $scope.CargarListado();
          };
        };

        

        var showLoading = function(){
          $scope.popup = $ionicPopup.show({
            templateUrl: "templates/common/loading.html"
          });
        }

        var hideLoading = function(){
          $scope.popup.close();
        }


        /** Funcion encargada de obtener la lista de firebase */
        $scope.AuthData = Auth.AuthData;
        $scope.CargarListado = function () {
              ////console.log("Cargando Listado");
              $scope.Listado = [];
              showLoading();
              ListaCompras.getListado($scope.AuthData.uid).then(
                  function(success){
                      if(ListaCompras.lista != null) {
                        angular.forEach(ListaCompras.lista,function (detalles,key) {
                          //////console.log($scope.Listado);
                          setTimeout(function(){
                              $scope.Listado.push({detalle:detalles,key:key});
                              $scope.$apply();
                          }, 0);
                        });
                        ////console.log($scope.Listado);
                        //$scope.Listado.timestamp =new Date($scope.Listado.timestamp * 1000);
                        // Cargamos el avatar de cada Comercio
                        hideLoading();  
                        //comercios.CategoriesForm = CentrosComerciales.all;
                      }
                  },
                  function(error){
                      ////console.log("ERROR " + error);
                  }
              );


        }

        $scope.AuthData = Auth.AuthData;
        $scope.editar_nombre = function(id, nombre){
          ////console.log(id, nombre);
          $scope.data = {};
          $scope.data.toDoNuevo = nombre ;
          var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="data.toDoNuevo"><p style="color:red; font-size:9px;">{{ mensaje_error }}</p>',
            title: 'Nombre de la Lista',
            scope: $scope,
            buttons: [
              { text: 'Cancelar',
                type: 'boton-no-border',
              },
              {
                text: '<b>Editar</b>',
                type: 'button-positive button-celeste boton-no-border',
                onTap: function(e) {

                  //////console.log($scope.data.toDoNuevo);
                  if (!$scope.data.toDoNuevo) {
                    //////console.log("No ingreso nada");
                    //don't allow the user to close unless he enters wifi password
                    $scope.mensaje_error = "Debes completar el nombre de la lista";
                    e.preventDefault();
                  } else {
                    //////console.log("Ingreso " +  $scope.data.toDoNuevo);

                    ListaCompras.EditarNombreLista($scope.AuthData.uid,$scope.data.toDoNuevo, id).then(
                        function(success){
                          $scope.mensaje_error = "";
                          $scope.CargarListado();
                        },
                        function(error){
                          $scope.mensaje_error = "Debes completar el nombre de la lista";
                        }
                    );

                    return $scope.data.toDoNuevo;
                  }
                }
              }
            ]
          });
        }

        

        /*
          FUNCION PARA ELIMINAR TODO
        */
        $scope.showDelete = false;
        $scope.show_eliminar =function(){
          if($scope.showDelete){
            setTimeout(function(){
                $scope.showDelete = false;
                $scope.$apply();
            }, 0);
          }else{
            setTimeout(function(){
                $scope.showDelete = true;
                $scope.$apply();
            }, 0);
          }
          //////console.log($scope.showDelete);
        }


        $scope.AuthData = Auth.AuthData;
        $scope.eliminar = function(item){
          //////console.log(item);
          //////console.log($scope.ListaTodo[item]);
            
            ListaCompras.eliminarTodo($scope.AuthData.uid,$scope.ListaTodo[item].llave,$scope.ListaTodo[item].key).then(
                          function(success){
                            setTimeout(function(){
                            $scope.ListaTodo.splice(item, 1);
                                $scope.$apply();
                            }, 0);
                          },
                          function(error){
                              //////console.log(error);
                          }
                      );
                      
        }


        $scope.AuthData = Auth.AuthData;
        $scope.eliminar_lista = function(item){
          //////console.log(item);
            
            ListaCompras.eliminarLista($scope.AuthData.uid,item).then(
                          function(success){
                            setTimeout(function(){
                                $scope.Listado.splice(item, 1);
                                $scope.$apply();
                            }, 0);
                          },
                          function(error){
                              //////console.log(error);
                          }
                      );
                      
        }

        /** Funcion encargada de Agregar un ToDo */
        
        $scope.AuthData = Auth.AuthData;
        $scope.agregar = function() {

          $scope.data = {};

            var myPopup = $ionicPopup.show({
              template: '<input type="text" ng-model="data.toDoNuevo"><p style="color:red; font-size:9px;">{{ mensaje_error }}</p>',
              title: 'Nombre de la Lista',
              scope: $scope,
              buttons: [
                { text: 'Cancelar',
                  type: 'boton-no-border', },
                {
                  text: '<b>Crear</b>',
                  type: 'button-positive button-celeste boton-no-border',
                  onTap: function(e) {

                    //////console.log($scope.data.toDoNuevo);
                    if (!$scope.data.toDoNuevo) {
                      //////console.log("No ingreso nada");
                      //don't allow the user to close unless he enters wifi password
                      $scope.mensaje_error = "Debes completar el nombre de la lista";
                      e.preventDefault();
                    } else {
                      //////console.log("Ingreso " +  $scope.data.toDoNuevo);

                      ListaCompras.crearLista($scope.AuthData.uid,$scope.data.toDoNuevo).then(
                          function(success){
                            $scope.mensaje_error = "";
                            $scope.CargarListado();
                          },
                          function(error){
                            $scope.mensaje_error = "Debes completar el nombre de la lista";
                          }
                      );

                      return $scope.data.toDoNuevo;
                    }
                  }
                }
              ]
            });
        };

        $scope.AuthData = Auth.AuthData;
        $scope.CargarTodo = function(){
              $scope.ListaTodo = [];
              showLoading();
              //////console.log($stateParams.id);
              $scope.key = $stateParams.id;
              ListaCompras.getListadoTodo($scope.AuthData.uid,$stateParams.id).then(
                  function(success){
                    ////console.log(success);
                      if(ListaCompras.listaTodo != null) {
                        angular.forEach(success,function (detalles,key) {
                              $scope.ListaTodo.push({detalles:detalles,key:key,llave:$scope.key});
                        });
                        ////console.log($scope.ListaTodo);
                        hideLoading();  
                      }else{
                        ////console.log("error");
                        hideLoading();  
                      }
                  },
                  function(error){
                      ////console.log(error);
                      hideLoading();  
                  }
              );
        }

        $scope.todo ={
          item:'',
          cantidad:''
        }

        $scope.AuthData = Auth.AuthData;
        $scope.addTodo = function(todo) {
              showLoading();
            ListaCompras.agregarTodo($scope.AuthData.uid,$scope.key,todo).then(
                          function(success){ 
                              hideLoading(); 
                              $scope.todo.item = '';
                              $scope.todo.cantidad = '';
                              $scope.CargarTodo();
                          },
                          function(error){
                              //////console.log(error);
                              hideLoading();  
                          }
                      );

        }

        $scope.AuthData = Auth.AuthData;
        $scope.marcar = function(index,item) {
          //////console.log(item);
          //////console.log(index);
          //////console.log($scope.key);
          //////console.log($scope.ListaTodo[item].detalles);
            ListaCompras.marcarDone($scope.AuthData.uid,index,$scope.key,$scope.ListaTodo[item].detalles.done).then(
                          function(success){ 
                          },
                          function(error){
                              //////console.log(error);
                          }
                      );
        }
        
})

.directive('mapElement', ['$compile', function($compile, $scope, ) {    
    return {        
        restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment 
        link: function($scope, iElm, iAttrs, controller) {
          //console.log(iElm);
          //console.log(iAttrs);
          if($scope.svg != '' && $scope.svg != undefined){
            ////console.log("Cargo desde firebase");
            iAttrs.link = $scope.svg;
          }else{
            ////console.log("Cargo desde local")
            $scope.svg = 'img/map10082017.svg';
          }

          $scope.level = 2;
          window.JSMap = svgPanZoom('.js-map svg', {
            zoomEnabled: true,
            controlIconsEnabled: false,
            zoomScaleSensitivity: 0.75,
            mouseWheelZoomEnabled: true,
            preventMouseEventsDefault: false,
            fit: true,
            center: true,
            panEnabled: true,
            minZoom: 2.0
            // maxZoom : 3.0,
            // onZoom : function(e){          
            //  if(e <= 1.0){
            //    ////console.log("disabled ",e);
            //    JSMap.disableMouseWheelZoom();
            //  }
            //  if(e >= 1.0 && !JSMap.isMouseWheelZoomEnabled()){
            //    ////console.log("enabled ",e);
            //    JSMap.enableMouseWheelZoom();
            //  }
            // }
          });

          $scope.getPosition = function(g){
            JSMap.zoom(1);
            JSMap.panBy({x:0,y:0});

            setTimeout(function(){
                    var x = g.left;
                    var y = g.top;
                    var point = {x : x, y : y};               
                    var realZoom = JSMap.getSizes().realZoom;            
              JSMap.zoomAtPointBy(1.5,{x: (point.x + JSMap.getPan().x - (JSMap.getSizes().width/2) / 2),y: (point.y + JSMap.getPan().y - (JSMap.getSizes().width/2) / 2)});
            },500); 
          };
              

          $scope.zoom = function(z) {
            ////console.log("zoom");
            if(z === 2){         
              JSMap.zoomIn();
            }else{
              JSMap.zoomOut();
            }
          };
              

          var floors = 2;            
          
          //var f1 = angular.element(floors[0]);

          //JSMap.panBy({x:50,y:-90});
          JSMap.zoomAtPointBy(0, {x: 150, y: 150})

          $scope.find = function(id) {
            //console.log("Buscamos el local");
              
              iElm.find('[class^="map-item--selected"]').attr('class','');
              iElm.find("#local-"+id).attr('class','map-item--selected');
              var level = iElm.find("#local-"+id).parent().attr('id');
              $scope.level = level ? level.replace('floor_','') : "";

              $scope.getPosition(iElm.find("#local-"+id).position());
          };


          if($scope.local != '' && $scope.local != undefined){
            //console.log($scope.local);
            $scope.find($scope.local);
          }


        },
        templateUrl: function(iElm,iAttrs, $scope) {
          ////console.log(iAttrs);
          ////console.log(iElm);
          //return $scope.svg || 'img/map10082017.svg'
          return iAttrs.link || 'img/map10082017.svg'
        }
    };
}])

//  En la parte de favoritos, al agregar un favorito a mi perfil tambien debemos guardar el ID del usuario dentro
// del perfil del comercio, para poder enviar mas rapido las notificaciones a los usuarios.
