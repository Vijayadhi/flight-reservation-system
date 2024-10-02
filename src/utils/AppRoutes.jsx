import ContentWrapper from "../components/ContentWrapper";
import Error404Component from "../components/Error404Component";
import LoginComponent from "../components/LoginComponent";
import PassengerDetailsComponent from "../components/PassengerDetailsComponet";
import UserRegistrationComponent from "../components/UserRegistrationComponent";

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
        element: <PassengerDetailsComponent/>
    },
    // Wildcard route to catch undefined paths
    {
        path: '*', // This matches any route that doesn't exist
        element: <Error404Component />
    }
];
