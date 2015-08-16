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
      files.forEach(function(file){
        var stats = fs.statSync('./videos/' + file);
          if(stats.isDirectory())
          {
            vidRow = {
              'title': file,
              'imgSrc': '../videos/' + file + '/image.png'
            };
            vidTbl.push(vidRow);
          }
      });
    res.send(vidTbl);
    // clear out old data
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
    res.send({
      'show': show,
      'seasons': seasons
    });
    //clear out data
    show = '';
    seasons = [];
  });

  app.get('/listSeasons/:show', function(req, res){
    res.send('coming soon!');
  });

  app.get('/listEpisodes/:show/:seasons', function(req, res){
    res.send('coming soon!');
  });
};
