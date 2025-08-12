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
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*",
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
  console.log('=== VIPPS CHECK STATUS REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    console.log('Handling preflight OPTIONS request');
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    const { reference, orderId } = await req.json();
    
    // Support both old orderId and new reference for backward compatibility
    const paymentReference = reference || orderId;
    
    if (!paymentReference) {
      return jsonResponse({ error: "Missing reference or orderId" }, { status: 400 });
    }

    const baseUrl = Deno.env.get("VIPPS_BASE_URL") || "https://api.vipps.no";
    const subscriptionKey = Deno.env.get("VIPPS_SUBSCRIPTION_KEY");
    const merchantSerialNumber = Deno.env.get("VIPPS_MERCHANT_SERIAL_NUMBER");

    if (!subscriptionKey || !merchantSerialNumber) {
      return jsonResponse({ error: "Vipps server not configured" }, { status: 500 });
    }

    const accessToken = await getAccessToken();

    console.log('=== VIPPS EPAYMENT CHECK STATUS ===');
    console.log('Reference:', paymentReference);
    console.log('Using ePayment API v1');

    // Call ePayment API v1 get payment endpoint
    const response = await fetch(`${baseUrl}/epayment/v1/payments/${paymentReference}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Merchant-Serial-Number": merchantSerialNumber,
        "Vipps-System-Name": "badstat-no",
        "Vipps-System-Version": "1.0.0",
      },
    });

    const responseText = await response.text();
    
    console.log("=== VIPPS CHECK STATUS RESPONSE ===");
    console.log("Status:", response.status);
    console.log("Response body:", responseText);
    
    if (!response.ok) {
      console.error("ePayment check status error:", responseText);
      return jsonResponse({ 
        success: false, 
        error: `ePayment API error: ${responseText}`,
        api: "ePayment v1"
      }, { status: 500 });
    }

    let paymentData;
    try {
      paymentData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response:", e);
      return jsonResponse({ 
        success: false, 
        error: "Invalid JSON response from Vipps"
      }, { status: 500 });
    }

    console.log("=== PAYMENT STATUS ===");
    console.log("State:", paymentData.state);
    console.log("Amount:", paymentData.amount);
    console.log("PSP Reference:", paymentData.pspReference);

    return jsonResponse({ 
      success: true, 
      reference: paymentReference,
      state: paymentData.state,
      amount: paymentData.amount,
      pspReference: paymentData.pspReference,
      aggregate: paymentData.aggregate,
      api: "ePayment v1",
      fullData: paymentData // Include full response for debugging
    });

  } catch (err) {
    console.error("Error in vipps-check-status:", err);
    return jsonResponse({ 
      success: false, 
      error: String(err),
      api: "ePayment v1"
    }, { status: 500 });
  }
}); 