// raffle-frontend/src/pages/CartPage.js
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './CartPage.module.css';
import detailStyles from './RaffleDetailPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faCreditCard, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const formatTicketNumberDisplay = (number, digits) => {
    if (number === undefined || number === null || digits === undefined) return 'N/A';
    return String(number).padStart(digits, '0');
};

const CartPage = ({ allTicketsData, onRaffleUpdate }) => {
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const pendingTickets = useMemo(() => {
        return (allTicketsData || []).filter(ticket => ticket.status === 'pending');
    }, [allTicketsData]);

    const handleFinalizePurchase = async (ticket) => {
        setError('');
        setSuccessMessage('');
        const payload = { ticket_id: ticket.id };

        try {
            const response = await axios.post('/api/v1/tickets/finalize', payload);
            if (response.data.success) {
                setSuccessMessage(`¡Compra para ${ticket.raffle_name} finalizada con éxito!`);
                onRaffleUpdate({ type: 'finalize_purchase' });
            }
        } catch (err) {
            const errorDetail = err.response?.data?.detail;
            setError(errorDetail || "Ocurrió un error al finalizar la compra.");
        }
    };

    // --- FUNCIÓN DE ANULACIÓN AJUSTADA PARA COINCIDIR CON SALESMANAGEMENTPAGE ---
    const handleAnnulTicket = async (ticket) => {
        if (!window.confirm(`¿Está seguro de que desea anular este tiquete? Los números reservados (${ticket.numbers.join(', ')}) quedarán libres.`)) {
            return;
        }

        setError('');
        setSuccessMessage('');

        try {
            // CAMBIO 1: Se utiliza el mismo endpoint DELETE que en SalesManagementPage.js
            await axios.delete(`/api/v1/tickets/${ticket.id}/cancel`);

            // CAMBIO 2: Se muestra un mensaje de éxito y se actualiza el estado global
            setSuccessMessage(`Tiquete para la rifa "${ticket.raffle_name}" anulado exitosamente.`);
            onRaffleUpdate({ type: 'cancel_ticket', payload: { ticketId: ticket.id } });

        } catch (err) {
            console.error('Error al anular el tiquete:', err);
            const errorMessage = err.response?.data?.detail || 'No se pudo anular el tiquete.';
            setError(errorMessage);
        }
    };

    return (
        <div className={styles.cartPageContainer}>
            <h1 className={styles.pageTitle}>Tiquetes Pendientes de Pago</h1>
            <p className={styles.pageSubtitle}>
                Aquí están tus tiquetes reservados. Confirma la compra para asegurar tus números.
            </p>

            {error && <div className={`${styles.messageContainer} ${styles.error}`}><FontAwesomeIcon icon={faExclamationTriangle} /> {error}</div>}
            {successMessage && <div className={`${styles.messageContainer} ${styles.success}`}><FontAwesomeIcon icon={faCheckCircle} /> {successMessage}</div>}

            {pendingTickets.length > 0 ? (
                <ul className={styles.reservedList}>
                    {pendingTickets.map(ticket => {
                        const ticketDigits = ticket.raffle_name?.match(/(\d+)\s*Dígitos/)?.[1] || 2;
                        
                        return (
                            <li key={ticket.id} className={`${detailStyles.soldTicketItem} ${styles.reservedListItem}`}>
                                <div className={styles.raffleInfoContainer}>
                                    <h3 className={styles.raffleNameInList}>{ticket.raffle_name}</h3>
                                </div>
                                
                                <p><strong>Comprador:</strong> {ticket.name}</p>
                                <div className={detailStyles.numbersContainer}> 
                                    <strong>Números:</strong> 
                                    {ticket.numbers.map(number => (
                                        <span key={number} className={detailStyles.ticketNumberTag}>
                                            {formatTicketNumberDisplay(number, ticketDigits)} 
                                        </span>
                                    ))}
                                </div>
                                <p><strong>Fecha de Reserva:</strong> {new Date(ticket.created_at).toLocaleString('es-ES')}</p>
                                <p><strong>WhatsApp:</strong> {ticket.phone}</p>
                                <p><strong>Estado:</strong> <span className={detailStyles.statusReserved}>Pendiente de Pago</span></p>
                                
                                <div className={styles.ticketActions}>
                                    <button
                                        className={styles.actionButtonRemove}
                                        onClick={() => handleAnnulTicket(ticket)}
                                        title="Anular esta reserva y liberar los números"
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} /> Anular
                                    </button>
                                    <button 
                                        className={styles.actionButtonPayment} 
                                        onClick={() => handleFinalizePurchase(ticket)}
                                    >
                                        <FontAwesomeIcon icon={faCreditCard} /> Confirmar Compra
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className={styles.emptyCartMessage}>
                    <p>No tienes tiquetes pendientes de pago.</p>
                    <Link to="/" className={styles.browseButton}>Ver Rifas Disponibles</Link>
                </div>
            )}
        </div>
    );
};

export default CartPage;