const express = require('express')
const resetService = require("../service/resetData")
const routes = require("./routes")
const app = express()
const port = process.env.PORT;

async function webserver() {
  app.use(express.static('public'));
  app.use(express.json());
  app.use("/api", routes);

  await resetService.init()

  app.listen(port, () => {
    console.log(`Server started`)
  })
}

webserver()


module.exports = app;

// TODO Si besoin d'améliorer le cache, regarder ici https://medium.com/@yurii.h.dev/nodejs-redis-how-and-why-88647af49e99