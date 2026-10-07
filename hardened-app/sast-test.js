import express from "express";

const app = express();

app.get("/security-test", (req, res) => {
  const query = req.query.q;
  eval(query);
  res.send("test");
});

app.listen(3000);
