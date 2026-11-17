const cart = new Map();

const cartCount = document.getElementById("cart-count");
const cartPanel = document.getElementById("cart-panel");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const toast = document.getElementById("toast");
const searchPanel = document.getElementById("search-panel");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function getCartQuantity() {
  return [...cart.values()].reduce((sum, item) => sum + item.quantity, 0);
}

function renderCart() {
  cartCount.textContent = getCartQuantity();
  const entries = [...cart.entries()];
  if (!entries.length) {
    cartItems.innerHTML = '<p class="empty-cart">Your basket is waiting for something sweet!</p>';
    cartTotal.textContent = "AED 0";
    return;
  }

  cartItems.innerHTML = entries.map(([name, item]) => `
    <div class="cart-row">
      <div><strong>${name}</strong><small>AED ${item.price} each</small></div>
      <div class="quantity">
        <button data-change="-1" data-name="${name}" aria-label="Remove one ${name}">−</button>
        <span>${item.quantity}</span>
        <button data-change="1" data-name="${name}" aria-label="Add one ${name}">+</button>
      </div>
    </div>
  `).join("");

  const total = entries.reduce((sum, [, item]) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = `AED ${total}`;
}

function openCart() {
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
  overlay.classList.add("visible");
  document.body.classList.add("panel-open");
}
function closePanels() {
  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
  searchPanel.classList.remove("open");
  searchPanel.setAttribute("aria-hidden", "true");
  overlay.classList.remove("visible");
  document.body.classList.remove("panel-open");
}

document.querySelectorAll("[data-add]").forEach(button => {
  button.addEventListener("click", () => {
    const product = button.closest(".product-card");
    const name = product.dataset.name;
    const price = Number(product.dataset.price);
    const existing = cart.get(name);
    cart.set(name, { price, quantity: existing ? existing.quantity + 1 : 1 });
    renderCart();
    showToast(`${name} added to your basket!`);
  });
});

cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-change]");
  if (!button) return;
  const name = button.dataset.name;
  const item = cart.get(name);
  if (!item) return;
  item.quantity += Number(button.dataset.change);
  if (item.quantity <= 0) cart.delete(name);
  renderCart();
});

document.querySelector(".cart-toggle").addEventListener("click", openCart);
document.querySelector("[data-close-cart]").addEventListener("click", closePanels);
overlay.addEventListener("click", closePanels);

document.querySelector(".search-toggle").addEventListener("click", () => {
  searchPanel.classList.add("open");
  searchPanel.setAttribute("aria-hidden", "false");
  document.getElementById("product-search").focus();
});
document.querySelector("[data-close-search]").addEventListener("click", closePanels);

document.getElementById("product-search").addEventListener("input", event => {
  const term = event.target.value.toLowerCase().trim();
  document.querySelectorAll(".product-card").forEach(card => {
    card.hidden = !card.dataset.name.toLowerCase().includes(term);
  });
  document.getElementById("menu").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector(".menu-toggle").addEventListener("click", event => {
  const nav = document.querySelector(".main-nav");
  const isOpen = nav.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
  event.currentTarget.textContent = isOpen ? "×" : "☰";
});
document.querySelectorAll(".main-nav a").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelector(".main-nav").classList.remove("open");
    document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
    document.querySelector(".menu-toggle").textContent = "☰";
  });
});

document.getElementById("checkout").addEventListener("click", () => {
  if (!cart.size) {
    showToast("Add a treat to your basket first!");
    return;
  }
  showToast("Your basket is ready! Connect a checkout service to accept orders.");
});

document.getElementById("year").textContent = new Date().getFullYear();
renderCart();
