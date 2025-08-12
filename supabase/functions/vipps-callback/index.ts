import "jsr:@supabase/functions-js/edge-runtime.d.ts";

function redirect(url: string) {
  return new Response(null, { status: 302, headers: { Location: url } });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId") || url.searchParams.get("reference") || "";
  const status = url.searchParams.get("status") || url.searchParams.get("transactionStatus") || "";

  const frontendCallback = Deno.env.get("VIPPS_REDIRECT_URL") || `${url.origin}/premium/callback`;
  const final = new URL(frontendCallback);
  if (orderId) final.searchParams.set("orderId", orderId);
  if (status) final.searchParams.set("status", status);

  return redirect(final.toString());
}); 