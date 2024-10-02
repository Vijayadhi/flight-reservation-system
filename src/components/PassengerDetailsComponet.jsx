import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { getAccessToken, formatDuration } from '../utils/helper';
import { FaTrashAlt } from 'react-icons/fa'; // Import trash icon for removal
import TopBarComponent from './TopBarComponent';

const PassengerDetailsComponent = () => {
    const [flightData, setFlightData] = useState(null);
    const [passengerDetails, setPassengerDetails] = useState([]);

    useEffect(() => {
        // Retrieve flight data from sessionStorage
        const storedFlightData = sessionStorage.getItem('selectedFlightData');
        if (storedFlightData) {
            const parsedFlightData = JSON.parse(storedFlightData);
            setFlightData(parsedFlightData);
            initializePassengerDetails(parsedFlightData.travelerPricings.length);
        }

        const sendFlightOffers = async () => {
            const token = await getAccessToken();
            const requestData = sessionStorage.getItem('selectedFlightData');

            // Parse the retrieved flightOffers data
            const parsedRequestData = JSON.parse(requestData);

            const formattedData = {
                data: {
                    type: "flight-offers-pricing",
                    flightOffers: [parsedRequestData] // Use the parsed data here
                }
            };

            try {
                const res = await axios.post(
                    'https://test.api.amadeus.com/v1/shopping/flight-offers/pricing',
                    formattedData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                console.log(res.data);
            } catch (error) {
                console.error('Error sending flight offers:', error);
            }
        };

        // Call sendFlightOffers only if flight data exists
        if (storedFlightData) {
            sendFlightOffers();
        }
    }, []);

    // Initialize the passenger details with empty fields based on the number of travelers
    const initializePassengerDetails = (travelerCount) => {
        const initialDetails = [];
        for (let i = 0; i < travelerCount; i++) {
            initialDetails.push({ firstName: '', lastName: '', gender: '', dateOfBirth: '', passportNumber: '' });
        }
        setPassengerDetails(initialDetails);
    };

    // Handle change in passenger details input fields
    const handlePassengerDetailChange = (index, field, value) => {
        const updatedDetails = [...passengerDetails];
        updatedDetails[index][field] = value;
        setPassengerDetails(updatedDetails);
    };

    // Handle removing a passenger
    const removePassenger = (index) => {
        const updatedDetails = passengerDetails.filter((_, i) => i !== index);
        setPassengerDetails(updatedDetails);
    };

    // Handle form submission
    const handleSubmit = () => {
        const postData = {
            flightData: flightData,
            passengerDetails: passengerDetails
        };

        console.log('Pre-posting booking data: ', postData);
        // Process booking data
    };

    const maxPassengers = flightData ? flightData.numberOfBookableSeats : 6; // Maximum passengers based on available seats

    const addPassenger = () => {
        if (passengerDetails.length < maxPassengers) {
            setPassengerDetails([...passengerDetails, { firstName: "", lastName: "", gender: "", dateOfBirth: "", passportNumber: "" }]);
        }
    };

    return (
        <>
        <TopBarComponent/>
            <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-white p-6">
                <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-8 animate-fade-in">
                    <h2 className="text-4xl font-extrabold text-center mb-10 text-indigo-700">Passenger Information</h2>

                    {/* Flight Summary */}
                    {flightData && (
                        <div className="flight-summary mb-8 p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-white border border-gray-200 rounded-lg shadow-md transition-transform hover:scale-105">
                            <h3 className="text-2xl font-bold mb-4 text-indigo-700">Flight Summary</h3>

                            {/* Loop through each itinerary */}
                            {flightData.itineraries.map((itinerary, itineraryIndex) => (
                                <div key={itineraryIndex} className="mb-6">
                                    <h4 className="text-xl font-semibold mb-4 text-gray-700">Itinerary {itineraryIndex + 1}</h4>

                                    {/* Loop through each segment in the itinerary */}
                                    {itinerary.segments.map((segment, segmentIndex) => (
                                        <div key={segmentIndex} className="mb-4 p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
                                            <h5 className="text-lg font-semibold text-indigo-600 mb-2">Segment {segmentIndex + 1}</h5>

                                            {/* Departure Details */}
                                            <div className="text-gray-600 mb-2">
                                                <p><strong>Departure Airport Code:</strong> {segment.departure.iataCode}</p>
                                                <p><strong>Departure Terminal:</strong> {segment.departure.terminal || 'N/A'}</p>
                                            </div>

                                            {/* Arrival Details */}
                                            <div className="text-gray-600">
                                                <p><strong>Arrival Airport Code:</strong> {segment.arrival.iataCode}</p>
                                            </div>

                                            {/* Flight Duration */}
                                            <div className="text-gray-600 mt-4">
                                                <p><strong>Flight Duration:</strong> {formatDuration(segment.duration)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {/* Price and Seats */}
                            <div className="flex justify-between items-center text-lg text-gray-600 mt-4">
                                <p><strong>Total Price:</strong> {flightData.price.total} {flightData.price.currency}</p>
                                <p><strong>Seats Available:</strong> {flightData.numberOfBookableSeats}</p>
                            </div>
                        </div>
                    )}

                    {/* Passenger Details Form */}
                    <div className="passenger-details-form">
                        <h3 className="text-3xl font-semibold mb-6 text-gray-700">Enter Passenger Details</h3>

                        {passengerDetails.map((passenger, index) => (
                            <div key={index} className="passenger-form mb-6 p-6 bg-gray-50 border border-gray-300 rounded-lg shadow-sm transition-shadow hover:shadow-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-xl font-semibold text-indigo-600">Passenger {index + 1}</h4>
                                    <button
                                        className="text-red-500 hover:text-red-600 transition-all"
                                        onClick={() => removePassenger(index)}
                                    >
                                        <FaTrashAlt size={18} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-600 font-semibold mb-1">First Name</label>
                                        <input
                                            type="text"
                                            value={passenger.firstName}
                                            onChange={(e) => handlePassengerDetailChange(index, 'firstName', e.target.value)}
                                            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                            placeholder="Enter first name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 font-semibold mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            value={passenger.lastName}
                                            onChange={(e) => handlePassengerDetailChange(index, 'lastName', e.target.value)}
                                            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                            placeholder="Enter last name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 font-semibold mb-1">Gender</label>
                                        <select
                                            value={passenger.gender}
                                            onChange={(e) => handlePassengerDetailChange(index, 'gender', e.target.value)}
                                            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                            required
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 font-semibold mb-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={passenger.dateOfBirth}
                                            onChange={(e) => handlePassengerDetailChange(index, 'dateOfBirth', e.target.value)}
                                            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 font-semibold mb-1">Passport Number</label>
                                        <input
                                            type="text"
                                            value={passenger.passportNumber}
                                            onChange={(e) => handlePassengerDetailChange(index, 'passportNumber', e.target.value)}
                                            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                            placeholder="Enter passport number"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Button to add more passengers, limited by available seats */}
                        {passengerDetails.length < maxPassengers && (
                            <button
                                onClick={addPassenger}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all"
                            >
                                Add Another Passenger
                            </button>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            className="mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all"
                        >
                            Confirm Booking
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PassengerDetailsComponent;
