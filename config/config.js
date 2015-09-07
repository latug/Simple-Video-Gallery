module.exports = function(app)
{
  app.locals.protocol = 'http';
  app.locals.host = 'localhost';
  app.locals.port = '3000';
  app.locals.path = './';
};
