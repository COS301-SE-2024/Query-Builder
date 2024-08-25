require('dotenv').config();

import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },

  e2e: {
    baseUrl: "http://127.0.0.1:3000",
    setupNodeEvents(on, config) {
      config.env = {
        ...process.env,
        ...config.env
      }
      return config 
    }
  },
});
