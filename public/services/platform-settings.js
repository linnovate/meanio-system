angular.module('mean.platformsettings').factory('PlatformSetting', ['$rootScope',
  function($rootScope) {

      function getPlatformSettings() {
        this.platformSettings = {};

        var self = this;

        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            self.platformSettings = JSON.parse(xmlhttp.responseText);
            $rootScope.platformSettings = self.platformSettings;
          }
        }

        xmlhttp.open("GET", "/api/platformsettings", false);
        xmlhttp.send();

        this.$get = function() {
          $rootScope.platformSettings = this.platformSettings;
          return this.platformSettings;
        };

    }

    return new getPlatformSettings();
  }
]);
