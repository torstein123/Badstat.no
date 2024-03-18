import React, { useState, createContext, useEffect } from "react";
import { loginRequest } from "./Auth-service";
import { createUserWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "./firebase"; // Ensure correct paths
import { doc, setDoc, collection, getDocs } from "firebase/firestore";

export const AuthenticationContext = createContext();

export const AuthenticationContextProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (usr) => {
            setUser(usr);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const onLogin = async (email, password) => {
        setIsLoading(true);
        try {
            const u = await loginRequest(email, password);
            setUser(u);
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

            await setDoc(doc(db, 'users', newUser.uid), {
                email: newUser.email,
                role: 'user',
                ...additionalData,
            });

            setUser(newUser);
            return newUser; // Resolve the promise with the new user
        } catch (error) {
            setError(error.message);
            throw error; // Rethrow the error to handle it in the component
        } finally {
            setIsLoading(false);
        }
    };

    const onLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (e) {
            setError(e.message);
        }
    };
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isFeedbackPositive, setIsFeedbackPositive] = useState(true);
    const onResetPassword = async (email) => {
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setIsFeedbackPositive(true); // Indicate positive feedback
            setFeedbackMessage('Password reset link sent! Check your email.');
        } catch (error) {
            setIsFeedbackPositive(false); // Indicate negative feedback
            setFeedbackMessage(error.message); // Use a more user-friendly message as needed
            setError(error.message);
        }
        setIsLoading(false);
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
                isLoading,
                error,
                onLogin,
                onRegister,
                onLogout,
                feedbackMessage,
                isFeedbackPositive,
                isLoading,
                onResetPassword,
                fetchUserDiaryEntries,
            }}
        >
            {children}
        </AuthenticationContext.Provider>
    );
};
