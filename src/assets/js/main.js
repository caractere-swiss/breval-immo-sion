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

  // Slider galerie — flèches prev/next + compteur.
  var sliderEl = document.querySelector(".slider");
  if (sliderEl) {
    var track = sliderEl.querySelector(".slider__track");
    var slides = sliderEl.querySelectorAll(".slider__slide");
    var counter = sliderEl.querySelector(".slider__counter");
    var total = slides.length;
    var current = 0;

    function slideTo(index) {
      current = Math.max(0, Math.min(index, total - 1));
      track.scrollTo({ left: current * track.clientWidth, behavior: "smooth" });
      if (counter) counter.textContent = (current + 1) + " / " + total;
    }

    sliderEl.querySelector(".slider__arrow--prev").addEventListener("click", function () { slideTo(current - 1); });
    sliderEl.querySelector(".slider__arrow--next").addEventListener("click", function () { slideTo(current + 1); });

    track.addEventListener("scroll", function () {
      var idx = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      if (idx !== current) { current = idx; if (counter) counter.textContent = (current + 1) + " / " + total; }
    }, { passive: true });
  }

  // Lightbox de la galerie (Lot 1) — agrandissement des visuels au clic.
  var gallery = document.querySelector("[data-gallery]");
  if (gallery) {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML =
      '<button type="button" class="lightbox__close" aria-label="Fermer">×</button>' +
      '<img alt="">';
    document.body.appendChild(box);
    var boxImg = box.querySelector("img");

    function openLightbox(src, alt) {
      boxImg.src = src;
      boxImg.alt = alt || "";
      box.classList.add("is-open");
    }
    function closeLightbox() {
      box.classList.remove("is-open");
      boxImg.src = "";
    }

    gallery.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-full]");
      if (!btn) return;
      var img = btn.querySelector("img");
      openLightbox(btn.getAttribute("data-full"), img ? img.alt : "");
    });

    box.addEventListener("click", function (e) {
      // Ferme si clic sur le fond ou le bouton de fermeture (pas sur l'image)
      if (e.target === box || e.target.closest(".lightbox__close")) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && box.classList.contains("is-open")) closeLightbox();
    });
  }
})();
