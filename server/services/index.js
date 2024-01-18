"use strict";

const myService = require("./my-service");
const searchService = require("./search");

module.exports = {
  myService,
  search: searchService,
};
