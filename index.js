'use strict';

module.exports = {
  name: require('./package').name,

  options: {
    autoImport: {
      webpack: {
        module: {
          rules: [
            /* fixes issue with graphql-js's mjs entry */
            /* see: https://github.com/graphql/graphql-js/issues/1272#issuecomment-393903706 */
            {
              test: /\.mjs$/,
              include: /node_modules\/graphql/,
              type: 'javascript/auto',
            },
          ],
        },
        externals: {
          react: 'react',
        },
      },
    },
  },

  included(app) {
    this._super.included.apply(this, arguments);

    this.app = app;
  },

  getOptions() {
    const hostOptions =
      (this.parent && this.parent.options) ||
      (this.app && this.app.options) ||
      {};

    return (
      hostOptions.emberApolloClient || {
        keepGraphqlFileExtension: true,
      }
    );
  },

  setupPreprocessorRegistry(type, registry) {
    const options = this.getOptions();

    if (type === 'parent') {
      registry.add('js', {
        name: require('./package').name,
        ext: 'graphql',
        toTree(tree) {
          const GraphQLFilter = require('broccoli-graphql-filter');

          return new GraphQLFilter(tree, {
            keepExtension: options.keepGraphqlFileExtension,
          });
        },
      });
    }
  },
};
