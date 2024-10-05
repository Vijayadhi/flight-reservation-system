import React, { useEffect, useState } from 'react';
import { fetchLocation, getAccessToken, fetchAirports } from '../utils/helper';
import arrivalGifIcon from "../assets/icons/arrival.gif";
import departureGifIcon from "../assets/icons/departure.gif";
import calendarGifIcon from "../assets/icons/calendar.gif";
import addAdultGiftIcon from "../assets/icons/add.gif";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import default styles
import AvailableFlightsComponent from './AvailableFlightsComponent';

const SearchFlightComponent = () => {
    const [location, setLocation] = useState('');
    const [airports, setAirports] = useState([]);
    const [selectedFromAirport, setSelectedFromAirport] = useState('');
    const [selectedFromAirportObject, setSelectedFromAirportObject] = useState(null);
    const [selectedToAirport, setSelectedToAirport] = useState('');
    const [selectedToAirportObject, setSelectedToAirportObject] = useState(null);
    const [searchResultsFrom, setSearchResultsFrom] = useState([]);
    const [searchResultsTo, setSearchResultsTo] = useState([]);
    const [searchKeywordFrom, setSearchKeywordFrom] = useState('');
    const [searchKeywordTo, setSearchKeywordTo] = useState('');
    const [noMatchesFrom, setNoMatchesFrom] = useState(false);
    const [noMatchesTo, setNoMatchesTo] = useState(false);
    const [departureDate, setDepartureDate] = useState('');
    const [adultsCount, setAdultsCount] = useState(1);
    const [flightOffers, setFlightOffers] = useState(null);

    useEffect(() => {
        const getAirports = async () => {
            const loc = await fetchLocation();
            if (loc) {
                setLocation(loc);
                const accessToken = await getAccessToken();
                if (accessToken) {
                    const airportData = await fetchAirports(loc.latitude, loc.longitude, accessToken);
                    setAirports(airportData.data);
                    if (airportData.data && airportData.data.length > 0) {
                        setSelectedFromAirport(`${airportData.data[0].address.cityName} (${airportData.data[0].iataCode}) - ${airportData.data[0].address.countryName} (${airportData.data[0].address.countryCode})`);
                        setSelectedFromAirportObject(airportData.data[0]);
                    }
                }
            }
        };
        getAirports();
    }, []);

    const handleDateChange = (date) => {
        if (date) {
            const formattedDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
            setDepartureDate(formattedDate);
        }
    };

    const handleSearch = async (keyword, type) => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken && keyword) {
            const url = `${import.meta.env.VITE_API_URL}/reference-data/locations?subType=CITY,AIRPORT&keyword=${keyword}`;
            try {
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.data && data.data.length > 0) {
                        if (type === "from") {
                            setSearchResultsFrom(data.data);
                            setNoMatchesFrom(false);
                        } else {
                            setSearchResultsTo(data.data);
                            setNoMatchesTo(false);
                        }
                    } else {
                        if (type === "from") {
                            setSearchResultsFrom([]);
                            setNoMatchesFrom(true);
                        } else {
                            setSearchResultsTo([]);
                            setNoMatchesTo(true);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
                if (type === "from") {
                    setSearchResultsFrom([]);
                    setNoMatchesFrom(true);
                } else {
                    setSearchResultsTo([]);
                    setNoMatchesTo(true);
                }
            }
        }
    };

    const handleFromInputChange = (e) => {
        const keyword = e.target.value;
        setSelectedFromAirport(keyword);
        setSearchKeywordFrom(keyword);
        if (keyword.length >= 1) {
            handleSearch(keyword, "from");
        } else {
            setSearchResultsFrom([]);
            setNoMatchesFrom(false);
        }
    };

    const handleToInputChange = (e) => {
        const keyword = e.target.value;
        setSelectedToAirport(keyword);
        setSearchKeywordTo(keyword);
        if (keyword.length >= 1) {
            handleSearch(keyword, "to");
        } else {
            setSearchResultsTo([]);
            setNoMatchesTo(false);
        }
    };

    const handleFromAirportSelect = (airport) => {
        setSelectedFromAirport(`${airport.address.cityName} (${airport.iataCode}) - ${airport.address.countryName} (${airport.address.countryCode})`);
        setSelectedFromAirportObject(airport);
        setSearchResultsFrom([]);
        setNoMatchesFrom(false);
    };

    const handleToAirportSelect = (airport) => {
        setSelectedToAirport(`${airport.address.cityName} (${airport.iataCode}) - ${airport.address.countryName} (${airport.address.countryCode})`);
        setSelectedToAirportObject(airport);
        setSearchResultsTo([]);
        setNoMatchesTo(false);
    };

    const handleSearchFlightOffers = async () => {
        const accessToken = await getAccessToken();
        if (accessToken && selectedFromAirportObject && selectedToAirportObject && departureDate && adultsCount) {
            const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${selectedFromAirportObject.iataCode}&destinationLocationCode=${selectedToAirportObject.iataCode}&departureDate=${departureDate}&adults=${adultsCount}&currencyCode=INR`;
            try {
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                if (response.ok) {
                    const flightOffers = await response.json();
                    setFlightOffers(flightOffers);
                }
            } catch (error) {
                console.error('Error fetching flight offers:', error);
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-black mb-4">Find Your Next Adventure</h1>
                <p className="text-lg text-gray-500">Search for the best flights and get ready to explore the world.</p>
            </div>

            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">From</label>
                        <input
                            type="text"
                            placeholder="Country, city or airport"
                            className="w-full p-3 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedFromAirport}
                            onChange={handleFromInputChange}
                            required
                        />
                        <img src={departureGifIcon} alt="Departure" className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-8" />
                        {searchResultsFrom.length > 0 && (
                            <ul className="bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                {searchResultsFrom.map((result) => (
                                    <li
                                        key={result.id}
                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => handleFromAirportSelect(result)}
                                    >
                                        <div>
                                            <span className="font-semibold">{result.address.cityName} ({result.iataCode})</span>
                                            <span className="block text-sm">{result.address.countryName} ({result.address.countryCode})</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {noMatchesFrom && <p className="text-red-500">No matches found</p>}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">To</label>
                        <input
                            type="text"
                            placeholder="Country, city or airport"
                            className="w-full p-3 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedToAirport}
                            onChange={handleToInputChange}
                            required
                        />
                        <img src={arrivalGifIcon} alt="Arrival" className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-8" />
                        {searchResultsTo.length > 0 && (
                            <ul className="bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                {searchResultsTo.map((result) => (
                                    <li
                                        key={result.id}
                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => handleToAirportSelect(result)}
                                    >
                                        <div>
                                            <span className="font-semibold">{result.address.cityName} ({result.iataCode})</span>
                                            <span className="block text-sm">{result.address.countryName} ({result.address.countryCode})</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {noMatchesTo && <p className="text-red-500">No matches found</p>}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Departure Date</label>
                        <div className="relative">
                            <ReactDatePicker
                                selected={departureDate ? new Date(departureDate) : null}
                                onChange={handleDateChange}
                                className="w-full p-3 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholderText="Select a date"
                                dateFormat="yyyy-MM-dd"
                                required
                            />
                            <img src={calendarGifIcon} alt="Calendar" className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-8" />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Adults</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="1"
                                max="9"
                                value={adultsCount}
                                onChange={(e) => setAdultsCount(e.target.value)}
                                className="w-full p-3 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Number of adults"
                                required
                            />
                            <p className='text-red-500'>Future changes are restriced</p>
                            <img src={addAdultGiftIcon} alt="Add Adult" className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-8" />
                        </div>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <button
                        onClick={handleSearchFlightOffers}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Search Flights
                    </button>
                </div>
            </div>

            {flightOffers && (
                <div className="mt-8">
                    <AvailableFlightsComponent flightOffers={flightOffers} />
                </div>
            )}
        </div>
    );
};

export default SearchFlightComponent;
