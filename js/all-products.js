// ===== all-products.js =====

const LIMIT = 12; // products per page
let currentPage = 1;
let currentSort = "";
let totalProducts = 0;

// ===== Build API URL =====
function buildUrl(page) {
  const skip = (page - 1) * LIMIT;

  if (currentSort) {
    const [sortBy, order] = currentSort.split("-");
    return `https://dummyjson.com/products?limit=${LIMIT}&skip=${skip}&sortBy=${sortBy}&order=${order}`;
  }

  return `https://dummyjson.com/products?limit=${LIMIT}&skip=${skip}`;
}

// ===== Fetch Products =====
async function fetchProducts(page = 1) {
  currentPage = page;
  showLoader();

  try {
    const url = buildUrl(page);
    const res = await fetch(url);
    const data = await res.json();

    totalProducts = data.total;

    renderProducts(data.products);
    renderPagination(totalProducts, page);
    renderCount(page, data.products.length, totalProducts);
  } catch (err) {
    document.getElementById("products-container").innerHTML =
      `<p class="text-center text-danger py-5">Failed to load products.</p>`;
  }
}

// ===== Render Products =====
function renderProducts(products) {
  const container = document.getElementById("products-container");
  container.innerHTML = "";

  if (!products.length) {
    container.innerHTML = `<p class="text-center text-muted py-5">No products found.</p>`;
    return;
  }

  products.forEach((product) => {
    const stars = renderStars(product.rating);
    const col = document.createElement("div");
    col.className = "col-6 col-sm-6 col-md-4 col-lg-3";
    col.innerHTML = `
      <a href="details.html?id=${product.id}" class="product-card">
        <img src="${product.thumbnail}" alt="${product.title}" loading="lazy" />
        <div class="card-body">
          <p class="product-title">${product.title}</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="product-price">$${product.price}</span>
            <span class="product-rating">${stars} <small class="text-muted">(${product.rating})</small></span>
          </div>
        </div>
      </a>
    `;
    container.appendChild(col);
  });
}

// ===== Render Stars =====
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

// ===== Render Count =====
function renderCount(page, shown, total) {
  const start = (page - 1) * LIMIT + 1;
  const end = start + shown - 1;
  document.getElementById("total-count").textContent =
    `Showing ${start}–${end} of ${total} products`;
}

// ===== Render Pagination =====
function renderPagination(total, activePage) {
  const totalPages = Math.ceil(total / LIMIT);
  const ul = document.getElementById("pagination");
  ul.innerHTML = "";

  if (totalPages <= 1) return;

  // Prev
  ul.innerHTML += `
    <li class="page-item ${activePage === 1 ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="goToPage(event, ${activePage - 1})">‹ Prev</a>
    </li>
  `;

  // Pages — show max 5 pages around current
  const range = 2;
  const start = Math.max(1, activePage - range);
  const end = Math.min(totalPages, activePage + range);

  if (start > 1) {
    ul.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(event, 1)">1</a></li>`;
    if (start > 2) ul.innerHTML += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
  }

  for (let i = start; i <= end; i++) {
    ul.innerHTML += `
      <li class="page-item ${i === activePage ? "active" : ""}">
        <a class="page-link" href="#" onclick="goToPage(event, ${i})">${i}</a>
      </li>
    `;
  }

  if (end < totalPages) {
    if (end < totalPages - 1) ul.innerHTML += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
    ul.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(event, ${totalPages})">${totalPages}</a></li>`;
  }

  // Next
  ul.innerHTML += `
    <li class="page-item ${activePage === totalPages ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="goToPage(event, ${activePage + 1})">Next ›</a>
    </li>
  `;
}

function goToPage(e, page) {
  e.preventDefault();
  const totalPages = Math.ceil(totalProducts / LIMIT);
  if (page < 1 || page > totalPages) return;
  window.scrollTo({ top: 0, behavior: "smooth" });
  fetchProducts(page);
}

// ===== Loader =====
function showLoader() {
  document.getElementById("products-container").innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-dark" role="status"></div>
    </div>
  `;
  document.getElementById("pagination").innerHTML = "";
  document.getElementById("total-count").textContent = "";
}

// ===== Sort Event =====
document.getElementById("sort-select").addEventListener("change", function () {
  currentSort = this.value;
  fetchProducts(1);
});

// ===== Init =====
fetchProducts(1);
