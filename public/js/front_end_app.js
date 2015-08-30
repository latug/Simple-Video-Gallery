var vidGal = angular.module('vidGal', ['ngRoute']);

// Configure router.
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

// Setup calls to the back end.
vidGal.factory('api',['$http', function($http){

  var api = {};

  api.listGallery = function()
  {
    return $http.get('/listGallery');
  };

  api.listSeasons = function(show){
    return $http.get('/listSeasons/' + show);
  };

  api.listEpisodes = function(show, season)
  {
    return $http.get('/listEpisodes/' + show + '/' + season);
  };

  return api;
}]);

// Controller for the gallery page
vidGal.controller('galleryCtrl', ['$scope', 'api', function($scope, api){
  api.listGallery().then(function(res){
    $scope.shows = res.data;
  });
}]);

// Controller for the video page.
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
        if(videos.length >= 2)
        {
          $scope.showNxtPrev = true;
        }
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

  $scope.selectedSeason = function($event)
  {
    $scope.showSeason = angular.element($event.currentTarget).attr('id');
    api.listEpisodes(
                      $routeParams.show,
                      angular.element($event.currentTarget).attr('id')
                    )
    .then(function(res){
        if($routeParams.show == res.data.show && angular.element($event.currentTarget).attr('id') == res.data.season)
        {
            videos = res.data.vids;
            pos = 0;
            if(videos.length >= 2)
            {
              $scope.showNxtPrev = true;
            }

            if(angular.element('#screen').html() !== "")
            {
              destroyPlayer();
              drawPlayer(videos, pos);
            }
            else
            {
              drawPlayer(videos, pos);
            }
        }
    });
  };

}]);
