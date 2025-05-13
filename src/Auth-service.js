import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase"; // Ensure this is set up correctly for the web

export const signInWithGoogleRedirect = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
};

export const handleRedirectResult = async () => {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            const user = result.user;
            return user;
        }
    } catch (error) {
        console.error("Error handling redirect:", error.message);
        throw error;
    }
};

export const loginRequest = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
        .then(userCredentials => {
            const user = userCredentials.user;
            return user;
        })
        .catch(error => {
            // Instead of alert, we throw an error to be handled by the caller
            throw new Error(error.message);
        });
}
