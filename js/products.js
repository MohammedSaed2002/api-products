// ===== products.js =====

const LIMIT = 8;
let currentPage = 1;
let currentCategory = "";
let currentSort = "";
let totalProducts = 0;

function getParams() {
  const params = new URLSearchParams(window.location.search);
  currentCategory = params.get("category") || "";
}

function buildUrl(page) {
  const skip = (page - 1) * LIMIT;
  if (currentSort) {
    const [sortBy, order] = currentSort.split("-");
    if (currentCategory) {
      return `https://dummyjson.com/products/category/${currentCategory}?limit=0`;
    }
    return `https://dummyjson.com/products?limit=${LIMIT}&skip=${skip}&sortBy=${sortBy}&order=${order}`;
  }
  if (currentCategory) {
    return `https://dummyjson.com/products/category/${currentCategory}?limit=0`;
  }
  return `https://dummyjson.com/products?limit=${LIMIT}&skip=${skip}`;
}

async function fetchProducts(page = 1) {
  currentPage = page;
  showSkeleton();
  try {
    const url = buildUrl(page);
    const res = await fetch(url);
    const data = await res.json();
    let products = data.products;

    if (currentSort && currentCategory) {
      const [sortBy, order] = currentSort.split("-");
      products = sortProducts(products, sortBy, order);
    }

    if (currentCategory) {
      totalProducts = products.length;
      const start = (page - 1) * LIMIT;
      products = products.slice(start, start + LIMIT);
    } else {
      totalProducts = data.total;
    }

    renderProducts(products);
    renderPagination(totalProducts, page);
    renderCount(page, products.length, totalProducts);
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

function renderProducts(products) {
  const container = document.getElementById("products-container");
  container.innerHTML = "";

  if (!products.length) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <p style="font-size:3rem;">🔍</p>
        <p class="text-muted">No products found in this category.</p>
      </div>`;
    return;
  }

  products.forEach((product) => {
    const stars = renderStars(product.rating);
    const discount = product.discountPercentage ? Math.round(product.discountPercentage) : null;
    const col = document.createElement("div");
    col.className = "col-6 col-sm-6 col-md-4 col-lg-3";
    col.innerHTML = `
      <a href="details.html?id=${product.id}" class="product-card">
        ${discount ? `<span class="discount-badge">-${discount}%</span>` : ""}
        <div class="img-wrapper">
          <img src="${product.thumbnail}" alt="${product.title}" loading="lazy" />
        </div>
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

function renderCount(page, shown, total) {
  const start = (page - 1) * LIMIT + 1;
  const end = start + shown - 1;
  const el = document.getElementById("total-count");
  if (el) el.textContent = `Showing ${start}–${end} of ${total} products`;
}

function renderPagination(total, activePage) {
  const totalPages = Math.ceil(total / LIMIT);
  const ul = document.getElementById("pagination");
  ul.innerHTML = "";
  if (totalPages <= 1) return;

  ul.innerHTML += `<li class="page-item ${activePage === 1 ? "disabled" : ""}">
    <a class="page-link" href="#" onclick="goToPage(event,${activePage - 1})">‹ Prev</a></li>`;

  const range = 2;
  const start = Math.max(1, activePage - range);
  const end = Math.min(totalPages, activePage + range);

  if (start > 1) {
    ul.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(event,1)">1</a></li>`;
    if (start > 2) ul.innerHTML += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
  }

  for (let i = start; i <= end; i++) {
    ul.innerHTML += `<li class="page-item ${i === activePage ? "active" : ""}">
      <a class="page-link" href="#" onclick="goToPage(event,${i})">${i}</a></li>`;
  }

  if (end < totalPages) {
    if (end < totalPages - 1) ul.innerHTML += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
    ul.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(event,${totalPages})">${totalPages}</a></li>`;
  }

  ul.innerHTML += `<li class="page-item ${activePage === totalPages ? "disabled" : ""}">
    <a class="page-link" href="#" onclick="goToPage(event,${activePage + 1})">Next ›</a></li>`;
}

function goToPage(e, page) {
  e.preventDefault();
  const totalPages = Math.ceil(totalProducts / LIMIT);
  if (page < 1 || page > totalPages) return;
  window.scrollTo({ top: 0, behavior: "smooth" });
  fetchProducts(page);
}

function showSkeleton() {
  document.getElementById("products-container").innerHTML = Array(8).fill(`
    <div class="col-6 col-sm-6 col-md-4 col-lg-3">
      <div class="skeleton-card">
        <div class="skeleton skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton skeleton-line mb-2"></div>
          <div class="skeleton skeleton-line short"></div>
        </div>
      </div>
    </div>
  `).join("");
  document.getElementById("pagination").innerHTML = "";
  const el = document.getElementById("total-count");
  if (el) el.textContent = "";
}

function setPageTitle() {
  if (currentCategory) {
    const name = currentCategory.replace(/-/g, " ");
    document.title = `${name} | ShopAPI`;
    document.getElementById("page-title").textContent = name.charAt(0).toUpperCase() + name.slice(1);
    document.getElementById("breadcrumb-category").textContent = name;
  } else {
    document.getElementById("page-title").textContent = "All Products";
    document.getElementById("breadcrumb-category").textContent = "All Products";
  }
}

// Scroll To Top
const scrollBtn = document.getElementById("scroll-top");
window.addEventListener("scroll", () => {
  scrollBtn.classList.toggle("visible", window.scrollY > 400);
});
scrollBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Sort
document.getElementById("sort-select").addEventListener("change", function () {
  currentSort = this.value;
  fetchProducts(1);
});

// Init
getParams();
setPageTitle();
fetchProducts(1);