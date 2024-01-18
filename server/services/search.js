// 'use strict';

// /**
//  *  service
//  */

// const { createCoreService } = require('@strapi/strapi').factories;

// module.exports = createCoreService('plugin::indexed-search.search');

"use strict";

const _ = require("lodash");

module.exports = ({ strapi }) => ({
  async globalSearch(ctx) {
    const { term, pagination } = ctx.request.query;
    const pageNumber = pagination?.page ? parseInt(pagination.page) : 1;
    const limit = parseInt(
      pagination?.pageSize ??
        strapi.config.get("constants.DEFAULT_RESPONSE_LIMIT")
    );
    const start = limit * (pageNumber - 1);

    //let query = `select *  from searches order by id offset ${start} limit ${limit};`;
    let query = `select * from searches where content ilike '%${term}%'`;

    const knex = strapi.db.connection.context;
    let queryResult = await knex.raw(query);

    const rowCount = queryResult?.rows?.length;
    const totalPages = Math.ceil(queryResult?.rows?.length / limit);
    const nextPage = totalPages > pageNumber ? pageNumber + 1 : pageNumber;
    queryResult.rows = queryResult.rows.slice(start, pageNumber * limit);

    const searchGrouped = _.groupBy(queryResult.rows, "entity");

    let results = [];
    for (let key in searchGrouped) {
      let orderedList = _.map(searchGrouped[key], ({ entity_id }) => entity_id);
      let entity = {
        api: key,
        results: await strapi.entityService.findMany(key, {
          filters: {
            id: orderedList, //_.map(searchGrouped[key], ({ entity_id }) => entity_id),
          },
          populate: "*",
          // populate: {
          //   ArticleThemes: {
          //     fields: ["id", "PageTitle", "PageUID"],
          //   },
          //   ThumbnailImage: true,
          // },
        }),
      };
      entity.results = _.sortBy(entity.results, (obj) =>
        _.indexOf(orderedList, obj.id)
      );
      //promises.push(entity);
      results = results.concat(entity.results);
    }

    //let result = await Promise.all(promises);

    // const allCategories = await strapi
    //   .service("plugin::simple-global-search.search-config")
    //   .getCategoriesCount(ctx);

    return {
      Result: results,
      //category: allCategories,
      Meta: {
        Pagination: {
          Page: nextPage,
          PageSize: limit,
          PageCount: totalPages,
          Total: rowCount,
        },
      },
    };
  },

  async syncEntries(ctx) {
    let entities = strapi.config.get(
      "search.entities",
      "defaultValueIfUndefined"
    );

    let promises = [];
    for (let entity of entities) {
      let entries = await strapi.entityService.findMany(entity.name, {
        populate: "*",
      });

      _.each(entries, (entry) => {
        let data = _.pick(entry, entity.fields);

        _.forOwn(data, function (value, key) {
          //data = { ...data, entity_id: entry.id, entity: entity.name };
          promises.push(
            strapi.entityService.create("plugin::indexed-search.search", {
              data: {
                entity_id: entry.id,
                entity: entity.name,
                content: value,
              },
            })
          );
        });
      });
    }

    await Promise.all(promises);

    return "data synced";
  },
});
