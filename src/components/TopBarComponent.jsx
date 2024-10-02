import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';

function TopBarComponent() {
    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Contact Us', href: '/contact_us' },
    ];

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('timeout');
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <>
            <header className="absolute inset-x-0 top-0 z-50">
                <nav aria-label="Global" className="flex items-center justify-end p-6 lg:px-8">
                    <div className="flex lg:hidden">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                        >
                            <span className="sr-only">Open main menu</span>
                            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="hidden lg:flex lg:gap-x-12 lg:justify-end text-right">
                        {navigation.map((item) => (
                            <Link key={item.name} to={item.href} className="text-sm font-semibold leading-6 text-gray-900">
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden lg:flex lg:flex-1 lg:justify-end text-right">
                        {!isLoggedIn ? (
                            <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900">
                                Log in <span aria-hidden="true">&rarr;</span>
                            </Link>
                        ) : (
                            <>
                                <Link to="/profile" className="text-sm font-semibold leading-6 text-gray-900">
                                    Profile
                                </Link>
                                <Link to="/bookings" className="ml-6 text-sm font-semibold leading-6 text-gray-900">
                                    My Bookings
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="ml-6 text-sm font-semibold leading-6 text-gray-900"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>

                </nav>


                <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
                    <div className="fixed inset-0 z-50" />

                    <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                        <div className="flex items-center justify-between">
                            <a href="#" className="-m-1.5 p-1.5">
                                <span className="sr-only">Your Company</span>
                                <img
                                    alt=""
                                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                                    className="h-8 w-auto"
                                />
                            </a>
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(false)}
                                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                            >
                                <span className="sr-only">Close menu</span>
                                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mt-6 flow-root">
                            <div className="-my-6 divide-y divide-gray-500/10">
                                <div className="space-y-2 py-6">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 text-right"
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                                <div className="py-6">
                                    {!isLoggedIn ? (
                                        <Link
                                            to="/login"
                                            className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 text-right"
                                        >
                                            Log in
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                to="/profile"
                                                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 text-right"
                                            >
                                                Profile
                                            </Link>
                                            <Link
                                                to="/bookings"
                                                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 text-right"
                                            >
                                                My Bookings
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 text-right"
                                            >
                                                Logout
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </Dialog>
            </header>
        </>
    );
}

export default TopBarComponent;
