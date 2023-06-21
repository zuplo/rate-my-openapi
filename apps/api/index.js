#!/usr/bin/env node
/* eslint-disable */
require("dotenv").config({ path: process.env.DOTENV_CONFIG_PATH });

const { start } = require("./dist/server");

start()
  .then((server) => {
    process.on("SIGTERM", () => {
      server.close();
    });
    process.on("SIGINT", () => {
      server.close();
    });
  })
  .catch(console.error);
