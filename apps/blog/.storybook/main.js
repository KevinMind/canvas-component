const path = require("path");

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  "framework": "@storybook/react",
  staticDirs: ['../public'],
  features: {
    previewCsfV3: true,
    interactionsDebugger: true,
  },
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.graphql$/,
      exclude: /node_modules/,
      use: [
        // @TODO: replace with storybook babel loader to keep conde transpilation consistent
        { loader: 'babel-loader', options: { presets: ['@babel/preset-typescript', '@babel/preset-react'] } },
        { loader: "graphql-let/loader" }
      ],
    });

    config.module.rules.push({
      test: /\.graphqls$/,
      exclude: /node_modules/,
      use: ["graphql-let/schema/loader"],
    });

    return config;
  },
}