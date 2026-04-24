import fs from "fs";
import path from "path";
import { Logger } from "borgen";
import swaggerJSDoc from "swagger-jsdoc";
import { ENV } from "../lib/environments";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "My API",
    version: "v1.0.0",
    description: `
# My API Documentation
`,
    license: {
      name: "Copyright 2026 My API",
    },
  },
  servers: [
    {
      url: ENV.API_DOCS_SERVER,
    },
  ],
};

const generateOpenAPISpec = () => {
  const swaggerSpec = swaggerJSDoc({
    failOnErrors: true,
    definition: swaggerDefinition,
    apis: [
      path.join(__dirname, "../controllers/**/*Controller.ts"),
      path.join(__dirname, "../router/**/*.ts"),
    ],
  });

  fs.writeFileSync(
    path.join(__dirname, "openapi.json"),
    JSON.stringify(swaggerSpec, null, 2),
    "utf-8",
  );

  Logger.info({ message: "Swagger spec generated successfully" });
};

export default generateOpenAPISpec;
