var vidGal = angular.module('vidGal', ['ngRoute']);

vidGal.config(function($routeProvider){
  $routeProvider
    .when('/gallery',{
      controller: 'galleryCtrl',
      templateUrl: '/pages/gallery.html'
    })
    .when('/show/:show',{
      controller: 'showCtrl',
      templateUrl: '/pages/show.html'
    })
    .otherwise({
      redirectTo: '/gallery'
    });
});

vidGal.factory('api',['$http', function($http){

  var api = {};

  api.listGallery = function()
  {
    return $http.get('/listGallery');
  };

  api.listSeasons = function(show){
    return $http.get('/listSeasons/' + show);
  };

  return api;
}]);

vidGal.controller('galleryCtrl', ['$scope', 'api', function($scope, api){
  api.listGallery().then(function(res){
    $scope.shows = res.data;
  });
}]);

vidGal.controller('showCtrl', ['$scope', 'api', '$routeParams', function($scope, api, $routeParams){
  var videos = [];
  api.listSeasons($routeParams.show).then(function(res){
    if($routeParams.show == res.data.show)
    {
      $scope.seasons = res.data.seasons;
      videos = res.data.vids;
      $scope.vid = videos[0];
      console.log(videos);
      console.log($scope.vid);
    }
  });
  $scope.title = $routeParams.show;

}]);
