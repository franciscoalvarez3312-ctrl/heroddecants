const https = require("https");

const SUPABASE_URL = "https://yxmmnomewbbfajigehgb.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY;

exports.handler = async function(event) {
  console.log("URL:", SUPABASE_URL);
  console.log("KEY:", SUPABASE_KEY ? "OK" : "MISSING");

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
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(data || "[]") }));
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

  const { email, name } = JSON.parse(event.body);

  if (!email || !name) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Email y nombre requeridos" }) };
  }

  // Check if email already registered
  const existing = await supabaseRequest("GET", `/rest/v1/cupones?email=eq.${encodeURIComponent(email)}&select=email`);
  if (existing.body && existing.body.length > 0) {
    return { statusCode: 200, headers, body: JSON.stringify({ error: "Este correo ya tiene un cupón registrado" }) };
  }

  // Generate unique code
  const codigo = generateCode();

  // Save to Supabase
  await supabaseRequest("POST", "/rest/v1/cupones", { email, codigo, usado: false });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, codigo, name, email })
  };
};
