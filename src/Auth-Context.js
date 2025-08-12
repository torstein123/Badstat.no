import React, { useState, createContext, useEffect } from "react";
import { loginRequest } from "./Auth-service";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, collection, getDocs, getDoc } from "firebase/firestore";

export const AuthenticationContext = createContext();

export const AuthenticationContextProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isFeedbackPositive, setIsFeedbackPositive] = useState(true);

    // Fetch user data from Firestore including subscription info
    const fetchUserData = async (userId) => {
        try {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserData(data);
                return data;
            } else {
                // Create user document if it doesn't exist
                const defaultUserData = {
                    email: user?.email || '',
                    role: 'user',
                    subscriptionStatus: 'free',
                    subscriptionExpiry: null,
                    createdAt: new Date().toISOString()
                };
                await setDoc(userDocRef, defaultUserData);
                setUserData(defaultUserData);
                return defaultUserData;
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    };

    // Check if user has valid premium subscription
    const hasPremiumAccess = () => {
        if (!userData) return false;
        
        // Admin always has access
        if (userData.role === 'admin') return true;
        
        // Check subscription status and expiry
        if (userData.subscriptionStatus === 'premium' && userData.subscriptionExpiry) {
            const expiryDate = new Date(userData.subscriptionExpiry);
            const now = new Date();
            return expiryDate > now;
        }
        
        return false;
    };

    // Update subscription status after successful payment
    const updateSubscriptionStatus = async (userId, vippsOrderId) => {
        try {
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year from now
            
            const userDocRef = doc(db, 'users', userId);
            const updateData = {
                subscriptionStatus: 'premium',
                subscriptionExpiry: expiryDate.toISOString(),
                lastPaymentDate: new Date().toISOString(),
                vippsOrderId: vippsOrderId
            };
            
            await setDoc(userDocRef, updateData, { merge: true });
            setUserData(prev => ({ ...prev, ...updateData }));
            
            return true;
        } catch (error) {
            console.error('Error updating subscription:', error);
            return false;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (usr) => {
            setUser(usr);
            
            if (usr) {
                // Fetch user data when user is authenticated
                await fetchUserData(usr.uid);
            } else {
                setUserData(null);
            }
            
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const onLogin = async (email, password) => {
        setIsLoading(true);
        try {
            const u = await loginRequest(email, password);
            setUser(u);
            await fetchUserData(u.uid);
        } catch (e) {
            setError(e.message);
        }
        setIsLoading(false);
    };

    const onRegister = async (email, password, additionalData) => {
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;

            const defaultUserData = {
                email: newUser.email,
                role: 'user',
                subscriptionStatus: 'free',
                subscriptionExpiry: null,
                createdAt: new Date().toISOString(),
                ...additionalData,
            };

            await setDoc(doc(db, 'users', newUser.uid), defaultUserData);
            setUser(newUser);
            setUserData(defaultUserData);
            return newUser;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const onLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setUserData(null);
        } catch (e) {
            setError(e.message);
        }
    };

    const onGoogleLogin = async () => {
        setIsLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            setUser(result.user);
            await fetchUserData(result.user.uid);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const onResetPassword = async (email) => {
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setFeedbackMessage('Password reset link sent! Check your email.');
            setIsFeedbackPositive(true);
        } catch (error) {
            setFeedbackMessage(error.message);
            setIsFeedbackPositive(false);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserDiaryEntries = async (userId, opponentSpillerId) => {
        if (!user) {
            throw new Error('User not authenticated');
        }
        if (user.uid !== userId) {
            throw new Error('Unauthorized access');
        }

        const querySnapshot = await getDocs(collection(db, `diaries/${userId}/${opponentSpillerId}`));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    return (
        <AuthenticationContext.Provider
            value={{
                isAuthenticated: !!user,
                user,
                userData,
                isLoading,
                error,
                onLogin,
                onRegister,
                onLogout,
                onGoogleLogin,
                feedbackMessage,
                isFeedbackPositive,
                onResetPassword,
                fetchUserDiaryEntries,
                hasPremiumAccess: hasPremiumAccess(),
                updateSubscriptionStatus,
                fetchUserData,
            }}
        >
            {children}
        </AuthenticationContext.Provider>
    );
};
