import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface VippsAccessTokenResponse {
  token_type: string;
  expires_in: number;
  ext_expires_in: number;
  expires_on: string;
  not_before: string;
  resource: string;
  access_token: string;
}

function jsonResponse(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Max-Age": "86400",
      ...init?.headers,
    },
    ...init,
  });
}

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get("VIPPS_CLIENT_ID");
  const clientSecret = Deno.env.get("VIPPS_CLIENT_SECRET");
  const subscriptionKey = Deno.env.get("VIPPS_SUBSCRIPTION_KEY");
  const baseUrl = Deno.env.get("VIPPS_BASE_URL") || "https://api.vipps.no";

  if (!clientId || !clientSecret || !subscriptionKey) {
    throw new Error("Missing Vipps credentials");
  }

  const response = await fetch(`${baseUrl}/accesstoken/get`, {
    method: "POST",
    headers: {
      "client_id": clientId,
      "client_secret": clientSecret,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get access token: ${errorText}`);
  }

  const data: VippsAccessTokenResponse = await response.json();
  return data.access_token;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return jsonResponse({}, { status: 204 });
  }

  try {
    const { userId, userEmail } = await req.json();
    if (!userId) {
      return jsonResponse({ error: "Missing userId" }, { status: 400 });
    }

    const baseUrl = Deno.env.get("VIPPS_BASE_URL") || "https://api.vipps.no";
    const subscriptionKey = Deno.env.get("VIPPS_SUBSCRIPTION_KEY");
    const merchantSerialNumber = Deno.env.get("VIPPS_MERCHANT_SERIAL_NUMBER");
    const amountOre = Number(Deno.env.get("VIPPS_AMOUNT_ORE") || "9900"); // Amount in øre (99.00 NOK)

    if (!subscriptionKey || !merchantSerialNumber) {
      return jsonResponse({ error: "Vipps server not configured" }, { status: 500 });
    }

    const accessToken = await getAccessToken();

    // Generate reference (used instead of orderId in ePayment API)
    const reference = `badstat-${userId.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`.substring(0, 64);
    
    console.log('=== VIPPS EPAYMENT API v1 DEBUG ===');
    console.log('Using ePayment API v1 (modern approach)');
    console.log('- Reference:', reference);
    console.log('- Amount (øre):', amountOre);
    console.log('- Merchant Serial Number:', merchantSerialNumber);

    // ePayment API v1 payload structure
    const payload = {
      amount: {
        currency: "NOK",
        value: amountOre
      },
      paymentMethod: {
        type: "WALLET"
      },
      customer: {
        phoneNumber: "47000000000" // Placeholder - user will enter real number in Vipps
      },
      returnUrl: "https://badstat.no/premium/callback",
      userFlow: "WEB_REDIRECT",
      paymentDescription: "Badstat.no Premium Lisens 2025/2026-sesongen",
      reference: reference
    };

    console.log('=== EPAYMENT API PAYLOAD ===');
    console.log(JSON.stringify(payload, null, 2));

    // Call ePayment API v1 create payment endpoint
    const response = await fetch(`${baseUrl}/epayment/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Merchant-Serial-Number": merchantSerialNumber,
        "Vipps-System-Name": "badstat-no",
        "Vipps-System-Version": "1.0.0",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    
    console.log("=== VIPPS EPAYMENT API RESPONSE ===");
    console.log("Status:", response.status);
    console.log("Response body:", responseText);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error("ePayment API error:", responseText);
      return jsonResponse({ 
        success: false, 
        error: `ePayment API error: ${responseText}`,
        api: "ePayment v1"
      }, { status: 500 });
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response:", e);
      return jsonResponse({ 
        success: false, 
        error: "Invalid JSON response from Vipps"
      }, { status: 500 });
    }

    console.log("=== PAYMENT CREATED SUCCESSFULLY ===");
    console.log("Reference:", reference);
    console.log("Redirect URL:", responseData.redirectUrl);

    return jsonResponse({ 
      success: true, 
      reference: reference,
      orderId: reference, // Keep for backward compatibility
      url: responseData.redirectUrl,
      api: "ePayment v1"
    });

  } catch (err) {
    console.error("Error in vipps-create-order:", err);
    return jsonResponse({ 
      success: false, 
      error: String(err),
      api: "ePayment v1"
    }, { status: 500 });
  }
}); 