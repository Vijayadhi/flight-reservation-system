import airLineData from "../../airlines-logos-dataset-master/airlines";
// tokenHelper
export const fetchAccessToken = async () => {
    const clientId = import.meta.env.VITE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_CLIENT_SECRET;


    const url = 'https://test.api.amadeus.com/v1/security/oauth2/token';
    const body = new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': clientId,
        'client_secret': clientSecret
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body.toString()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch access token');
        }

        const data = await response.json();
        const { access_token, expires_in } = data;

        // Calculate expiration time in milliseconds
        const expirationTime = Date.now() + expires_in * 1000;

        // Store the token and expiration time in localStorage
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('tokenExpirationTime', expirationTime);

        return access_token;
    } catch (error) {
        console.error('Error fetching the access token:', error);
        return null;
    }
};

export const getAccessToken = async () => {
    const tokenExpirationTime = localStorage.getItem('tokenExpirationTime');

    // Check if the token is already stored and not expired
    if (tokenExpirationTime && Date.now() < tokenExpirationTime) {
        return localStorage.getItem('accessToken');
    }

    // Fetch a new token if none exists or the existing one is expired
    return await fetchAccessToken();
};




// locationHelper
export const fetchLocation = async () => {
    try {
        const response = await fetch('http://ip-api.com/json/');
        if (!response.ok) {
            throw new Error('Failed to fetch location data');
        }
        const data = await response.json();
        const { lat, lon } = data;
        return { latitude: lat, longitude: lon };
    } catch (error) {
        console.error('Error fetching the location:', error);
        return null;
    }
};


export const formatDuration = (duration) => {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/;
    const matches = duration.match(regex);

    const hours = matches[1] ? matches[1] : '0'; // Default to 0 if no hours
    const minutes = matches[2] ? matches[2] : '0'; // Default to 0 if no minutes

    return `${hours}h ${minutes}m`; // Format the result
};
export const fetchAirports = async (latitude, longitude) => {
    const accessToken = await getAccessToken();
    const api_url = import.meta.env.VITE_API_URL;

    if (!accessToken) {
        return null;
    }

    const url = `${api_url}/reference-data/locations/airports?latitude=${latitude}&longitude=${longitude}`;
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch airport data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching the airports:', error);
        return null;
    }
};

export const findLogo = (airlineCode) => {
    const airline = airLineData.data.find((airline) =>
        airline.iata_code === airlineCode || airline.icao_code === airlineCode
    ); // Search for the airline by IATA or ICAO code

    if (airline && airline.logo) {
        return airline.logo; // Return the logo URL if found
    }
    return 'images/default-logo.png'; // Return a default logo if not found
};