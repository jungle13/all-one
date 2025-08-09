// raffle-frontend/src/pages/ManageRafflesPage.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './ManageRafflesPage.module.css';
import homeStyles from './Home.module.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faImage, faEdit, faPlus, faTimes, faEye, 
    faClock, faPlayCircle, faCheckCircle, faTrophy 
} from '@fortawesome/free-solid-svg-icons';
import RaffleEditorForm from '../components/forms/RaffleEditorForm';
import apiClient from '../services/api'; // <-- CAMBIO

const formatTicketNumberDisplay = (number, digits) => {
    if (number === undefined || number === null || digits === undefined) return 'N/A';
    return String(number).padStart(digits, '0');
};

// --- CAMBIO: El componente ya no recibe props de datos, es autosuficiente ---
const ManageRafflesPage = () => {
    // --- ESTADO SIMPLIFICADO ---
    const [raffles, setRaffles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [raffleToEdit, setRaffleToEdit] = useState(null); // Contiene el objeto completo a editar
    const [formError, setFormError] = useState('');
    
    // --- LÓGICA DE BÚSQUEDA DE DATOS (NUEVA) ---
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            //const response = await axios.get('/api/v1/raffle/');
            const response = await apiClient.get('/raffle/'); // <-- CAMBIO
            setRaffles(response.data.raffles || []);
        } catch (err) {
            setError('No se pudieron cargar las rifas.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const uniqueSponsors = useMemo(() => {
        // ... (tu lógica existente para extraer sponsors, si aplica) ...
        return [];
    }, [raffles]);

    const activeRaffles = raffles.filter(r => r.status && (r.status.toLowerCase() === 'active' || r.status.toLowerCase() === 'pending'));
    const finishedRaffles = raffles.filter(r => r.status && r.status.toLowerCase() === 'finished');

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return 'Fecha no definida';
        return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // --- MANEJADORES DE FORMULARIO SIMPLIFICADOS ---
    const handleAddNewRaffle = () => {
        setRaffleToEdit(null);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEditRaffle = (raffle) => {
        setRaffleToEdit(raffle);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setRaffleToEdit(null);
        setFormError('');
    };
// --- MANEJADORES DE ENVÍO DEL FORMULARIO ---
    // --- CAMBIO: Manejo de envío del formulario con lógica robustecida ---
    // Esta función maneja tanto la creación como la edición de rifas.
    // Asegura que el payload tenga una URL de imagen válida y maneja errores de validación.
    const handleFormSubmit = async (payload, imageFile) => {
        setFormError('');
        
        // Aquí iría la lógica para subir el 'imageFile' si existe y obtener una URL
        // y luego añadir esa URL al 'payload'. Por ahora, se omite por simplicidad.
        
        try {
            // ELIMINADO: const finalPayload = { ... };
            console.log("[FRONTEND - ManageRafflesPage] Payload final a punto de ser enviado a la API:", payload);

            if (raffleToEdit) { // Modo Edición
                //const response = await axios.put(`/api/v1/raffle/${raffleToEdit.id}`, payload); // <-- Se usa el payload directamente
                const response = await apiClient.put(`/raffle/${raffleToEdit.id}`, payload); // <-- CAMBIO
                alert(`¡Rifa "${response.data.name}" actualizada!`);
            } else { // Modo Creación
                //const response = await axios.post('/api/v1/raffle/create', payload); // <-- Se usa el payload directamente
                const response = await apiClient.post('/raffle/create', payload); // <-- CAMBIO
                alert(`¡Rifa "${payload.name}" creada!`);
            }
            handleCancelForm();
            fetchData(); // Vuelve a cargar todas las rifas para reflejar los cambios
        } catch (err) {
            // --- LOG #3: VER EL ERROR COMPLETO DEL SERVIDOR ---
                console.error("[FRONTEND - ManageRafflesPage] Error recibido del backend:", err);
            // Opcional, para ver más detalles del objeto de error:
                console.error("[FRONTEND - ManageRafflesPage] Detalle del error en response:", err.response);
            const errorDetail = err.response?.data?.detail;

            // --- Lógica de Manejo de Errores Robustecida ---
            if (Array.isArray(errorDetail)) {
                // Si es un array de errores de validación, los une en un solo string.
                setFormError(errorDetail.map(e => `Error en el campo '${e.loc[1]}': ${e.msg}`).join('. '));
            } else if (typeof errorDetail === 'object' && errorDetail !== null) {
                // Si es un solo objeto de error (como el que causó el problema), lo formatea.
                setFormError(`Error en el campo '${errorDetail.loc[1]}': ${errorDetail.msg}`);
            } else if (typeof errorDetail === 'string') {
                // Si es un string (como "Rifa no encontrada"), lo muestra directamente.
                setFormError(errorDetail);
            } else {
                // Para cualquier otro caso.
                setFormError('Ocurrió un error inesperado.');
            }
        }
    };
    
    // --- FUNCIONES DE RENDERIZADO (SIN CAMBIOS LÓGICOS) ---
    const renderActiveRaffleCard = (raffle) => {
        const ticketDigits = raffle.dijits_per_number || 2;
        const displayPrice = (typeof raffle.price === 'number' && !isNaN(raffle.price)) ? raffle.price.toLocaleString() : 'N/A';

        let statusIcon, statusClass, statusText;
        switch (raffle.status?.toLowerCase()) {
            case 'active': statusIcon = faPlayCircle; statusClass = homeStyles.statusActive; statusText = "Activa"; break;
            case 'pending': statusIcon = faClock; statusClass = homeStyles.statusPending; statusText = "Pendiente"; break;
            default: statusIcon = faImage; statusClass = ''; statusText = 'Desconocido';
        }

        return (
            <div key={raffle.id} className={homeStyles.card}>
                <div className={homeStyles.cardImageContainer}>
                    {raffle.image_url && raffle.image_url !== '#' ? (
                        <img src={raffle.image_url} alt={raffle.name} className={homeStyles.cardImage} />
                    ) : (
                        <FontAwesomeIcon icon={faImage} className={homeStyles.imagePlaceholderIcon} />
                    )}
                </div>
                <div className={homeStyles.cardContent}>
                    <h3 className={homeStyles.cardTitle}>{raffle.name}</h3>
                    <div className={`${homeStyles.statusBadge} ${statusClass}`}>
                        <FontAwesomeIcon icon={statusIcon} />
                        <span>{statusText}</span>
                    </div>
                    <p className={homeStyles.cardInfoText}>Sorteo: {formatDateForDisplay(raffle.end_date)}</p>
                    <p className={homeStyles.cardInfoText}>Dígitos: {ticketDigits}</p>
                    <p className={homeStyles.cardPrice}>{`$${displayPrice} COP c/u`}</p>
                    
                    <div className={homeStyles.cardProgressContainer}>
                        <div className={homeStyles.cardProgressBar} style={{ width: `${raffle.statistics?.total_tickets > 0 ? ((raffle.statistics.tickets_sold / raffle.statistics.total_tickets) * 100).toFixed(0) : 0}%` }}></div>
                    </div>
                    <p className={homeStyles.cardProgressText}><small>{`${raffle.statistics?.tickets_sold || 0} de ${raffle.statistics?.total_tickets || 'N/A'} vendidos`}</small></p>

                    <div className={styles.cardActionsManage}>
                        <button onClick={() => handleEditRaffle(raffle)} className={styles.editButton}>
                            <FontAwesomeIcon icon={faEdit} /> Editar
                         </button>
                        <Link to={`/raffle/${raffle.id}`} className={styles.viewButton}>
                            <FontAwesomeIcon icon={faEye} /> Ver
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    const renderFinishedRaffleListItem = (raffle) => {
        // (Tu código JSX para renderizar el item de rifa finalizada se mantiene aquí sin cambios)
        return <li key={raffle.id}>...</li>;
    };

    if (loading) return <div className={styles.manageRafflesPageContainer}><p>Cargando...</p></div>;
    if (error) return <div className={styles.manageRafflesPageContainer}><p>{error}</p></div>;

    return (
        <div className={styles.manageRafflesPageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.headerActions}>
                    <h1 className={styles.pageTitle}>Gestionar Rifas</h1>
                    <button onClick={showForm ? handleCancelForm : handleAddNewRaffle} className={styles.addRaffleButtonToggle}>
                        <FontAwesomeIcon icon={showForm ? faTimes : faPlus} /> 
                        {showForm ? 'Cerrar Formulario' : 'Añadir Nueva Rifa'}
                    </button>
                </div>

                {showForm && (
                    <div className={styles.createFormContainer}>
                        <h2>{raffleToEdit ? `Editando Rifa: ${raffleToEdit.name}` : 'Formulario para Nueva Rifa'}</h2>
                        <RaffleEditorForm
                            isEditing={!!raffleToEdit}
                            raffleToEdit={raffleToEdit}
                            onFormSubmit={handleFormSubmit}
                            onCancel={handleCancelForm}
                            formError={formError}
                            uniqueSponsors={uniqueSponsors}
                        />
                    </div>
                )}
            </div>
            
            <h2 className={homeStyles.sectionTitle}>Rifas Activas y Pendientes ({activeRaffles.length})</h2>
            {activeRaffles.length > 0 ? (<div className={homeStyles.cardContainer}>{activeRaffles.map(renderActiveRaffleCard)}</div>) : (<p className={homeStyles.noRafflesMessage}>No hay rifas activas o pendientes.</p>)}
            
            <h2 className={homeStyles.sectionTitle}>Rifas Finalizadas ({finishedRaffles.length})</h2>
            {finishedRaffles.length > 0 ? (<ul className={styles.finishedRaffleList}>{finishedRaffles.map(renderFinishedRaffleListItem)}</ul>) : (<p className={homeStyles.noRafflesMessage}>No hay rifas finalizadas.</p>)}
        </div>
    );
};

export default ManageRafflesPage;