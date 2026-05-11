// ===== details.js =====

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function fetchProduct(id) {
  try {
    const res = await fetch(`https://dummyjson.com/products/${id}`);
    if (!res.ok) throw new Error("Not found");
    const product = await res.json();
    renderProduct(product);
  } catch (err) {
    document.getElementById("loader").innerHTML =
      `<div class="text-center py-5">
        <p style="font-size:3rem;">😕</p>
        <p class="text-danger fw-bold">Product not found.</p>
        <a href="index.html" class="btn btn-dark mt-2">Go Home</a>
      </div>`;
  }
}

function renderProduct(product) {
  document.title = `${product.title} | ShopAPI`;
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

  // Info
  document.getElementById("product-category").textContent = product.category.replace(/-/g, " ");
  document.getElementById("product-name").textContent = product.title;

  const stars = renderStars(product.rating);
  document.getElementById("product-rating").textContent = `${stars} ${product.rating}/5`;

  const stockEl = document.getElementById("product-stock");
  if (product.stock > 0) {
    stockEl.textContent = `✓ In Stock (${product.stock})`;
    stockEl.className = "badge bg-success";
  } else {
    stockEl.textContent = "✗ Out of Stock";
    stockEl.className = "badge bg-danger";
  }

  document.getElementById("product-price").textContent = `$${product.price}`;
  document.getElementById("product-description").textContent = product.description;
  document.getElementById("meta-brand").textContent = product.brand || "—";
  document.getElementById("meta-sku").textContent = product.sku || "—";
  document.getElementById("meta-warranty").textContent = product.warrantyInformation || "—";

  renderReviews(product.reviews || []);

  document.getElementById("loader").classList.add("d-none");
  document.getElementById("product-details").classList.remove("d-none");
}

function renderReviews(reviews) {
  const container = document.getElementById("reviews-container");

  if (!reviews.length) {
    container.innerHTML = `<p class="text-muted">No reviews yet.</p>`;
    return;
  }

  reviews.forEach((review) => {
    const stars = renderStars(review.rating);
    const date = new Date(review.date).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";
    col.innerHTML = `
      <div class="review-card">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="reviewer-name">${review.reviewerName}</span>
          <span style="color:var(--star);">${stars}</span>
        </div>
        <p class="review-date">${date}</p>
        <p class="review-comment mb-0">${review.comment}</p>
      </div>
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

// Scroll To Top
const scrollBtn = document.getElementById("scroll-top");
window.addEventListener("scroll", () => {
  scrollBtn.classList.toggle("visible", window.scrollY > 400);
});
scrollBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Init
const productId = getProductId();
if (productId) {
  fetchProduct(productId);
} else {
  document.getElementById("loader").innerHTML =
    `<div class="text-center py-5">
      <p class="text-danger">No product ID provided.</p>
      <a href="index.html" class="btn btn-dark mt-2">Go Home</a>
    </div>`;
}