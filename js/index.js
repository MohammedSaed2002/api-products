// ===== index.js =====

const CATEGORY_ICONS = {
  smartphones: "📱", laptops: "💻", fragrances: "🌸", skincare: "🧴",
  groceries: "🛒", "home-decoration": "🏠", furniture: "🛋️", tops: "👕",
  "womens-dresses": "👗", "womens-shoes": "👠", "mens-shirts": "👔",
  "mens-shoes": "👟", "mens-watches": "⌚", "womens-watches": "💍",
  "womens-bags": "👜", "womens-jewellery": "💎", sunglasses: "🕶️",
  automotive: "🚗", motorcycle: "🏍️", lighting: "💡",
  beauty: "💄", tablets: "📟", "sports-accessories": "⚽",
  "kitchen-accessories": "🍳", vehicle: "🚙", "mobile-accessories": "🔌",
  default: "🏷️",
};

// ===== Skeleton =====
function showSkeletonCategories() {
  const container = document.getElementById("categories-container");
  container.innerHTML = Array(12).fill(`
    <div class="col-6 col-sm-4 col-md-3 col-lg-2">
      <div class="skeleton-card p-3 text-center">
        <div class="skeleton skeleton-img mb-2" style="height:48px;width:48px;border-radius:50%;margin:0 auto;"></div>
        <div class="skeleton skeleton-line short mx-auto" style="height:12px;"></div>
      </div>
    </div>
  `).join("");
}

function showSkeletonProducts() {
  const container = document.getElementById("products-container");
  container.innerHTML = Array(8).fill(`
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
}

// ===== Fetch Categories =====
async function fetchCategories() {
  showSkeletonCategories();
  try {
    const res = await fetch("https://dummyjson.com/products/category-list");
    const categories = await res.json();
    renderCategories(categories);
  } catch (err) {
    document.getElementById("categories-container").innerHTML =
      `<p class="text-center text-danger">Failed to load categories.</p>`;
  }
}

function renderCategories(categories) {
  const container = document.getElementById("categories-container");
  container.innerHTML = "";
  categories.forEach((cat) => {
    const icon = CATEGORY_ICONS[cat] || CATEGORY_ICONS["default"];
    const col = document.createElement("div");
    col.className = "col-6 col-sm-4 col-md-3 col-lg-2";
    col.innerHTML = `
      <a href="products.html?category=${cat}" class="category-card">
        <div class="category-icon">${icon}</div>
        <div class="category-name">${cat.replace(/-/g, " ")}</div>
      </a>
    `;
    container.appendChild(col);
  });
}

// ===== Fetch Products =====
async function fetchProducts() {
  showSkeletonProducts();
  try {
    const res = await fetch("https://dummyjson.com/products?limit=10");
    const data = await res.json();
    renderProducts(data.products);
  } catch (err) {
    document.getElementById("products-container").innerHTML =
      `<p class="text-center text-danger">Failed to load products.</p>`;
  }
}

function renderProducts(products) {
  const container = document.getElementById("products-container");
  container.innerHTML = "";
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

// ===== Scroll To Top =====
const scrollBtn = document.getElementById("scroll-top");
window.addEventListener("scroll", () => {
  scrollBtn.classList.toggle("visible", window.scrollY > 400);
});
scrollBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ===== Init =====
fetchCategories();
fetchProducts();