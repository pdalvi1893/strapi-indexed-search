'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('indexed-search')
      .service('myService')
      .getWelcomeMessage();
  },
});
