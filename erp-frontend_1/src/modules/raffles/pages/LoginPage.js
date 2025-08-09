// raffle-frontend/src/pages/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios'; // 1. Importamos axios
import styles from './LoginPage.module.css';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import apiClient from '../services/api'; 

// 2. Renombramos la prop a onLoginSuccess para más claridad
const LoginPage = ({ onLoginSuccess }) => {
    // El frontend usa 'email' como nombre de variable, pero lo enviaremos como 'username'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    /**
     * handleSubmit - Ahora se conecta al backend de verdad.
     */
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        // 3. Preparamos los datos para el backend.
        // FastAPI con OAuth2PasswordRequestForm espera datos de formulario, no JSON.
        const params = new URLSearchParams();
        params.append('username', username); // El backend espera 'username'
        params.append('password', password);

        try {
            // 4. Hacemos la llamada POST a la API
            // La URL relativa funciona gracias al "proxy" en package.json
            const response = await apiClient.post('/auth/token', params, { 
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
            
            // 5. Manejamos la respuesta exitosa
            if (response.data.access_token) {
                // Llamamos a la función del componente padre con el token
                onLoginSuccess(response.data.access_token);
            } else {
                 setError('Respuesta inesperada del servidor.');
            }

        } catch (err) {
            // 6. Manejamos los errores
            if (err.response && err.response.data && err.response.data.detail) {
                // Muestra el error específico de FastAPI (ej: "Incorrect username or password")
                setError(err.response.data.detail);
            } else {
                // Error genérico si no hay conexión
                setError('Error al conectar con el servidor. Verifica que esté corriendo.');
            }
        }
    };

    return (
        <div className={styles.loginPageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.imageLogoContainer}>
                    <img 
                        src="/images/logo-R-completo.webp"
                        alt="Raffle Colombia Logo"
                        className={styles.loginPageLogoImage}
                    />
                </div>
                <p className={styles.loginTitle}>Bienvenido - Bienvenida</p>
                <form onSubmit={handleSubmit} className={styles.loginForm}>
                    {error && <div className={styles.errorMessage}>{error}</div>}
                    <div className={styles.formGroup}>
                        <input
                            type="text"
                            className={styles.formControl}
                            placeholder="Usuario (ej: admin)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <input
                            type="password"
                            className={styles.formControl}
                            placeholder="Contraseña (ej: secret)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.loginButton}>
                        Iniciar sesión
                    </button>
                </form>
                <a href="/forgot-password" className={styles.forgotPasswordLink}>¿Olvidaste tu contraseña?</a>
                <div className={styles.accountActionsContainer}>
                    <p className={styles.noAccountText}>¿Aún no tienes una cuenta?</p>
                    <Link to="/register" className={styles.createAccountLink}>CREAR UNA CUENTA DE RAFFLE COLOMBIA</Link>
                </div>
            </div>
            <Footer /> 
        </div>
    );
};

export default LoginPage;
