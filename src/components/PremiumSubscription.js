import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthenticationContext } from '../Auth-Context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import VippsService from '../services/vippsService';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    faCrown, 
    faCheck, 
    faSpinner, 
    faCreditCard,
    faShield,
    faChartLine,
    faUnlock,
    faStar
} from '@fortawesome/free-solid-svg-icons';

const PremiumSubscription = () => {
    const { user, userData, updateSubscriptionStatus } = useContext(AuthenticationContext);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [debugInfo, setDebugInfo] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    // Check for cancelled status and show debug info
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const status = urlParams.get('status');
        
        if (status === 'cancelled' && location.pathname === '/premium') {
            setDebugInfo(`
                Redirected to cancelled page!
                Path: ${location.pathname}
                Search: ${location.search}
                Status: ${status}
                All params: ${JSON.stringify(Object.fromEntries(urlParams.entries()), null, 2)}
                Time: ${new Date().toLocaleString()}
                
                This means either:
                1. Payment was cancelled in Vipps
                2. Payment timed out
                3. Callback/webhook configuration issue
            `);
        }
    }, [location]);

    // Handle payment callback
    useEffect(() => {
        const handlePaymentCallback = async () => {
            console.log('=== FRONTEND CALLBACK HANDLER ===');
            console.log('Current location:', location);
            console.log('Pathname:', location.pathname);
            console.log('Search params:', location.search);
            
            const urlParams = new URLSearchParams(location.search);
            const reference = urlParams.get('reference') || urlParams.get('orderId'); // Support both
            const status = urlParams.get('status');
            
            console.log('Extracted parameters:');
            console.log('- reference:', reference);
            console.log('- status:', status);
            console.log('- All params:', Object.fromEntries(urlParams.entries()));
            console.log('- User:', user?.uid);
            
            // Show debug info on screen
            const storedPaymentRef = localStorage.getItem('vipps_payment_reference');
            setDebugInfo(`
                Callback detected!
                Path: ${location.pathname}
                Search: ${location.search}
                Reference from URL: ${reference}
                Reference from storage: ${storedPaymentRef}
                Status: ${status}
                User: ${user?.uid}
                API: ePayment v1 (webhook-based)
                Approach: Storage-based reference lookup
            `);
            
            // Check if this is a callback from Vipps ePayment API
            if (location.pathname === '/premium/callback') {
                console.log('Processing Vipps ePayment callback (webhook-based approach)...');
                setIsProcessing(true);
                
                try {
                    // Check for payment reference in localStorage (set when payment was created)
                    const storedPaymentRef = localStorage.getItem('vipps_payment_reference');
                    const paymentRef = reference || storedPaymentRef;
                    
                    console.log('Payment reference from URL:', reference);
                    console.log('Payment reference from storage:', storedPaymentRef);
                    console.log('Using reference:', paymentRef);
                    
                    if (paymentRef) {
                        console.log('Checking payment status for reference:', paymentRef);
                        // Check payment status with Vipps ePayment API
                        const paymentStatus = await VippsService.checkPaymentStatus(paymentRef);
                        console.log('Payment status response:', paymentStatus);
                        console.log('Payment state:', paymentStatus.state);
                        console.log('API version:', paymentStatus.api);
                        
                        // Check if payment was successful - ePayment API uses different states
                        if (paymentStatus && (paymentStatus.state === 'AUTHORIZED' || paymentStatus.state === 'RESERVED')) {
                        
                            console.log('Payment was successful, updating subscription...');
                            // Update user subscription status in Firebase
                            const updateResult = await updateSubscriptionStatus(user.uid, paymentRef);
                            console.log('Subscription update result:', updateResult);
                            
                            if (updateResult) {
                                console.log('Premium access granted successfully!');
                                setPaymentSuccess(true);
                                // Clean up localStorage and URL
                                localStorage.removeItem('vipps_payment_reference');
                                window.history.replaceState({}, '', '/premium');
                            } else {
                                console.error('Failed to update subscription in Firebase');
                                setPaymentError('Betalingen var vellykket, men vi kunne ikke oppdatere din konto. Kontakt support.');
                            }
                        } else {
                            // Payment failed or was cancelled
                            console.log('Payment was not successful:', paymentStatus);
                            setPaymentError('Betalingen ble ikke fullført. Du kan prøve igjen.');
                            localStorage.removeItem('vipps_payment_reference');
                            navigate('/premium?status=cancelled');
                        }
                    } else {
                        // No payment reference found
                        console.error('No payment reference found for callback');
                        setPaymentError('Kunne ikke identifisere betalingen. Kontakt support hvis du har betalt.');
                        navigate('/premium?status=cancelled');
                    }
                } catch (error) {
                    console.error('Error verifying payment:', error);
                    setPaymentError('Kunne ikke verifisere betalingen. Kontakt support hvis du har betalt.');
                } finally {
                    setIsProcessing(false);
                }
            } else {
                console.log('Not a Vipps callback - reference:', reference, 'pathname:', location.pathname);
            }
            console.log('=== END FRONTEND CALLBACK HANDLER ===');
        };

        if (user && location.pathname === '/premium/callback') {
            handlePaymentCallback();
        }
    }, [location, user, updateSubscriptionStatus, navigate]);

    const handleVippsPayment = async () => {
        if (!user) {
            setPaymentError('Du må være logget inn for å kjøpe lisens');
            return;
        }

        setIsProcessing(true);
        setPaymentError(null);

        try {
            // Use real Vipps payment integration
            const paymentResult = await VippsService.createPaymentOrder(user.uid, userData?.email || user.email);
            
            if (paymentResult.success && paymentResult.url) {
                // Store payment reference for later callback handling
                if (paymentResult.reference) {
                    localStorage.setItem('vipps_payment_reference', paymentResult.reference);
                    console.log('Stored payment reference:', paymentResult.reference);
                }
                
                // Redirect to Vipps payment page
                window.location.href = paymentResult.url;
            } else {
                setPaymentError('Kunne ikke opprette Vipps-betaling. Prøv igjen.');
            }
        } catch (error) {
            console.error('Payment error:', error);
            setPaymentError('Det oppstod en feil under opprettelsen av betalingen. Prøv igjen senere.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (paymentSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-6 text-center">
                        <FontAwesomeIcon icon={faCheck} className="h-16 w-16 text-white mb-4" />
                        <h2 className="text-2xl font-bold text-white">Gratulerer!</h2>
                        <p className="text-amber-100">Din lisens til 2025/2026-sesongen er aktivt</p>
                    </div>
                    <div className="p-6 text-center">
                        <p className="text-gray-600 mb-4">
                            Du har nå full tilgang til alle funksjoner på Badstat.no for hele 2025/2026-sesongen!
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-amber-600 hover:to-yellow-600 transition duration-300"
                        >
                            Utforsk Badstat.no
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show debug info if available
    if (debugInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-center">
                        <h2 className="text-2xl font-bold text-white">Debug Info</h2>
                    </div>
                    <div className="p-6">
                        <pre className="text-sm bg-gray-100 p-4 rounded whitespace-pre-wrap">
                            {debugInfo}
                        </pre>
                        <button
                            onClick={() => setDebugInfo('')}
                            className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                        >
                            Close Debug
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="h-20 w-20 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                            <FontAwesomeIcon icon={faCrown} className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Badstat.no Lisens 2025/2026
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
                        Få full tilgang til alle funksjoner og statistikker for hele badmintonsesongen
                    </p>
                    
                    {/* Cost Explanation */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 max-w-3xl mx-auto">
                        <p className="text-blue-200 text-sm leading-relaxed">
                            <strong>Hvorfor lisens?</strong> BadStat.no inneholder over 150.000 kamper i databasen og krever betydelige ressurser for hosting, database og vedlikehold. Lisensmodellen sikrer at vi kan fortsette å levere kvalitetstjenesten du forventer.
                        </p>
                    </div>
                </div>

                {/* Pricing Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-6 text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">Sesong 2025/2026</h2>
                        <div className="text-5xl font-bold text-white mb-2">
                            99 <span className="text-2xl">NOK</span>
                        </div>
                        <p className="text-amber-100">Hele sesongen • Full tilgang</p>
                    </div>

                    {/* Features */}
                    <div className="p-8">
                        <h3 className="text-xl font-semibold text-white mb-6 text-center">
                            Hva får du med lisensen?
                        </h3>
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                             {[
                                 { icon: faChartLine, title: 'Detaljert Spillerstatistikk', desc: 'Se alle spillernes historikk og utvikling' },
                                 { icon: faUnlock, title: 'Head-to-Head Analyser', desc: 'Sammenlign spillere og se historiske oppgjør' },
                                 { icon: faShield, title: '"Spotify Wrapped" År-i-oversikt', desc: 'Personlige årsrapporter med flotte visualiseringer og statistikker' },
                                 { icon: faStar, title: 'Rankingoversikt', desc: 'Følg rankingutvikling gjennom årene' },
                                 { icon: faChartLine, title: 'Turneringsanalyser', desc: 'Detaljert innsikt i turneringsprestasjoner' },
                                 { icon: faUnlock, title: 'Spillerdagbok', desc: 'Personlig dagbok for å følge din utvikling' }
                             ].map((feature, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <FontAwesomeIcon 
                                            icon={feature.icon} 
                                            className="h-5 w-5 text-amber-400 mt-1" 
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">{feature.title}</h4>
                                        <p className="text-gray-300 text-sm">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Payment Button */}
                        <div className="text-center">
                            {paymentError && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                    {paymentError}
                                </div>
                            )}
                            
                            {isProcessing ? (
                                <button
                                    disabled={true}
                                    className="w-full md:w-auto bg-gray-500 text-white font-semibold py-4 px-8 rounded-lg cursor-not-allowed flex items-center justify-center space-x-3"
                                >
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin h-5 w-5" />
                                    <span>Behandler betaling...</span>
                                </button>
                            ) : (
                                <div className="w-full md:w-auto flex justify-center">
                                    <div 
                                        onClick={handleVippsPayment}
                                        className="hover:scale-105 transition-transform duration-200 cursor-pointer"
                                    >
                                        <vipps-mobilepay-button
                                            type="button"
                                            brand="vipps"
                                            language="no"
                                            variant="primary"
                                            rounded="true"
                                            verb="buy"
                                            stretched="false"
                                            branded="true"
                                            loading="false"
                                        ></vipps-mobilepay-button>
                                    </div>
                                </div>
                            )}
                            
                            <p className="text-gray-400 text-sm mt-4">
                                Sikker betaling med Vipps • Gjelder hele 2025/2026-sesongen
                            </p>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">
                        Hvorfor kjøpe lisens?
                    </h3>
                    <p className="text-gray-300">
                        Badstat.no leverer Norges mest omfattende badmintonstatistikk. 
                        Din lisens støtter videre utvikling og drift av tjenesten, 
                        og gir deg tilgang til alle avanserte funksjoner og analyser.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PremiumSubscription; 