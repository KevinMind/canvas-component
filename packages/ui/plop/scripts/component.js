module.exports = function (plop) {
  // controller generator
  plop.setGenerator("Component", {
    description: "create new component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "what is the name of the app",
      },
    ],
    actions: [
      {
        type: "addMany",
        base: "../templates/component",
        destination: "../../src/Canvas/components/{{name}}",
        transform: (data) => {
          return data;
        },
        templateFiles: "../templates/component/**",
        stripExtensions: ["hbs"],
        globOptions: {
          dot: true,
        },
      },
    ],
  });
};
