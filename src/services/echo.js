import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Factory function: creates a fresh Echo instance with the current auth token.
// Called after login so auth_token is always available in localStorage.
const createEcho = () => {
    const token = localStorage.getItem('auth_token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    return new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap2',
        forceTLS: true,
        // Route is in api.php → /api/broadcasting/auth, protected by auth:sanctum
        authEndpoint: `${apiUrl}/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        },
    });
};

export default createEcho;