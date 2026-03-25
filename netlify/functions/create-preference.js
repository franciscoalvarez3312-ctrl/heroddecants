const https = require("https");
const { createClient } = require("@supabase/supabase-js");

// 1. Inicializamos Supabase con tus variables de entorno
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// LA FUENTE DE LA VERDAD: Catálogo de precios seguro
const CATALOGO_PRECIOS = {
  1: { 2: 70, 5: 150, 10: 280 },   // Acqua di Gio EDT
  2: { 2: 80, 5: 160, 10: 300 },   // Acqua di Gio Profondo EDP
  3: { 2: 90, 5: 180, 10: 330 },   // Acqua di Gio Parfum
  4: { 2: 70, 5: 150, 10: 280 },   // Armani Code EDP
  5: { 2: 80, 5: 160, 10: 300 },   // Stronger With You Intensely
  6: { 2: 130, 5: 320, 10: 620 },  // Stronger With You EDT
  7: { 2: 60, 5: 110, 10: 190 },   // The Most Wanted EDT Intense
  8: { 2: 60, 5: 110, 10: 190 },   // The Most Wanted Intense
  9: { 2: 60, 5: 110, 10: 190 },   // Wanted by Night
  10: { 2: 80, 5: 160, 10: 300 },  // Forever Wanted
  11: { 2: 50, 5: 100, 10: 170 },  // Boss Bottled Infinite
  12: { 2: 50, 5: 100, 10: 170 },  // Boss Bottled EDT
  14: { 2: 60, 5: 110, 10: 190 },  // Versace Eros EDT
  15: { 2: 70, 5: 150, 10: 270 },  // Versace Eros Flame
  16: { 2: 60, 5: 110, 10: 190 },  // Versace Pour Homme
  17: { 2: 60, 5: 110, 10: 190 },  // Versace Dylan Blue
  19: { 2: 60, 5: 110, 10: 190 },  // Montblanc Explorer
  20: { 2: 60, 5: 110, 10: 190 },  // Montblanc Platinum
  21: { 2: 50, 5: 100, 10: 170 },  // Montblanc Starwalker
  22: { 2: 60, 5: 110, 10: 190 },  // Montblanc Legend EDP
  23: { 2: 60, 5: 110, 10: 190 },  // Montblanc Legend Spirit
  24: { 2: 90, 5: 180, 10: 330 },  // JPG Le Male Le Parfum
  25: { 2: 60, 5: 130, 10: 230 },  // JPG Le Male
  26: { 2: 120, 5: 290, 10: 580 }, // JPG Ultra male
  27: { 2: 90, 5: 180, 10: 330 },  // JPG Le Male Elixir
  28: { 2: 90, 5: 180, 10: 330 },  // JPG Le Beau Le Parfum
  29: { 2: 70, 5: 150, 10: 280 },  // JPG Le Beau EDT
  30: { 2: 90, 5: 180, 10: 330 },  // JPG Le Beau Paradise Garden
  32: { 2: 70, 5: 150, 10: 280 },  // Scandal Le Parfum
  34: { 2: 100, 5: 210, 10: 380 }, // Sauvage EDP
  36: { 2: 90, 5: 180, 10: 330 },  // Dior Homme 2020
  37: { 2: 100, 5: 210, 10: 380 }, // Dior Homme Parfum
  38: { 2: 50, 5: 100, 10: 170 },  // Uomo Signature
  41: { 2: 70, 5: 150, 10: 280 },  // Bad Boy Cobalt
  42: { 2: 90, 5: 180, 10: 330 },  // Born in Roma EDT
  43: { 2: 100, 5: 200, 10: 370 }, // Born in Roma Intense
  44: { 2: 90, 5: 180, 10: 330 },  // Born in Roma Coral Fantasy
  47: { 2: 60, 5: 110, 10: 190 },  // Kenzo Homme EDT Intense
  48: { 2: 60, 5: 110, 10: 190 },  // Kenzo Homme EDP
  49: { 2: 60, 5: 110, 10: 190 },  // Kenzo Homme Marine
  51: { 2: 70, 5: 150, 10: 280 },  // Le Sel d'Issey EDT
  52: { 2: 90, 5: 200, 10: 360 },  // Y EDP
  54: { 2: 90, 5: 200, 10: 360 },  // Myself EDP
  55: { 2: 90, 5: 180, 10: 330 },  // L'Homme
  57: { 2: 120, 5: 260, 10: 490 }, // Terre d'Hermès Parfum
  58: { 2: 90, 5: 180, 10: 330 },  // Terre d'Hermès Eau Givrée
  60: { 2: 70, 5: 150, 10: 280 },  // Polo Blue Parfum
  61: { 2: 70, 5: 150, 10: 280 },  // Polo Red Parfum
  64: { 2: 60, 5: 110, 10: 190 },  // Light Blue EDT 2025
  65: { 2: 60, 5: 110, 10: 190 },  // Light Blue Intense
  66: { 2: 70, 5: 150, 10: 280 },  // K EDP
  67: { 2: 40, 5: 80, 10: 140 },   // Club de Nuit Intense Man
  68: { 2: 40, 5: 80, 10: 140 },   // Club de Nuit Urban Man
  69: { 2: 40, 5: 80, 10: 140 },   // Club de Nuit Iconic
  70: { 2: 40, 5: 70, 10: 120 },   // Asad
  71: { 2: 40, 5: 80, 10: 140 },   // Asad Elixir
  72: { 2: 40, 5: 80, 10: 140 },   // Asad Bourbon
  73: { 2: 40, 5: 80, 10: 140 },   // Vintage Radio
  74: { 2: 40, 5: 80, 10: 140 },   // Art of Universe
  75: { 2: 170, 5: 370, 10: 700 }, // Reflection Man
  76: { 2: 170, 5: 370, 10: 700 }, // Erba Pura
  77: { 2: 170, 5: 370, 10: 700 }, // Naxos
  78: { 2: 170, 5: 370, 10: 700 }, // Torino 21
  79: { 2: 240, 5: 540, 10: 1010 },// Aventus
  80: { 2: 90, 5: 200, 10: 360 },  // Bois Impérial
  81: { 2: 180, 5: 400, 10: 750 }, // Layton
  83: { 2: 70, 5: 140, 10: 250 },  // Spicebomb EDT
  84: { 2: 70, 5: 150, 10: 280 },  // Gentleman Society EDP
  85: { 2: 90, 5: 180, 10: 330 }   // Gentleman Society Ambree
};

