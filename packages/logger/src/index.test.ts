import logger from "./index";

describe("logger", () => {
  it("logs", () => {
    const spy = jest.spyOn(console, "log");

    logger("test");

    expect(spy).toHaveBeenCalledWith("test");
  });
});
