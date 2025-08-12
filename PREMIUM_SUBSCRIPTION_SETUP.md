# Premium Subscription System Setup Guide

## Overview
This guide explains how the premium subscription system works and how to integrate it with real Vipps payments.

## System Architecture

### 1. Authentication Context (`src/Auth-Context.js`)
- Extended to include subscription data and premium access checking
- Fetches user data from Firestore including subscription status
- Validates premium access based on subscription expiry date
- Admin users automatically have premium access

### 2. Premium Gate (`src/components/PremiumGate.js`)
- Wrapper component that restricts access to premium content
- Shows upgrade prompts for non-premium users
- Redirects to login for unauthenticated users

### 3. Premium Subscription Page (`src/components/PremiumSubscription.js`)
- Displays subscription pricing and features
- Handles Vipps payment integration
- Currently uses mock payment for development

### 4. Vipps Service (`src/services/vippsService.js`)
- Template for Vipps API integration
- Currently has mock implementation
- Ready for real Vipps API integration

## Firestore Database Structure

### Users Collection
```javascript
{
  email: "user@example.com",
  role: "user", // or "admin"
  subscriptionStatus: "premium", // or "free"
  subscriptionExpiry: "2025-12-31T23:59:59.999Z",
  lastPaymentDate: "2024-12-31T23:59:59.999Z",
  vippsOrderId: "vipps_123456789_abc123",
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

## Setting Up Real Vipps Integration

### 1. Register with Vipps
1. Create a Vipps merchant account at https://vipps.no
2. Get access to Vipps Developer Portal
3. Create a new application for e-commerce payments
4. Obtain your credentials:
   - Client ID
   - Client Secret
   - Subscription Key (Ocp-Apim-Subscription-Key)
   - Merchant Serial Number

### 2. Environment Variables
Create a `.env` file in your project root:
```env
REACT_APP_VIPPS_CLIENT_ID=115daacf-a2fc-4777-bcd1-b54bb96fa33e
REACT_APP_VIPPS_CLIENT_SECRET=7LM8Q~TXn-iX8KSKvn2GYbdJjzikzFx6IitXPaYY
REACT_APP_VIPPS_SUBSCRIPTION_KEY=5ccfc6d558894d579e2974a3d35aa29a
REACT_APP_VIPPS_MERCHANT_SERIAL_NUMBER=1016779
REACT_APP_VIPPS_BASE_URL=https://api.vipps.no  # Production environment
```

**Note:** The credentials are already configured as fallbacks in the VippsService, but using environment variables is recommended for security.

### 3. Backend Implementation (Recommended)
For security reasons, Vipps payment processing should be handled by your backend:

```javascript
// Example Express.js backend endpoint
app.post('/api/create-vipps-payment', async (req, res) => {
  try {
    const { userId, userEmail } = req.body;
    
    // Get Vipps access token
    const accessToken = await getVippsAccessToken();
    
    // Create payment order
    const paymentOrder = await createVippsPaymentOrder(accessToken, userId, userEmail);
    
    res.json({ success: true, ...paymentOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 4. Update Frontend Service
Replace the mock implementation in `src/services/vippsService.js`:

```javascript
// Update handleVippsPayment in PremiumSubscription.js
const handleVippsPayment = async () => {
  try {
    // Call your backend instead of VippsService directly
    const response = await fetch('/api/create-vipps-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.uid,
        userEmail: userData?.email
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Redirect to Vipps payment page
      window.location.href = result.url;
    }
  } catch (error) {
    setPaymentError('Payment failed. Please try again.');
  }
};
```

### 5. Payment Callback Handling
Set up webhook endpoints to handle payment confirmations:

```javascript
app.post('/api/vipps-webhook', async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    if (status === 'RESERVED') {
      // Payment successful - update user subscription
      await updateUserSubscription(orderId);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Error');
  }
});
```

## Current Implementation

### Routes Protected by Premium Gate
- `/MostGames` - Leaderboard
- `/compare/:player1/:player2` - Player comparison
- `/player/:name` - Player details
- `/player/:name/year-in-review` - Year in review
- `/headtohead` - Head to head search
- `/playerlist` - Player list
- `/diary` - Badminton diary
- `/blogg` - Blog posts

### Public Routes (No Premium Required)
- `/` - Home page (with premium upgrade prompts)
- `/register` - User registration
- `/account` - Login/account management
- `/premium` - Premium subscription page
- `/OmOss` - About us
- `/Personvern` - Privacy policy
- `/Vilkar` - Terms of service

## Features Included

### Premium Status Indicators
- Crown icon in navbar for premium users
- Premium status in account screen
- Upgrade buttons for non-premium users
- Lock icons on premium features in home page
- Premium prompts on feature cards

### Subscription Management
- Automatic expiry checking
- Admin override (admins always have premium access)
- Subscription renewal handling

### User Experience
- Beautiful upgrade prompts
- Progress indicators during payment
- Success confirmation pages
- Public home page showcasing premium features
- Conditional navigation based on subscription status

## Testing

### Development Mode
The system currently uses mock payments that simulate the Vipps flow:
1. User clicks "Pay with Vipps"
2. Mock payment processes for 2 seconds
3. Subscription is automatically activated
4. User gains premium access

### Production Checklist
- [ ] Set up real Vipps merchant account
- [ ] Implement backend payment processing
- [ ] Set up webhook endpoints
- [ ] Configure production environment variables
- [ ] Test payment flow thoroughly
- [ ] Set up monitoring and logging

## Security Considerations

1. **Never expose Vipps credentials in frontend code**
2. **Always validate payments on the backend**
3. **Use HTTPS for all payment-related communication**
4. **Implement proper error handling and logging**
5. **Set up webhook validation to prevent fraud**

## Support and Troubleshooting

### Common Issues
1. **Payment not activating subscription**: Check webhook configuration
2. **Users stuck in payment loop**: Implement proper error handling
3. **Subscription not expiring**: Verify cron jobs for expiry checking

### Vipps Documentation
- [Vipps Developer Portal](https://developer.vipps.no/)
- [eCommerce API Guide](https://developer.vipps.no/docs/APIs/ecom-api/)
- [Webhook Integration](https://developer.vipps.no/docs/APIs/ecom-api/vipps-ecom-api-checklist/)

## Pricing
- **Annual subscription**: 99 NOK
- **Payment method**: Vipps
- **Features**: Full access to all statistics and analysis tools

This system provides a solid foundation for premium subscriptions with room for future enhancements like multiple subscription tiers, monthly payments, or additional features. 