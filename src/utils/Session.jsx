// useSessionTimeout.js

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const useSessionTimeout = () => {
    const navigate = useNavigate();

    // Convert timeout string (e.g., '15m') to milliseconds
    const convertTimeoutToMs = (timeout) => {
        const unit = timeout.slice(-1); // Get the last character (unit)
        const value = parseInt(timeout.slice(0, -1), 10); // Get the numerical value

        switch (unit) {
            case 'm': // minutes to ms
                return value * 60 * 1000;
            case 's': // seconds to ms
                return value * 1000;
            default:
                return 0; // Unrecognized format
        }
    };

    useEffect(() => {
        const checkSession = () => {
            const token = sessionStorage.getItem('token');
            const timeout = sessionStorage.getItem('timeOut');

            if (token && timeout) {
                const timeoutInMs = convertTimeoutToMs(timeout);
                const loginTime = parseInt(sessionStorage.getItem('loginTime'), 10) || Date.now();
                const currentTime = Date.now();

                if (currentTime - loginTime >= timeoutInMs) {
                    handleLogout();
                }
            }
        };

        const interval = setInterval(checkSession, 5000); // Check every 5 seconds

        return () => {
            clearInterval(interval);
        };
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem("orderData");
        sessionStorage.removeItem("selectedFlightData")
        sessionStorage.removeItem("payment_response")
        sessionStorage.removeItem("paymentId")
        localStorage.removeItem("seatData")
        

        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
    };
};

export default useSessionTimeout;
