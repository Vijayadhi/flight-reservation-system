import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import backIconGift from '../assets/icons/left-arrow.png';
import { Link, useNavigate } from 'react-router-dom';

function LoginComponent() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_API}/user/user_login`, { email, password });

            // Store the token in session storage
            const { token, message } = response.data;
            sessionStorage.setItem('token', token);

            // Show success message using react-hot-toast
            toast.success(message);

            // Redirect to the home page or dashboard after login
            navigate('/dashboard');

        } catch (error) {
            // Show error message using react-hot-toast
            toast.error('Invalid credentials. Please try again.');
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                    <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                        <div className="max-w-md mx-auto">
                            <button className='button' onClick={() => navigate('/')}>
                                <img src={backIconGift} alt="" className="absolute left-10 top-1/8 transform -translate-y-1/2 h-7 w-7 bold" />
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
                                                type="text"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:borer-rose-600"
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
                                                className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:borer-rose-600"
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
