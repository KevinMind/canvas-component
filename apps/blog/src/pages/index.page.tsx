import log from "logger";
import {Button} from "ui";

export default function Store() {
  log("Hey! This is Home.");
  return (
    <div>
      <h1>Hello blog</h1>
      <Button onClick={(e) => console.log(e)}>Click</Button>
    </div>
  );
}