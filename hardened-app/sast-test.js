import express from "express";

const app = express();

app.get("/search", (req, res) => {
  const query = req.query.q;
  eval(query);
  res.send("ok");
});

app.listen(3000);
