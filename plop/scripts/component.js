module.exports = function (plop) {
  // controller generator
  plop.setGenerator("Component", {
    description: "create new component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "what is the name of the component",
      },
      {
        type: "input",
        name: "path",
        message: "type the path to the component directory",
      },
    ],
    actions: [
      {
        type: "addMany",
        base: "../templates/component",
        destination: "../../{{path}}/components/{{name}}",
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
