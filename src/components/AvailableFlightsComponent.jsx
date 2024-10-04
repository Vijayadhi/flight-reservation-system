import React, { useState } from 'react';
import { findLogo, formatDuration } from '../utils/helper'; // Import the helper function
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // For notifications

const AvailableFlightsComponent = ({ flightOffers }) => {
    const navigate = useNavigate();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null, secondaryKey: null });
    const [compareList, setCompareList] = useState([]); // State to keep track of selected flights for comparison

    // Sort function based on the selected key and direction
    const sortFlights = (flights, config) => {
        if (config.key) {
            const sortedFlights = [...flights].sort((a, b) => {
                const valA = config.key === 'price' ? parseFloat(a.price.total) : a.itineraries[0].duration;
                const valB = config.key === 'price' ? parseFloat(b.price.total) : b.itineraries[0].duration;

                if (valA < valB) {
                    return config.direction === 'asc' ? -1 : 1;
                }
                if (valA > valB) {
                    return config.direction === 'asc' ? 1 : -1;
                }
                
                // If primary sort values are equal, apply secondary sort
                if (config.secondaryKey) {
                    const secondaryValA = config.secondaryKey === 'price' ? parseFloat(a.price.total) : a.itineraries[0].duration;
                    const secondaryValB = config.secondaryKey === 'price' ? parseFloat(b.price.total) : b.itineraries[0].duration;
                    
                    if (secondaryValA < secondaryValB) {
                        return config.direction === 'asc' ? -1 : 1;
                    }
                    if (secondaryValA > secondaryValB) {
                        return config.direction === 'asc' ? 1 : -1;
                    }
                }
                
                return 0;
            });
            return sortedFlights;
        }
        return flights;
    };

    // Function to handle "Book Now" button click
    const handleBookNow = (flight) => {
        sessionStorage.setItem('selectedFlightData', JSON.stringify(flight));
        toast.success('Flight selected successfully!');
        const token = sessionStorage.getItem('token'); // Check if the user is logged in

        if (!token) {
            navigate('/login'); // Redirect to login if not logged in
        } else {
            navigate('/get_passengerDetails'); // Redirect to booking page if logged in
        }
    };

    // Function to set sorting config (key and direction)
    const handleSort = (key, secondaryKey = null) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction, secondaryKey });
    };

    // Function to handle flight comparison
    const handleCompare = (flight) => {
        if (compareList.length < 3 && !compareList.some(f => f.id === flight.id)) {
            setCompareList([...compareList, flight]);
        } else if (compareList.some(f => f.id === flight.id)) {
            setCompareList(compareList.filter(f => f.id !== flight.id));
        } else {
            toast.error('You can only compare up to 3 flights!');
        }
    };

    // Sorted flight offers
    const sortedFlights = sortFlights(flightOffers.data, sortConfig);

    return (
        <>
            {/* Sorting Controls */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-800">Available Flights</h2>
                <div className="space-x-4">
                    <button
                        onClick={() => handleSort('price', 'duration')} // Sort by price and then duration
                        className={`px-4 py-2 rounded-md font-medium ${sortConfig.key === 'price' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Sort by Price {sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </button>

                    <button
                        onClick={() => handleSort('duration', 'price')} // Sort by duration and then price
                        className={`px-4 py-2 rounded-md font-medium ${sortConfig.key === 'duration' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Sort by Travel Time {sortConfig.key === 'duration' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </button>
                </div>
            </div>

            {/* Comparison Section */}
            {compareList.length > 0 && (
                <div className="bg-blue-100 p-4 rounded-md mb-4">
                    <h3 className="text-lg font-semibold mb-2">Compare Flights</h3>
                    <div className="flex justify-between space-x-4">
                        {compareList.map((flight, index) => (
                            <div key={index} className="w-1/3 bg-white shadow-md p-4 rounded-md">
                                <div className="flex justify-between items-center mb-2">
                                    <img
                                        src={"../../airlines-logos-dataset-master/" + `${findLogo(flight.validatingAirlineCodes[0])}`}
                                        alt={flightOffers.dictionaries.carriers[flight.validatingAirlineCodes[0]]}
                                        className="h-12 w-12 mr-2"
                                    />
                                    <p className="text-xl font-bold">₹{flight.price.total}</p>
                                </div>
                                <div className="text-center mt-2">
                                    <p><strong>Airline:</strong> {flightOffers.dictionaries.carriers[flight.validatingAirlineCodes[0]]}</p>
                                    <p><strong>From:</strong> {flight.itineraries[0].segments[0].departure.iataCode}</p>
                                    <p><strong>To:</strong> {flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode}</p>
                                    <p><strong>Departure Time:</strong> {new Date(flight.itineraries[0].segments[0].departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p><strong>Arrival Time:</strong> {new Date(flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p><strong>Duration:</strong> {formatDuration(flight.itineraries[0].duration)}</p>
                                    <p><strong>Layovers:</strong> {flight.itineraries[0].segments.length - 1}</p>
                                </div>
                                <button
                                    className="mt-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
                                    onClick={() => handleCompare(flight)}
                                >
                                    Remove from Compare
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Flight List */}
            {flightOffers.meta.count > "0" ? (
                <div className="space-y-6">
                    {sortedFlights.map((offer) => (
                        <div key={offer.id} className="bg-white rounded-md shadow-md overflow-hidden">
                            <div className="p-4 flex justify-between items-center">
                                <div className="flex items-center">
                                    <img
                                        src={"../../airlines-logos-dataset-master/" + `${findLogo(offer.validatingAirlineCodes[0])}`}
                                        alt={flightOffers.dictionaries.carriers[offer.validatingAirlineCodes[0]]}
                                        className="h-12 w-12 mr-2"
                                    />
                                    <div>
                                        <p className="text-lg font-bold">
                                            {flightOffers.dictionaries.carriers[offer.validatingAirlineCodes[0]]}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold">₹{offer.price.total}</p>
                                    <p className="text-sm text-gray-500">per adult</p>
                                    <button
                                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                                        onClick={() => handleBookNow(offer)}
                                    >
                                        Book Now
                                    </button>
                                    <button
                                        className="mt-2 ml-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md"
                                        onClick={() => handleCompare(offer)}
                                    >
                                        {compareList.some(f => f.id === offer.id) ? 'Remove' : 'Compare'}
                                    </button>
                                </div>
                            </div>
                            <div className="border-t p-4 flex justify-between">
                                <div>
                                    <p><strong>From:</strong> {offer.itineraries[0].segments[0].departure.iataCode}</p>
                                    <p><strong>To:</strong> {offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.iataCode}</p>
                                </div>
                                <div className="text-right">
                                    <p><strong>Departure:</strong> {new Date(offer.itineraries[0].segments[0].departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p><strong>Arrival:</strong> {new Date(offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p><strong>Duration:</strong> {formatDuration(offer.itineraries[0].duration)}</p>
                                    <p><strong>Layovers:</strong> {offer.itineraries[0].segments.length - 1}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500">No flights found.</div>
            )}
        </>
    );
};

export default AvailableFlightsComponent;
