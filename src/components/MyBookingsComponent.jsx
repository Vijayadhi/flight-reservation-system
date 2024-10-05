import React, { useEffect, useState } from 'react';
import useSessionTimeout from '../utils/Session';
import axios from 'axios';
import TopBarComponent from './TopBarComponent';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import  Calendar  from 'ical-generator'; // Update the import statement

function MyBookingsComponent() {
    const [bookings, setBookings] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const cal = new Calendar();
    useEffect(() => {
        // Fetch booking data from API
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_API}/booking/getBooking`, {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    }
                });
                setBookings(response.data.consolidateData); // assuming response contains consolidateData array
            } catch (err) {
                console.error("Error fetching bookings:", err);
            }
        };

        fetchData();
        sessionStorage.removeItem("orderData");
        sessionStorage.removeItem("selectedFlightData");
        sessionStorage.removeItem("payment_response");
        sessionStorage.removeItem("paymentId");
        localStorage.removeItem("seatData");

    }, []);

    // Session timeout hook
    useSessionTimeout();

    // Sorting logic
    const sortData = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });

        const sortedBookings = [...bookings].sort((a, b) => {
            if (a[key] < b[key]) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        setBookings(sortedBookings);
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    // Function to download the ticket
    const downloadTicket = (booking) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("Flight Ticket", 10, 10);
        doc.setFontSize(12);
        doc.text(`Flight Number: ${booking.flight_number}`, 10, 30);
        doc.text(`Departure: ${booking.departure_airport}`, 10, 40);
        doc.text(`Arrival: ${booking.arrival_airport}`, 10, 50);
        doc.text(`Travel Date: ${booking.travel_date}`, 10, 60);
        doc.text(`Seat Number: ${booking.seat_number}`, 10, 70);
        doc.text(`Total Cost: ₹${booking.total_cost}`, 10, 80);
        doc.text(`Baggage Allowance: ${booking.baggage_allowance ? 'Yes' : 'No'}`, 10, 90);

        // Add any other relevant booking details here

        doc.save(`${booking.flight_number}-ticket.pdf`);
    };

    // Function to generate iCal file for each booking
    const downloadToCalendar = (booking) => {
        const cal = new Calendar(); // Update the calendar creation

        cal.createEvent({
            start: new Date(booking.departure_time),
            end: new Date(booking.arrival_time),
            summary: `Flight ${booking.flight_number} from ${booking.departure_airport} to ${booking.arrival_airport}`,
            description: `Seat Number: ${booking.seat_number}\nTotal Cost: ₹${booking.total_cost}`,
        });

        const icalString = cal.toString();
        const blob = new Blob([icalString], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${booking.flight_number}-calendar.ics`;
        a.click();

        URL.revokeObjectURL(url);
    };

    return (
        <>
            <TopBarComponent />
            <div className="container mx-auto p-4 mt-6">
                <h1 className="text-3xl font-bold mb-6 text-center">My Flight Bookings</h1>

                <table className="min-w-full bg-gradient-to-r from-blue-500 to-blue-800 text-white">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left">Flight Number</th>
                            <th className="px-6 py-3 text-left">Departure</th>
                            <th className="px-6 py-3 text-left">Arrival</th>
                            <th className="px-6 py-3 text-left">Travel Date</th>
                            <th className="px-6 py-3 text-left">Seat Number</th>
                            <th className="px-6 py-3 text-left">Total Cost</th>
                            <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4">{booking.flight_number}</td>
                                <td className="px-6 py-4">{booking.departure_airport}</td>
                                <td className="px-6 py-4">{booking.arrival_airport}</td>
                                <td className="px-6 py-4">{booking.travel_date}</td>
                                <td className="px-6 py-4">{booking.seat_number}</td>
                                <td className="px-6 py-4">₹{booking.total_cost}</td>
                                <td className="px-6 py-4">
                                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => downloadTicket(booking)}>Download Ticket</button>
                                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2" onClick={() => downloadToCalendar(booking)}>Add to Calendar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default MyBookingsComponent;