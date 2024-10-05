import React, { useEffect, useState } from 'react';
import TopBarComponent from './TopBarComponent';
import { getAccessToken } from '../utils/helper';
import axios from 'axios';
import useSessionTimeout from '../utils/Session';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';


function SeatMapComponent() {
  const [seatData, setSeatData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  const order = sessionStorage.getItem('orderData');
  const orderID = JSON.parse(order);
  const OrID = orderID?.data?.id;

  const  navigate = useNavigate();


  const totalTravelers = orderID?.data?.travelers?.length || 0;
  useSessionTimeout(); // Call the hook to check session timeout


  useEffect(() => {
    if (OrID) {
      const accessToken = localStorage.getItem('accessToken');

      const fetchSeatMapData = async () => {
        try {
          const response = await axios.get(`https://test.api.amadeus.com/v1/shopping/seatmaps?flight-orderId=${OrID}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            }
          });

          setSeatData(response.data);
          // console.log("Seat map data fetched:", response.data);
          localStorage.setItem('seatData', JSON.stringify(response.data));
        } catch (error) {
          if (error.response && error.response.status === 401) {
            const errorCode = error.response.data.errors[0]?.code;
            if (errorCode === 38192) {
              // console.log("Access token expired. Refreshing token...");
              await getAccessToken();
              retryRequest();
            } else {
              setError("Authorization error");
              console.error("Authorization error:", error);
            }
          } else {
            setError("Error fetching seat map data");
            console.error("Error fetching seat map data:", error);
          }
        } finally {
          setIsLoading(false);
        }
      };

      const retryRequest = async () => {
        try {
          const newAccessToken = localStorage.getItem('accessToken');
          const response = await axios.get(`https://test.api.amadeus.com/v1/shopping/seatmaps?flight-orderId=${OrID}`, {
            headers: {
              'Authorization': `Bearer ${newAccessToken}`,
            }
          });

          setSeatData(response.data);
          // console.log("Retried and fetched seat map data:", response.data);
          localStorage.setItem('seatData', JSON.stringify(response.data));
        } catch (retryError) {
          setError("Retry request failed");
          console.error("Retry request failed:", retryError);
        }
      };

      fetchSeatMapData();
    } else {
      setError("Order ID is missing");
      console.error("Order ID is missing");
    }
  }, [OrID]);

  const handleSeatSelection = (seat) => {
    // Check if the seat is available
    if (seat.travelerPricing[0].seatAvailabilityStatus === 'AVAILABLE') {
      // Check if the seat is already selected
      const seatIndex = selectedSeats.findIndex(selected => selected.number === seat.number);

      if (seatIndex > -1) {
        // If the seat is already selected, remove it from the selection
        const newSelectedSeats = selectedSeats.filter((_, index) => index !== seatIndex);
        setSelectedSeats(newSelectedSeats);
      } else {
        // Limit selection based on total travelers
        if (selectedSeats.length < totalTravelers) {
          // Add the selected seat to the array
          setSelectedSeats([...selectedSeats, seat]);
        } else {
          alert(`You can only select a maximum of ${totalTravelers} seats.`);
        }
      }
      setShowBookingDetails(false);
    } else {
      alert('Seat is not available');
    }
  };

  const handleShowBookingDetails = () => {
    setShowBookingDetails(true);
  };

  const handleCompleteBooking = () => {
    const confirmBooking = window.confirm("Are you sure you want to complete the booking?");
    if (confirmBooking) {
      // Log selected seats and order data
      // console.log("Selected Seats:", selectedSeats);
      // console.log("Order Data:", orderID);

      const paymentId = sessionStorage.getItem("paymentId")

      axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_API}/booking/newBooking`,
        {
          OrID,
          // The data you want to send in the body (e.g., orderId, orderData, selectedSeats)
          // orderID,
          orderData:order,
          selectedSeats,
          paymentId
          
        },
        {
          headers: {
            "Authorization": `Bearer ${sessionStorage.getItem('token')}`
          }
        }
      )
        .then(response => {

          alert("Booking completed!"); 

          navigate('/my_bookings')

          // Alert the user for confirmation
// Redirect to a new page or refresh the current page
        })
        .catch(error => {
          toast.error(error.message)
          console.error("Error creating booking:", error);
        });



      // You can handle further actions here, like making a POST request to save the booking
      setShowBookingDetails(false); // Optionally close the booking details
    }
  };

  const seats = seatData?.data[0].decks[0].seats;

  return (
    <>
      <TopBarComponent />
      <br />
      <br />
      {isLoading ? (
        <div className="max-w-md mx-auto p-4 bg-gradient-to-r from-blue-500 to-blue-300 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4 text-white">Loading...</h2>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row max-w-7xl mx-auto p-4 bg-white rounded-lg shadow-lg">
          <div className="flex-1 mr-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Seat Map</h2>
            <div className="grid grid-cols-6 gap-2">
              {seats?.map((seat, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg transition-all duration-300 ease-in-out 
                    ${seat.travelerPricing[0].seatAvailabilityStatus === 'AVAILABLE'
                      ? 'bg-green-100 border-green-500 hover:bg-green-200'
                      : seat.travelerPricing[0].seatAvailabilityStatus === 'BLOCKED'
                        ? 'bg-red-100 border-red-500 hover:bg-red-200'
                        : 'bg-gray-100 border-gray-500 hover:bg-gray-200'
                    } 
                    ${selectedSeats.some(selected => selected.number === seat.number) ? 'ring-2 ring-blue-500 shadow-lg' : ''}
                    ${seat.isWindow ? 'bg-yellow-100 border-yellow-500' : ''}`} // Highlight window seats
                  onClick={() => handleSeatSelection(seat)}
                >
                  <p className="text-lg font-bold text-center">{seat.number}</p>
                  {seat.travelerPricing[0].seatAvailabilityStatus === 'AVAILABLE' && (
                    <p className="text-xs text-green-600 text-center">Available</p>
                  )}
                  {seat.travelerPricing[0].seatAvailabilityStatus === 'BLOCKED' && (
                    <p className="text-xs text-red-600 text-center">Blocked</p>
                  )}
                  {seat.travelerPricing[0].seatAvailabilityStatus === 'OCCUPIED' && (
                    <p className="text-xs text-gray-600 text-center">Occupied</p>
                  )}
                  {seat.isWindow && (
                    <p className="text-xs text-yellow-600 text-center">Window Seat</p> // Indicate window seats
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-none w-full lg:w-1/3 mt-4 lg:mt-0">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Selected Seats</h2>
            {selectedSeats.length > 0 ? (
              <div className="p-4 bg-gray-100 rounded-lg shadow-md">
                <p className="text-lg font-bold">Seats:</p>
                <ul>
                  {selectedSeats.map(seat => (
                    <li key={seat.number} className="text-2xl text-blue-600">{seat.number}</li>
                  ))}
                </ul>
                <button
                  className="mt-4 w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600 transition duration-300"
                  onClick={handleShowBookingDetails}
                >
                  Show Booking Details
                </button>
              </div>
            ) : (
              <div className="p-4 bg-gray-100 rounded-lg shadow-md">
                <p className="text-lg font-bold">No seats selected</p>
              </div>
            )}
          </div>
        </div>
      )}
      {showBookingDetails && selectedSeats.length > 0 && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Booking Details</h2>
            <p className="text-lg">Seats:</p>
            <ul>
              {selectedSeats.map(seat => (
                <li key={seat.number} className="text-lg">Seat Number: <span className="font-bold">{seat.number}</span></li>
              ))}
            </ul>
            {/* Add more details as needed */}
            <button
              className="mt-4 w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600 transition duration-300"
              onClick={handleCompleteBooking} // Change here to complete booking
            >
              Complete Booking
            </button>
            <button
              className="mt-2 w-full bg-gray-300 text-gray-700 font-bold py-2 rounded hover:bg-gray-400 transition duration-300"
              onClick={() => setShowBookingDetails(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {error && <div className="text-red-500">{error}</div>}
    </>
  );
}

export default SeatMapComponent;
