// netlify/functions/validate-coupon.js
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  const { code, email } = event.queryStringParameters || {};

  if (!code || !email) {
    return { statusCode: 400, headers, body: JSON.stringify({ valid: false, message: "Faltan parámetros." }) };
  }

  const upperCode = code.toUpperCase().trim();
  const lowerEmail = email.toLowerCase().trim();

  // Find coupon in DB
  const { data, error } = await supabase
    .from("cupones")
    .select("*")
    .eq("codigo", upperCode)
    .single();

  if (error || !data) {
    return { statusCode: 200, headers, body: JSON.stringify({ valid: false, message: "Cupón no encontrado." }) };
  }

  // Check if coupon belongs to this email
  if (data.email && data.email.toLowerCase() !== lowerEmail) {
    return { statusCode: 200, headers, body: JSON.stringify({ valid: false, message: "Este cupón no corresponde a tu correo." }) };
  }

  // Check if already used
  if (data.usado) {
    return { statusCode: 200, headers, body: JSON.stringify({ valid: false, message: "Este cupón ya fue utilizado." }) };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ valid: true, discount: data.descuento || 10, message: "Cupón válido." })
  };
};
