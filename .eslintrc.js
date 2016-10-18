module.exports = {
    "env": {
        "node": true,
        "es6": true
    },
    "root": true,
    "extends": "defaults/configurations/eslint",
    "rules": {
      "eqeqeq": [1, "smart"],
      "space-before-function-paren": [1, "always"],
      "semi": [2, "always"],
      "no-var": 1,
      "prefer-const": 1,
      "prefer-template": 1,
      "arrow-spacing": 2,
      "arrow-parens": 2
    }
};
