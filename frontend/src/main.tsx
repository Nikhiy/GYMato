import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext.tsx';
import "leaflet/dist/leaflet.css";
import { SocketProvider } from './context/SocketContext.tsx';

export const authService='https://tomato-auth-latest.onrender.com'
export const restaurantService='https://tomato-restaurant-1.onrender.com'
export const utilsService='https://tomato-utils-gn83.onrender.com'
export const realtimeService='https://realtime-service-waj9.onrender.com'
export const riderService='https://rider-service-1kr6.onrender.com'
export const adminService='https://tomato-admin-vw3v.onrender.com'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="638233768044-99f7blj37iavuob63r7fvo6tjhc8b0ut.apps.googleusercontent.com">
      <AppProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
