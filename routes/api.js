var fs = require('fs');

module.exports = function(app)
{
  app.get('/', function(req, res){
    res.send("../public/index.html");
  });
};
