export async function sendWhatsAppMessage(to, templateName, components = [], languageCode = "en_US") {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    console.error("❌ WhatsApp Credentials Missing");
    return { success: false, error: "Missing Credentials" };
  }

  const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to: to, // Number must include country code (e.g., 919876543210)
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode }
    }
  };

  if (components && components.length > 0) {
    body.template.components = components;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ WhatsApp API Error:", data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (error) {
    console.error("❌ Network Error:", error);
    return { success: false, error: error.message };
  }
}
