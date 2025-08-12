// Vipps Payment Service
// This is a template for implementing Vipps payment integration
// You'll need to replace this with actual Vipps API calls

const VIPPS_CONFIG = {
    // These should be environment variables in production
    CLIENT_ID: process.env.REACT_APP_VIPPS_CLIENT_ID,
    CLIENT_SECRET: process.env.REACT_APP_VIPPS_CLIENT_SECRET,
    SUBSCRIPTION_KEY: process.env.REACT_APP_VIPPS_SUBSCRIPTION_KEY,
    MERCHANT_SERIAL_NUMBER: process.env.REACT_APP_VIPPS_MERCHANT_SERIAL_NUMBER,
    BASE_URL: process.env.REACT_APP_VIPPS_BASE_URL, // Production environment
    AMOUNT: 9900, // 99 NOK in øre (smallest currency unit)
    CURRENCY: 'NOK',
};

const FUNCTIONS_BASE_URL = "https://pzlqcweunxxcavyzxopg.functions.supabase.co"

class VippsService {
    constructor() {
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    // Get access token from Vipps
    async getAccessToken() {
        try {
            // In a real implementation, this should be done on your backend for security
            const response = await fetch(`${VIPPS_CONFIG.BASE_URL}/accesstoken/get`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'client_id': VIPPS_CONFIG.CLIENT_ID,
                    'client_secret': VIPPS_CONFIG.CLIENT_SECRET,
                    'Ocp-Apim-Subscription-Key': VIPPS_CONFIG.SUBSCRIPTION_KEY,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to get Vipps access token');
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000);
            
            return this.accessToken;
        } catch (error) {
            console.error('Error getting Vipps access token:', error);
            throw error;
        }
    }

    // Check if we have a valid access token
    async ensureValidToken() {
        if (!this.accessToken || Date.now() >= this.tokenExpiry) {
            await this.getAccessToken();
        }
        return this.accessToken;
    }

    // Create a payment order
    async createPaymentOrder(userId, userEmail) {
        try {
            // Prefer secure server call via Supabase Edge Functions if configured
            if (FUNCTIONS_BASE_URL) {
                const response = await fetch(`${FUNCTIONS_BASE_URL}/vipps-create-order`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6bHFjd2V1bnh4Y2F2eXp4b3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODcyNzYsImV4cCI6MjA2OTQ2MzI3Nn0.fMki9KkLeaJc4xH3a3BlnbO_baG_h5FEv8yTcQEk9XY'
                    },
                    body: JSON.stringify({ userId, userEmail }),
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.error || 'Failed to create Vipps payment order');
                }
                return { 
                    orderId: data.reference || data.orderId, // Support both for compatibility
                    reference: data.reference,
                    url: data.url, 
                    success: true,
                    api: data.api
                };
            }

            // Fallback: direct Vipps call (not recommended for production)
            await this.ensureValidToken();

            const orderId = `badstat_${userId}_${Date.now()}`;
            const payload = {
                merchantInfo: {
                    merchantSerialNumber: VIPPS_CONFIG.MERCHANT_SERIAL_NUMBER,
                    fallBack: `${window.location.origin}/premium?status=cancelled`,
                    authToken: this.generateAuthToken(),
                    isApp: false,
                    paymentType: 'eComm Regular Payment'
                },
                customerInfo: {
                    mobileNumber: null,
                },
                transaction: {
                    amount: VIPPS_CONFIG.AMOUNT,
                    transactionText: 'Badstat.no Lisens 2025/2026-sesongen',
                    orderId,
                    timeStamp: new Date().toISOString(),
                    skipLandingPage: false
                }
            };

            const response = await fetch(`${VIPPS_CONFIG.BASE_URL}/ecomm/v2/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`,
                    'X-Request-Id': this.generateRequestId(),
                    'X-Source-Address': window.location.origin,
                    'X-TimeStamp': new Date().toISOString(),
                    'Ocp-Apim-Subscription-Key': VIPPS_CONFIG.SUBSCRIPTION_KEY,
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to create Vipps payment order');
            }

            const data = await response.json();
            return { orderId, url: data.url, success: true };
        } catch (error) {
            console.error('Error creating Vipps payment order:', error);
            throw error;
        }
    }

    // Check payment status
    async checkPaymentStatus(reference) {
        try {
            console.log('=== VIPPS SERVICE CHECK STATUS (ePayment API) ===');
            console.log('Checking status for reference:', reference);
            console.log('Functions base URL:', FUNCTIONS_BASE_URL);
            
            if (FUNCTIONS_BASE_URL) {
                const url = `${FUNCTIONS_BASE_URL}/vipps-check-status`;
                console.log('Making request to:', url);
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6bHFjd2V1bnh4Y2F2eXp4b3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODcyNzYsImV4cCI6MjA2OTQ2MzI3Nn0.fMki9KkLeaJc4xH3a3BlnbO_baG_h5FEv8yTcQEk9XY'
                    },
                    body: JSON.stringify({ 
                        reference: reference,
                        orderId: reference // Support both for compatibility
                    })
                });
                
                console.log('Response status:', response.status);
                console.log('Response headers:', Object.fromEntries(response.headers.entries()));
                
                const data = await response.json();
                console.log('Response data:', data);
                console.log('Payment state:', data.state);
                console.log('API version:', data.api);
                
                if (!response.ok || !data.success) {
                    console.error('Error response:', data);
                    throw new Error(data.error || 'Failed to check Vipps payment status');
                }
                console.log('=== END VIPPS SERVICE CHECK STATUS ===');
                return data;
            }

            // Fallback to direct API call (not recommended, but kept for compatibility)
            await this.ensureValidToken();
            const response = await fetch(`${VIPPS_CONFIG.BASE_URL}/epayment/v1/payments/${reference}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Ocp-Apim-Subscription-Key': VIPPS_CONFIG.SUBSCRIPTION_KEY,
                    'Merchant-Serial-Number': VIPPS_CONFIG.MERCHANT_SERIAL_NUMBER,
                    'Vipps-System-Name': 'badstat-no',
                    'Vipps-System-Version': '1.0.0',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to check payment status');
            }
            return await response.json();
        } catch (error) {
            console.error('Error checking payment status:', error);
            throw error;
        }
    }

    // Mock payment for development
    async mockPayment(userId, userEmail) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    orderId: `mock_${userId}_${Date.now()}`,
                    status: 'RESERVED',
                    success: true
                });
            }, 2000);
        });
    }

    // Generate auth token (should be implemented according to Vipps requirements)
    generateAuthToken() {
        return Math.random().toString(36).substr(2, 16);
    }

    // Generate unique request ID
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Handle payment callback/webhook
    async handlePaymentCallback(orderId, status) {
        // This would typically be handled by your backend
        console.log(`Payment callback received for order ${orderId}: ${status}`);
        return status === 'RESERVED';
    }
}

export default new VippsService(); 