# Supabase Edge Functions for Vipps

Functions:
- `vipps-create-order` (POST): Creates a Vipps payment order
- `vipps-check-status` (GET): Retrieves Vipps payment status/details
- `vipps-callback` (GET): Redirect handler from Vipps back to frontend

## Required Secrets (Supabase Project → Edge Functions → Secrets)
- `VIPPS_BASE_URL` = `https://api.vipps.no`
- `VIPPS_CLIENT_ID` = your Vipps Client ID
- `VIPPS_CLIENT_SECRET` = your Vipps Client Secret
- `VIPPS_SUBSCRIPTION_KEY` = your Vipps Ocp-Apim-Subscription-Key
- `VIPPS_MERCHANT_SERIAL_NUMBER` = your Vipps MSN
- `VIPPS_FALLBACK_URL` = `https://badstat.no/premium?status=cancelled` (or your domain)
- `VIPPS_REDIRECT_URL` = `https://badstat.no/premium/callback` (or your domain)
- `VIPPS_AMOUNT_ORE` = `9900`

## Deploy
- Ensure `.cursor/mcp.json` has a valid `--project-ref=<YOUR_PROJECT_REF>` and remove `--read-only`.
- Then I can deploy via MCP, or you can run locally:

```
supabase functions deploy vipps-create-order
supabase functions deploy vipps-check-status
supabase functions deploy vipps-callback
```

## Frontend
Set in `.env` (React):
```
REACT_APP_FUNCTIONS_BASE_URL=https://<YOUR_PROJECT_REF>.functions.supabase.co
```

The app will use these edge functions when `REACT_APP_FUNCTIONS_BASE_URL` is set. 