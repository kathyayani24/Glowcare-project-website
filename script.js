(() => {
  const toggle = document.querySelector('.menu-toggle');
  const navWrap = document.querySelector('.nav-wrap');
  if (toggle && navWrap) {
    toggle.addEventListener('click', () => {
      const open = navWrap.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    navWrap.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      navWrap.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const concernSelect = document.getElementById('skin-concern-select');
  const recommendation = document.getElementById('recommendation-result');
  if (concernSelect && recommendation) {
    const recommendations = {
      'Acne': ['Face Wash', 'A gentle cleanse can be a simple part of your routine.'],
      'Dryness': ['Moisturizer', 'Moisturizer helps support comfortable, hydrated-feeling skin.'],
      'Sensitivity': ['Moisturizer', 'Choose a gentle, fragrance-free routine where possible.'],
      'Dark Spots': ['Serum', 'A serum may fit into a routine focused on uneven-looking skin tone.'],
      'Aging': ['Serum', 'A serum can be one step in a consistent skincare routine.'],
      'General Skincare': ['Sunscreen SPF 50', 'Daily broad-spectrum sun protection is an important skincare step.']
    };
    const renderRecommendation = () => {
      const choice = recommendations[concernSelect.value];
      if (!choice) {
        recommendation.innerHTML = '<p>Select a concern above to see a suggested product.</p>';
        return;
      }
      recommendation.innerHTML = `<div class="recommendation-copy"><p class="eyebrow">Suggested for you</p><h3>${choice[0]}</h3><p>${choice[1]}</p></div>`;
    };
    concernSelect.addEventListener('change', renderRecommendation);
    renderRecommendation();
  }

  // The Join GlowCare form submits natively to Salesforce Web-to-Lead.
  // Do not prevent its submit event here, or Salesforce will not receive the lead.

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const message = document.getElementById('contact-form-message');
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;
      message.textContent = 'Thank you for your message. Please email sales@glowcare.com if you need a direct response.';
      message.className = 'form-message success';
      contactForm.reset();
    });
  }

  // Shopping cart. Items persist in this browser via localStorage.
  const productCatalog = {
    'face-wash': { name: 'Face Wash', price: 349, oldPrice: 399 },
    'moisturizer': { name: 'Moisturizer', price: 499, oldPrice: 599 },
    'serum': { name: 'Serum', price: 649, oldPrice: 799 },
    'sunscreen': { name: 'Sunscreen SPF 50', price: 449, oldPrice: 599 }
  };
  const cartKey = 'glowcare-cart-v1';
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(cartKey) || '{}') || {}; } catch (_) { cart = {}; }
  const cartDialog = document.getElementById('cart-dialog');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartContent = document.getElementById('cart-content');
  const checkoutArea = document.getElementById('checkout-area');
  const checkoutForm = document.getElementById('checkout-form');
  const orderReview = document.getElementById('order-review');
  const orderConfirmation = document.getElementById('order-confirmation');

  const money = amount => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  const saveCart = () => { try { localStorage.setItem(cartKey, JSON.stringify(cart)); } catch (_) {} };
  const cartQuantity = () => Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const cartSubtotal = () => Object.entries(cart).reduce((sum, [id, qty]) => sum + ((productCatalog[id]?.price || 0) * qty), 0);

  function renderCart() {
    document.querySelectorAll('.cart-count').forEach(el => { el.textContent = cartQuantity(); });
    if (!cartContent) return;
    const entries = Object.entries(cart).filter(([id, qty]) => productCatalog[id] && qty > 0);
    if (!entries.length) {
      cartContent.hidden = false;
      cartContent.innerHTML = '<div class="cart-empty"><h3>Your bag is empty</h3><p>Add a GlowCare product to get started.</p><button type="button" class="btn cart-continue">Continue shopping</button></div>';
      if (checkoutArea) checkoutArea.hidden = true;
      if (orderReview) orderReview.hidden = true;
      return;
    }
    const subtotal = cartSubtotal();
    cartContent.innerHTML = entries.map(([id, qty]) => {
      const item = productCatalog[id];
      return `<div class="cart-line"><div><h3>${item.name}</h3><p>${money(item.price)} each</p><div class="cart-line-controls"><button class="qty-btn" type="button" data-qty="${id}" data-delta="-1" aria-label="Decrease ${item.name} quantity">−</button><span>Qty: ${qty}</span><button class="qty-btn" type="button" data-qty="${id}" data-delta="1" aria-label="Increase ${item.name} quantity">+</button><button class="remove-item" type="button" data-remove="${id}">Remove</button></div></div><strong>${money(item.price * qty)}</strong></div>`;
    }).join('') + `<div class="cart-summary"><div class="cart-summary-row"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div class="cart-summary-row"><span>Delivery</span><span>Shown at checkout</span></div><div class="cart-summary-row cart-total"><span>Estimated total</span><strong>${money(subtotal)}</strong></div><button class="btn" id="start-checkout" type="button" style="width:100%">Proceed to Checkout</button></div>`;
    if (checkoutArea && !checkoutForm?.dataset.reviewing) checkoutArea.hidden = true;
    if (orderReview) orderReview.hidden = true;
  }

  function openCart() {
    if (!cartDialog || !cartBackdrop) return;
    renderCart();
    cartDialog.hidden = false;
    cartBackdrop.hidden = false;
    document.body.classList.add('cart-open');
    cartDialog.querySelector('.cart-close')?.focus();
  }
  function closeCart() {
    if (!cartDialog || !cartBackdrop) return;
    cartDialog.hidden = true;
    cartBackdrop.hidden = true;
    document.body.classList.remove('cart-open');
    document.querySelector('.cart-open')?.focus();
  }
  function addToCart(id, openAfter = false) {
    if (!productCatalog[id]) return;
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
    renderCart();
    if (openAfter) openCart();
  }

  document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => {
    addToCart(button.dataset.add);
    const old = button.textContent;
    button.textContent = '✓';
    button.setAttribute('aria-label', 'Added to cart');
    window.setTimeout(() => { button.textContent = old; button.setAttribute('aria-label', `Add ${productCatalog[button.dataset.add]?.name || 'product'} to cart`); }, 900);
  }));
  document.querySelectorAll('[data-shop]').forEach(button => button.addEventListener('click', () => addToCart(button.dataset.shop, true)));
  document.querySelectorAll('.cart-open').forEach(button => button.addEventListener('click', openCart));
  cartDialog?.querySelector('.cart-close')?.addEventListener('click', closeCart);
  cartBackdrop?.addEventListener('click', closeCart);
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && cartDialog && !cartDialog.hidden) closeCart(); });
  cartContent?.addEventListener('click', event => {
    const qtyButton = event.target.closest('[data-qty]');
    const removeButton = event.target.closest('[data-remove]');
    if (qtyButton) {
      const id = qtyButton.dataset.qty;
      cart[id] = (cart[id] || 0) + Number(qtyButton.dataset.delta);
      if (cart[id] <= 0) delete cart[id];
      saveCart(); renderCart();
    } else if (removeButton) {
      delete cart[removeButton.dataset.remove]; saveCart(); renderCart();
    } else if (event.target.closest('.cart-continue')) closeCart();
    else if (event.target.closest('#start-checkout')) {
      if (checkoutArea) { checkoutArea.hidden = false; checkoutArea.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      checkoutForm?.querySelector('input')?.focus();
    }
  });

  checkoutForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!checkoutForm.reportValidity()) return;
    const data = new FormData(checkoutForm);
    const orderLines = Object.entries(cart).filter(([id, qty]) => productCatalog[id] && qty > 0)
      .map(([id, qty]) => `<li>${productCatalog[id].name} × ${qty} — ${money(productCatalog[id].price * qty)}</li>`).join('');
    const orderRef = 'GC-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    if (orderReview) {
      orderReview.innerHTML = `<h3>Review your order</h3><div class="order-review-card"><p><strong>Customer:</strong> ${escapeHtml(data.get('name'))}</p><p><strong>Email:</strong> ${escapeHtml(data.get('email'))}</p><p><strong>Delivery address:</strong> ${escapeHtml(data.get('address'))}, ${escapeHtml(data.get('city'))}, ${escapeHtml(data.get('state'))} ${escapeHtml(data.get('pincode'))}</p><p><strong>Phone:</strong> ${escapeHtml(data.get('phone'))}</p><ul>${orderLines}</ul><p><strong>Estimated subtotal: ${money(cartSubtotal())}</strong></p></div><button type="button" class="btn" id="confirm-demo-order">Place Order</button> <button type="button" class="btn btn-secondary" id="edit-delivery">Edit delivery details</button>`;
      orderReview.hidden = false;
      checkoutArea.hidden = true;
      orderReview.dataset.orderRef = orderRef;
      orderReview.dataset.customer = String(data.get('name'));
      orderReview.dataset.email = String(data.get('email'));
      orderReview.dataset.lines = orderLines;
      orderReview.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }
  orderReview?.addEventListener('click', event => {
    if (event.target.closest('#edit-delivery')) {
      orderReview.hidden = true;
      checkoutArea.hidden = false;
      checkoutForm?.querySelector('input')?.focus();
    }
    if (event.target.closest('#confirm-demo-order')) {
      orderConfirmation.innerHTML = `<h3>Thank you, ${escapeHtml(orderReview.dataset.customer)}!</h3><p>Your order reference is <strong>${escapeHtml(orderReview.dataset.orderRef)}</strong>.</p><p>Your order details have been recorded on this page.</p><button type="button" class="btn" id="finish-demo-order">Continue shopping</button>`;
      orderConfirmation.hidden = false;
      orderReview.hidden = true;
      if (cartContent) cartContent.hidden = true;
      if (checkoutArea) checkoutArea.hidden = true;
      cart = {};
      saveCart();
      document.querySelectorAll('.cart-count').forEach(el => { el.textContent = '0'; });
      orderConfirmation.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  orderConfirmation?.addEventListener('click', event => {
    if (event.target.closest('#finish-demo-order')) {
      orderConfirmation.hidden = true;
      if (cartContent) cartContent.hidden = false;
      renderCart();
      closeCart();
    }
  });
  renderCart();

})();
