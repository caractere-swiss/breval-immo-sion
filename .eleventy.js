module.exports = function (eleventyConfig) {
  // Copie des assets statiques tels quels vers _site/assets
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Année courante pour le footer (évite de coder une date en dur)
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  return {
    // Servi sous https://caractere-swiss.github.io/breval-immo-sion/
    // → tous les liens passés par le filtre `| url` sont préfixés automatiquement.
    pathPrefix: "/breval-immo-sion/",
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
