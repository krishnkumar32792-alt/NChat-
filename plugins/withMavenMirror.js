const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withMavenMirror(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const mirror = `
allprojects {
  repositories {
    maven { url "https://repo.huaweicloud.com/repository/maven/" }
    mavenCentral()
    google()
  }
}
`;

      if (!config.modResults.contents.includes('repo.huaweicloud.com')) {
        config.modResults.contents += mirror;
      }
    }

    return config;
  });
};