const ENVIO_COSTO = 99;
const ENVIO_GRATIS_DESDE = 1499;

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  if (!ACCESS_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: "Token no configurado" }) };
  }

  const body = JSON.parse(event.body);
  const cartDelFrontend = body.items || [];
  
  let subtotalReal = 0;
  const mpItems = [];

  // 1. Armamos los items de forma segura
  for (const item of cartDelFrontend) {
    if (!CATALOGO_PRECIOS[item.id] || !CATALOGO_PRECIOS[item.id][item.size]) {
      return { statusCode: 400, body: JSON.stringify({ error: `Perfume ID ${item.id} o tamaño ${item.size} inválido` }) };
    }
    
    const precioReal = CATALOGO_PRECIOS[item.id][item.size];
    subtotalReal += (precioReal * item.qty);

    mpItems.push({
      title: `${item.brand} ${item.name} ${item.size}ml`,
      quantity: item.qty,
      unit_price: precioReal,
      currency_id: "MXN"
    });
  }

  // 2. Evaluamos el cupón conectado a Supabase
  if (body.coupon) {
    const { data: cuponData, error } = await supabase
      .from("cupones")
      .select("*")
      .eq("codigo", body.coupon.toUpperCase().trim())
      .single();

    if (cuponData && !cuponData.usado) {
      const emailValido = !cuponData.email || (body.buyer?.email && cuponData.email.toLowerCase() === body.buyer.email.toLowerCase());
      
      if (emailValido) {
        const porcentaje = cuponData.descuento || 10;
        const descuentoReal = Math.round(subtotalReal * (porcentaje / 100));
        
        mpItems.push({
          title: `Descuento cupón ${cuponData.codigo}`,
          quantity: 1,
          unit_price: -descuentoReal,
          currency_id: "MXN"
        });
      }
    }
  }

  // 3. Evaluamos el envío
  let costoEnvioFinal = 0;
  if (body.shipping && body.shipping.type === "Express") {
    costoEnvioFinal = 179;
  } else if (subtotalReal < ENVIO_GRATIS_DESDE) {
    costoEnvioFinal = ENVIO_COSTO;
  }

  if (costoEnvioFinal > 0) {
    mpItems.push({
      title: body.shipping && body.shipping.type === "Express" ? "Envío Express" : "Envío Estándar",
      quantity: 1,
      unit_price: costoEnvioFinal,
      currency_id: "MXN"
    });
  }
