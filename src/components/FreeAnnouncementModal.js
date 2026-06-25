import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCheck, faXmark, faGift } from '@fortawesome/free-solid-svg-icons';

const STORAGE_KEY = 'badstat_free_announcement_seen_v1';

const FreeAnnouncementModal = () => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        try {
            if (!localStorage.getItem(STORAGE_KEY)) {
                setOpen(true);
            }
        } catch (e) {
            setOpen(true);
        }
    }, []);

    const close = () => {
        try {
            localStorage.setItem(STORAGE_KEY, '1');
        } catch (e) {
            // ignore
        }
        setOpen(false);
    };

    if (!open) return null;

    const items = [
        'All ranking- og kampdata oppdateres nå 24/7 (beklager det store mellomrommet mellom oppdateringene tidligere)',
        'Det er nå mulig å se lagseriekamper i profilene',
        'Mer statistikk på lagkamper kommer',
        'Ranking for aldersbestemte klasser kommer snart',
        'Og enda mer'
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={close}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="relative max-w-lg w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

                <button
                    onClick={close}
                    aria-label="Lukk"
                    className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                <div className="relative p-8">
                    <div className="flex justify-center mb-5">
                        <div className="h-16 w-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                            <FontAwesomeIcon icon={faGift} className="h-7 w-7 text-white" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-white text-center mb-3">
                        Badstat er nå gratis!
                    </h2>

                    <p className="text-gray-300 text-center mb-6 leading-relaxed">
                        Tusen takk til alle som har støttet Badstat{' '}
                        <FontAwesomeIcon icon={faHeart} className="text-rose-400 mx-1" />{' '}
                        Støtten deres har gjort det mulig å:
                    </p>

                    <ul className="space-y-3 mb-8">
                        {items.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-200">
                                <span className="flex-shrink-0 mt-1 h-5 w-5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-white" />
                                </span>
                                <span className="text-sm sm:text-base">{item}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={close}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-indigo-500/25"
                    >
                        Ta en titt!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FreeAnnouncementModal;
