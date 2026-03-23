const https = require("https");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const ACCESS_TOKEN = "APP_USR-7282432580755708-032317-278fdcc05ec0be0382d79c31ec88a91b-3287638735";
  const { items } = JSON.parse(event.body);

  const preference = {
    items: items,
    payer: { email: "cliente@heroddecants.com" },
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
        const result = JSON.parse(body);
        if (result.init_point) {
          resolve({
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ init_point: result.init_point })
          });
        } else {
          resolve({
            statusCode: 500,
            body: JSON.stringify({ error: "No se pudo crear la preferencia", detail: result })
          });
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
