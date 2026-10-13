const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("search");
const boroughButtons = document.getElementById("boroughButtons");
const cuisineButtons = document.getElementById("cuisineButtons");
const form = document.getElementById("restoForm");

const BOROUGHS = ["Manhattan", "Brooklyn", "Bronx", "Queens", "Staten Island"];

let selectedBorough = "";
let selectedCuisine = "";
let bestOnly = false;
let currentRestos = [];

// ---------- LOAD + SHOW ----------
async function loadRestos() {
  const url =
    `/api/restaurants?search=${encodeURIComponent(searchInput.value)}` +
    `&borough=${encodeURIComponent(selectedBorough)}` +
    `&cuisine=${encodeURIComponent(selectedCuisine)}` +
    `&best=${bestOnly}`;
  const res = await fetch(url);
  currentRestos = await res.json();

  tableBody.innerHTML = "";
  currentRestos.forEach((r) => {
    tableBody.innerHTML += `
      <tr>
        <td>${r.name}</td>
        <td>${r.borough}</td>
        <td>${r.cuisine}</td>
        <td>${r.address}</td>
        <td><span class="badge ${r.avg > 90 ? "" : "low"}">${r.avg}</span></td>
        <td>
          <button class="btn blue" onclick="editResto(${r.id})">Edit</button>
          <button class="btn red" onclick="deleteResto(${r.id})">Delete</button>
        </td>
      </tr>`;
  });

  if (currentRestos.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='6'>No restaurants found 😢</td></tr>";
  }
}

// ---------- BOROUGH FILTER BUTTONS ----------
function showBoroughs() {
  boroughButtons.innerHTML =
    `<button class="${selectedBorough === "" ? "active" : ""}" onclick="pickBorough('')">All Boroughs</button>`;
  BOROUGHS.forEach((b) => {
    boroughButtons.innerHTML +=
      `<button class="${selectedBorough === b ? "active" : ""}" onclick="pickBorough('${b}')">${b}</button>`;
  });
}

function pickBorough(b) {
  selectedBorough = b;
  showBoroughs();
  loadRestos();
}

// ---------- CATEGORY FILTER BUTTONS ----------
async function loadCuisines() {
  const res = await fetch("/api/restaurants");
  const all = await res.json();
  const cuisines = [...new Set(all.map((r) => r.cuisine))].sort();

  cuisineButtons.innerHTML =
    `<button class="${selectedCuisine === "" ? "active" : ""}" onclick="pickCuisine('')">All Categories</button>`;
  cuisines.forEach((c) => {
    cuisineButtons.innerHTML +=
      `<button class="${selectedCuisine === c ? "active" : ""}" onclick="pickCuisine('${c}')">${c}</button>`;
  });
}

function pickCuisine(c) {
  selectedCuisine = c;
  loadCuisines();
  loadRestos();
}

// ---------- SEARCH BUTTONS ----------
document.getElementById("searchBtn").onclick = loadRestos;
searchInput.addEventListener("keyup", (e) => { if (e.key === "Enter") loadRestos(); });

document.getElementById("bestBtn").onclick = () => {
  bestOnly = !bestOnly;
  loadRestos();
};

document.getElementById("resetBtn").onclick = () => {
  searchInput.value = "";
  selectedBorough = "";
  selectedCuisine = "";
  bestOnly = false;
  showBoroughs();
  loadCuisines();
  loadRestos();
};

// ---------- ADD / EDIT ----------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("restoId").value;
  const resto = {
    name: document.getElementById("name").value,
    borough: document.getElementById("borough").value,
    cuisine: document.getElementById("cuisine").value,
    address: document.getElementById("address").value,
    grades: document.getElementById("grades").value.split(",").map((g) => Number(g.trim())),
  };

  if (id) {
    await fetch(`/api/restaurants/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resto),
    });
  } else {
    await fetch("/api/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resto),
    });
  }

  resetForm();
  loadCuisines();
  loadRestos();
});

function editResto(id) {
  const r = currentRestos.find((x) => x.id === id);
  document.getElementById("formTitle").innerText = "Edit Restaurant";
  document.getElementById("restoId").value = r.id;
  document.getElementById("name").value = r.name;
  document.getElementById("borough").value = r.borough;
  document.getElementById("cuisine").value = r.cuisine;
  document.getElementById("address").value = r.address;
  document.getElementById("grades").value = r.grades.join(", ");
  document.getElementById("saveBtn").innerText = "Save Changes";
  document.getElementById("cancelBtn").style.display = "inline-block";
  form.scrollIntoView({ behavior: "smooth" });
}

function resetForm() {
  form.reset();
  document.getElementById("restoId").value = "";
  document.getElementById("formTitle").innerText = "Add a Restaurant";
  document.getElementById("saveBtn").innerText = "Add";
  document.getElementById("cancelBtn").style.display = "none";
}
document.getElementById("cancelBtn").onclick = resetForm;

// ---------- DELETE ----------
async function deleteResto(id) {
  if (!confirm("Delete this restaurant?")) return;
  await fetch(`/api/restaurants/${id}`, { method: "DELETE" });
  loadCuisines();
  loadRestos();
}

// ---------- START ----------
showBoroughs();
loadCuisines();
loadRestos();