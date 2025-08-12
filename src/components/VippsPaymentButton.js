import React, { useState, useContext } from 'react';
import { AuthenticationContext } from '../Auth-Context';
import VippsService from '../services/vippsService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheck, faExclamationTriangle, faUser, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const VippsPaymentButton = ({ 
    size = 'normal', // 'small', 'normal', 'large'
    variant = 'primary', // 'primary', 'secondary', 'text'
    showText = true,
    className = '',
    onSuccess = null,
    onError = null,
    redirectToCallback = true // Whether to redirect to /premium/callback for processing
}) => {
    const { user, isAuthenticated, updateSubscriptionStatus } = useContext(AuthenticationContext);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'error', null
    const navigate = useNavigate();

    const handleVippsPayment = async () => {
        if (!isAuthenticated || !user) {
            // Redirect to login page
            navigate('/account');
            return;
        }

        setIsProcessing(true);
        setPaymentStatus(null);

        try {
            console.log('Creating Vipps payment order...');
            const paymentResult = await VippsService.createPaymentOrder(user.uid);
            console.log('Payment result:', paymentResult);

            if (paymentResult.success && paymentResult.url) {
                // Store payment reference for later callback handling
                if (paymentResult.reference) {
                    localStorage.setItem('vipps_payment_reference', paymentResult.reference);
                    console.log('Stored payment reference:', paymentResult.reference);
                }
                
                // Redirect to Vipps payment page
                window.location.href = paymentResult.url;
            } else {
                throw new Error(paymentResult.error || 'Kunne ikke opprette betaling');
            }
        } catch (error) {
            console.error('Payment error:', error);
            setPaymentStatus('error');
            if (onError) onError(error.message);
            setIsProcessing(false);
        }
    };

    // Size configurations
    const sizeClasses = {
        small: {
            button: 'px-3 py-2 text-sm',
            icon: 'h-4 w-4',
            text: 'text-sm'
        },
        normal: {
            button: 'px-6 py-3',
            icon: 'h-5 w-5',
            text: 'text-base'
        },
        large: {
            button: 'px-8 py-4 text-lg',
            icon: 'h-6 w-6',
            text: 'text-lg'
        }
    };

    // Variant configurations
    const variantClasses = {
        primary: 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:from-amber-700 hover:to-yellow-700 shadow-lg hover:shadow-amber-500/25',
        secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/20',
        text: 'text-amber-400 hover:text-amber-300 underline decoration-2 underline-offset-4'
    };

    const currentSize = sizeClasses[size];
    const currentVariant = variantClasses[variant];

    if (paymentStatus === 'success') {
        return (
            <div className={`flex items-center space-x-2 text-green-400 ${currentSize.text}`}>
                <FontAwesomeIcon icon={faCheck} className={currentSize.icon} />
                {showText && <span>Betaling vellykket!</span>}
            </div>
        );
    }

    if (variant === 'text') {
        return (
            <button
                onClick={handleVippsPayment}
                disabled={isProcessing}
                className={`${currentVariant} ${className} disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2`}
            >
                {isProcessing ? (
                    <>
                        <FontAwesomeIcon icon={faSpinner} className={`animate-spin ${currentSize.icon}`} />
                        {showText && <span>Behandler...</span>}
                    </>
                ) : (
                    <>
                        {!isAuthenticated ? (
                            <>
                                <FontAwesomeIcon icon={faSignInAlt} className={currentSize.icon} />
                                {showText && (
                                    <span>
                                        {size === 'small' ? 'Logg inn først' : 'Logg inn for å kjøpe lisens'}
                                    </span>
                                )}
                            </>
                        ) : (
                            <>
                                {showText && <span>Kjøp lisens - 99 NOK</span>}
                            </>
                        )}
                    </>
                )}
            </button>
        );
    }

    return (
        <div className={`inline-block ${className}`}>
            {isProcessing ? (
                <button
                    disabled={true}
                    className={`${currentSize.button} bg-gray-500 text-white font-semibold rounded-lg cursor-not-allowed flex items-center justify-center space-x-2`}
                >
                    <FontAwesomeIcon icon={faSpinner} className={`animate-spin ${currentSize.icon}`} />
                    {showText && <span>Behandler betaling...</span>}
                </button>
            ) : !isAuthenticated ? (
                <button
                    onClick={handleVippsPayment}
                    className={`${currentSize.button} ${currentVariant} font-semibold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2`}
                >
                    <FontAwesomeIcon icon={faSignInAlt} className={currentSize.icon} />
                    {showText && (
                        <span>
                            {size === 'small' ? 'Logg inn først' : 'Logg inn for å kjøpe lisens'}
                        </span>
                    )}
                </button>
            ) : (
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
            )}
            
            {paymentStatus === 'error' && (
                <div className="flex items-center space-x-2 text-red-400 text-sm mt-2">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4" />
                    <span>Betalingen feilet. Prøv igjen.</span>
                </div>
            )}
        </div>
    );
};

export default VippsPaymentButton; 