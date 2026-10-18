/* Tessell Supply — a function-first storefront engine shared in shape by both
   display demos. Products come from PRODUCTS in app data below (in-file). */
(function () {
  "use strict";
  var PRODUCTS = [
    { id: "ribbon-bow", cat: "hair", name: "Ribbon-Tie Hair Bow", tone: "Blush",
      price: 12.50, was: 17.00, motif: "bow",
      desc: "A hand-tied ribbon bow on a gentle clip, in a matte satin finish.",
      opts: ["Blush", "Ivory", "Sage"] },
    { id: "pearl-pendant", cat: "jewellery", name: "Faux-Pearl Pendant", tone: "Ivory",
      price: 18.00, was: 24.00, motif: "pendant",
      desc: "A single faux-pearl pendant on a fine gold-tone chain, 45 cm with an extender.",
      opts: ["Ivory", "Champagne"] },
    { id: "hoop-trio", cat: "jewellery", name: "Mini Hoop Trio", tone: "Gold-tone",
      price: 14.00, was: 19.00, motif: "hoops",
      desc: "Three pairs of small gold-tone hoops in graduated sizes, nickel-safe posts.",
      opts: ["Gold-tone", "Silver-tone"] },
    { id: "scrunchie-set", cat: "hair", name: "Satin Scrunchie Set", tone: "Set of 3",
      price: 9.50, was: 13.00, motif: "scrunchie",
      desc: "Three satin scrunchies in soft neutrals, gentle on hair and easy on wrists.",
      opts: ["Neutrals", "Pastels"] },
    { id: "phone-strap", cat: "bags", name: "Beaded Phone Strap", tone: "Rose",
      price: 11.00, was: 15.00, motif: "strap",
      desc: "A beaded wrist strap that clips to a phone case — part charm, part insurance.",
      opts: ["Rose", "Pearl mix"] },
    { id: "card-wallet", cat: "bags", name: "Envelope Card Wallet", tone: "Cream",
      price: 19.50, was: 25.00, motif: "wallet",
      desc: "A slim envelope wallet in cream faux leather with room for six cards and folded notes.",
      opts: ["Cream", "Tan"] }
  ];

  var MOTIFS = {
    bow:      '<path d="M60 60 C 40 40, 22 44, 24 60 C 22 76, 40 80, 60 60 C 80 40, 98 44, 96 60 C 98 76, 80 80, 60 60"/><circle cx="60" cy="60" r="5"/>',
    pendant:  '<path d="M38 16 C 46 44, 74 44, 82 16"/><circle cx="60" cy="62" r="11"/>',
    hoops:    '<circle cx="44" cy="58" r="17"/><circle cx="76" cy="58" r="17"/><path d="M44 34 V26 M76 34 V26"/>',
    scrunchie:'<path d="M60 28 C 84 28, 92 48, 84 66 C 76 84, 44 84, 36 66 C 28 48, 36 28, 60 28"/><circle cx="60" cy="56" r="9"/>',
    strap:    '<path d="M34 18 C 34 60, 86 60, 86 18"/><circle cx="42" cy="48" r="4"/><circle cx="60" cy="56" r="4"/><circle cx="78" cy="48" r="4"/>',
    wallet:   '<rect x="26" y="38" width="68" height="46" rx="8"/><path d="M26 54 H94"/>'
  };
  function art(p, cls) {
    return '<svg class="' + (cls || "card-art") + '" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">' + (MOTIFS[p.motif] || MOTIFS.bow) + "</svg>";
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
