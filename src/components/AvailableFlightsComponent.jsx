import React from 'react';
import { findLogo, formatDuration } from '../utils/helper'; // Import the helper function
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // For notifications

const AvailableFlightsComponent = ({ flightOffers }) => {
    const navigate = useNavigate();

    // Helper function to format the duration
    

    // Function to handle "Book Now" button click
    const handleBookNow = (flight) => {
        // Always store the flight data in localStorage
        sessionStorage.setItem('selectedFlightData', JSON.stringify(flight));
        toast.success('Flight selected successfully!');
        const token = sessionStorage.getItem('token'); // Check if the user is logged in (assuming token is stored in sessionStorage)

        if (!token) {
            // If user is not logged in, redirect to login page
            navigate('/login');
        } else {
            // If user is logged in, redirect to booking confirmation or flight details page
            navigate('/get_passengerDetails');

        }
    };

    return (
        <>
            {flightOffers.meta.count > "0" ? (
                <div className="space-y-6">
                    {flightOffers.data.map((offer) => (
                        <div key={offer.id} className="bg-white rounded-md shadow-md overflow-hidden">
                            <div className="p-4 flex justify-between items-center">
                                <div className="flex items-center">
                                    {/* Dynamically set the airline logo based on the carrier code */}
                                    <img
                                        src={"../../airlines-logos-dataset-master/" + `${findLogo(offer.validatingAirlineCodes[0])}`} // Call the helper to get the airline logo
                                        alt={flightOffers.dictionaries.carriers[offer.validatingAirlineCodes[0]]}
                                        className="h-18 w-15 mr-2"
                                    />
                                    <div>
                                        <p className="text-lg font-medium font-bold">
                                            {flightOffers.dictionaries.carriers[offer.validatingAirlineCodes[0]]}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold">₹{offer.price.total}</p>
                                    <p className="text-sm text-gray-500">per adult</p>
                                    <button
                                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        type="button"
                                        onClick={() => handleBookNow(offer)} // Handle Book Now click
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>

                            {/* Flight itinerary details */}
                            <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-medium">
                                        {new Date(offer.itineraries[0].segments[0].departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-sm text-gray-500">{offer.itineraries[0].segments[0].departure.iataCode}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm text-gray-500 font-bold text-center md-5">
                                        {formatDuration(offer.itineraries[0].duration)}
                                        <div className="h-1 bg-green-500 w-24"></div>
                                        <br />
                                        <Link to="#" className='text-blue-800'>View More Details</Link>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-lg font-medium">
                                        {new Date(offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.iataCode}
                                    </p>
                                </div>
                            </div>

                            {/* Pricing and promotions */}
                            <div className="bg-yellow-100 p-4">
                                <p className="text-sm font-medium text-yellow-800">
                                    <span className="bg-red-500 rounded-full w-2 h-2 inline-block mr-2"></span>
                                    Lock this price starting from ₹{offer.price.base} →
                                </p>
                            </div>

                            {/* Display free amenities for Segment 1 only */}
                            <div className="bg-yellow-100 p-4">
                                {offer.travelerPricings.map((travelerPricing, travelerIndex) => (
                                    <div key={travelerIndex} className="mb-4">
                                        {travelerPricing.fareDetailsBySegment.map((segment, segmentIndex) => (
                                            segmentIndex === 0 && segment.amenities && segment.amenities.length > 0 ? (
                                                <div key={segmentIndex} className="text-sm font-medium text-yellow-800 mb-2">
                                                    <span className="bg-red-500 rounded-full w-2 h-2 inline-block mr-2"></span>
                                                    other Offers :
                                                    <ul className="ml-4 mt-2 list-disc list-inside">
                                                        {segment.amenities
                                                            .filter((amenity) => !amenity.isChargeable) // Filter to show only free amenities
                                                            .map((amenity, amenityIndex) => (
                                                                <li key={amenityIndex}>
                                                                    {amenity.description}
                                                                </li>
                                                            ))}
                                                    </ul>
                                                </div>
                                            ) : null
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <h1 className="text-rose-950 text-center"><b>No Flights Available</b></h1>
            )}
        </>
    );
};

export default AvailableFlightsComponent;
