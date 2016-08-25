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
          if(config.method=='GET') {
            var separator = config.url.indexOf('?') === -1 ? '?' : '&';
            config.url = config.url+separator+'noCache=' + new Date().getTime();
          }
          return config;
        }
      };
    })
  //Http Interceptor to check auth failures for XHR requests
  .config(['$httpProvider',
    function($httpProvider) {
      $httpProvider.interceptors.push('httpInterceptor');
      $httpProvider.interceptors.push('noCacheInterceptor');
    }
  ]);
