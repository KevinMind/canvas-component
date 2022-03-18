module.exports = function (plop) {
  // controller generator
  plop.setGenerator('App', {
    description: 'create new app',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'what is the name of the app',
      },
    ],
    actions: [
      {
        type: 'addMany',
        base: '../templates/app',
        destination: '../../apps/{{name}}',
        transform: (data) => {
          return data;
        },
        templateFiles: '../templates/app/**',
        stripExtensions: ['hbs'],
        globOptions: {
          dot: true,
        },
      },
    ],
  });
};