const https = require("https");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  if (!ACCESS_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: "Token no configurado" }) };
  }

  const { items, payer, shipments } = JSON.parse(event.body);

  const preference = {
    items: items,
    payer: {
      name: payer?.name || "",
      email: payer?.email || "cliente@heroddecants.com",
      phone: { number: payer?.phone || "" }
    },
    shipments: shipments || {},
    back_urls: {
      success: "https://heroddecants.com?pago=exitoso",
      failure: "https://heroddecants.com?pago=fallido",
      pending: "https://heroddecants.com?pago=pendiente"
    },
    auto_return: "approved",
    statement_descriptor: "HEROD DECANTS"
  };

  return new Promise((resolve) => {
    const data = JSON.stringify(preference);
    const options = {
      hostname: "api.mercadopago.com",
      path: "/checkout/preferences",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Length": Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        try {
          const result = JSON.parse(body);
          if (result.init_point) {
            resolve({
              statusCode: 200,
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ init_point: result.init_point })
            });
          } else {
            resolve({
              statusCode: 500,
              body: JSON.stringify({ error: "No se pudo crear la preferencia", detail: result })
            });
          }
        } catch(e) {
          resolve({ statusCode: 500, body: JSON.stringify({ error: "Error parsing response" }) });
        }
      });
    });

    req.on("error", (e) => {
      resolve({ statusCode: 500, body: JSON.stringify({ error: e.message }) });
    });

    req.write(data);
    req.end();
  });
};
