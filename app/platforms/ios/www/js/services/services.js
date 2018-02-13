angular.module('starter.services', [])
    
    .factory('StorageService', function ($localStorage) {

        $localStorage.things = $localStorage.things || [];
        $localStorage.things.userObj = $localStorage.things.userObj || {};

       // ////console.log()

        var _getAll = function () {
            ////console.log($localStorage.things);
            return $localStorage.things;
        };
        var _push = function (thing) {
            $localStorage.things.push(thing);
        }
        var _addUserObj = function (data) {
            $localStorage.things.userObj = $localStorage.things.userObj || {};
            $localStorage.things.userObj = data;
        }
        var _getUserObj = function (data) {
            //////console.log($localStorage.things.userObj);
           return $localStorage.things.userObj;
        }
        var _remove = function () {
            $localStorage.things = [];
            //////console.log('userObj removed')
        }
        return {
            getAll: _getAll,
            getUserObj: _getUserObj,
            add: _addUserObj,
            push: _push,
            remove: _remove
        };
    })
    
    .factory('CartService', function ($localStorage) {

        $localStorage.cart = $localStorage.cart || [];

        var _getAll = function () {
            ////console.log($localStorage.cart);
            return $localStorage.cart;
        };
        var _push = function (thing) {
            $localStorage.cart.push(thing);
            ////console.log($localStorage.cart);
        }
        var _remove = function (thing) {
            $localStorage.cart.splice($localStorage.cart.indexOf(thing), 1);
            ////console.log('removed, current length'+ $localStorage.cart.length);
        }
        
        var _removeAll = function () {
            $localStorage.cart = [];
            ////console.log('all items removed');
        }
        return {
            getAll: _getAll,
            push: _push,
            remove: _remove,
            removeAll: _removeAll
        };
    })
    
    .factory('WishlistService', function ($localStorage) {

        $localStorage.wishlist = $localStorage.wishlist || [];

        var _getAll = function () {
            ////console.log($localStorage.wishlist);
            return $localStorage.wishlist;
        };
        var _push = function (thing) {
            $localStorage.wishlist.push(thing);
            ////console.log($localStorage.wishlist);
        }
        var _remove = function (thing) {
            $localStorage.wishlist.splice($localStorage.wishlist.indexOf(thing), 1);
            ////console.log('removed, current length'+ $localStorage.wishlist.length);
        }
        return {
            getAll: _getAll,
            push: _push,
            remove: _remove
        };
    })
    
    .factory('$dataService', ['$http', '$constants', function ($http, $constants) {

        var apiUrl = $constants.jsonApiUrl,
       
            header = {
                'Content-Type': "application/json"
            };

        return {

            $getNonce: function () {
                return $http.post(apiUrl + '/get_nonce/?controller=user&method=register', {}, {
                    header: header
                })

            },

            $signup: function (data) {
                return $http.get(apiUrl + '/user/register/', {
                    header: header,
                    params: data
                })

            },

            $login: function (data) {
                return $http.get(apiUrl + '/user/generate_auth_cookie/', {
                    header: header,
                    params: data
                })
            },

            $passwordReset: function (params) {
                ////console.log(params);
                return $http.get(apiUrl + '/user/retrieve_password/', {
                    header: header,
                    params: params
                })
            },

            $getPosts: function (params) {
                ////console.log(params);
                return $http.get(apiUrl + '/get_category_posts/', {
                    header: header,
                    params: params
                })
            }



        }
    }])


    .factory('CordovaCamera', function($q, $cordovaCamera) {
        var self = this;
        
        //
        // generic function for retrieving a base64 imagedata string
        self.newImage = function(sourceTypeIndex, optTargetSize) {
            
            var q = $q.defer();
            
            var targetSizeTarget = 800;
            if(optTargetSize != undefined && optTargetSize != "") {
                targetSizeTarget = optTargetSize;
            };
            
            var sourceType;
            switch(sourceTypeIndex) {
                case 0:
                    //
                    sourceType = Camera.PictureSourceType.CAMERA;
                    break
                case 1:
                    //
                    sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
                    break
            };
            
            var options = {
                quality:            800,
            destinationType :   Camera.DestinationType.DATA_URL,
            sourceType :        sourceType, 
            allowEdit :         true,
            targetWidth:        targetSizeTarget,
                targetHeight:       targetSizeTarget,
            encodingType:       Camera.EncodingType.JPEG,
            popoverOptions:     CameraPopoverOptions,
            saveToPhotoAlbum:   false
          };
          
            $cordovaCamera.getPicture(options).then(
            function(imageData) {
                q.resolve("data:image/jpeg;base64," + imageData);
            }, 
            function(error) {
                q.reject(error);
            });
            return q.promise;
        };
        
        return self;
        
    })

    .factory('FireFunc', function($q) {
      var self = this;
      var lugares = [];

      // fn load
      // v3
      self.onValue = function(childRef) {
        var qGet = $q.defer();
        firebase.database().ref(childRef).on('value', function(snapshot) {
            qGet.resolve(snapshot.val());
        }, function(error){
            qGet.reject(error);
        });
        return qGet.promise;
      };
      self.GetComercios = function(childRef) {
        var qGet = $q.defer();
        firebase.database().ref(childRef).orderByChild("/perfil/online").equalTo(true).on('value', function(snapshot) {
            qGet.resolve(snapshot.val());
        }, function(error){
            qGet.reject(error);
        });
        return qGet.promise;
      };
      self.onValue2 = function(childRef, limitValue) {
        var qGet = $q.defer();
        firebase.database().ref(childRef).limitToFirst(limitValue).on('value', function(snapshot) {
            qGet.resolve(snapshot.val());
        }, function(error){
            qGet.reject(error);
        });
        return qGet.promise;
      };
      self.onValue3 = function(childRef, sortNode) {
        var qGet = $q.defer();
        firebase.database().ref(childRef).orderByChild(sortNode).on('value', function(snapshot) {
            qGet.resolve(snapshot.val());
        }, function(error){
            qGet.reject(error);
        });
        return qGet.promise;
      };
      self.GetValue = function(childRef,sortNode) {
        var qGet = $q.defer();
        firebase.database().ref(childRef).orderByChild(sortNode).on('value', function(snapshot) {
            qGet.resolve(snapshot.val());
        }, function(error){
            qGet.reject(error);
        });
        return qGet.promise;
      };

      self.puntosShopping = function(childRef, sortNode) {
        var lugares = [];
        var qGet = $q.defer();
        firebase.database().ref(childRef).orderByChild(sortNode).on('child_added', function(snapshot) {
            ////console.log(snapshot.key + " = " + snapshot.val().perfil.puntos);
            if(snapshot.val().perfil.puntos == true || snapshot.val().perfil.puntos == 'true'){
              lugares.push({lugar:snapshot.key, puntos:snapshot.val().perfil.puntos, icono:snapshot.val().perfil.icono, nombre:snapshot.val().perfil.nombre, categoria: 'centros_comerciales'})
            }
            qGet.resolve(lugares);
        }, function(error){
            qGet.reject(error);
        });
        return qGet.promise;
      };

      self.puntosMultimarcas = function(childRef, sortNode) {
        var qGet = $q.defer();
        firebase.database().ref(childRef).orderByChild(sortNode).on('child_added', function(snapshot) {
            ////console.log(snapshot.key + " = " + snapshot.val().perfil.puntos);
            if(snapshot.val().perfil.puntos == true || snapshot.val().perfil.puntos == 'true'){
              lugares.push({lugar:snapshot.key, puntos:snapshot.val().perfil.puntos, icono:snapshot.val().perfil.icono, nombre:snapshot.val().perfil.nombre, categoria: 'multimarcas'})
            }
            qGet.resolve(lugares);
        }, function(error){
            qGet.reject(error);
        });
        return qGet.promise;
      };

      // v3
      self.onValueSort = function(childRef, sortNode, limitValue) {
        var datos = [];
        var qGet = $q.defer();
        firebase.database().ref(childRef).orderByChild(sortNode).on('child_added', function(snapshot) {
              ////console.log(snapshot.key + " was " + snapshot.val().estadisticas.visitas + " meters tall");
              datos.push({lugar:snapshot.key, visitas:snapshot.val().estadisticas.visitas, icono:snapshot.val().perfil.icono, nombre:snapshot.val().perfil.nombre, online:snapshot.val().perfil.online,})
            qGet.resolve(datos);
        }, function(error){
            qGet.reject(error);
        });
        return qGet.promise;
      };
      self.onValueSort2 = function(childRef, sortNode, limitValue) {
        var datos2 = [];
        var qGet = $q.defer();
        firebase.database().ref(childRef).orderByChild(sortNode).limitToLast(limitValue).on('child_added', function(snapshot) {
            ////console.log(snapshot.key + " was " + snapshot.val().estadisticas.visitas + " meters tall");
            datos2.push({lugar:snapshot.key, visitas:snapshot.val().estadisticas.visitas, icono:snapshot.val().perfil.icono, nombre:snapshot.val().perfil.nombre})
            qGet.resolve(datos2);
        }, function(error){
            qGet.reject(error);
        });
        return qGet.promise;
      };

      // fn set
      // v3
      self.set = function(childRef, SetObject) {
        var qAdd = $q.defer();
        var updates = {};
        updates[childRef] = SetObject;
        firebase.database().ref().update(updates)
        .then(function(success){
            qAdd.resolve(success);
        }).catch(function(error){
            qAdd.reject(error);
        });
        return qAdd.promise;
      };

      // fn push
      // v3
      self.push = function(childRef, PushObject) {
        var qAdd = $q.defer();
        firebase.database().ref(childRef).push(PushObject)
        .then(function(success){
            qAdd.resolve(success);
        }).catch(function(error){
            qAdd.reject(error);
        });
        return qAdd.promise;
      };

      // fn update
      // v3
      self.update = function(updates) {
        var qUpdate = $q.defer();
        firebase.database().ref().update(updates)
        .then(function(success){
            qUpdate.resolve(success);
        }).catch(function(error){
            qUpdate.reject(error);
        });
        return qUpdate.promise;
      };

      // fn remove
      // v3
      self.remove = function(childRef) {
        var qDel = $q.defer();
        var updates = {};
        updates[childRef] = null;
        firebase.database().ref().update(updates)
        .then(function(success){
            qDel.resolve("REMOVE_SUCCESS");
        }).catch(function(error){
            qDel.reject(error);
        });
        return qDel.promise;
      };

      return self;
    })

    .factory('Auth', function($q, $rootScope, $ionicHistory) {
      var self = this;
      self.AuthData = {};

      /**
       * Init the global variable AuthData
       */
      onAuth().then(
          function(AuthData){
            self.AuthData = AuthData;
          }
      );

      /**
       * v3
       * unAuthenticate the user
       * independent of method (password, twitter, etc.)
       */
      self.unAuth = function() {
        var qSignOut = $q.defer();
        firebase.auth().signOut().then(function() {
          // Sign-out successful.
            self.AuthData = {}; // gv
          broadcastAuthChange();
          qSignOut.resolve();
        }, function(error) {
          // An error happened.
          qSignOut.reject(error);
        });
        return qSignOut.promise;
      };

      /**
       * v3
       * Monitor the current authentication state
       * returns on success:  AuthData
       * returns on fail:     AUTH_LOGGED_OUT
       */
      function onAuth() {
        var qCheck = $q.defer();
        firebase.auth().onAuthStateChanged(
          function(user) {
            if (user) {
              self.AuthData = user;//gv
              qCheck.resolve(user);
            } else {
              $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true   
              });
              $ionicHistory.clearHistory();
              ////console.log("No esta logeado");
              qCheck.reject("AUTH_LOGGED_OUT");
            };
        });
        return qCheck.promise;
      };

      self.getAuthState = function() {
        var qCheck = $q.defer();
        firebase.auth().onAuthStateChanged(
          function(user) {
            if (user) {
              self.AuthData = user;//gv
              qCheck.resolve(user);
            } else {
              $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true   
              });
              $ionicHistory.clearHistory();
              ////console.log("No esta logeado");
              qCheck.reject("AUTH_LOGGED_OUT");
            };
        });
        return qCheck.promise;
      };

      self.ObtenerNotificaciones = function(){
        var qCheck = $q.defer();
        firebase.auth().onAuthStateChanged(
          function(user) {
            if (user.email == null) {
              ////console.log("Notificaciones ",user);
              self.AuthData = user;//gv
              qCheck.resolve("true");
            } else {
              ////console.log("No esta logeado");
              qCheck.reject("AUTH_LOGGED_OUT");
            };
        });
        return qCheck.promise;
      };
      /**
       * v3
       * Authenticate the user with password
       * returns on success: AuthData
       * returns on error: error
       *
       * common error.code:
       * INVALID_USER (user does not excist)
       * INVALID_EMAIL (email incorrect)
       * INVALID_PASSWORD
       */
      self.signInPassword = function(userEmail, userPassword) {

        var qAuth = $q.defer();
        firebase.auth().signInWithEmailAndPassword(userEmail, userPassword)
        .then(function(User){
            broadcastAuthChange();
            self.AuthData = User; //gv
            qAuth.resolve(User);
        })
        .catch(function(error) {
            broadcastAuthChange();
            if(error.code == 'auth/network-request-failed') {
                error['message'] = "Oops... It seems that your browser is not supported. Please download Google Chrome or Safari and try again."
            };
            qAuth.reject(error);
        });
        return qAuth.promise;
      };


      /**
       * v3
       * Create a new user with password
       * method: does not require confirmation of email
       * returns on success: userData =/= AuthData (??)
       * returns on error: error
       *
       */
      self.signUpPassword = function(userEmail, userPassword) {
        var qAuth = $q.defer();
        firebase.auth().createUserWithEmailAndPassword(userEmail, userPassword)
        .then(function(User){
            broadcastAuthChange();
            self.AuthData = User; //gv
            qAuth.resolve(User);
        })
        .catch(function(error) {
            broadcastAuthChange();
            if(error.code == 'auth/network-request-failed') {
                error['message'] = "Oops... It seems that your browser is not supported. Please download Google Chrome or Safari and try again."
            };
            qAuth.reject(error);
        });
        return qAuth.promise;
      };

      /**
       * XXX
       * Change Password or Email / Reset Password
       */
      self.changePassword = function(userEmail, oldPassword, newPassword) {
        var qChange = $q.defer();
        var ref = new Firebase(FBURL);
        ref.changePassword({
            email       : userEmail,
            oldPassword : oldPassword,
            newPassword : newPassword
        }, function(error) {
            if (error === null) {
                qChange.resolve("CHANGE_PASSWORD_SUCCESS");
            } else {
                qChange.reject(error);
            }
        });
        return qChange.promise;
      };

      //    * XXX
      self.changeEmail = function(oldEmail, newEmail, userPassword) {
        var qChange = $q.defer();
        var ref = new Firebase(FBURL);
        ref.changeEmail({
            oldEmail : oldEmail,
            newEmail : newEmail,
            password : userPassword
        }, function(error) {
            if (error === null) {
                qChange.resolve("CHANGE_EMAIL_SUCCESS");
            } else {
                qChange.reject(error);
            }
        });
        return qChange.promise;
      };

      // v3
      self.resetPassword = function(userEmail) {
        var qReset  = $q.defer();
        var auth    = firebase.auth();
        auth.sendPasswordResetEmail(emailValue).then(function() {
          qReset.resolve("RESET_PASSWORD_SUCCESS");
        }, function(error) {
          qReset.reject(error);
        });
        return qReset.promise;
        return qConfirm.promise;
      };

      /**
       * ---------------------------------------------------------------------------
       * Social Authentication
       * TODO: please follow the instructions here: https://firebase.google.com/docs/auth/web/google-signin
       */
       
      // Crgamos los datos del usuario que se conecto con Facebook
      self.CargarPerfil = function(auth, perfil) {
        ////console.log(perfil.first_name);
        var datos = {
          nombre: perfil.first_name || '',
          apellido: perfil.last_name || '',
          email: auth.email || '',
          edad: perfil.age_range || '',
          birth: perfil.birthday || '',
          cover: perfil.cover || '',
          amigos: perfil.friends || '',
          //uid: uid
        };
        var updates = {};
        updates['/users/' + auth.user.uid + '/' + 'perfil'] = datos;

        return firebase.database().ref('/users/' + auth.user.uid + '/' + 'perfil').update(datos).then(
              function(success){
                return success;
              })  
      };

      function broadcastAuthChange() {
        $rootScope.$broadcast('rootScope:authChange', {});
      };

      return self;
    })
    
    .factory('ListaCompras',function($q, FireFunc){
      var self = this;
      self.lista = '';
      self.listaTodo = '';

      self.getListado = function(uid) {
        var qCat = $q.defer();
        FireFunc.onValue('users/'+ uid +'/listado').then(function(result){
          if(result != null) {
            self.lista = result;
          } else {
            self.lista = '';
          }
          qCat.resolve(self.lista);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.getListadoTodo = function(uid,key) {
        var qCat = $q.defer();
        ////console.log(key)
        FireFunc.onValue('users/'+ uid +'/listado/'+key+'/items/').then(function(result){
          if(result != null) {
            self.listaTodo = result;
          } else {
            self.listaTodo = '';
          }
          qCat.resolve(self.listaTodo);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      // SET
      self.crearLista = function(uid, nombreLista) {
        var timeNow = new Date().getTime()
        var post ={
            nombreLista: nombreLista,
            timestamp: timeNow,
        }
        ////console.log(post);
        return firebase.database().ref('users/' + uid + '/listado/').push(post);
      };

      // SET
      self.agregarTodo = function(uid,key,todo) {
        ////console.log(todo);
        var post ={
            lista: todo.item,
            cantidad: todo.cantidad,
            done: false,
        }
        
        ////console.log(todo);
        return firebase.database().ref('users/' + uid + '/listado/'+key+'/items/').push(post);
      };

      // SET
      self.marcarDone = function(uid,item,lista,done) {
        var post ={
          done: done
        }
        return firebase.database().ref('users/' + uid + '/listado/'+lista+'/items/'+item).update(post);
      };
      self.EditarNombreLista = function(uid,nombre,key) {
        var post ={
          nombreLista: nombre
        }
        return firebase.database().ref('users/' + uid + '/listado/'+key).update(post);
      };

      self.eliminarTodo = function(uid, key,item) {
        var childRef = 'users/' + uid + '/listado/'+key+'/items/'+item;
        ////console.log(childRef);
        return FireFunc.remove(childRef);
      };

      self.eliminarLista = function(uid, key ) {
        var childRef = 'users/' + uid + '/listado/'+key;
        ////console.log(childRef);
        return FireFunc.remove(childRef);
      };

      return self;

    })

    .factory('Profile', function($q, FireFunc, Utils, Codes, CordovaCamera, $ionicPopup) {
      var self = this;

      self.ProfileData = {}; //cache
      self.notificacion = {}; //cache
      self.listado_notificaciones = {}; //cache
      
      // GET  users/$uid
      self.get = function(uid) {
        var childRef = "users/" + uid;
        return FireFunc.onValue(childRef).then(
          function(ProfileData){
            // write to cache
            self.ProfileData = ProfileData;
            return ProfileData;
          },
          function(error){
            return error;
          }
        );
      };
      
      self.notificaciones = function(uid) {
        var qCat = $q.defer();
        if(uid != undefined){
          FireFunc.onValue("users/" + uid + "/configuracion/notificaciones").then(function(result){
            //console.log(uid);
            //console.log(result);
            if((result != null || result != 'null') && (uid != undefined || uid != 'undefined')) {
              self.notificacion = result;
              qCat.resolve(self.notificacion);
            } else {
              //console.log("error");
              self.notificacion = null;
              qCat.resolve(self.notificacion);
            }
          },
          function(error){
            qCat.reject(error);
          })
        }else{
          qCat.reject("error");
        }
        return qCat.promise;
      };
      
      self.GetNotificaciones = function(uid) {
        var qCat = $q.defer();
        FireFunc.onValue("users/" + uid + "/notificaciones").then(function(result){
          if(result != null) {
            self.listado_notificaciones = result;
          } else {
            self.listado_notificaciones = null;
          }
          qCat.resolve(self.listado_notificaciones);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };


      // SET
      self.UpdateNotificaciones = function(uid, valor) {
        var post ={
            activada: valor,
        }
        ////console.log(post);
        return firebase.database().ref("users/" + uid + "/configuracion/notificaciones").set(post);
      };
      
      
      // GET  users/$uid/$globalProperty
      self.getGlobal = function(uid, globalProperty) {
        var childRef = "users/" + uid + "/" + globalProperty;
        return FireFunc.onValue(childRef).then(
          function(ProfileData){
            // write to cache
            self.ProfileData = ProfileData;
            return ProfileData;
          },
          function(error){
            return error;
          }
        );
      };
      
      // GET  users/$uid/$globalProperty/property
      self.getSub = function(uid, globalProperty, subProperty) {
        var childRef = "users/" + uid + "/" + globalProperty + "/" + subProperty;
        return FireFunc.onValue(childRef);
      };
      
      // SET  users/$uid/$globalProperty
      self.setGlobal = function(uid, globalProperty, globalValue) {
        var childRef = "users/" + uid +"/" + globalProperty;
        return FireFunc.set(childRef, globalValue).then(
          function(successCallback){
            return successCallback;
          },
          function(error){
            return error;
          }
        );
      };
      
      // SET  users/$uid/$globalProperty/property
      self.setSub = function(uid, globalProperty, subProperty, subValue) {
        var childRef = "users/" + uid +"/" + globalProperty + "/" + subProperty;
        Utils.showMessage("Updating profile...");
        return FireFunc.set(childRef, subValue).then(
          function(successCallback){
            Utils.showMessage("Profile updated", 750);
            return successCallback;
          },
          function(error){
            Codes.handleError(error);
            return error;
          }
        );
      };
      
      // Cambiar los datos del perfil del usuario
      self.UpdatePerfil = function(uid, perfil) {
        // Obtenemos los datos que enviamos desde el controller
        var user = firebase.auth().currentUser;
        if(perfil.email != undefined && perfil.email != '' && perfil.email != null){
          user.updateEmail(perfil.email).then(function() {
            // Update successful.
            ////console.log("Correo Actualizado");
          }, function(error) {
            // An error happened.
            ////console.log("Correo NO Actualizado",error);
          });
        }
        var datos = {
          nombre: perfil.nombre || '',
          apellido: perfil.apellido || '',
          email: perfil.email || '',
          ciudad: perfil.ciudad || '',
          sexo: perfil.sexo || '',
          nacimiento: perfil.nacimiento || '',
          //uid: uid
        };
        var updates = {};
        updates['/users/' + uid + '/' + 'perfil'] = datos;

        return firebase.database().ref('/users/' + uid + '/' + 'perfil').update(datos).then(
              function(success){
                ////console.log(success);
                return success;
              })  
      };
      
      // SET  users/$uid/profilePicture
      self.changeProfilePicture = function(sourceTypeIndex, uid) {
        return CordovaCamera.newImage(sourceTypeIndex, 800).then(
          function(imageData){
            if(imageData != undefined) {
              return self.setGlobal(uid, 'perfil/foto_perfil', imageData);
            } else {
              return imageData;
            }
          }, function(error){
              return error;
          }
        );
      };
      
      
      // VALIDATE   usernames/$username === null
      // GET        users/$uid/meta/username (old)    proceed0
      // SET        users/$uid/meta/username (new)    proceed2c
      // DELETE     usernames/$username (old)         proceed2a
      // SET        usernames/$username (new)         proceed2b
      self.changeUserName = function(uid, newUsername) {
        
        ////console.log(uid, newUsername)
        
        // 0    validate if username taken
        var newUsernamesRef = "usernames/" + newUsername;
        return FireFunc.onValue(newUsernamesRef).then(
          function(snapshot){
            if(snapshot == null) {
              return proceed1();
            } else {
              Codes.handleError({code: "USERNAME_TAKEN"});
              return "USERNAME_TAKEN";
            }
          },
          function(error){
            return error;
          }
        );
        
        function proceed1() {
          // 1  get the current username
          var oldMetaRef = "users/" + uid + "/meta/username"
          return FireFunc.onValue(oldMetaRef).then(
            function(oldUsername){
              return proceed2(oldUsername);
            },
            function(error){
              return error;
            }
          )
        };
        
        function proceed2(oldUsername) {
          
          // *** todo in v2.1: rewrite to leverage .update()
          // More about Firebase Multi-Location Updates (available from v2.3)
          // on their website
          //
          // Example:
          // var pathData = {};
          // pathData['/usernames/' + oldUsername] = null;
          // pathData['/usernames/' + newUsername] = uid;
          // FireFunc.update(ref);
          
          // 2ab  set, handle node usernames in the background
          var oldUsernamesRef = "usernames/" + oldUsername;
          var newUsernamesRef = "usernames/" + newUsername;
          FireFunc.remove(oldUsernamesRef);
          FireFunc.set(newUsernamesRef, uid);
          
          // 2c   set, update meta
          return self.setSub(uid, 'meta', 'username', newUsername);
        };
        
      };
      
      return self;
    })

    .factory('Codes', function(Utils, $q) {
      var self = this;
      
      self.handleError = function(error) {
        Utils.showMessage(self.getErrorMessage(error), 1500);
      };
      
      self.getErrorMessage = function(error) {
        var updateMessage = "";
        ////console.log(error)
        if (error.hasOwnProperty('code')){
          switch(error.code) {
            case 'INVALID_USER':
              //
              updateMessage = "User does not excist... Sign up!"
              // perhaps an automatic redirect
              break
            case 'auth/invalid-email':
              //
              updateMessage = "Correo Electronico no valido."
              break
            case 'auth/user-not-found':
              //
              updateMessage = "No hemos encontrado el correo electronico en nuestro sistema."
              break
            case 'auth/wrong-password':
              //
              updateMessage = "Contraseña incorrecta."
              break
            case 'INVALID_PASSWORD':
              //
              updateMessage = "Incorrect password"
              break
            case 'INVALID_INPUT':
              //
              updateMessage = "Invalid E-mail or password. Try again"
              break
            case 'EMAIL_TAKEN':
              //
              updateMessage = "E-mail is already taken. Forgot password? Reset it"
              break
            case 'USERNAME_TAKEN':
              //
              updateMessage = "Username is already taken. Try again"
              break
            case 'USERNAME_NONEXIST':
              //
              updateMessage = "User not found. Check your spelling"
              break
            case 'PROFILE_NOT_SET':
              //
              updateMessage = "Please provide an username and display name"
              break
            case 'POST_NEW_CHAR_EXCEEDED':
              //
              updateMessage = "Your post can have max. " + POST_MAX_CHAR + " characters"
              break
            default: 
              //
              updateMessage = "Oops. Something went wrong..."
              break
          }
        } else {
          updateMessage = "Oops. Something went wrong..."
        }
        return updateMessage;
      };
      
      
      /**
       * Generic function to validate input
       */
      self.validateInput = function(inputValue, inputType) {
        var qVal = $q.defer();
        switch (inputValue) {
          case undefined:
            handleValidation("INPUT_UNDEFINED", false)
            break
          case null:
            handleValidation("INPUT_NULL", false)
            break
          case "":
            handleValidation("INPUT_NULL", false)
            break
          default: 
            handleValidation("INPUT_VALID", true)
            break
        }
        function handleValidation(code, pass){
          if(pass){
            qVal.resolve(code);
          } else {
            qVal.reject(code);
          }
        };
        return qVal.promise;
      };

      return self;
    })

    .factory('Utils', function($ionicLoading, $timeout, $q) {
      var self = this;

     // ionic loading notification
      self.showMessage = function(message, optHideTime) {
        if(optHideTime != undefined && optHideTime > 100) {
          // error message or notification (no spinner)
          $ionicLoading.show({
              template: message
          });
          $timeout(function(){
              $ionicLoading.hide();
          }, optHideTime)
        } else {
          // loading (spinner)
          $ionicLoading.show({
              template: message + '<br><br>' + '<ion-spinner class="spinner-modal"></ion-spinner>'
          });

          $timeout(function(){    // close if it takes longer than 10 seconds
              $ionicLoading.hide();
              //self.showMessage("Timed out", 2000);
          }, 20000)

        }
      };

      return self;
    })

    .factory('CentrosComerciales', function($q, FireFunc) {

      var self = this;
      self.all = {};
      self.shopping = {};
      self.locales = {};
      self.local = {};

      self.get = function() {
        var qCat = $q.defer();
        FireFunc.GetComercios('categorias/centros_comerciales/comercios').then(function(result){
          if(result != null) {
            self.all = result;
          } else {
            self.all = {};
          }
          qCat.resolve(self.all);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.getShopping = function(shopping) {
        var qCat = $q.defer();
        FireFunc.onValue('categorias/centros_comerciales/comercios/'+shopping).then(function(result){
          if(result != null) {
            self.shopping = result;
          } else {
            self.shopping = {};
          }
          qCat.resolve(self.shopping);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.getShopping2 = function(shopping) {
        var qCat = $q.defer();
        FireFunc.onValue('categorias/centros_comerciales/comercios/'+shopping).then(function(result){
          if(result != null) {
            // Al obertener los datos del comercio le sumamos una visita
              // Obtenemos la cantidad de visitas actuales y le sumamos uno
              var suma = result.estadisticas.visitas + 1
              firebase.database().ref('categorias/centros_comerciales/comercios/'+shopping+'/estadisticas').update({visitas:suma});

              var anho = new Date().getFullYear();
              var mes = new Date().getMonth() + 1;
              FireFunc.onValue('categorias/centros_comerciales/comercios/'+shopping+'/estadisticas/'+anho+'/'+mes).then(function(resultado){
                if(resultado == null){
                  // La primera estadistica del anho mes
                  var suma = 1;
                  firebase.database().ref('categorias/centros_comerciales/comercios/'+shopping+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                }else{
                  if(!resultado.hasOwnProperty(['visitas'])){
                    var suma = 1;
                    firebase.database().ref('categorias/centros_comerciales/comercios/'+shopping+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                  }else{
                    var suma = resultado.visitas + 1
                    firebase.database().ref('categorias/centros_comerciales/comercios/'+shopping+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                  }
                }
              })
            self.shopping = result;
          } else {
            self.shopping = {};
          }
          qCat.resolve(self.shopping);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.set = function(CategoriesObj) {
        return FireFunc.set('categorias/centros_comerciales/comercios', CategoriesObj);
      };

      self.getLocales = function(shopping) {
        var qCat = $q.defer();
        FireFunc.onValue('categorias/centros_comerciales/comercios/'+shopping+'/locales').then(function(result){
          if(result != null) {
            self.locales = result;
          } else {
            self.locales = {};
          }
          qCat.resolve(self.locales);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.getLocal = function(local,shopping) {
        var resultado = [];
        var qCat = $q.defer();
        FireFunc.onValue('categorias/centros_comerciales/comercios/'+shopping+'/locales/'+local).then(function(result){
          if(result != null) {
            FireFunc.onValue('categorias/centros_comerciales/comercios/'+shopping).then(function(resultado){
              console.log(resultado.perfil.online);
              if(resultado.perfil.online == true){
                self.local = result;
              }
            })
          } else {
            self.local = {};
          }
          qCat.resolve(self.local);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.getLocal2 = function(local,shopping) {
        console.log(local, shopping);
        var qCat = $q.defer();
        FireFunc.onValue('categorias/centros_comerciales/comercios/'+shopping+'/locales/'+local).then(function(result){
          if(result != null) {
            // Al obertener los datos del comercio le sumamos una visita
              // Obtenemos la cantidad de visitas actuales y le sumamos uno
              if(!result.hasOwnProperty(['estadisticas.visitas'])){
                var suma = 1
                firebase.database().ref('categorias/centros_comerciales/comercios/'+shopping+'/locales/'+local+'/estadisticas').update({visitas:suma});
              }else{
                var suma = result.estadisticas.visitas + 1
                firebase.database().ref('categorias/centros_comerciales/comercios/'+shopping+'/locales/'+local+'/estadisticas').update({visitas:suma});
              }
              var anho = new Date().getFullYear();
              var mes = new Date().getMonth() + 1;
              FireFunc.onValue('categorias/centros_comerciales/comercios/'+shopping+'/locales/'+local+'/estadisticas/'+anho+'/'+mes).then(function(resultado){
                if(resultado == null){
                  // La primera estadistica del anho mes
                  var suma = 1;
                  firebase.database().ref('categorias/centros_comerciales/comercios/'+shopping+'/locales/'+local+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                }else{
                  if(!resultado.hasOwnProperty(['visitas'])){
                    var suma = 1;
                    firebase.database().ref('categorias/centros_comerciales/comercios/'+shopping+'/locales/'+local+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                  }else{
                    var suma = resultado.visitas + 1
                    firebase.database().ref('categorias/centros_comerciales/comercios/'+shopping+'/locales/'+local+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                  }
                }
              })
            self.local = result;
          } else {
            self.local = {};
          }
          qCat.resolve(self.local);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      return self;
    })

    .factory('Multimarcas', function($q, FireFunc) {

      var self = this;
      self.all = {};
      self.shopping = {};
      self.locales = {};
      self.local = {};

      self.get = function() {
        var qCat = $q.defer();
        FireFunc.GetComercios('categorias/multimarcas/comercios').then(function(result){
          if(result != null) {
            self.all = result;
          } else {
            self.all = {};
          }
          qCat.resolve(self.all);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.getShopping = function(shopping) {
        var qCat = $q.defer();
        FireFunc.onValue('categorias/multimarcas/comercios/'+shopping).then(function(result){
          if(result != null) {
            self.shopping = result;
          } else {
            self.shopping = {};
          }
          qCat.resolve(self.shopping);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.getShopping2 = function(shopping) {
        var qCat = $q.defer();
        FireFunc.onValue('categorias/multimarcas/comercios/'+shopping).then(function(result){
          if(result != null) {
            // Al obertener los datos del comercio le sumamos una visita
              // Obtenemos la cantidad de visitas actuales y le sumamos uno
              var suma = result.estadisticas.visitas + 1
              firebase.database().ref('categorias/multimarcas/comercios/'+shopping+'/estadisticas').update({visitas:suma});

              var anho = new Date().getFullYear();
              var mes = new Date().getMonth() + 1;
              FireFunc.onValue('categorias/multimarcas/comercios/'+shopping+'/estadisticas/'+anho+'/'+mes).then(function(resultado){
                if(resultado == null){
                  // La primera estadistica del anho mes
                  var suma = 1;
                  firebase.database().ref('categorias/multimarcas/comercios/'+shopping+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                }else{
                  if(!resultado.hasOwnProperty(['visitas'])){
                    var suma = 1;
                    firebase.database().ref('categorias/multimarcas/comercios/'+shopping+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                  }else{
                    var suma = resultado.visitas + 1
                    firebase.database().ref('categorias/multimarcas/comercios/'+shopping+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                  }
                }
              })
            self.shopping = result;
          } else {
            self.shopping = {};
          }
          qCat.resolve(self.shopping);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.set = function(CategoriesObj) {
        return FireFunc.set('categorias/multimarcas/comercios', CategoriesObj);
      };

      self.getLocales = function(shopping) {
        var qCat = $q.defer();
        FireFunc.onValue('categorias/multimarcas/comercios/'+shopping+'/locales').then(function(result){
          if(result != null) {
            self.locales = result;
          } else {
            self.locales = {};
          }
          qCat.resolve(self.locales);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.getLocal = function(local,shopping) {
        var qCat = $q.defer();
        FireFunc.onValue('categorias/multimarcas/comercios/'+shopping+'/locales/'+local).then(function(result){
          if(result != null) {
            FireFunc.onValue('categorias/multimarcas/comercios/'+shopping).then(function(resultado){
              result.perfil.icono = resultado.perfil.icono;
              self.local = result;
            })
          } else {
            self.local = {};
          }
          qCat.resolve(self.local);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.getLocal2 = function(local,shopping) {
        var qCat = $q.defer();
        FireFunc.onValue('categorias/multimarcas/comercios/'+shopping+'/locales/'+local).then(function(result){
          if(result != null) {

            FireFunc.onValue('categorias/multimarcas/comercios/'+shopping).then(function(resultado){
              result.perfil.icono = resultado.perfil.icono;
            })
            // Al obertener los datos del comercio le sumamos una visita
              // Obtenemos la cantidad de visitas actuales y le sumamos uno
              var suma = result.estadisticas.visitas + 1
              firebase.database().ref('categorias/multimarcas/comercios/'+shopping+'/locales/'+local+'/estadisticas').update({visitas:suma});

              var anho = new Date().getFullYear();
              var mes = new Date().getMonth() + 1;
              FireFunc.onValue('categorias/multimarcas/comercios/'+shopping+'/locales/'+local+'/estadisticas/'+anho+'/'+mes).then(function(resultado){
                if(resultado == null){
                  // La primera estadistica del anho mes
                  var suma = 1;
                  firebase.database().ref('categorias/multimarcas/comercios/'+shopping+'/locales/'+local+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                }else{
                  if(!resultado.hasOwnProperty(['visitas'])){
                    var suma = 1;
                    firebase.database().ref('categorias/multimarcas/comercios/'+shopping+'/locales/'+local+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                  }else{
                    var suma = resultado.visitas + 1
                    firebase.database().ref('categorias/multimarcas/comercios/'+shopping+'/locales/'+local+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                  }
                }
              })
            self.local = result;
          } else {
            self.local = {};
          }
          qCat.resolve(self.local);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      return self;
    })

    .factory('Supermercados', function($q, FireFunc) {

      var self = this;
      self.all = {};
      self.shopping = {};
      self.locales = {};
      self.local = {};

      self.get = function() {
        var qCat = $q.defer();
        FireFunc.GetComercios('categorias/supermercados/comercios').then(function(result){
          if(result != null) {
            self.all = result;
          } else {
            self.all = {};
          }
          qCat.resolve(self.all);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.getShopping = function(shopping) {
        var qCat = $q.defer();
        FireFunc.onValue('categorias/supermercados/comercios/'+shopping).then(function(result){
          if(result != null) {
            self.shopping = result;
          } else {
            self.shopping = {};
          }
          qCat.resolve(self.shopping);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.getShopping2 = function(shopping) {
        var qCat = $q.defer();
        FireFunc.onValue('categorias/supermercados/comercios/'+shopping).then(function(result){
          if(result != null) {
            // Al obertener los datos del comercio le sumamos una visita
              // Obtenemos la cantidad de visitas actuales y le sumamos uno
              var suma = result.estadisticas.visitas + 1
              firebase.database().ref('categorias/supermercados/comercios/'+shopping+'/estadisticas').update({visitas:suma});

              var anho = new Date().getFullYear();
              var mes = new Date().getMonth() + 1;
              FireFunc.onValue('categorias/supermercados/comercios/'+shopping+'/estadisticas/'+anho+'/'+mes).then(function(resultado){
                if(resultado == null){
                  // La primera estadistica del anho mes
                  var suma = 1;
                  firebase.database().ref('categorias/supermercados/comercios/'+shopping+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                }else{
                  if(!resultado.hasOwnProperty(['visitas'])){
                    var suma = 1;
                    firebase.database().ref('categorias/supermercados/comercios/'+shopping+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                  }else{
                    var suma = resultado.visitas + 1
                    firebase.database().ref('categorias/supermercados/comercios/'+shopping+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                  }
                }
              })
            self.shopping = result;
          } else {
            self.shopping = {};
          }
          qCat.resolve(self.shopping);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.set = function(CategoriesObj) {
        return FireFunc.set('categorias/supermercados/comercios', CategoriesObj);
      };

      self.getLocales = function(shopping) {
        var qCat = $q.defer();
        FireFunc.onValue('categorias/supermercados/comercios/'+shopping+'/locales').then(function(result){
          if(result != null) {
            self.locales = result;
          } else {
            self.locales = {};
          }
          qCat.resolve(self.locales);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.getLocal2 = function(local,shopping) {
        var qCat = $q.defer();
        FireFunc.onValue('categorias/supermercados/comercios/'+shopping+'/locales/'+local).then(function(result){
          if(result != null) {

            FireFunc.onValue('categorias/supermercados/comercios/'+shopping).then(function(resultado){
              result.perfil.icono = resultado.perfil.icono;
            })
            // Al obertener los datos del comercio le sumamos una visita
              // Obtenemos la cantidad de visitas actuales y le sumamos uno
              var suma = result.estadisticas.visitas + 1
              firebase.database().ref('categorias/supermercados/comercios/'+shopping+'/locales/'+local+'/estadisticas').update({visitas:suma});

              var anho = new Date().getFullYear();
              var mes = new Date().getMonth() + 1;
              FireFunc.onValue('categorias/supermercados/comercios/'+shopping+'/locales/'+local+'/estadisticas/'+anho+'/'+mes).then(function(resultado){
                if(resultado == null){
                  // La primera estadistica del anho mes
                  var suma = 1;
                  firebase.database().ref('categorias/supermercados/comercios/'+shopping+'/locales/'+local+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                }else{
                  if(!resultado.hasOwnProperty(['visitas'])){
                    var suma = 1;
                    firebase.database().ref('categorias/supermercados/comercios/'+shopping+'/locales/'+local+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                  }else{
                    var suma = resultado.visitas + 1
                    firebase.database().ref('categorias/supermercados/comercios/'+shopping+'/locales/'+local+'/estadisticas/'+anho+'/'+mes).update({visitas:suma});
                  }
                }
              })
            self.local = result;
          } else {
            self.local = {};
          }
          qCat.resolve(self.local);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.getLocal = function(local,shopping) {
        var qCat = $q.defer();
        FireFunc.onValue('categorias/supermercados/comercios/'+shopping+'/locales/'+local).then(function(result){
          if(result != null) {
            FireFunc.onValue('categorias/supermercados/comercios/'+shopping).then(function(resultado){
              result.perfil.icono = resultado.perfil.icono;
              self.local = result;
            })
          } else {
            self.local = {};
          }
          qCat.resolve(self.local);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      return self;
    })

    .factory('Sponsor', function($q, FireFunc) {

      var self = this;
      self.listado = {};

      self.get = function() {
        var qCat = $q.defer();
        const numberOfUsers = 5;
        const randomIndex = Math.floor(Math.random() * numberOfUsers);
        //console.log(randomIndex);
        FireFunc.onValue('sponsors/').then(function(result){
          if(result != null) {
            self.listado = result;
          } else {
            self.listado = {};
          }
          qCat.resolve(self.listado);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.sumarClicks = function(key) {
        FireFunc.onValue('sponsors/'+key).then(function(result){
          if(result != null) {
            // Al obertener los datos del comercio le sumamos una visita
              // Obtenemos la cantidad de visitas actuales y le sumamos uno
              if(!result.hasOwnProperty(['clicks'])){
                var suma = 1;
                firebase.database().ref('sponsors/'+key).update({clicks:suma});
              }else{
                var suma = result.clicks + 1;
                firebase.database().ref('sponsors/'+key).update({clicks:suma});
              }
          }
        })
      };



      return self;
    })

    .factory('Destacados', function($q, FireFunc) {

      var self = this;
      self.listado = {};

      self.get = function() {
        var qCat = $q.defer();
        FireFunc.onValue2('destacados/',7).then(function(result){
          if(result != null) {
            self.listado = result;
          } else {
            self.listado = {};
          }
          qCat.resolve(self.listado);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.sumarClicks = function(key) {
        FireFunc.onValue('destacados/'+key).then(function(result){
          //console.log(result);
          if(result != null) {
            // Al obertener los datos del comercio le sumamos una visita
              // Obtenemos la cantidad de visitas actuales y le sumamos uno
              if(!result.hasOwnProperty(['clicks'])){
                var suma = 1;
                firebase.database().ref('destacados/'+key).update({clicks:suma});
              }else{
                var suma = result.clicks + 1;
                firebase.database().ref('destacados/'+key).update({clicks:suma});
              }
          }
        })
      };

      return self;
    })

    .factory('LocalesAdheridos', function($q, FireFunc, Auth) {

      var self = this;
          self.locales = {};
          self.ListaChecks = {};
          self.puntos = {};
          self.cupones = {};
          self.beneficio = false;

      self.puntosShopping = function() {
        var qCat = $q.defer();
        FireFunc.puntosShopping('categorias/centros_comerciales/comercios/','/perfil/puntos/').then(function(result){
          ////console.log(result);
          if(result != null) {
            self.locales = result;
          } else {
            self.locales = {};
          }
          qCat.resolve(self.locales);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.puntosMultimarcas = function() {
        var qCat = $q.defer();
        FireFunc.puntosMultimarcas('categorias/multimarcas/comercios/','/perfil/puntos/').then(function(result){
          ////console.log(result);
          if(result != null) {
            self.locales = result;
          } else {
            self.locales = {};
          }
          qCat.resolve(self.locales);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };


      // SET
      self.Sugerir = function(item) {
        ////console.log(item);
        if(item.comercios.perfil.hasOwnProperty(['sugeridos'])){
          var post ={
              sugeridos: item.comercios.perfil.sugeridos + 1,
          }
        }else{
          var post ={
              sugeridos: 1,
          }
        }
        if(item.categoria == 'multimarcas'){
          return firebase.database().ref('categorias/multimarcas/comercios/'+item.multimarca+'/locales/'+item.slug+'/perfil').update(post);
        }else{
          return firebase.database().ref('categorias/centros_comerciales/comercios/'+item.slug+'/perfil').update(post);
        }

      };

      self.Cupones = function() {
        var qCat = $q.defer();
        var uid = Auth.AuthData.uid;
        FireFunc.onValue('users/' + uid + '/cupones').then(function(result){
          ////console.log(result);
          if(result != null) {
            self.cupones = result;
          } else {
            self.cupones = {};
          }
          qCat.resolve(self.cupones);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.canjear = function(item, key) {
        //Primero le mostramos los beneficios que tiene disponible para que pueda elegir

        // Obtenemos la lista de sus checks, con HasOwnPrperty verificamos si est ane la lista el comercio para hacer un UPDATE,
        // caso contrario hacemos un SET
        if(Auth.AuthData.hasOwnProperty('uid')){
          var uid = Auth.AuthData.uid;
          var timeNow = new Date().getTime()
          var post ={
              beneficio: item.detalle_beneficio[key],
              icono: item.icono,
              lugar: item.nombre,
              time_generado: timeNow
          }
          // Primero agregamos el cupon generado con los datos del comercio
          return firebase.database().ref('users/' + uid + '/cupones').push().set(post).then(
                  // Si la operacion fue exitosa procedemos a setear en 0 los puntos y colocamos false en beneficios
                  function(success){
                    var puntos2 =  (item.puntos - item.puntos_beneficio[key]); 
                    if(puntos2 == 0){
                      // le quedan 0 puntos procedemos a eliminar los puntos del checkin
                      return FireFunc.remove('users/' + uid + '/checks/' + item.key );
                    }else{
                      item.detalle_beneficio.splice(key, 1);
                      item.puntos_beneficio.splice(key, 1);

                      //Chequeamos si sigue teniendo beneficios
                      if(item.categoria == 'multimarcas'){
                        var childRef = 'categorias/multimarcas/comercios/'+item.comercio+'/locales/'+item.slug;
                      }else if(item.categoria == 'supermercados'){
                        var childRef = 'categorias/supermercados/comercios/'+item.comercio+'/locales/'+item.slug;
                      }else{
                        var childRef = 'categorias/centros_comerciales/comercios/'+item.slug;
                      }
                      self.beneficio = false;
                      self.detalle_beneficio = [];
                      self.puntos_beneficio = [];
                      //console.log(childRef);
                      FireFunc.GetValue(childRef,'/beneficios/').then(function(result) {
                        //console.log(result);
                        angular.forEach(result.beneficios,function (detalles,key) {
                          if(detalles.puntos <= puntos2){
                            self.beneficio = true;
                            self.detalle_beneficio.push(detalles.beneficios);
                            self.puntos_beneficio.push(detalles.puntos);
                          }
                        });
                        
                        var post ={
                            puntos: puntos2,
                            beneficios: self.beneficio,
                            puntos_beneficio: self.puntos_beneficio,
                            detalle_beneficio: self.detalle_beneficio
                        }
                        return firebase.database().ref('users/' + uid + '/checks/' + item.key ).update(post);
                      });
                    }
                  })

        }
      };

      self.Checks = function() {
        var qCat = $q.defer();
        var uid = Auth.AuthData.uid;
        FireFunc.onValue('users/' + uid + '/checks').then(function(result){
          ////console.log(result);
          if(result != null) {
            self.puntos = result;
          } else {
            self.puntos = {};
          }
          qCat.resolve(self.puntos);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      // REMOVE
      self.eliminarCupon = function(key) {
        var uid = Auth.AuthData.uid;
        var childRef = 'users/' + uid + '/cupones/' + key;
        return FireFunc.remove(childRef);
      };

      self.checkin = function(item) {
        self.beneficio = false;
        self.detalle_beneficio = [];
        self.puntos_beneficio = [];
        self.key_beneficio = '';
        var timeNow = new Date().getTime();
        // Obtenemos la lista de sus checks, con HasOwnPrperty verificamos si est ane la lista el comercio para hacer un UPDATE,
        // caso contrario hacemos un SET
        if(Auth.AuthData.hasOwnProperty('uid')){
          var uid = Auth.AuthData.uid;
          var childRef = 'users/' + uid + '/checks';
          FireFunc.onValue(childRef).then(function(result) {
              if(result != null) {
                self.ListaChecks =  result;
                // Ya tenemos la lista de checks realizadas por el usuario, ahora verificamos si ya existe el comercio
                var check_realizado = false;
                var listado = [];
                var listado = self.ListaChecks;
                angular.forEach(listado,function (detalles,key) {
                  var llave = key;
                  if(detalles.categoria == item.categoria && detalles.slug == item.slug){
                    //Chequeamos si tiene beneficios el local
                    if(item.categoria == 'multimarcas'){
                      var childRef = 'categorias/multimarcas/comercios/'+item.multimarca+'/locales/'+item.slug;
                      var comercio2 = item.multimarca;
                    }else if(item.categoria == 'centros_comerciales'){
                      var childRef = 'categorias/centros_comerciales/comercios/'+item.slug;
                      var comercio2 = '';
                    }else{
                      var childRef = 'categorias/supermercados/comercios/'+item.supermercado+'/locales/'+item.slug;
                      var comercio2 = item.multimarca;
                    }
                    var suma  = detalles.puntos + 1;
                    ////console.log(childRef);
                    FireFunc.GetValue(childRef,'/beneficios/').then(function(result) {
                      // Recorremos los beneficios que tiene el comercio
                      angular.forEach(result.beneficios,function (detalles,key) {
                        if(detalles.puntos <= suma){
                          // Si el comercio tiene beneficios con puntos menores o iguales a la suma, se debe agregar al cupon
                          self.beneficio = true;
                          self.detalle_beneficio.push(detalles.beneficios);
                          self.puntos_beneficio.push(detalles.puntos);
                          self.key_beneficio = key;
                          //console.log("Ya tiene beneficios", detalles.beneficios);
                        }
                      });
                      ////console.log(self.detalle_beneficio);
                      var post ={
                          puntos: suma,
                          beneficios: self.beneficio,
                          detalle_beneficio: self.detalle_beneficio,
                          puntos_beneficio: self.puntos_beneficio,
                          last_check :timeNow,
                          key_beneficio:self.key_beneficio,
                          comercio : comercio2
                      }
                      check_realizado = true;
                      return firebase.database().ref('users/' + uid + '/checks/'+llave).update(post).then(
                            function(success){
                              //console.log("Funciono");
                            }, function(error){
                              //console.log("No Funciono");
                            });
                    },
                    function(error){
                        //console.log("ERROR");
                        //console.log(error);
                    })
                  }else{
                    check_realizado = false;
                  }
                });
                $q.all(check_realizado).then(function(){
                  ////console.log("Deleted all test users");
                  if(!check_realizado){
                    ////console.log("Agrega uno nuevo");
                    // No esta en la lista
                    var post ={
                        categoria: item.categoria,
                        slug: item.slug,
                        icono: item.comercios.perfil.icono,
                        nombre: item.comercios.perfil.nombre,
                        puntos: +1,
                        last_check : timeNow
                    }
                    return firebase.database().ref('users/' + uid + '/checks/').push().set(post).then(
                            function(success){
                              //console.log("Funciono");
                            }, function(error){
                              //console.log("No Funciono");
                            })
                  }      
                })
              }else{
                // No tiene checks, vamos a hacer set para agregar uno nuevo
                    var post ={
                        categoria: item.categoria,
                        slug: item.slug,
                        icono: item.comercios.perfil.icono,
                        nombre: item.comercios.perfil.nombre,
                        puntos: +1
                    }
                    return firebase.database().ref('users/' + uid + '/checks/').push().set(post).then(
                            function(success){
                              return success;
                            })
              }
          }); 

        }
      };

      return self;
    })

    .factory('Visitas', function($q, FireFunc) {

      var self = this;
          self.shoppings = {};
          self.multimarcas = {};
          self.supermercados = {};

      self.getShoppings = function() {
        self.shoppings = {};
        var qCat = $q.defer();
        FireFunc.onValueSort('categorias/centros_comerciales/comercios/','-/estadisticas/visitas/', 5).then(function(result){
          ////console.log(result);
          if(result != null) {
            self.shoppings = result;
          } else {
            self.shoppings = {};
          }
          qCat.resolve(self.shoppings);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.getMultitiendas = function() {
        self.multimarcas = {};
        var qCat = $q.defer();
        FireFunc.onValueSort('categorias/multimarcas/comercios/','/estadisticas/visitas/', 5).then(function(result){
          ////console.log(result);
          if(result != null) {
            self.multimarcas = result;
          } else {
            self.multimarcas = {};
          }
          qCat.resolve(self.multimarcas);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      self.getSupermercados = function() {
        self.supermercados = {};
        var qCat = $q.defer();
        FireFunc.onValueSort('categorias/supermercados/comercios/','/estadisticas/visitas/', 5).then(function(result){
          ////console.log(result);
          if(result != null) {
            self.supermercados = result;
          } else {
            self.supermercados = {};
          }
          qCat.resolve(self.supermercados);
        },
        function(error){
          qCat.reject(error);
        })
        return qCat.promise;
      };

      return self;
    })

    /*
    * Favoritos
    */
    .factory('Favoritos', function($q, CentrosComerciales, Utils, Codes, FireFunc) {
      var self = this;

      self.CachedList = {};
      self.CachedMeta = {};

      // LOAD
      // Generic wrapper to load the list
      // Prevents duplicate loading
      self.load = function(AuthData) {

        // reset if authdata unauth
        if(!AuthData.hasOwnProperty('uid')) {
          self.CachedList = {};
          self.CachedMeta = {};
        };

        var qLoad = $q.defer();
        if(Object.keys(self.CachedList).length > 0) {
          qLoad.resolve(self.CachedList);
        } else {
          if(AuthData.hasOwnProperty('uid')){
            self.getList(AuthData.uid).then(
              function(WalletList){
                //console.log("Favoritos ",self.CachedList);
                qLoad.resolve(self.CachedList);
              },
              function(error){
                //////console.log(error);
                qLoad.reject(error);
              })
          } else {
            qLoad.reject('WALLET_UNAUTH');
          }
        }
        return qLoad.promise;
      };


      // SET
      self.save = function(uid, productId, categoria, comercio) {
        // Guardamos el favorito en la estadistica de la empresa
        //console.log(comercio);
        var posteo ={
            fav: true,
        }

        switch (categoria) {
          case '':
            firebase.database().ref('categorias/' + categoria + '/comercios/' + productId +'/estadisticas/favoritos/'+uid).update(posteo);
            break
          case 'centros_comerciales_local':
            firebase.database().ref('categorias/centros_comerciales/comercios/' + comercio + '/locales/' + productId +'/estadisticas/favoritos/'+uid).update(posteo);
            break
          case 'multimarcas_local':
            firebase.database().ref('categorias/multimarcas/comercios/' + comercio + '/locales/' + productId +'/estadisticas/favoritos/'+uid).update(posteo);
            break
          case 'supermercados_local':
            firebase.database().ref('categorias/supermercados/comercios/' + comercio + '/locales/' + productId +'/estadisticas/favoritos/'+uid).update(posteo);
            break
        }
        var post ={
            categoria: categoria,
            slug: productId,
            comercio: comercio || ''
        }
        //console.log(post);
        return firebase.database().ref('users/' + uid + '/favoritos/' + productId).set(post);
      };

      // REMOVE
      self.remove = function(uid, productId, categoria, comercio) {
        // Guardamos el favorito en la estadistica de la empresa
        var posteo ={
            fav: false,
        }
        switch (categoria) {
          case '':
            firebase.database().ref('categorias/' + categoria + '/comercios/' + productId +'/estadisticas/favoritos/'+uid).update(posteo);
            break
          case 'centros_comerciales_local':
            firebase.database().ref('categorias/centros_comerciales/comercios/' + comercio + '/locales/' + productId +'/estadisticas/favoritos/'+uid).update(posteo);
            break
          case 'multimarcas_local':
            firebase.database().ref('categorias/multimarcas/comercios/' + comercio + '/locales/' + productId +'/estadisticas/favoritos/'+uid).update(posteo);
            break
          case 'supermercados_local':
            firebase.database().ref('categorias/supermercados/comercios/' + comercio + '/locales/' + productId +'/estadisticas/favoritos/'+uid).update(posteo);
            break
        }

        var childRef = 'users/' + uid + '/favoritos/' + productId;
        return FireFunc.remove(childRef);
      };

      // PRESS
      // handles the logic when the wallet button is pressed
      var tempPressed = false; // prevents multiple actions at once
      self.buttonPressed = function(AuthData, productId, categoria, comercio) {
        var qPress = $q.defer();

        if(AuthData.hasOwnProperty('uid') && !tempPressed) {
          tempPressed = true;

          if(!self.CachedList[productId]){ // add
            //console.log("Agrega fav");

            self.save(AuthData.uid, productId, categoria,comercio).then(
              function(success){
                //console.log(success);
                self.CachedList[productId] = true;
                tempPressed = false;
                qPress.resolve(self.CachedList);
              },
              function(error){
                //console.log(error);
                tempPressed = false;
                qPress.reject();
              }
            )

          } else { // remove
            //console.log("Elimina fav");

            self.remove(AuthData.uid, productId, categoria, comercio).then(
              function(success){
                //console.log(success);
                self.CachedList[productId] = false;
                tempPressed = false;
                qPress.resolve(self.CachedList);
              },
              function(error){
                //console.log(error);
                tempPressed = false;
                qPress.reject();
              }
            )

          } // end if

        } // end auth and tempPressed
        else {
          //console.log("Error");
          qPress.resolve(self.CachedList)
        }
        return qPress.promise;
      };


      // ---------------------------------------------------------------------------

      // GET  wallet/$uid
      // v3
      self.getList = function(uid) {
        var qGet = $q.defer();
        var childRef = 'users/' + uid + '/favoritos';
        FireFunc.onValue(childRef).then(function(WalletList) {
            if(WalletList != null) {
              self.CachedList =  WalletList;
              qGet.resolve(WalletList);
            } else {
              qGet.reject(null);
            } // walletlist null
        }, function (error) {
            qGet.reject(error);
        }); // walletlist error
        return FireFunc.onValue(childRef);
      };

      // GET  wallet/$uid
      // FILL products_meta/$productId
      // v3
      self.getProductsMeta = function(uid) {
        var qGet = $q.defer();
        var childRef = "wallet/" + uid;
        FireFunc.onValue(childRef).then(function(WalletList) {
            if(WalletList != null) {
              Products.getProductMetaFromList(WalletList).then(
                function(ProductsMeta){
                  if(ProductsMeta != null) {
                      self.CachedMeta =  ProductsMeta;
                      qGet.resolve(ProductsMeta);
                  } else {
                    qGet.reject(null);
                  } // productsmeta null
                },
                function(error){
                  qGet.reject(error);
                }
              ) // products meta error
            } else {
              qGet.reject(null);
            } // walletlist null
        }, function (error) {
            qGet.reject(error);
        }); // walletlist error
        return qGet.promise;
      };




      return self;
    })

    /*
    * Buscador
    */
    .factory('Buscador', function($q, CentrosComerciales, Utils, Codes, FireFunc) {
      var self = this;
          self.CentrosComerciales = {};
          self.Multimarcas = {};
          self.Supermercados = {};
          self.MultimarcasSucursales = {};

      // ---------------------------------------------------------------------------

      // GET  wallet/$uid
      // v3
      self.GetComercios = function() {
        var qGet = $q.defer();
        var childRef = 'categorias/centros_comerciales/comercios';
        FireFunc.GetComercios(childRef).then(function(Comercios) {
              self.CentrosComerciales =  Comercios;
              ////console.log(Comercios);
              qGet.resolve(Comercios);
        }, function (error) {
            qGet.reject(error);
        }); // walletlist error
        return FireFunc.onValue(childRef);
      };
      self.GetMultimarcas = function() {
        var qGet = $q.defer();
        var childRef = 'categorias/multimarcas/comercios';
        FireFunc.GetComercios(childRef).then(function(Comercios) {
              self.Multimarcas =  Comercios;
              ////console.log(Comercios);
              qGet.resolve(Comercios);
        }, function (error) {
            qGet.reject(error);
        }); // walletlist error
        return FireFunc.onValue(childRef);
      };
      self.GetSupermercados = function() {
        var qGet = $q.defer();
        var childRef = 'categorias/supermercados/comercios';
        FireFunc.GetComercios(childRef).then(function(Comercios) {
              self.Supermercados =  Comercios;
              ////console.log(Comercios);
              qGet.resolve(Comercios);
        }, function (error) {
            qGet.reject(error);
        }); // walletlist error
        return FireFunc.onValue(childRef);
      };
      self.GetMultimarcas_Sucursales = function() {
        var qGet = $q.defer();
        var childRef = 'categorias/multimarcas/comercios';
        var sortNode = '/locales/';
        FireFunc.onValue3(childRef,sortNode).then(function(Comercios) {
              self.MultimarcasSucursales =  Comercios;
              //console.log(Comercios);
              qGet.resolve(Comercios);
        }, function (error) {
            qGet.reject(error);
        }); // walletlist error
        return FireFunc.onValue3(childRef,sortNode);
      };

      return self;
    })
    
    /*
    * Mapa Promociones
    */
    .factory('MapaPromociones', function($q, FireFunc) {
      var self = this;
          self.Shoppings = {};
          self.Multimarcas = {};
          self.Supermercados = {};

      // ---------------------------------------------------------------------------

      // GET  wallet/$uid
      // v3
      self.GetShoppings = function() {
        var qGet = $q.defer();
        var childRef = 'categorias/centros_comerciales/comercios';
        FireFunc.GetComercios(childRef).then(function(Comercios) {
              self.Shoppings =  Comercios;
              qGet.resolve(Comercios);
        }, function (error) {
            qGet.reject(error);
        }); // walletlist error
        return FireFunc.onValue(childRef);
      };

      self.GetMultimarcas = function() {
        var qGet = $q.defer();
        var childRef = 'categorias/multimarcas/comercios';
        FireFunc.GetComercios(childRef).then(function(Comercios) {
              self.Multimarcas =  Comercios;
              qGet.resolve(Comercios);
        }, function (error) {
            qGet.reject(error);
        }); // walletlist error
        return FireFunc.onValue(childRef);
      };

      self.GetSupermercados = function() {
        var qGet = $q.defer();
        var childRef = 'categorias/supermercados/comercios';
        FireFunc.GetComercios(childRef).then(function(Comercios) {
              self.Supermercados =  Comercios;
              qGet.resolve(Comercios);
        }, function (error) {
            qGet.reject(error);
        }); // walletlist error
        return FireFunc.onValue(childRef);
      };


      return self;
    })


    .service('IonicClosePopupService', [
        function () {
            var currentPopup;
            var htmlEl = angular.element(document.querySelector('html'));
            htmlEl.on('click', function (event) {
                if (event.target.nodeName === 'HTML') {
                    if (currentPopup) {
                        currentPopup.close();
                    }
                }
            });

            this.register = function (popup) {
                currentPopup = popup;
            }
        }
    ])
    

    /*
    * Mapa Promociones
    */
    .factory('Notificaciones', function($q, FireFunc) {
      var self = this;
          self.Shoppings = {};

      // ---------------------------------------------------------------------------

      // GET  wallet/$uid
      // v3
      self.UpdateNotificaciones = function(uid, notificacion) {
        var post ={
            estado: 'vigente',
        }
        ////console.log(post);
        return firebase.database().ref('users/' + uid + '/notificaciones/' + notificacion).update(post);
      };


      return self;
    });