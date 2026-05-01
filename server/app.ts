import "dotenv/config";
import cors from "cors";
import http from "http";
import path from "path";
import helmet from "helmet";
import express from "express";
import router from "./router/router";
import compression from "compression";
import { Borgen, Logger } from "borgen";
import cookieParser from "cookie-parser";
import { helmetConfig } from "./lib/helmet";
import connectDb from "./database/connectDb";
import { rateLimit } from "express-rate-limit";
import generateOpenAPISpec from "./docs/openapi";
import expressBasicAuth from "express-basic-auth";
import { apiReference } from "@scalar/express-api-reference";
import { initRabbitMQ } from "./lib/rabbitmq";
import { AllowedOrigins, ENV, isDevelopment } from "./lib/environments";
import { slackReceiver } from "./controllers/slack/slack.Controller";

const app = express();

const server = http.createServer(app);

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 150, // limit each IP to 150 requests per windowMs
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

app.set("trust proxy", 1);

// Register Slack events at the absolute top to ensure the raw request stream 
// is available for signature verification.
app.use("/api/v1/slack", slackReceiver.router);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || AllowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(helmet(helmetConfig));
app.use(Borgen({}));

app.use(express.json());
app.use(compression() as unknown as express.RequestHandler);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// API Reference
app.use(
  "/api/v1/openapi",
  express.static(path.join(__dirname, "./docs/openapi.json")),
);
app.use(
  "/api/v1/docs",
  expressBasicAuth({
    users: { [ENV.API_DOCS_USER]: ENV.API_DOCS_PASSWORD },
    challenge: true,
    realm: ENV.API_DOCS_REALM,
  }),
  apiReference({
    url: `${ENV.API_DOCS_SERVER}/api/v1/openapi`,
    layout: "modern",
    defaultOpenAllTags: true,
    expandAllResponses: true,
    theme: "elysiajs",
    hideClientButton: false,
    showSidebar: true,
    showDeveloperTools: "localhost",
    showToolbar: "localhost",
    operationTitleSource: "summary",
    persistAuth: false,
    telemetry: true,
    isEditable: false,
    isLoading: false,
    hideModels: false,
    documentDownloadType: "both",
    hideTestRequestButton: false,
    hideSearch: false,
    showOperationId: false,
    hideDarkModeToggle: false,
    withDefaultFonts: true,
    expandAllModelSections: false,
    orderSchemaPropertiesBy: "alpha",
    orderRequiredPropertiesFirst: true,
    _integration: "express",
    default: false,
    slug: "api-1",
    title: "API #1",
  }),
);

app.use("/", router);

const startServer = async () => {
  if (isDevelopment) {
    generateOpenAPISpec();
  }

  // Initialize RabbitMQ (this also starts the background worker)
  await initRabbitMQ();

  server.listen(ENV.SERVER_PORT, () => {
    Logger.info({
      message: `Server is listening on port ${ENV.SERVER_PORT}`,
      messageColor: "greenBright",
      infoColor: "whiteBright",
    });
  });
};

// Connect to the database. Then Start Server
connectDb(startServer);
