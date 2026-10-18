/* Tessell Supply — a function-first storefront engine shared in shape by both
   display demos. Products come from PRODUCTS in app data below (in-file). */
(function () {
  "use strict";
  var PRODUCTS = [
    { id: "grip-case", cat: "cases", name: "Everyday Grip Case", tone: "Slate",
      price: 16.50, was: 22.00, motif: "case",
      desc: "A slim everyday case with a matte grip back and raised edges around the screen and camera.",
      opts: ["Slate", "Sand", "Ink"] },
    { id: "clear-case", cat: "cases", name: "Clear View Case", tone: "Glacier",
      price: 15.00, was: 20.00, motif: "case",
      desc: "A clear case that shows the phone instead of hiding it, with cushioned corners.",
      opts: ["Glacier", "Smoke"] },
    { id: "glass-duo", cat: "glass", name: "Tempered Glass Duo", tone: "2-pack",
      price: 13.50, was: 18.00, motif: "glass",
      desc: "Two tempered-glass screen protectors with an alignment tray, so the spare is ready before you need it.",
      opts: ["Standard", "Privacy"] },
    { id: "mag-wallet", cat: "carry", name: "Snap-On Card Wallet", tone: "Magnetic",
      price: 21.00, was: 26.00, motif: "wallet",
      desc: "A magnetic wallet that snaps to the back of a case and carries two cards.",
      opts: ["Tan", "Black"] },
    { id: "braid-cable", cat: "charge", name: "Braided Charge Cable", tone: "2 m · USB-C",
      price: 11.50, was: 15.00, motif: "cable",
      desc: "A 2-metre braided USB-C cable with reinforced ends, rated for daily coiling.",
      opts: ["Graphite", "Cream"] },
    { id: "charge-dock", cat: "charge", name: "Desktop Charge Dock", tone: "USB-C",
      price: 27.00, was: 34.00, motif: "dock",
      desc: "A weighted desktop dock that holds the phone at reading angle while it charges.",
      opts: ["White", "Charcoal"] }
  ];

  var MOTIFS = {
    case:  '<rect x="34" y="14" width="52" height="92" rx="10"/><circle cx="48" cy="30" r="6"/>',
    glass: '<rect x="34" y="14" width="52" height="92" rx="6"/><path d="M40 96 L80 24"/>',
    wallet:'<rect x="26" y="38" width="68" height="46" rx="8"/><path d="M26 54 H94"/>',
    cable: '<path d="M30 96 C 60 60, 60 60, 92 26"/><rect x="86" y="14" width="10" height="16" rx="2"/>',
    dock:  '<path d="M28 96 H92"/><rect x="44" y="22" width="34" height="58" rx="6" transform="rotate(10 61 51)"/>'
  };
  function art(p, cls) {
    return '<svg class="' + (cls || "card-art") + '" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">' + (MOTIFS[p.motif] || MOTIFS.case) + "</svg>";
  }
  function money(n) { return "$" + n.toFixed(2); }

  var grid = document.getElementById("grid");
  var note = document.getElementById("grid-note");
  function render(filter) {
    var shown = PRODUCTS.filter(function (p) { return filter === "all" || p.cat === filter; });
    grid.innerHTML = shown.map(function (p) {
      return '<article class="card">' +
        '<button type="button" class="card-open" data-open="' + p.id + '">' + art(p) +
        '<span class="card-tone">' + p.tone + "</span></button>" +
        '<div class="card-body"><h3>' + p.name + '</h3>' +
        '<p class="card-price">' + money(p.price) + (p.was ? ' <s>' + money(p.was) + "</s>" : "") + "</p>" +
        '<button type="button" class="add-btn" data-add="' + p.id + '">Add to cart</button></div></article>';
    }).join("");
    note.textContent = "Showing " + shown.length + " of " + PRODUCTS.length + " products.";
  }
  render("all");

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-on"); });
      chip.classList.add("is-on");
      render(chip.getAttribute("data-filter"));
    });
  });

  /* ---- cart ---- */
  var cart = {}; // key: id|opt -> {id, opt, qty}
  var countEl = document.getElementById("cart-count");
  var drawer = document.getElementById("drawer");
  var scrim = document.getElementById("scrim");
  var linesEl = document.getElementById("drawer-lines");
  var totalEl = document.getElementById("drawer-total");

  function cartList() { return Object.keys(cart).map(function (k) { return cart[k]; }); }
  function refresh() {
    var list = cartList();
    var count = list.reduce(function (s, i) { return s + i.qty; }, 0);
    var total = list.reduce(function (s, i) {
      var p = PRODUCTS.find(function (x) { return x.id === i.id; });
      return s + p.price * i.qty;
    }, 0);
    countEl.textContent = count;
    totalEl.textContent = money(total);
    linesEl.innerHTML = list.length ? list.map(function (i) {
      var p = PRODUCTS.find(function (x) { return x.id === i.id; });
      var key = i.id + "|" + i.opt;
      return '<div class="line"><div class="line-info"><strong>' + p.name + "</strong>" +
        '<span>' + i.opt + " · " + money(p.price) + '</span></div>' +
        '<div class="line-qty"><button type="button" data-dec="' + key + '">−</button><span>' + i.qty + '</span>' +
        '<button type="button" data-inc="' + key + '">+</button></div>' +
        '<button type="button" class="line-rm" data-rm="' + key + '">Remove</button></div>';
    }).join("") : '<p class="empty">Your cart is empty — add a product to see the flow.</p>';
  }
  function add(id, opt) {
    var key = id + "|" + opt;
    if (cart[key]) cart[key].qty += 1; else cart[key] = { id: id, opt: opt, qty: 1 };
    refresh();
  }
  function openCart() { drawer.hidden = false; scrim.hidden = false; }
  function closeCart() { drawer.hidden = true; scrim.hidden = true; }
  document.getElementById("cart-open").addEventListener("click", openCart);
  document.getElementById("cart-close").addEventListener("click", closeCart);
  scrim.addEventListener("click", closeCart);
  document.getElementById("checkout-btn").addEventListener("click", function () {
    document.getElementById("drawer-done").hidden = false;
  });
  linesEl.addEventListener("click", function (e) {
    var t = e.target;
    var inc = t.getAttribute("data-inc"), dec = t.getAttribute("data-dec"), rm = t.getAttribute("data-rm");
    if (inc) cart[inc].qty += 1;
    else if (dec) { cart[dec].qty -= 1; if (cart[dec].qty <= 0) delete cart[dec]; }
    else if (rm) delete cart[rm];
    else return;
    refresh();
  });

  /* ---- quick view ---- */
  var quick = document.getElementById("quick");
  var current = null, currentOpt = null;
  function openQuick(p) {
    current = p; currentOpt = p.opts[0];
    document.getElementById("quick-art").innerHTML = art(p, "quick-svg");
    document.getElementById("quick-cat").textContent = p.cat;
    document.getElementById("quick-name").textContent = p.name;
    document.getElementById("quick-desc").textContent = p.desc;
    document.getElementById("quick-price").innerHTML = money(p.price) + (p.was ? " <s>" + money(p.was) + "</s>" : "");
    var opts = document.getElementById("quick-opts");
    opts.innerHTML = p.opts.map(function (o, i) {
      return '<button type="button" class="opt' + (i === 0 ? " is-on" : "") + '" data-opt="' + o + '">' + o + "</button>";
    }).join("");
    opts.querySelectorAll(".opt").forEach(function (b) {
      b.addEventListener("click", function () {
        opts.querySelectorAll(".opt").forEach(function (x) { x.classList.remove("is-on"); });
        b.classList.add("is-on"); currentOpt = b.getAttribute("data-opt");
      });
    });
    if (typeof quick.showModal === "function") quick.showModal(); else quick.setAttribute("open", "");
  }
  document.getElementById("quick-close").addEventListener("click", function () { quick.close(); });
  document.getElementById("quick-add").addEventListener("click", function () {
    if (current) { add(current.id, currentOpt); quick.close(); openCart(); }
  });
  document.addEventListener("click", function (e) {
    var open = e.target.closest ? e.target.closest("[data-open]") : null;
    var addBtn = e.target.closest ? e.target.closest("[data-add]") : null;
    if (open) {
      var p = PRODUCTS.find(function (x) { return x.id === open.getAttribute("data-open"); });
      if (p) openQuick(p);
    } else if (addBtn) {
      var q = PRODUCTS.find(function (x) { return x.id === addBtn.getAttribute("data-add"); });
      if (q) { add(q.id, q.opts[0]); openCart(); }
    }
  });
  refresh();
})();
