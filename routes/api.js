var fs = require('fs');
var vidTbl = [];
var vidRow = {};

module.exports = function(app)
{
  app.get('/', function(req, res){
    res.send("../public/index.html");
  });

  // List out videos based on directory and grab icon.
  app.get('/listVideos', function(req, res){
    fs.readdir('./videos/', function(err, files){
      if(err){
        console.log(err);
        return;
      }
      files.forEach(function(file){
        fs.stat('./videos/' + file, function(err, status){
          if(err){
            console.log(err);
            return;
          }
          if(status.isDirectory()){
            vidRow = {
              'title': file,
              'imgSrc': '../videos/' + file + '/image.png'
            };
            vidTbl.push(vidRow);
          }
        });
      });
    });
    res.send(vidTbl);
    vidTbl = [];
    vidRow = {};
  });
};
