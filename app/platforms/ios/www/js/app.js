// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngStorage', 'ngCordova', 'jett.ionic.filter.bar',])

.run(function($ionicPlatform, $rootScope, $ionicHistory, $state, StorageService, $localStorage, Profile, Auth) {
  $ionicPlatform.ready(function() {

    Auth.getAuthState().then(function(user){
        $state.go('app.editorial');
    },function(AUTH_LOGGED_OUT){
    })
    /*
    window.onerror = function (errorMsg, url, lineNumber) {
      console.log("ERROR");
      alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
    }
     */

    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      navigator.splashscreen.hide();

  
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      cordova.plugins.Keyboard.disableScroll(true);
      cordova.plugins.Keyboard.close();

      // Enable to debug issues.
      //window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});
      
      var notificationOpenedCallback = function(jsonData) {
        console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
      };
      //alert(JSON.stringify(Auth.AuthData));
      /*
      window.plugins.OneSignal
        .startInit("3feef121-bc77-483a-adbe-98de478ab827")
        .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.None)
        //.handleNotificationOpened(notificationOpenedCallback)
        //.sendTag("perfil",JSON.stringify(Profile.ProfileData))
        .endInit();
      */

    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    
  });

  // Redirect the user to the login state if unAuthenticated
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    console.log("$stateChangeError", error);
    event.preventDefault(); // http://goo.gl/se4vxu
    if(error == "AUTH_LOGGED_OUT") {
      $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      });
      $ionicHistory.clearHistory();
      $state.go('mensaje_login'); //Debes logearte
    }
  });
})


