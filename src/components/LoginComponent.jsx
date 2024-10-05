import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import backIconGift from '../assets/icons/left-arrow.png';
import { Link, useNavigate } from 'react-router-dom';

function LoginComponent() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [logoutTimer, setLogoutTimer] = useState(null); // Keep track of logout timer

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

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_API}/user/user_login`, { email, password });
            const { token, message, timeout } = response.data;

            // Store the token in session storage
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('timeOut', timeout);
            sessionStorage.setItem('loginTime', Date.now()); // Store current time as login time


            // Show success message
            toast.success(message);

            // Convert timeout string to milliseconds
            const timeoutInMs = convertTimeoutToMs(timeout);

            // Set the session timeout for automatic logout
            setSessionTimeout(timeoutInMs);

            // Redirect to home page or dashboard
            navigate('/');

        } catch (error) {
            toast.error('Invalid credentials. Please try again.');
        }
    };

    // Set session timeout for auto-logout
    const setSessionTimeout = (timeoutInMs) => {
        if (timeoutInMs > 0) {
            const timer = setTimeout(() => {
                handleLogout(); // Logout when time expires
            }, timeoutInMs);
            setLogoutTimer(timer); // Store the timer so we can clear it later
        }
    };

    // Handle user logout
    const handleLogout = () => {
        sessionStorage.removeItem("orderData");
        sessionStorage.removeItem("selectedFlightData")
        sessionStorage.removeItem("payment_response")
        sessionStorage.removeItem("paymentId")
        localStorage.removeItem("seatData")
        sessionStorage.removeItem('token');

        
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
    };

    // Handle component unmounting to clear any active timeout
    useEffect(() => {
        // Cleanup function to clear the timeout on unmount
        return () => {
            if (logoutTimer) {
                clearTimeout(logoutTimer); // Clear any active timeout if the component unmounts
            }
        };
    }, [logoutTimer]);

    return (
        <>
            <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                    <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                        <div className="max-w-md mx-auto">
                            <button className='button' onClick={() => navigate('/')}>
                                <img src={backIconGift} alt="Back" className="absolute left-10 top-1/8 transform -translate-y-1/2 h-7 w-7 bold" />
                            </button>
                            <div>
                                <br />
                                <h1 className="text-2xl font-semibold">Login</h1>
                            </div>
                            <div className="divide-y divide-gray-200">
                                <form onSubmit={handleSubmit}>
                                    <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                        <div className="relative">
                                            <input
                                                autoComplete="off"
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-rose-600"
                                                placeholder="Email address"
                                            />
                                            <label
                                                htmlFor="email"
                                                className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                            >
                                                Email Address
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <input
                                                autoComplete="off"
                                                id="password"
                                                name="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-rose-600"
                                                placeholder="Password"
                                            />
                                            <label
                                                htmlFor="password"
                                                className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                            >
                                                Password
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <button
                                                type="submit"
                                                className="bg-cyan-500 text-white rounded-md px-2 py-1"
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <Link to="/register" className='text-blue-600'>New User? <br />Register Here.</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LoginComponent;
