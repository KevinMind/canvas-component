import { ApolloClient, InMemoryCache } from "@apollo/client";

export default function createClient() {
  return new ApolloClient({
    uri: "https://api-eu-central-1.graphcms.com/v2/ckjo70qrrqzg901xybnzecdvn/master",
    cache: new InMemoryCache(),
  });
}
