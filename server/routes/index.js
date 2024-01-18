module.exports = [
  {
    method: 'GET',
    path: '/search',
    handler: 'search.index',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/sync/sync',
    handler: 'search.syncEntries',
    config: {
      policies: [],
      auth: false,
    },
  },
];
