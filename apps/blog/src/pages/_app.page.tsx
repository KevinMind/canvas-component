import { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";

import createClient from "../utilities/graphql/client";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={createClient()}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default MyApp;
