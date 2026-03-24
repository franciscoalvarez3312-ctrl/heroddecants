const https = require("https");

const SUPABASE_URL = "https://yxmmnomewbbfajigehgb.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY;

function supabaseRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Prefer": method === "POST" ? "return=representation" : ""
      }
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data || "[]") }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "HEROD-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

exports.handler = async function(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  let email, name;
  try {
    const parsed = JSON.parse(event.body);
    email = parsed.email;
    name = parsed.name;
  } catch(e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Body inválido" }) };
  }

  if (!email || !name) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Email y nombre requeridos" }) };
  }

  const existing = await supabaseRequest("GET", `/rest/v1/cupones?email=eq.${encodeURIComponent(email)}&select=email,codigo`);
  console.log("Existing check:", JSON.stringify(existing));

  if (existing.body && Array.isArray(existing.body) && existing.body.length > 0) {
    const codigoExistente = existing.body[0].codigo;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, codigo: codigoExistente, name, email, reused: true })
    };
  }

  const codigo = generateCode();

  const insert = await supabaseRequest("POST", "/rest/v1/cupones", {
    email,
    codigo,
    usado: false,
    descuento: 10
  });
  console.log("Supabase insert status:", insert.status, "body:", JSON.stringify(insert.body));

  if (insert.status !== 200 && insert.status !== 201) {
    console.error("Error insertando en Supabase:", insert.status, insert.body);
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, codigo, name, email })
  };
};
