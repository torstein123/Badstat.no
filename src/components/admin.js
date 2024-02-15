import React, { useState, useEffect, useContext } from 'react';
import { AuthenticationContext } from '../Auth-Context';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';

export const AdminComponent = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const { user } = useContext(AuthenticationContext);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists() && userDoc.data().role === 'admin') {
                    setIsAdmin(true);
                    fetchRequests();
                } else {
                    setIsAdmin(false);
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        const fetchRequests = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'linkRequests'));
                const requestsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                setRequests(requestsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [user]);

    const handleRequestAction = async (id, status) => {
        try {
            const requestDoc = doc(db, 'linkRequests', id);
            await updateDoc(requestDoc, { status });
            // Update local state or re-fetch requests
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!isAdmin) return <div>Access Denied</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Admin Panel</h1>
            {requests.map(request => (
                <div key={request.id} style={{ marginBottom: '20px' }}>
                    {/* Display request data */}
                    <p><strong>Player Name:</strong> {request.playerName}</p>
                    <p><strong>User ID:</strong> {request.userId}</p>
                    <p><strong>Status:</strong> {request.status}</p>
                    {/* Add other fields as needed */}
                    
                    {/* Action buttons */}
                    <button onClick={() => handleRequestAction(request.id, 'accepted')}>Accept</button>
                    <button onClick={() => handleRequestAction(request.id, 'denied')}>Deny</button>
                </div>
            ))}
        </div>
    );
};

export default AdminComponent;
