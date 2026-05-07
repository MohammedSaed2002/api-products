// ===== details.js =====

// ===== Get Product ID from URL =====
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// ===== Fetch Product =====
async function fetchProduct(id) {
  try {
    const res = await fetch(`https://dummyjson.com/products/${id}`);
    if (!res.ok) throw new Error("Product not found");
    const product = await res.json();
    renderProduct(product);
  } catch (err) {
    document.getElementById("loader").innerHTML =
      `<p class="text-danger text-center py-5">Product not found.</p>`;
  }
}

// ===== Render Product =====
function renderProduct(product) {
  // Update page title
  document.title = `${product.title} | ShopAPI`;

  // Breadcrumb
  document.getElementById("breadcrumb-name").textContent = product.title;

  // Main Image
  const mainImg = document.getElementById("main-image");
  mainImg.src = product.images[0];
  mainImg.alt = product.title;

  // Thumbnails
  const thumbsContainer = document.getElementById("thumbnails");
  product.images.forEach((img, index) => {
    const thumb = document.createElement("img");
    thumb.src = img;
    thumb.alt = `${product.title} ${index + 1}`;
    thumb.className = `thumbnail-img ${index === 0 ? "active" : ""}`;
    thumb.addEventListener("click", () => {
      mainImg.src = img;
      document.querySelectorAll(".thumbnail-img").forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
    });
    thumbsContainer.appendChild(thumb);
  });

  // Category
  document.getElementById("product-category").textContent = product.category.replace(/-/g, " ");

  // Name
  document.getElementById("product-name").textContent = product.title;

  // Rating
  const stars = renderStars(product.rating);
  document.getElementById("product-rating").textContent = `${stars} ${product.rating}/5`;

  // Stock
  const stockEl = document.getElementById("product-stock");
  if (product.stock > 0) {
    stockEl.textContent = `In Stock (${product.stock})`;
    stockEl.className = "badge bg-success";
  } else {
    stockEl.textContent = "Out of Stock";
    stockEl.className = "badge bg-danger";
  }

  // Price
  document.getElementById("product-price").textContent = `$${product.price}`;

  // Description
  document.getElementById("product-description").textContent = product.description;

  // Meta
  document.getElementById("meta-brand").textContent = product.brand || "—";
  document.getElementById("meta-sku").textContent = product.sku || "—";
  document.getElementById("meta-warranty").textContent = product.warrantyInformation || "—";

  // Reviews
  renderReviews(product.reviews || []);

  // Show content, hide loader
  document.getElementById("loader").classList.add("d-none");
  document.getElementById("product-details").classList.remove("d-none");
}

// ===== Render Reviews =====
function renderReviews(reviews) {
  const container = document.getElementById("reviews-container");

  if (!reviews.length) {
    container.innerHTML = `<p class="text-muted">No reviews yet.</p>`;
    return;
  }

  reviews.forEach((review) => {
    const stars = renderStars(review.rating);
    const date = new Date(review.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";
    col.innerHTML = `
      <div class="review-card">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="reviewer-name">${review.reviewerName}</span>
          <span class="text-warning">${stars}</span>
        </div>
        <p class="review-date">${date}</p>
        <p class="review-comment mb-0">${review.comment}</p>
      </div>
    `;
    container.appendChild(col);
  });
}

// ===== Stars Helper =====
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

// ===== Init =====
const productId = getProductId();
if (productId) {
  fetchProduct(productId);
} else {
  document.getElementById("loader").innerHTML =
    `<p class="text-danger text-center py-5">No product ID provided.</p>`;
}
