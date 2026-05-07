// ===== index.js =====

const CATEGORY_ICONS = {
  smartphones: "📱", laptops: "💻", fragrances: "🌸", skincare: "🧴",
  groceries: "🛒", "home-decoration": "🏠", furniture: "🛋️", tops: "👕",
  "womens-dresses": "👗", "womens-shoes": "👠", "mens-shirts": "👔",
  "mens-shoes": "👟", "mens-watches": "⌚", "womens-watches": "💍",
  "womens-bags": "👜", "womens-jewellery": "💎", sunglasses: "🕶️",
  automotive: "🚗", motorcycle: "🏍️", lighting: "💡",
  default: "🏷️",
};

// ===== Fetch Categories =====
async function fetchCategories() {
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

// ===== Fetch Featured Products (10 only) =====
async function fetchProducts() {
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

// ===== Init =====
fetchCategories();
fetchProducts();
