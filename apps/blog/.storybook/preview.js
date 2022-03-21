import { initialize, mswDecorator } from 'msw-storybook-addon';
import { ApolloProvider } from "@apollo/client";
import createClient from "../src/utilities/graphql/client";


initialize();

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  mswDecorator,
  (Story) => {
    return (
      <ApolloProvider client={createClient()}>
        <Story />
      </ApolloProvider>
    )
  }
];
