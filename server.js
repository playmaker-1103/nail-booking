const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/hello", (req, res) => {
  res.json({ msg: "Hello from Node 👋" });
});

app.post("/api/echo", (req, res) => {
  res.json({ ok: true, youSent: req.body });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server listening http://localhost:${PORT}`),
);
