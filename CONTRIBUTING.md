# Contributing to Vib3

Thanks for your interest in VIB3! ❤️ 
You are very welcome to contribute. 
If you are proposing a new feature, make sure to open an issue to make sure it is inline with the project goals.


## Getting started

1. Fork this repository to your GitHub account and clone it locally:

   ```
   git clone https://github.com/<your-username>/vib3.git
   cd vib3
   ```

2. Install the dependencies and build the project source code:
   ```
   > npm install
   > npm run build
   ```

   > **Note:** run `npm run build` for one-off builds after your changes, or run `npm run watch` to leave it in watch mode.

3. Use NPM link to use the local dev version of `vib3` in other projects:

   ```
   > npm link
   ```

4) To use your local version in other projects, run this in the project:

   ```
   > npm link vib3
   ```

   You should see a success message: `success Using linked package for "vib3".` The project will now use the locally linked version instead of a copy from `node_modules`.

## Submitting a PR

Be sure to run `npm run test` before you make your PR to make sure you haven't broken anything.


### Attribution
This guide is by [TSDX](https://github.com/jaredpalmer/tsdx). 
