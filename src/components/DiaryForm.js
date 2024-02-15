import { db } from '../firebase'; // Adjust this import path as needed
import { collection, addDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import './diary.css'; // Ensure this is correctly pointing to your CSS file

function DiaryForm({ userId, opponentSpillerId, onEntryAdded }) {
    const [entry, setEntry] = useState({ summary: '', strengths: '', weaknesses: '' });

    useEffect(() => {
        console.log('DiaryForm mounted with userId:', userId, 'and opponentSpillerId:', opponentSpillerId);
    }, []);

    function handleChange(e) {
        setEntry({ ...entry, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        console.log('Submitting form with userId:', userId, 'and opponentSpillerId:', opponentSpillerId);
        if (!userId || !opponentSpillerId) {
            console.error("Missing userId or opponentSpillerId");
            return;
        }
        try {
            await addDoc(collection(db, `diaries/${userId}/${opponentSpillerId}`), entry);
            onEntryAdded();
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    }

    return (
        <div className="diary-form-container">
            <form onSubmit={handleSubmit}>
                <textarea name="summary" onChange={handleChange} placeholder="Oppsummering av kampen" />
                <textarea name="strengths" onChange={handleChange} placeholder="Styrker" />
                <textarea name="weaknesses" onChange={handleChange} placeholder="Svakheter" />
                <button type="submit">Loggfør</button>
            </form>
        </div>
    );
}

export default DiaryForm;
