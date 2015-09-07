var fs = require('fs');
var vidTbl = [];
var vidRow = {};
var vids = [];
var seasons = [];
var show = '';
var season = '';

module.exports = function(app)
{
  app.get('/', function(req, res){
    res.send("../public/index.html");
  });

  // List out videos based on directory and grab icon.
  app.get('/listGallery', function(req, res){
    var files = fs.readdirSync('./videos/');
    var btnText = '';
    files.forEach(function(file){
        var stats = fs.statSync('./videos/' + file);
          if(stats.isDirectory())
          {
            if(file.length > 30)
            {
              btnText = file.substr(0, 30) + '...';
            }
            else
            {
              btnText = file;
            }
            
            vidRow = {
              'title': file,
              'btn': btnText
            };
            vidTbl.push(vidRow);
          }
      });
    res.send(vidTbl);
    // clear out data
    vidTbl = [];
    vidRow = {};
  });

  //get the title back and go through and get the Seasons. If none are found pass to next handler
  app.get('/listSeasons/:show', function(req, res, next){
    show = req.params.show;
    var files = fs.readdirSync('./videos/' + show);
    files.forEach(function(file){
        var stats =  fs.statSync('./videos/' + show + '/' + file);
          if(stats.isDirectory())
          {
            seasons.push(file);
          }
      });
    if(seasons.length === 0)
    {
      next();
    }
    else
    {
      res.send({
        'show': show,
        'seasons': seasons,
        'vids': []
      });
    }
    //clear out data
    show = '';
    seasons = [];
  });

  app.get('/listSeasons/:show', function(req, res){
    show = req.params.show;
    var files = fs.readdirSync('./videos/' + show);
    var title = '';
    files.forEach(function(file){
      var stats = fs.statSync('./videos/' + show + '/' + file);
      if(stats.isFile() && file != 'image.png')
      {
        title = file.substr(0, file.length - 4);
        vids.push({
          link: app.locals.protocall + '://' + app.locals.host + ':' + app.locals.port + '/videos/' + encodeURIComponent(show) + '/' + encodeURIComponent(file),
          title: title
        });
      }
    });
    res.send({
      "show": show,
      "seasons": [],
      "vids": vids
    });
    //clear out data
    show = '';
    vids = [];
  });

  // If there were seasons then pass that in and get all the episodes in that season
  app.get('/listEpisodes/:show/:season', function(req, res){
    show = req.params.show;
    season = req.params.season;
    var title = '';
    var files = fs.readdirSync('./videos/' + show + '/' + season);
    files.forEach(function(file){
      var stats = fs.statSync('./videos/' + show + '/' + season + '/' + file);
      if(stats.isFile())
      {
        title = file.substr(0, file.length - 4);
        vids.push({
          link: app.locals.protocall + '://' + app.locals.host + ':' + app.locals.port + '/videos/' + encodeURIComponent(show) + '/' + encodeURIComponent(season) + '/' + encodeURIComponent(file),
          title: title
        });
      }
    });
    res.send({
      "show": show,
      "season": season,
      "vids": vids
    });
    //clear out data
    show = '';
    season = '';
    vids = [];
  });
};
