import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase"; // Ensure this is set up correctly for the web

export const loginRequest = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
        .then(userCredentials => {
            const user = userCredentials.user;
            console.log('Logged in with:', user.email);
            // You can return user data or a success message here if needed
            return user;
        })
        .catch(error => {
            // Instead of alert, we throw an error to be handled by the caller
            throw new Error(error.message);
        });
}
