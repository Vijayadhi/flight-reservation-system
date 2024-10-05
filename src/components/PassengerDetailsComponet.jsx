import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { getAccessToken, formatDuration } from '../utils/helper';
import { FaTrashAlt } from 'react-icons/fa'; // Import trash icon for removal
import TopBarComponent from './TopBarComponent';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useSessionTimeout from '../utils/Session';


const PassengerDetailsComponent = () => {
    useSessionTimeout();
    const [flightData, setFlightData] = useState(null);
    const [passengerDetails, setPassengerDetails] = useState([]);
    const [contactDetails, setContactDetails] = useState({
        country_code: '',
        phoneNumber: '',
        email: '',
        address: '',
        flat_no: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        tel_code: ''
    });

    const navigate = useNavigate()
    const [flightOfferPricing, setFlightOfferPricing] = useState()
    useEffect(() => {
        const storedFlightData = sessionStorage.getItem('selectedFlightData');
        if (storedFlightData) {
            const parsedFlightData = JSON.parse(storedFlightData);
            setFlightData(parsedFlightData);

            initializePassengerDetails(parsedFlightData.travelerPricings.length);
        }

        const sendFlightOffers = async (parsedRequestData) => {
            const token = await getAccessToken();
            const formattedData = {
                data: {
                    type: "flight-offers-pricing",
                    flightOffers: [parsedRequestData]
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
                setFlightOfferPricing(res.data)
            } catch (error) {
                toast.error(error.message)
                // console.error('Error sending flight offers:', error);
            }
        };
        sendFlightOffers(flightData)
    }, []);

    const initializePassengerDetails = (travelerCount) => {
        const initialDetails = [];
        for (let i = 0; i < travelerCount; i++) {
            initialDetails.push({
                firstName: '',
                lastName: '',
                gender: '',
                dateOfBirth: '',
                passportNumber: '',
                passportExpiryDate: '',
                passportIssuingCountry: ''
            });
        }
        setPassengerDetails(initialDetails);
    };

    const handlePassengerDetailChange = (index, field, value) => {
        const updatedDetails = [...passengerDetails];
        updatedDetails[index][field] = value;
        setPassengerDetails(updatedDetails);
    };

    const removePassenger = (index) => {
        const updatedDetails = passengerDetails.filter((_, i) => i !== index);
        setPassengerDetails(updatedDetails);
    };

    const handleContactDetailsChange = (field, value) => {
        setContactDetails({ ...contactDetails, [field]: value });
    };

    const validateFields = () => {
        // Validate contact details
        if (!contactDetails.phoneNumber.trim() || !contactDetails.email.trim() || !contactDetails.address.trim()) {
            alert('Please fill out all contact details (phone number, email, and address).');
            return false;
        }

        // Validate each passenger's details
        for (let i = 0; i < passengerDetails.length; i++) {
            const passenger = passengerDetails[i];
            if (!passenger.firstName.trim() || passenger.firstName.trim().length < 2 || !passenger.lastName.trim() || passenger.lastName.trim().length < 2 || !passenger.gender || !passenger.dateOfBirth || !passenger.passportNumber.trim() || passenger.passportNumber.trim().length < 2) {
                alert(`Please fill out all details for Passenger ${i + 1} with a minimum length of 2 characters.`);
                return false;
            }
        }

        // All fields are valid
        return true;
    };

    const handleSubmit = async () => {
        if (!validateFields()) {
            return;
        }
        const storedFlightData = sessionStorage.getItem('selectedFlightData');
        const flightOffer = JSON.parse(storedFlightData);

        const postData = {
            data: {
                type: "flight-order",
                flightOffers: [
                    flightOffer
                ],
                travelers: passengerDetails.map((passenger, index) => ({
                    id: `${index + 1}`, // Unique traveler ID
                    name: {
                        firstName: passenger.firstName,
                        lastName: passenger.lastName.replace(/[^a-zA-Z]/g, ''), // Ensure valid last name
                    },
                    gender: passenger.gender.toUpperCase() === 'MALE' ? 'MALE' : 'FEMALE', // Standardize gender format
                    dateOfBirth: passenger.dateOfBirth,
                    document: {
                        documentType: 'PASSPORT', // Assuming passport
                        number: passenger.passportNumber,
                        expiryDate: passenger.passportExpiryDate, // New field
                        issuingCountry: passenger.passportIssuingCountry, // New field
                    },
                    contact: {
                        email: contactDetails.email,
                        phones: [
                            {
                                countryCallingCode: contactDetails.tel_code, // Example calling code
                                number: contactDetails.phoneNumber,
                                deviceType: 'MOBILE' // Added as per API requirements
                            }
                        ],
                        address: {
                            lines: [
                                `${contactDetails.flat_no} ${contactDetails.address}`, // Street address and building number
                                `${contactDetails.city}`, // City
                            ],
                            cityName: contactDetails.city, // Ensure cityName is provided
                            postalCode: contactDetails.postal_code, // Postal code
                            countryCode: contactDetails.country_code, // Country code
                        }
                    }
                })),
                travelerPricings: passengerDetails.map((passenger, index) => ({
                    travelerId: `${index + 1}`, // Ensure travelerId matches traveler array
                    fare: {
                        amount: flightOffer.price.total, // Ensure correct pricing
                        currency: flightOffer.price.currency, // Ensure correct currency
                    },
                    // Add any other required fields like `pricePerAdult` or similar based on flightOffer data
                }))
            }
        };


        try {
            const token = await getAccessToken();
            const response = await axios.post('https://test.api.amadeus.com/v1/booking/flight-orders', postData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            response.data.email = contactDetails.email
            const orderData = response.data
            if (orderData) {
                // console.log(response.data.id);
                sessionStorage.setItem("orderData", JSON.stringify(response.data));


                navigate('/bill')
            }

            toast.success("flight orders")
            // const payload = pay
            // handlePayment()
            // Handle successful booking response
        } catch (error) {
            alert('Failed to book flight. Please try again later.');
        }
    };


    const maxPassengers = flightData ? flightData.numberOfBookableSeats : 6;

    const addPassenger = () => {
        if (passengerDetails.length < maxPassengers) {
            setPassengerDetails([...passengerDetails, { firstName: "", lastName: "", gender: "", dateOfBirth: "", passportNumber: "" }]);
        }
    };

    return (
        <>
            <TopBarComponent />
            <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-white p-6">
                <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-8 animate-fade-in">
                    <h2 className="text-4xl font-extrabold text-center mb-10 text-indigo-700">Passenger Information</h2>

                    {flightData && (
                        <div className="flight-summary mb-8 p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-white border border-gray-200 rounded-lg shadow-md transition-transform hover:scale-105">
                            <h3 className="text-2xl font-bold mb-4 text-indigo-700">Flight Summary</h3>

                            {flightData.itineraries.map((itinerary, itineraryIndex) => (
                                <div key={itineraryIndex} className="mb-6">
                                    <h4 className="text-xl font-semibold mb-4 text-gray-700">Itinerary {itineraryIndex + 1}</h4>

                                    {itinerary.segments.map((segment, segmentIndex) => (
                                        <div key={segmentIndex} className="mb-4 p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
                                            <h5 className="text-lg font-semibold text-indigo-600 mb-2">Segment {segmentIndex + 1}</h5>

                                            <div className="text-gray-600 mb-2">
                                                <p><strong>Departure Airport Code:</strong> {segment.departure.iataCode}</p>
                                                <p><strong>Departure Terminal:</strong> {segment.departure.terminal || 'N/A'}</p>
                                            </div>

                                            <div className="text-gray-600">
                                                <p><strong>Arrival Airport Code:</strong> {segment.arrival.iataCode}</p>
                                            </div>

                                            <div className="text-gray-600 mt-4">
                                                <p><strong>Flight Duration:</strong> {formatDuration(segment.duration)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}

                            <div className="flex justify-between items-center text-lg text-gray-600 mt-4">
                                <p><strong>Total Price:</strong> {flightData.price.total} {flightData.price.currency}</p>
                                <p><strong>Number of Seats:</strong> {flightData.numberOfBookableSeats}</p>
                            </div>
                        </div>
                    )}

                    <h3 className="text-2xl font-bold my-6 text-indigo-700">Contact Information</h3>
                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="country-code">Country ISD Code</label>
                        <input
                            type="tel"
                            id="country-code"
                            value={contactDetails.tel_code}
                            onChange={(e) => handleContactDetailsChange('tel_code', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            placeholder="Enter your Country Code ex(91)"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="phoneNumber">Phone Number</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            value={contactDetails.phoneNumber}
                            onChange={(e) => handleContactDetailsChange('phoneNumber', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            placeholder="Enter your phone number"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={contactDetails.email}
                            onChange={(e) => handleContactDetailsChange('email', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="flat_no">Flat/House Number</label>
                        <input
                            type="number"
                            id="flat_no"
                            value={contactDetails.flat_no}
                            onChange={(e) => handleContactDetailsChange('flat_no', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            placeholder="Enter your Street/ Flat No."
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="street">Street</label>
                        <input
                            type="text"
                            id="street"
                            value={contactDetails.address}
                            onChange={(e) => handleContactDetailsChange('address', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            placeholder="Enter your street"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="city">City</label>
                        <input
                            type="text"
                            id="city"
                            value={contactDetails.city}
                            onChange={(e) => handleContactDetailsChange('city', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            placeholder="Enter your street"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="state">State</label>
                        <input
                            type="text"
                            id="state"
                            value={contactDetails.state}
                            onChange={(e) => handleContactDetailsChange('state', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            placeholder="Enter your State"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="postal_code">Zip Code</label>
                        <input
                            type="text"
                            id="postal_code"
                            value={contactDetails.postal_code}
                            onChange={(e) => handleContactDetailsChange('postal_code', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            placeholder="Enter your Zip Code"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="country_code">Country Code</label>
                        <input
                            type="text"
                            id="country_code"
                            value={contactDetails.country_code}
                            onChange={(e) => handleContactDetailsChange('country_code', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            placeholder="Enter your Country Code eg(US)"
                        />
                    </div>


                    <h3 className="text-2xl font-bold my-6 text-indigo-700">Passenger Details</h3>

                    {passengerDetails.map((passenger, index) => (
                        <div key={index} className="mb-6 p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
                            <h4 className="text-xl font-semibold mb-2">Passenger {index + 1}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label className="block mb-2" htmlFor={`firstName_${index}`}>First Name</label>
                                    <input
                                        type="text"
                                        id={`firstName_${index}`}
                                        value={passenger.firstName}
                                        onChange={(e) => handlePassengerDetailChange(index, 'firstName', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2"
                                        placeholder="First Name"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-2" htmlFor={`lastName_${index}`}>Last Name</label>
                                    <input
                                        type="text"
                                        id={`lastName_${index}`}
                                        value={passenger.lastName}
                                        onChange={(e) => handlePassengerDetailChange(index, 'lastName', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2"
                                        placeholder="Last Name"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-2" htmlFor={`gender_${index}`}>Gender</label>
                                    <select
                                        id={`gender_${index}`}
                                        value={passenger.gender}
                                        onChange={(e) => handlePassengerDetailChange(index, 'gender', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-2" htmlFor={`dateOfBirth_${index}`}>Date of Birth</label>
                                    <input
                                        type="date"
                                        id={`dateOfBirth_${index}`}
                                        value={passenger.dateOfBirth}
                                        onChange={(e) => handlePassengerDetailChange(index, 'dateOfBirth', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-2" htmlFor={`passportNumber_${index}`}>Passport Number</label>
                                    <input
                                        type="text"
                                        id={`passportNumber_${index}`}
                                        value={passenger.passportNumber}
                                        onChange={(e) => handlePassengerDetailChange(index, 'passportNumber', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2"
                                        placeholder="Passport Number"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-2" htmlFor={`passportExpiryDate_${index}`}>Passport Expiry Date</label>
                                    <input
                                        type="date"
                                        id={`passportExpiryDate_${index}`}
                                        value={passenger.passportExpiryDate}
                                        onChange={(e) => handlePassengerDetailChange(index, 'passportExpiryDate', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-2" htmlFor={`passportIssuingCountry_${index}`}>Passport Issuing Country</label>
                                    <input
                                        type="text"
                                        id={`passportIssuingCountry_${index}`}
                                        value={passenger.passportIssuingCountry}
                                        onChange={(e) => handlePassengerDetailChange(index, 'passportIssuingCountry', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2"
                                        placeholder="Passport Issuing Country"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removePassenger(index)}
                                className="mt-2 flex items-center text-red-600 hover:text-red-800"
                            >
                                <FaTrashAlt className="mr-1" /> Remove Passenger
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addPassenger}
                        className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg mt-4 hover:bg-indigo-700"
                    >
                        Add Another Passenger
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full bg-green-600 text-white font-bold py-2 rounded-lg mt-6 hover:bg-green-700"
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>
        </>
    );
};

export default PassengerDetailsComponent;
