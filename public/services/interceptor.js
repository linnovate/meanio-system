'use strict';

angular.module('mean-factory-interceptor', ['ngCookies'])
  .factory('httpInterceptor', ['$q', '$location', '$meanConfig', '$cookies',
    function($q, $location, $meanConfig, $cookies) {

      return {
        'response': function(response) {

          if (response.status === 401) {
            //console.log('response 401', response);
            //console.log('redirecting to loginPage', $meanConfig.loginPage);
            $location.url($meanConfig.loginPage);
            return $q.reject(response);
          }
          return response || $q.when(response);
        },

        'responseError': function(rejection) {

          if (rejection.status === 401) {
            console.log('responseError 401', rejection);

            // This is to set the cookie so that we can redirect back to the proper urL

            if(rejection.config.url !== '/api/login') {

              //console.log('droppin cookies for login redirect', $location.path());
              $cookies.put('redirect', $location.path());
              //console.log('redirecting to loginPage', $meanConfig.loginPage);

            } else {
              $location.url($meanConfig.loginPage);
            }


            return $q.reject(rejection);

          }
          return $q.reject(rejection);
        }

      };
    }
  ]).factory('noCacheInterceptor', function () {
      return {
        request: function (config) {
          // Don't cache GET reqs to /api/*, fix for IE
          if(config.method=='GET' && config.url.match(/api\//)) {
            var separator = config.url.indexOf('?') === -1 ? '?' : '&';
            config.url = config.url+separator+'noCache=' + new Date().getTime();
          }
          return config;
        }
      };
    }).factory('exceptionHandler', ['$injector', '$log', '$window', function($injector, $log, $window) {
        return function($delegate) {
          return function (exception, cause) {
          // Lazy load to avoid circular dependency
          var $http = $injector.get('$http');

          try {
            var errorMessage = exception.toString();
            StackTrace.fromError(exception).then(function(stackframes) {
              var stringifiedStack = stackframes.map(function(sf) { 
                return sf.toString();
              }).join(' \n');

              $http.post('/api/errors/clientside', 
              {
                errorUrl: $window.location.href,
                errorMessage: errorMessage,
                stackTrace: stringifiedStack,
                cause: ( cause || '' )
              }).then(function(response) {
              //...
              }, function(err) {
              //...
              });
            });
          } catch ( loggingError ) {
            // for Developers - log the log-failure.
            $log.warn( "Error logging failed" );
            $log.log( loggingError );
          }

          // Pass through to original handler
          $delegate(exception, cause);

          };
        };
      }])

  //Http Interceptor to check auth failures for XHR requests
  .config(['$httpProvider', '$provide',
    function($httpProvider, $provide) {
      $httpProvider.interceptors.push('httpInterceptor');
      $httpProvider.interceptors.push('noCacheInterceptor');
      $provide.decorator('$exceptionHandler', ['$delegate', 'exceptionHandlerFactory', function ($delegate, exceptionHandlerFactory) {
        return exceptionHandlerFactory($delegate);
      }]);
    }
  ]);
