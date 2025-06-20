import nunjucks from "nunjucks";
import path from "path";
import getMOJFilters from "@ministryofjustice/frontend/moj/filters/all.js";
import vision from "@hapi/vision";

export const viewsPlugin = {
  plugin: vision,
  options: {
    engines: {
      njk: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment);

          return (context) => {
            return template.render(context);
          };
        },
        prepare: (options, next) => {
          const nunjucksAppEnv = nunjucks.configure(
            [
              path.join(options.relativeTo || process.cwd(), options.path),
              "node_modules/govuk-frontend/dist",
              "node_modules/@ministryofjustice/frontend/",
            ],
            {
              autoescape: true,
              watch: false,
            },
          );

          // Add filters from MOJ Frontend
          let mojFilters = getMOJFilters();

          mojFilters = Object.assign(mojFilters);
          Object.keys(mojFilters).forEach(function (filterName) {
            nunjucksAppEnv.addFilter(filterName, mojFilters[filterName]);
          });

          options.compileOptions.environment = nunjucksAppEnv;
          return next();
        },
      },
    },
    path: "../views",
    relativeTo: "./app/views",
    isCached: true,
    context: {
      appVersion: process.env.npm_package_version,
      assetPath: "/assets",
      pageTitle: "ffc-ahwr-backoffice",
    },
  },
};
