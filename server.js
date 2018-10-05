var express = require('express');
var app = express();

app.use(express.static(__dirname + '/src'));

app.listen(8080, function () {
  console.log('Application is listening on port 80!');
});
