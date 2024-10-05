import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { handlePayment } from '../utils/helper';
import TopBarComponent from './TopBarComponent';
import axios from 'axios';
import useSessionTimeout from '../utils/Session';


const BillComponent = () => {
    const [billerName, setBillerName] = useState('');
    const [billerAddress, setBillerAddress] = useState('');
    const [billerEmail, setBillerEmail] = useState('');
    const [billerNumber, setBillerNumber] = useState('');
    const [seats, setSeats] = useState([]);

    useSessionTimeout()

    // Fetch order data from sessionStorage
    const order = sessionStorage.getItem('orderData');
    const orderID = JSON.parse(order);
    const OrID = orderID?.data?.id;
    

    const navigate = useNavigate();

    // useEffect(() => {
    //     if (OrID) {
    //         const token = localStorage.getItem("accessToken");

    //         axios.get(`${import.meta.env.VITE_API_URL}/shopping/seatmaps?flight-orderId=${OrID}`, {
    //             headers: {
    //                 'Authorization': `Bearer ${token}`,
    //             }
    //         })
    //             .then(response => {
    //                 setSeats(response.data.data);
    //                 console.log(response.data);

    //                 // Store seats data in session storage
    //                 localStorage.setItem("seatsData", JSON.stringify(response.data));
    //             })
    //             .catch(error => {
    //                 console.error(error);
    //                 toast.error(error.message || "Server Error");
    //             });
    //     }
    // }, [OrID]);

    // Prevent rendering if order data is missing
    if (!orderID) {
        toast.error("The order data is missing");
        return null;
    }

    const data = {
        name:billerName,
        email: billerEmail,
        orderNumber:  OrID
    }
    console.log(data);
    

    const handlePaymentButton = async () => {
        toast.success("Proceeding to payment...");

        try {
            const paymentSuccess = await handlePayment(payLoad, (paymentId) => {
                // console.log('Payment was successful with ID:', paymentId);

                // Store the payment ID in session storage
                sessionStorage.setItem('paymentId', paymentId);

                // Navigate to the seat map component

                toast.success("Payment Success");
            });

            if (paymentSuccess) {
                const paymentId = sessionStorage.getItem('paymentId');
                navigate('/seatMap', { state: { OrID } });


                // console.log("Payment ID from session storage:", paymentId);

            }
        } catch (error) {
            console.error('Payment failed:', error);
            localStorage.removeItem(seats);
            toast.error("Payment Failed. Please try again.");
        }
    };

    // Extract flight offer and traveler information from the order data
    const { flightOffers, travelers } = orderID.data;
    const flightOffer = flightOffers[0];
    const traveler = travelers[0];
    const paymentId = sessionStorage.getItem('paymentId');

    const payLoad = {
        name: traveler.name.firstName,
        address: billerAddress,
        amount: flightOffer.price.total,
        email: orderID.email,
        number: traveler.contact.phones[0].number,
        orderNumber: paymentId
    };
    // console.log("frontend", payLoad);
    

    return (
        <>
            <TopBarComponent />
            <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-10 space-y-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Billing Details</h1>

                {/* Flight Details */}
                <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Flight Information</h2>
                    <div className="space-y-2 text-lg">
                        <p className="text-gray-600">
                            <span className="font-semibold">Flight Name:</span> {flightOffer.itineraries[0].segments[0].carrierCode} - {flightOffer.itineraries[0].segments[0].number}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-semibold">Seat Class:</span> {flightOffer.travelerPricings[0].fareDetailsBySegment[0].cabin}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-semibold">Passengers:</span> {traveler.name.firstName} {traveler.name.lastName} ({traveler.travelerType})
                        </p>
                        <p className="text-gray-600">
                            <span className="font-semibold">Price:</span> ₹{flightOffer.price.total}
                        </p>
                    </div>
                </div>

                {/* Biller Information */}
                <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Biller Information</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">Biller's Name</label>
                            <input
                                type="text"
                                value={traveler.name.firstName}
                                onChange={(e) => setBillerName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">Biller's Email</label>
                            <input
                                type="text"
                                value={orderID.email || ''}
                                onChange={(e) => setBillerEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">Biller's Phone Number</label>
                            <input
                                type="number"
                                value={traveler.contact.phones[0].number || ''}
                                onChange={(e) => setBillerNumber(e.target.value)}
                                placeholder="Enter your phone number"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">Biller's Address</label>
                            <input
                                type="text"
                                value={billerAddress}
                                onChange={(e) => setBillerAddress(e.target.value)}
                                placeholder="Enter your address"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Proceed to Payment */}
                <div className="text-center mt-8">
                    <button
                        onClick={handlePaymentButton}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition"
                    >
                        Proceed to Payment
                    </button>
                </div>
            </div>
        </>
    );
};

export default BillComponent;
