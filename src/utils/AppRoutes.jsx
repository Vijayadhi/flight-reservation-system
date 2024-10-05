import ContentWrapper from "../components/ContentWrapper";
import Error404Component from "../components/Error404Component";
import LoginComponent from "../components/LoginComponent";
import PassengerDetailsComponent from "../components/PassengerDetailsComponet";
import UserRegistrationComponent from "../components/UserRegistrationComponent";
import BillComponent from "../components/BillComponent";
import SeatMapComponent from "../components/SeatMapComponent";
import MyBookingsComponent from "../components/MyBookingsComponent";
import ProtectedRoute from "./ProtectedRoute";  // Import the ProtectedRoute

export default [
    {
        path: '/',
        element: <ContentWrapper />
    },
    {
        path: '/login',
        element: <LoginComponent />
    },
    {
        path: '/register',
        element: <UserRegistrationComponent />
    },
    {
        path: '/not_found',
        element: <Error404Component />
    },
    {
        path: '/get_passengerDetails',
        element: <ProtectedRoute element={<PassengerDetailsComponent />} />
    },
    {
        path: '/bill',
        element: <ProtectedRoute element={<BillComponent />} />
    },
    {
        path: '/seatMap',
        element: <ProtectedRoute element={<SeatMapComponent />} />
    },
    {
        path: '/my_bookings',
        element: <ProtectedRoute element={<MyBookingsComponent />} />
    },
    {
        path: '*',
        element: <Error404Component />
    }
];
