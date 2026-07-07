const DRAFT_URL = "/data/marketing/daily-ad-latest.json";
const LOCAL_STATE_KEY = "haode-marketing-draft-review-state";

const fields = {
  title: document.querySelector("[data-title]"),
  headline: document.querySelector("[data-headline]"),
  status: document.querySelector("[data-status]"),
  localState: document.querySelector("[data-local-state]"),
  product: document.querySelector("[data-product]"),
  sku: document.querySelector("[data-sku]"),
  category: document.querySelector("[data-category]"),
  stock: document.querySelector("[data-stock]"),
  facebook: document.querySelector("[data-copy-facebook]"),
  tiktok: document.querySelector("[data-copy-tiktok]"),
  whatsapp: document.querySelector("[data-copy-whatsapp]"),
  banner: document.querySelector("[data-copy-banner]"),
  imagePrompt: document.querySelector("[data-image-prompt]"),
  actionStatus: document.querySelector("[data-action-status]")
};

let currentDraft = null;

function text(value, fallback = "-") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function stockText(draft) {
  const qty = Number(draft.stock_qty);
  const qtyText = Number.isFinite(qty) ? `${qty} pzs` : "cantidad no publicada";
  return `${text(draft.stock_location, "CDMX")} · ${qtyText}`;
}

function bannerCopy(draft) {
  return [
    `Website banner: ${text(draft.website_banner_title)}`,
    text(draft.website_banner_subtitle),
    "",
    `App banner: ${text(draft.app_banner_title)}`,
    text(draft.app_banner_subtitle),
    "",
    `CTA: ${text(draft.cta_whatsapp)}`
  ].join("\n");
}

function allCopy(draft) {
  return [
    "[Facebook]",
    text(draft.caption_facebook_es),
    "",
    "[TikTok]",
    text(draft.caption_tiktok_es),
    "",
    "[WhatsApp]",
    text(draft.caption_whatsapp_es),
    "",
    "[Website/App]",
    bannerCopy(draft)
  ].join("\n");
}

function readLocalState(draft) {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_STATE_KEY) || "{}");
    return parsed.date === draft.date && parsed.sku === draft.sku ? parsed.state : "";
  } catch {
    return "";
  }
}

function writeLocalState(state) {
  if (!currentDraft) return;
  localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify({
    date: currentDraft.date,
    sku: currentDraft.sku,
    state,
    updatedAt: new Date().toISOString()
  }));
  applyReviewState(state);
}

function applyReviewState(state) {
  const display = state || "Sin confirmacion local";
  fields.localState.textContent = display === "approved" ? "Aprobado en esta pantalla" : display === "rejected" ? "Rechazado en esta pantalla" : display;
  fields.status.classList.toggle("approved", state === "approved");
  fields.status.classList.toggle("rejected", state === "rejected");
  fields.actionStatus.textContent = state === "approved"
    ? "Estado visual: aprobado. No se publico en Facebook/TikTok."
    : state === "rejected"
      ? "Estado visual: rechazado. No se publico en Facebook/TikTok."
      : "Esperando revisión del jefe.";
}

function renderDraft(draft) {
  currentDraft = draft;
  fields.title.textContent = text(draft.headline_es, "Borrador de publicidad HAODE");
  fields.headline.textContent = `Fecha ${text(draft.date)} · estado del archivo: ${text(draft.status, "draft")}`;
  fields.status.textContent = text(draft.status, "draft");
  fields.product.textContent = text(draft.main_product);
  fields.sku.textContent = text(draft.sku);
  fields.category.textContent = text(draft.main_category);
  fields.stock.textContent = stockText(draft);
  fields.facebook.value = text(draft.caption_facebook_es, "");
  fields.tiktok.value = text(draft.caption_tiktok_es, "");
  fields.whatsapp.value = text(draft.caption_whatsapp_es, "");
  fields.banner.value = bannerCopy(draft);
  fields.imagePrompt.textContent = text(draft.image_prompt, "No hay imagen generada. Solo existe prompt/material de referencia.");
  applyReviewState(readLocalState(draft));
}

async function copyText(value) {
  const copyValue = text(value, "");
  if (!copyValue) return false;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(copyValue);
      return true;
    } catch {
      // Fall through to the textarea copy path for restricted admin previews.
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = copyValue;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  const ok = document.execCommand("copy");
  textarea.remove();
  return ok;
}

async function handleCopy(target) {
  if (!currentDraft) return;
  const map = {
    facebook: fields.facebook.value,
    tiktok: fields.tiktok.value,
    whatsapp: fields.whatsapp.value,
    banner: fields.banner.value,
    all: allCopy(currentDraft)
  };
  const ok = await copyText(map[target]);
  fields.actionStatus.textContent = ok ? "Texto copiado. Pendiente de publicación manual." : "No se pudo copiar el texto.";
}

async function loadDraft() {
  try {
    const response = await fetch(DRAFT_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    renderDraft(await response.json());
  } catch (error) {
    fields.title.textContent = "No se pudo cargar el borrador";
    fields.headline.textContent = `Revisa ${DRAFT_URL}. Error: ${error.message}`;
    fields.actionStatus.textContent = "Sin borrador cargado.";
  }
}

document.querySelector("[data-approve]")?.addEventListener("click", () => writeLocalState("approved"));
document.querySelector("[data-reject]")?.addEventListener("click", () => writeLocalState("rejected"));
document.querySelector("[data-copy-all]")?.addEventListener("click", () => handleCopy("all"));
document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", () => handleCopy(button.dataset.copyTarget));
});

loadDraft();
