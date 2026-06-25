// Bréval — interactions front (brouillon)
// Seul comportement réel : le menu burger mobile.
// Le calendrier de réservation (Lot 1) est purement visuel — aucune logique ici.

(function () {
  "use strict";

  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Referme le menu après un clic sur un lien (mobile)
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Lightbox de la galerie (Lot 1) — agrandissement et navigation gauche/droite.
  var gallery = document.querySelector("[data-gallery]");
  if (gallery) {
    var items = Array.from(gallery.querySelectorAll(".marquee__item:not([aria-hidden]) [data-full]"));
    var currentIdx = 0;

    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML =
      '<button type="button" class="lightbox__close" aria-label="Fermer">×</button>' +
      '<button type="button" class="lightbox__prev" aria-label="Précédent">‹</button>' +
      '<img alt="">' +
      '<button type="button" class="lightbox__next" aria-label="Suivant">›</button>';
    document.body.appendChild(box);
    var boxImg = box.querySelector("img");

    function showItem(idx) {
      currentIdx = (idx + items.length) % items.length;
      var btn = items[currentIdx];
      var img = btn.querySelector("img");
      boxImg.src = btn.getAttribute("data-full");
      boxImg.alt = img ? img.alt : "";
    }
    function openLightbox(btn) {
      var idx = items.indexOf(btn);
      showItem(idx >= 0 ? idx : 0);
      box.classList.add("is-open");
    }
    function closeLightbox() {
      box.classList.remove("is-open");
      boxImg.src = "";
    }

    gallery.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-full]");
      if (!btn) return;
      openLightbox(btn);
    });
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target.closest(".lightbox__close")) {
        closeLightbox();
      } else if (e.target.closest(".lightbox__prev")) {
        showItem(currentIdx - 1);
      } else if (e.target.closest(".lightbox__next")) {
        showItem(currentIdx + 1);
      }
    });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showItem(currentIdx - 1);
      if (e.key === "ArrowRight") showItem(currentIdx + 1);
    });
  }
})();
