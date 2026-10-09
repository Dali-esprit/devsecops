import express from "express";
import helmet from "helmet";

const app = express();

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

app.use(express.json({ limit: "10kb" }));

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    application: "DevSecOps Hardened App",
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "healthy" });
});


app.use((_req, res) => {
  res
    .status(404)
    .type("text/plain")
    .send("Not Found");
});


app.listen(3000, "0.0.0.0", () => {
  console.log("Hardened app listening on port 3000");
});
