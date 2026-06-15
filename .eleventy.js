module.exports = function (eleventyConfig) {
  // Copie des assets statiques tels quels vers _site/assets
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Année courante pour le footer (évite de coder une date en dur)
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  return {
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
