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
  var vid = '';
  var pos = 0;
  $scope.title = $routeParams.show;

  api.listSeasons($routeParams.show).then(function(res){
    if($routeParams.show == res.data.show)
    {
      $scope.seasons = res.data.seasons;
      if(res.data.vids.length > 0){
        videos = res.data.vids;
        drawPlayer(videos, pos);
      }
    }
  });

  function drawPlayer(videos, pos)
  {
    vid = '<object classid="clsid:67DABFBF-D0AB-41fa-9C46-CC0F21721616" width="100%" height="720" codebase="http://go.divx.com/plugin/DivXBrowserPlugin.cab">';
    vid = vid + '<param name="custommode" value="none" />';
    vid = vid + '<param name="previewImage" value="" />';
    vid = vid + '<param name="autoPlay" value="false" />';
    vid = vid + '<param name="src" value="'+ videos[pos] +'" />';
    vid = vid + '<embed type="video/divx" src="'+ videos[pos] +'" custommode="none" width="100%" height="720" autoPlay="false" previewImage="" pluginspage="http://go.divx.com/plugin/download/">';
    vid = vid + '</embed>';
    vid = vid + '</object>';
    angular.element('#screen').append(vid);
  }

  function destroyPlayer()
  {
    angular.element('#screen').html('');
  }

  $scope.nextVid = function()
  {
    destroyPlayer();

    pos += 1;
    if(pos > videos.length - 1)
    {
      pos = 0;
    }

    drawPlayer(videos, pos);
  };

  $scope.prevVid = function()
  {
    destroyPlayer();

    pos -= 1;
    if(pos < 0)
    {
      pos = videos.length - 1;
    }

    drawPlayer(videos, pos);
  };

}]);
