const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const FILE = path.join(__dirname, "restaurants.json");

app.use(express.json());
app.use(express.static("public"));

// helpers
const load = () => JSON.parse(fs.readFileSync(FILE, "utf8"));
const save = (data) => fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

// aggregate function: average of the grades
const average = (grades) =>
  grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;

// GET all restaurants (search, borough, cuisine, best quality)
app.get("/api/restaurants", (req, res) => {
  const { search = "", borough = "", cuisine = "", best = "" } = req.query;

  let list = load().map((r) => ({ ...r, avg: Math.round(average(r.grades) * 10) / 10 }));

  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (r) => r.name.toLowerCase().includes(s) || r.cuisine.toLowerCase().includes(s)
    );
  }
  if (borough) list = list.filter((r) => r.borough === borough);
  if (cuisine) list = list.filter((r) => r.cuisine === cuisine);
  if (best === "true") list = list.filter((r) => r.avg > 90).sort((a, b) => b.avg - a.avg);

  res.json(list);
});

// ADD
app.post("/api/restaurants", (req, res) => {
  const data = load();
  const newResto = { id: Date.now(), ...req.body };
  data.push(newResto);
  save(data);
  res.json(newResto);
});

// EDIT
app.put("/api/restaurants/:id", (req, res) => {
  const data = load();
  const i = data.findIndex((r) => r.id == req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  data[i] = { ...data[i], ...req.body };
  save(data);
  res.json(data[i]);
});

// DELETE
app.delete("/api/restaurants/:id", (req, res) => {
  const data = load().filter((r) => r.id != req.params.id);
  save(data);
  res.json({ success: true });
});

app.listen(3000, () => console.log("Resto Finder running at http://localhost:3000"));