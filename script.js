const WHATSAPP_PHONE = '523326684296';

function buildWhatsAppMessage(data) {
  const lines = [
    'Hola HAODE, quiero cotizar:',
    `Nombre: ${data.nombre || 'N/A'}`,
    `Producto: ${data.producto || 'N/A'}`,
    `Cantidad: ${data.cantidad || 'N/A'}`,
    `Ciudad: ${data.ciudad || 'N/A'}`,
  ];

  return lines.join('\n');
}

function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function attachQuoteForm(form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = {
      nombre: String(formData.get('nombre') || '').trim(),
      producto: String(formData.get('producto') || '').trim(),
      cantidad: String(formData.get('cantidad') || '').trim(),
      ciudad: String(formData.get('ciudad') || '').trim(),
    };

    openWhatsApp(buildWhatsAppMessage(data));
  });
}

document.querySelectorAll('[data-quote-form]').forEach(attachQuoteForm);
