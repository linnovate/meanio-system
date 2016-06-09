'use strict';

angular.module('mean-factory-interceptor', [])
  .factory('httpInterceptor', ['$q', '$location', '$meanConfig', '$cookies',
    function($q, $location, $meanConfig, $cookies) {

      return {
        'response': function(response) {

          if (response.status === 401) {
            $location.url($meanConfig.loginPage);
            return $q.reject(response);
          }
          return response || $q.when(response);
        },

        'responseError': function(rejection) {

          if (rejection.status === 401) {

            // This is to set the cookie so that we can redirect back to the proper urL
            $cookies.put('redirect', $location.path());

            $location.url($meanConfig.loginPage);

            return $q.reject(rejection);

          }
          return $q.reject(rejection);
        }

      };
    }
  ])
  //Http Interceptor to check auth failures for XHR requests
  .config(['$httpProvider',
    function($httpProvider) {
      $httpProvider.interceptors.push('httpInterceptor');
    }
  ]);