.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $ionicFilterBarConfigProvider) {

  //Coloca el Tab Menu Abajo en todas las plataformas
  $ionicConfigProvider.tabs.position('bottom'); 
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.views.swipeBackEnabled(true);
  $ionicConfigProvider.scrolling.jsScrolling(true);
  $ionicConfigProvider.views.maxCache(0);
    
    $ionicFilterBarConfigProvider.theme('stable');
    $ionicFilterBarConfigProvider.backdrop(false);
    $ionicFilterBarConfigProvider.transition('vertical');
    $ionicFilterBarConfigProvider.placeholder('Buscar');
    

  /*
    Chequeamos si el usuario esta autenticado
  */
  var authResolve = function (Auth) {
    return Auth.getAuthState();
  };


  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    cache: false,
    templateUrl: 'templates/tabs.html',
    controller: 'AppCtrl'
  })

    .state('app.editorial', {
      url: '/editorial',
      views: {
        'menuContent': {
          templateUrl: 'templates/editorial.html',
          controller: 'MainCtrl'
          //resolve: {authResolve: authResolve}
        }
      }
    })
    /* 
      CATEGORIAS
    */
    .state('app.categorias', {
      url: '/categorias',
      views: {
        'CategoriaContent': {
          templateUrl: 'templates/categorias.html',
          controller: 'CategoriaCtrl'
        }
      }
    })
    /* 
      FIN CATEGORIAS
    */
    
    /*
      SHOPPINGS
    */
    .state('app.shoppings', {
      url: '/shoppings/:slug',
      views: {
        'CategoriaContent': {
          templateUrl: 'templates/shoppings/detalle_shopping.html',
          controller: 'ShoppingCtrl',
          resolve: {authResolve: authResolve,}
        }
      }
    })

    .state('app.locales', {
      url: '/shoppings/:slug/locales',
      views: {
        'CategoriaContent': {
          templateUrl: 'templates/shoppings/detalle_shopping_locales.html',
          controller: 'ShoppingCtrl',
          resolve: {authResolve: authResolve}
        }
      }
    })

    .state('app.local', {
      url: '/shoppings/:slug/locales/:local',
      views: {
        'CategoriaContent': {
          templateUrl: 'templates/shoppings/detalle_shopping_local.html',
          controller: 'ShoppingCtrl',
          resolve: {authResolve: authResolve}
        }
      }
    })
    /*
      FIN SHOPPING
    */
    
    /*
      MULTIMARCAS
    */
    .state('app.multimarcas', {
      url: '/multimarcas/:slug',
      views: {
        'CategoriaContent': {
          templateUrl: 'templates/multimarcas/detalle_multimarcas.html',
          controller: 'MultimarcasCtrl',
          resolve: {authResolve: authResolve}
        }
      }
    })

    .state('app.locales_multimarcas', {
      url: '/multimarcas/:slug/locales',
      views: {
        'CategoriaContent': {
          templateUrl: 'templates/multimarcas/detalle_multimarcas_locales.html',
          controller: 'MultimarcasCtrl',
          resolve: {authResolve: authResolve}
        }
      }
    })

    .state('app.local_multimarcas', {
      url: '/multimarcas/:slug/locales/:local',
      views: {
        'CategoriaContent': {
          templateUrl: 'templates/multimarcas/detalle_multimarcas_local.html',
          controller: 'MultimarcasCtrl',
          resolve: {authResolve: authResolve}
        }
      }
    })
    /*
      FIN MULTIMARCAS
    */
    
    /*
      SUPERMERCADOS
    */
    .state('app.supermercados', {
      url: '/supermercados/:slug',
      views: {
        'CategoriaContent': {
          templateUrl: 'templates/supermercados/detalle_supermercados.html',
          controller: 'SupermercadosCtrl',
          resolve: {authResolve: authResolve}
        }
      }
    })

    .state('app.locales_supermercados', {
      url: '/supermercados/:slug/locales',
      views: {
        'CategoriaContent': {
          templateUrl: 'templates/supermercados/detalle_supermercados_locales.html',
          controller: 'SupermercadosCtrl',
          resolve: {authResolve: authResolve}
        }
      }
    })

    .state('app.local_supermercados', {
      url: '/supermercados/:slug/locales/:local',
      views: {
        'CategoriaContent': {
          templateUrl: 'templates/supermercados/detalle_supermercados_local.html',
          controller: 'SupermercadosCtrl',
          resolve: {authResolve: authResolve}
        }
      }
    })
    /*
      FIN SUPERMERCADOS
    */

    /*
      VISTA DEL MAPA EN GENERAL
    */
    .state('app.mapas', {
      url: '/mapa/:lat/:long',
      views: {
        'CategoriaContent': {
          templateUrl: 'templates/mapa.html',
          controller: 'MapaCtrl'
        }
      }
    })
    /*
      FIN DEL MAPA
    */

    /*
      VISTA DEL MAPA EN GENERAL
    */
    .state('app.mapa_complejo', {
      url: '/mapa_complejo/:categoria/:slug/:svg',
      views: {
        'CategoriaContent': {
          templateUrl: 'templates/mapa_shopping.html',
          controller: 'MapaCtrl'
        }
      }
    })
    .state('app.mapa_complejo_local', {
      url: '/mapa_complejo/:categoria/:slug/:svg/:local',
      views: {
        'CategoriaContent': {
          templateUrl: 'templates/mapa_shopping.html',
          controller: 'MapaCtrl'
        }
      }
    })
    /*
      FIN DEL MAPA
    */

    /*
      VISTA DEL MAPA PROMOCIONES
    */
    .state('app.mapaPromociones', {
      url: '/mapaPromociones',
      views: {
        'CheckContent': {
          templateUrl: 'templates/mapaPromociones.html',
          controller: 'MapaPromocionesCtrl',
          resolve: {authResolve: authResolve}
        }
      }
    })
    .state('app.buscadorPromociones', {
      url: '/buscadorPromociones',
      views: {
        'CheckContent': {
          templateUrl: 'templates/buscadorPromociones.html',
          controller: 'MapaPromocionesCtrl'
        }
      }
    })
    /*
      FIN DEL MAPA PROMOCIONES
    */

    .state('app.perfil', {
      url: '/perfil',
      views: {
        'perfilContent': {
          templateUrl: 'templates/modal/profile.html',
          controller: 'ProfileCtrl',
          resolve: {authResolve: authResolve}
        }
      }
    })

    .state('app.configuraciones', {
      url: '/configuraciones',
      views: {
        'perfilContent': {
          templateUrl: 'templates/modal/settings.html',
          controller: 'ProfileCtrl',
          resolve: {authResolve: authResolve}
        }
      }
    })

    .state('app.editarperfil', {
      url: '/editarperfil',
      views: {
        'perfilContent': {
          templateUrl: 'templates/modal/edit-profile.html',
          controller: 'ProfileCtrl'
        }
      }
    })

    .state('app.consultas', {
      url: '/consultas',
      views: {
        'perfilContent': {
          templateUrl: 'templates/consultas.html',
          controller: 'ConsultasCtrl'
        }
      }
    })

    .state('app.informacion', {
      url: '/informacion',
      views: {
        'perfilContent': {
          templateUrl: 'templates/informacion.html'
        }
      }
    })

    .state('app.favoritos', {
      url: '/favoritos',
      views: {
        'perfilContent': {
          templateUrl: 'templates/favoritos.html',
          controller: 'ProfileCtrl'
        }
      }
    })

    .state('app.check', {
      url: '/check',
      views: {
        'perfilContent': {
          templateUrl: 'templates/check.html',
          controller: 'ProfileCtrl'
        }
      }
    })

    .state('app.puntos', {
      url: '/puntos',
      views: {
        'perfilContent': {
          templateUrl: 'templates/puntos.html',
          controller: 'ProfileCtrl'
        }
      }
    })

    .state('app.lista_compras', {
      url: '/lista_compras',
      views: {
        'perfilContent': {
          templateUrl: 'templates/lista_compras.html',
          controller: 'ListaComprasCtrl'
        }
      }
    })

    .state('app.detalle_lista', {
      url: '/detalle_lista/:id',
      views: {
        'perfilContent': {
          templateUrl: 'templates/detalle_lista_compras.html',
          controller: 'ListaComprasCtrl'
        }
      }
    })

    .state('buscador', {
      url: '/buscador',
          templateUrl: 'templates/modal/search-product.html',
          controller: 'SearchCtrl',
          resolve: {authResolve: authResolve}
    })

    .state('onboarding', {
      url: '/onboarding',
          templateUrl:function(){
            if(ionic.Platform.isIOS()){
              return 'templates/onboarding_ios.html'
            }else{
              return 'templates/onboarding_android.html'
            }
          },
          controller: 'LoginCtrl'
    })
    .state('signin', {
      url: '/signin',
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl'
    })
    .state('mensaje_login', {
      url: '/mensaje_login',
          templateUrl: 'templates/mensaje_login.html',
    })
    .state('signup', {
      url: '/signup',
          templateUrl: 'templates/signup.html',
          controller: 'SignUpCtrl'
    })
    .state('sesion_cerrada', {
      url: '/sesion_cerrada',
          templateUrl: 'templates/sesion_cerrada.html'
    })
    .state('forgot-password', {
      url: '/forgot-password',
          templateUrl: 'templates/forgot-password.html',
          controller: 'LoginCtrl'
    });
    
  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/onboarding');
  $urlRouterProvider.otherwise(function($injector, $location, Auth) {
    console.log("Verificamos que vista mostramos");
    var $state = $injector.get('$state')
    var onboarding = localStorage.getItem('onboarding');
    if(onboarding === true || onboarding == 'true'){
      $state.go('app.editorial');
    }else{
      $state.go('onboarding');
      localStorage.setItem('onboarding',true);
    }           
  })
  $ionicConfigProvider.backButton.previousTitleText(false).text('');
});









