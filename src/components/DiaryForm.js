import { db } from '../firebase'; // Adjust this import path as needed
import { collection, addDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

function DiaryForm({ userId, opponentSpillerId, onEntryAdded }) {
    const [entry, setEntry] = useState({ summary: '', strengths: '', weaknesses: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        console.log('DiaryForm mounted with userId:', userId, 'and opponentSpillerId:', opponentSpillerId);
    }, []);

    function handleChange(e) {
        setEntry({ ...entry, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!userId || !opponentSpillerId) {
            console.error("Missing userId or opponentSpillerId");
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, `diaries/${userId}/${opponentSpillerId}`), {
                ...entry,
                timestamp: new Date().getTime()
            });
            setEntry({ summary: '', strengths: '', weaknesses: '' }); // Reset form
            onEntryAdded();
        } catch (error) {
            console.error("Error adding document: ", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faPen} className="mr-2 text-blue-400" />
                Ny Kampanalyse
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Oppsummering av kampen
                    </label>
                    <textarea
                        name="summary"
                        value={entry.summary}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Hvordan gikk kampen? Hva var avgjørende?"
                        rows="3"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <FontAwesomeIcon icon={faThumbsUp} className="mr-2 text-green-400" />
                        Motstanders styrker
                    </label>
                    <textarea
                        name="strengths"
                        value={entry.strengths}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Hva var motstanderen god på?"
                        rows="2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <FontAwesomeIcon icon={faThumbsDown} className="mr-2 text-red-400" />
                        Motstanders svakheter
                    </label>
                    <textarea
                        name="weaknesses"
                        value={entry.weaknesses}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Hvor kan motstanderen forbedre seg?"
                        rows="2"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                        isSubmitting
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transform hover:scale-105'
                    }`}
                >
                    {isSubmitting ? 'Lagrer...' : 'Lagre analyse'}
                </button>
            </form>
        </div>
    );
}

export default DiaryForm;
