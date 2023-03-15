const express = require('express');
const app = express(),
      bodyParser = require("body-parser");
      port = 3080;

const users = [];

app.use(bodyParser.json());
app.use(express.static(process.cwd()+"/enlink/dist/angular-nodejs-example/"));

app.get('/', (req,res) => {
  res.sendFile(process.cwd()+"/enlink/dist/angular-nodejs-example/index.html")
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});
