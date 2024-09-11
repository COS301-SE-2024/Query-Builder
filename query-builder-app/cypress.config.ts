require('dotenv').config();

import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "wq3voa",
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },

  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      config.env = {
        ...process.env,
        ...config.env
      }
      return config 
    }
  },
});
