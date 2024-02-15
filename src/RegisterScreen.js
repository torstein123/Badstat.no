import React, { useContext, useState } from 'react';
import { AuthenticationContext } from "./Auth-Context";
import { useNavigate } from 'react-router-dom';


export const RegisterScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [club, setClub] = useState('');
    const [age, setAge] = useState('');

    const { onRegister, error } = useContext(AuthenticationContext);
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            const additionalData = {
                firstName,
                lastName,
                club,
                age,
            };
            await onRegister(email, password, additionalData);
            navigate('/'); // Navigate to home page after successful registration
        } catch (e) {
            console.error("Registration error:", e.message);
        }
    };
    return (
        <div className="container">
            <div className="inputContainer">
                <input
                    placeholder="Fornavn"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input"
                />
                <input
                    placeholder="Etternavn"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input"
                />
                <input
                    placeholder="Klubb"
                    value={club}
                    onChange={(e) => setClub(e.target.value)}
                    className="input"
                />
                <input
                    placeholder="E-post"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                />
                <input
                    placeholder="Passord"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                />
            </div>

            <div className="buttonContainer">
                <button onClick={handleRegister} className="button">
                    Lag bruker
                </button>
            </div>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default RegisterScreen;
