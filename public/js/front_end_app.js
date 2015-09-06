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
  var vlc = document.getElementById('vlc'); // this method must be used because of the VLC javascript API.
  var subtitleTrack = 0;
  var audioTrack = 1;
  
  $scope.title = $routeParams.show;
  $scope.episodes = [];
  $scope.subs = [];
  $scope.audio = [];
  
  vlc.addEventListener('MediaPlayerPlaying', whenOpening, false);
  
  function whenOpening()
  {
    if(vlc.subtitle.count > 0)
    {
      vlc.subtitle.track = subtitleTrack;
      buildSubtitleMenu();
    }
    
    if(vlc.audio.count > 1)
    {
      vlc.audio.track = audioTrack;
      buildAudioMenu();
    }
    
  }
  
  function clearList()
  {
    var result = false;
    jQuery.when(vlc.playlist.items.clear()).done(function(){
      if(vlc.playlist.items.count == 0)
      {
        result =  true;
        $scope.episodes = [];
      }
    });
    return result;
  }
  
  function createPlayList(videos)
  {
    jQuery.each(videos, function(i, val){
      $scope.episodes.push({           
        index: vlc.playlist.add(val.link),
        title: val.title
      });
    });
        
    vlc.playlist.playItem(0); // play when playlist is ready
  }
  
  function buildSubtitleMenu()
  {
    var trackCount = vlc.subtitle.count;
    $scope.subs = [];
    
    for(var i = 0; i < trackCount; i++)
    {
      $scope.subs.push({
        track: i,
        title: i + ' - ' + vlc.subtitle.description(i)
      });
    }  
    
    $scope.$apply();  // push new list to page.
  }
  
  function buildAudioMenu()
  {
    var trackCount = vlc.audio.count;
    $scope.audio = []; // clear out last list.
    
    for(var i = 1; i < trackCount; i++)
    {
      $scope.audio.push({
        track: i,
        title: i + ' - ' + vlc.audio.description(i)
      });
    }
    
    $scope.$apply(); // push new list to page.
  }

  api.listSeasons($routeParams.show).then(function(res){
    if($routeParams.show == res.data.show)
    {
      $scope.seasons = res.data.seasons;
      
      if(res.data.vids.length > 0){
        
        videos = res.data.vids;
        
        createPlayList(videos);          
        
        if(videos.length >= 2)
        {
          $scope.showNxtPrev = true;
        }
      }
    }
  });

  $scope.nextVid = function()
  {    
    var currentItem = vlc.playlist.currentItem;
    var playlistCount = vlc.playlist.items.count;
    
    if(currentItem < playlistCount - 1)
    {
      vlc.playlist.next();
    }
    else
    {
      vlc.playlist.playItem(0);
    }
    
  };

  $scope.prevVid = function()
  { 
    var currentItem = vlc.playlist.currentItem;
    var playlistCount = vlc.playlist.items.count;
    
    if(currentItem == 0)
    {
      vlc.playlist.playItem(playlistCount - 1);  
    } 
    else
    {   
      vlc.playlist.prev();
    }
    
  };    

  $scope.selectedSeason = function($event)
  {
    var listResult = false;
    $scope.showSeason = angular.element($event.currentTarget).attr('id');          
            
    api.listEpisodes(
                      $routeParams.show,
                      angular.element($event.currentTarget).attr('id')
                    )
    .then(function(res){
        if($routeParams.show == res.data.show && angular.element($event.currentTarget).attr('id') == res.data.season)
        {          
            if(vlc.playlist.items.count > 0)
            {
              listResult = clearList(); //remove old playlist 
            }
            else
            {
              listResult = true;
            }       
            
            videos = res.data.vids;
            
            if(listResult)
            {
              createPlayList(videos);               
            }
                        
            if(videos.length >= 2)
            {
              $scope.showNxtPrev = true;
            }
            
        }
    });
  };
  
  $scope.selectedEpisode = function($event)
  {
    vlc.playlist.playItem(angular.element($event.currentTarget).attr('id'));
  };
  
  $scope.selectedSub = function($event)
  {
    var trackId = angular.element($event.currentTarget).attr('id');
    subtitleTrack = parseInt(trackId); // keep track for the next video.
    
    vlc.subtitle.track = trackId;
  }
  
  $scope.selectedAudio = function($event)
  {
    var trackId = angular.element($event.currentTarget).attr('id');
    audioTrack = parseInt(trackId); // keep track for the next video.
    
    vlc.audio.track = trackId;
  }

}]);
