




const modalOverlay = document.getElementById("modalOverlay");
const modalImage = document.getElementById("modalImage");
const modalClose = document.getElementById("modalClose");
const modalTargets = document.querySelectorAll(".js-modal-image");

let activeThumbnail = null;
let isAnimating = false;
let currentOpenRect = null;

const OPEN_DURATION = 320;
const CLOSE_DURATION = 180;

function getFitRect(img) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const naturalWidth = img.naturalWidth || img.width;
  const naturalHeight = img.naturalHeight || img.height;

  const maxWidth = vw * 0.9;
  const maxHeight = vh * 0.9;

  const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);

  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  const left = (vw - width) / 2;
  const top = (vh - height) / 2;

  return { top, left, width, height };
}

function setBaseRect(rect) {
  modalImage.style.top = `${rect.top}px`;
  modalImage.style.left = `${rect.left}px`;
  modalImage.style.width = `${rect.width}px`;
  modalImage.style.height = `${rect.height}px`;
}

function setTransform(fromRect, toRect) {
  const scaleX = fromRect.width / toRect.width;
  const scaleY = fromRect.height / toRect.height;
  const translateX = fromRect.left - toRect.left;
  const translateY = fromRect.top - toRect.top;

  modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
}

function openModal(img) {
  if (isAnimating) return;
  isAnimating = true;
  activeThumbnail = img;

  const startRect = img.getBoundingClientRect();
  const endRect = getFitRect(img);
  currentOpenRect = endRect;

  modalImage.src = img.src;
  modalImage.alt = img.alt || "";

  setBaseRect(endRect);
  modalImage.style.transition = "none";
  modalImage.style.opacity = "1";
  setTransform(startRect, endRect);

  document.body.classList.add("modal-open");
  modalOverlay.classList.add("is-open");
  modalOverlay.setAttribute("aria-hidden", "false");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      modalImage.style.transition = `transform ${OPEN_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      modalImage.style.transform = "translate(0px, 0px) scale(1, 1)";
    });
  });

  const onOpenEnd = (e) => {
    if (e.propertyName !== "transform") return;
    modalImage.removeEventListener("transitionend", onOpenEnd);
    isAnimating = false;
  };

  modalImage.addEventListener("transitionend", onOpenEnd);
}

function closeModal() {
  if (!activeThumbnail || isAnimating) return;
  isAnimating = true;

  const thumbRect = activeThumbnail.getBoundingClientRect();
  const openRect = currentOpenRect;

  modalImage.style.transition = `transform ${CLOSE_DURATION}ms cubic-bezier(0.55, 0, 0.8, 0.2)`;
  setTransform(thumbRect, openRect);

  modalClose.style.opacity = "0";

  const onCloseEnd = (e) => {
    if (e.propertyName !== "transform") return;
    modalImage.removeEventListener("transitionend", onCloseEnd);

    if (activeThumbnail) {
      activeThumbnail.focus();
    } else {
      modalClose.blur();
    }

    modalOverlay.classList.remove("is-open");
    modalOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    modalImage.src = "";
    modalImage.alt = "";
    modalImage.style.opacity = "0";
    modalImage.style.transition = "none";
    modalImage.style.transform = "translate(0px, 0px) scale(1, 1)";
    modalClose.style.opacity = "";

    activeThumbnail = null;
    currentOpenRect = null;
    isAnimating = false;
  };

  modalImage.addEventListener("transitionend", onCloseEnd);
}

modalTargets.forEach((img) => {
  img.addEventListener("click", () => {
    openModal(img);
  });
});

modalClose.addEventListener("click", closeModal);

window.addEventListener("resize", () => {
  if (!activeThumbnail || isAnimating) return;

  const endRect = getFitRect(activeThumbnail);
  currentOpenRect = endRect;
  setBaseRect(endRect);
  modalImage.style.transition = "none";
  modalImage.style.transform = "translate(0px, 0px) scale(1, 1)";
});

modalOverlay.addEventListener("click", (e) => {

  if (e.target === modalOverlay) {
    closeModal();
  }

});

document.addEventListener("keydown", (e) => {

  if (e.key === "Escape") {
    closeModal();
  }

});