// ===== products.js =====

const LIMIT = 8; // products per page
let currentPage = 1;
let currentCategory = "";
let currentSort = "";
let totalProducts = 0;

// ===== Read URL Params =====
function getParams() {
  const params = new URLSearchParams(window.location.search);
  currentCategory = params.get("category") || "";
}

// ===== Build API URL =====
function buildUrl(page) {
  const skip = (page - 1) * LIMIT;
  let url = "";

  if (currentSort) {
    const [sortBy, order] = currentSort.split("-");
    if (currentCategory) {
      // sort + category: fetch all then sort client-side (API limitation)
      url = `https://dummyjson.com/products/category/${currentCategory}?limit=0`;
    } else {
      url = `https://dummyjson.com/products?limit=${LIMIT}&skip=${skip}&sortBy=${sortBy}&order=${order}`;
    }
  } else {
    if (currentCategory) {
      url = `https://dummyjson.com/products/category/${currentCategory}?limit=0`;
    } else {
      url = `https://dummyjson.com/products?limit=${LIMIT}&skip=${skip}`;
    }
  }

  return url;
}

// ===== Fetch Products =====
async function fetchProducts(page = 1) {
  currentPage = page;
  showLoader();

  try {
    const url = buildUrl(page);
    const res = await fetch(url);
    const data = await res.json();

    let products = data.products;

    // Client-side sort for category pages
    if (currentSort && currentCategory) {
      const [sortBy, order] = currentSort.split("-");
      products = sortProducts(products, sortBy, order);
    }

    // Client-side pagination for category pages
    if (currentCategory) {
      totalProducts = products.length;
      const start = (page - 1) * LIMIT;
      products = products.slice(start, start + LIMIT);
    } else {
      totalProducts = data.total;
    }

    renderProducts(products);
    renderPagination(totalProducts, page);
  } catch (err) {
    document.getElementById("products-container").innerHTML =
      `<p class="text-center text-danger py-5">Failed to load products.</p>`;
  }
}

function sortProducts(products, sortBy, order) {
  return [...products].sort((a, b) => {
    let valA = sortBy === "price" ? a.price : a.title.toLowerCase();
    let valB = sortBy === "price" ? b.price : b.title.toLowerCase();
    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  });
}

// ===== Render =====
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

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

// ===== Pagination =====
function renderPagination(total, activePage) {
  const totalPages = Math.ceil(total / LIMIT);
  const ul = document.getElementById("pagination");
  ul.innerHTML = "";

  if (totalPages <= 1) return;

  // Prev
  ul.innerHTML += `
    <li class="page-item ${activePage === 1 ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="goToPage(${activePage - 1})">‹ Prev</a>
    </li>
  `;

  // Pages
  for (let i = 1; i <= totalPages; i++) {
    ul.innerHTML += `
      <li class="page-item ${i === activePage ? "active" : ""}">
        <a class="page-link" href="#" onclick="goToPage(${i})">${i}</a>
      </li>
    `;
  }

  // Next
  ul.innerHTML += `
    <li class="page-item ${activePage === totalPages ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="goToPage(${activePage + 1})">Next ›</a>
    </li>
  `;
}

function goToPage(page) {
  event.preventDefault();
  if (page < 1) return;
  window.scrollTo({ top: 0, behavior: "smooth" });
  fetchProducts(page);
}

function showLoader() {
  document.getElementById("products-container").innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-dark" role="status"></div>
    </div>
  `;
  document.getElementById("pagination").innerHTML = "";
}

// ===== Page Title =====
function setPageTitle() {
  if (currentCategory) {
    const name = currentCategory.replace(/-/g, " ");
    document.title = `${name} | ShopAPI`;
    document.getElementById("page-title").textContent =
      name.charAt(0).toUpperCase() + name.slice(1);
    document.getElementById("breadcrumb-category").textContent = name;
  } else {
    document.getElementById("page-title").textContent = "All Products";
    document.getElementById("breadcrumb-category").textContent = "All Products";
  }
}

// ===== Sort Event =====
document.getElementById("sort-select").addEventListener("change", function () {
  currentSort = this.value;
  fetchProducts(1);
});

// ===== Init =====
getParams();
setPageTitle();
fetchProducts(1);
