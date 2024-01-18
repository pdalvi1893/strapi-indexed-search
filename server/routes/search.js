// 'use strict';

// /**
//  *  router
//  */

// const { createCoreRouter } = require('@strapi/strapi').factories;

// module.exports = createCoreRouter('plugin::indexed-search.search');

module.exports = [
  {
    method: "GET",
    path: "/test",
    handler: "search.index",
    config: {
      policies: [],
    },
  },
];
