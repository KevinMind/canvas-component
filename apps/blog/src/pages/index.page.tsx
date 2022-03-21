import log from "logger";
import { Button } from "ui";
import { useApolloClient, gql } from "@apollo/client";

export default function Store() {
  const client = useApolloClient();
  log(client);

  client
    .query({
      query: gql`
        query {
          posts {
            id
          }
        }
      `,
    })
    .then((result) => log(result));
  return (
    <div>
      <h1>Hello blog</h1>
      <Button onClick={(e) => log(e)}>Click</Button>
    </div>
  );
}
