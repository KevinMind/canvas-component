import log from "logger";
import { Button } from "ui";

import { useIndexQueryQuery } from "./index.graphql";

console.log({ useIndexQueryQuery });

export default function Store() {
  const { data, loading, error } = useIndexQueryQuery();

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    log(error);
    return <div>error!</div>;
  }

  return (
    <div>
      <h1>Hello blog</h1>
      <Button onClick={(e) => log(e)}>Click</Button>
      <ul>
        {data?.posts.map((post) => {
          return <li>{post.id}</li>;
        })}
      </ul>
    </div>
  );
}
