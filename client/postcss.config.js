module.exports = {
  plugins: [
    require('@csstools/postcss-oklab-function')({ preserve: true }),
    '@tailwindcss/postcss',
  ],
};
