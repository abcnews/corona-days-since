const pkg = require("./package.json");

module.exports = {
  webpack: config => {
    config.devtool = "source-map";
    const rules = config.module.rules;
    const stylesRule = rules.find(x => x.__hint__ === "styles");
    stylesRule.use[1].options.modules.hashPrefix = `${pkg.name}@${pkg.version}`;
    return config;
  }
};
