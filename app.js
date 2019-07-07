(function () {
  'use strict';

  angular.module('NarrowItDownApp', [])
  .controller('NarrowItDownController', NarrowItDownController)
  .service('MenuSearchService', MenuSearchService)
  .directive('foundItems', FoundItems)
  .constant('ApiBaseUrl', 'https://davids-restaurant.herokuapp.com');

  NarrowItDownController.$inject = ['MenuSearchService'];
  function NarrowItDownController (MenuSearchService) {
    var menu = this;

    menu.narrowDown = function() {
      if (menu.searchTerm === "" || menu.searchTerm === undefined) {
        menu.found = [];
        return;
      }

      var dataFiltered = MenuSearchService.getMatchedMenuItems(menu.searchTerm)

      if (dataFiltered.then) {
        dataFiltered.then(function (response) {
            menu.found = response;
          })
      } else {
        menu.found = dataFiltered;
      }
    }

    menu.onRemove = function (index) {
        MenuSearchService.onRemove(index.index);
    }
  }

  function FoundItems () {
    var ddo = {
      restrict: 'E',
      templateUrl: 'shoppingList.html',
      scope: {
        found: '<foundItems',
        onRemove: '&'
      },
      controller: NarrowItDownController,
      controllerAs: 'directiveController',
      link: NothingFound
    }

    return ddo;
  }

  function NothingFound(scope, element, attrs, controller) {
    scope.$watch('found', function (newValue, oldValue) {
      if(newValue && !newValue.length) {
        element.find('div').css('display', 'block');
      } else {
        element.find('div').css('display', 'none');
      }
    });
  }

  MenuSearchService.$inject = ['$http', 'ApiBaseUrl'];
  function MenuSearchService ($http, ApiBaseUrl) {
    var service = this;
    var data = [];
    var foundItems = [];

    service.getMatchedMenuItems = function (searchTerm) {
        return $http({
          method: "GET",
          url: (ApiBaseUrl + '/menu_items.json')
        }).then(function(response) {
          data = response.data.menu_items;
          return filterList(searchTerm);
        });      
    }

    function filterList(searchTerm) {
      foundItems = [];

      for(var i = 0; i < data.length; i++) {
        var row = data[i];

        if (row.description.toLowerCase().search(searchTerm.toLowerCase()) !== - 1) {
          foundItems.push(row);
        }
      }

      return foundItems;
    }

    service.onRemove = function (index) {
      foundItems.splice(index, 1);
    }
  }
})();