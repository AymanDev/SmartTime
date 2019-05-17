'use strict';

const path = require('path');
const express = require('express');
const DIST_DIR = __dirname + '/dist',
  HTML_FILE = path.join(DIST_DIR, 'index.html');
const http = require('http');
const app = express();


app.use(express.static(DIST_DIR));
app.get('*', (req, res) => {
  res.sendFile(HTML_FILE)
});

const httpsServer = http.createServer(app);
httpsServer.listen(8080);
