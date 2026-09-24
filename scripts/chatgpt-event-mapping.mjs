// Pure preparation only: never loads a pixel or sends a network request.
export function prepareOpenAIEvent(event) {
  if (!event || typeof event !== 'object' || Array.isArray(event) || typeof event.event_id !== 'string' || !/^(?:lead_)?[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(event.event_id || '')) return null;
  const options = { event_id: event.event_id };
  switch (event.event) {
    case 'ViewProduct':
      if (typeof event.product_id !== 'string' || event.product_id.length > 100 || !/^[a-z0-9][a-z0-9-]*$/.test(event.product_id || '') || /\d{10,}/.test(event.product_id.replace(/-/g, ''))) return null;
      return { name: 'contents_viewed', data: { type: 'contents', contents: [{ id: event.product_id, content_type: 'product' }] }, options };
    case 'WhatsAppClick':
      return { name: 'custom', data: { type: 'custom' }, options: { ...options, custom_event_name: 'whatsapp_click' } };
    case 'Lead':
      return event.lead_registered === true ? { name: 'lead_created', data: { type: 'customer_action' }, options } : null;
    default:
      // Purchase is intentionally not mapped until a trusted paid-order integration exists.
      return null;
  }
}
