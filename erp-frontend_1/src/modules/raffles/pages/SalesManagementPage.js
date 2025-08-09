// raffle-frontend/src/pages/SalesManagementPage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './SalesManagementPage.module.css';
import detailStyles from './RaffleDetailPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faDownload, faTimesCircle, faEye, faSpinner, faExclamationTriangle, faPlus, faTimes, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TicketEditorForm from '../components/forms/TicketEditorForm';
import apiClient from '../services/api'; // <-- CAMBIO

const SalesManagementPage = () => {
    // Estados existentes
    const [tickets, setTickets] = useState([]);
    const [raffles, setRaffles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPurchaseForm, setShowPurchaseForm] = useState(false);

    // --- ESTADO PARA MANEJAR LA REDIRECCIÓN DE FORMA SEGURA ---
    const [redirectedRaffleId, setRedirectedRaffleId] = useState(null);

    // --- NUEVOS ESTADOS PARA EL CARRITO ---
    const [ticketCart, setTicketCart] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false); // Para el estado de carga de la compra final

    const location = useLocation();
    const navigate = useNavigate();

    const fetchTickets = useCallback(async () => {
        // Lógica existente para cargar tiquetes...
        setLoading(true);
        setError(null);
        try {
            //const response = await axios.get('/api/v1/tickets/');
            const response = await apiClient.get('/tickets/'); // <-- CAMBIO
            console.log("DATOS CRUDOS RECIBIDOS DEL BACKEND:", response.data.tickets);
            const sortedTickets = (response.data.tickets || []).sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            );
            setTickets(sortedTickets);
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al cargar los tiquetes.');
            console.error('Error fetching tickets:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRaffles = async () => {
        // Lógica existente para cargar rifas...
        try {
            //const response = await axios.get('/api/v1/raffle/');
            const response = await apiClient.get('/raffle/'); // <-- CAMBIO
            const activeRaffles = (response.data.raffles || []).filter(r => r.status === 'active');
            setRaffles(activeRaffles);
            return activeRaffles;
        } catch (err) {
            console.error('Error fetching raffles:', err);
            setError('No se pudieron cargar las rifas para la venta.');
            return [];
        }
    };

    useEffect(() => {
        const raffleIdFromState = location.state?.raffleId;
        if (raffleIdFromState) {
            setRedirectedRaffleId(raffleIdFromState);
            handleShowPurchaseForm();
            // Limpiamos el estado de la ubicación para que el efecto no se repita
            navigate(location.pathname, { replace: true, state: {} });
        } else if (!showPurchaseForm) {
            fetchTickets();
        }
    }, [location.state, showPurchaseForm, fetchTickets, navigate, location.pathname]);

    const handleShowPurchaseForm = async () => {
        setLoading(true);
        await fetchRaffles();
        setLoading(false);
        setShowPurchaseForm(true);
    };

    const handleCancelPurchaseFlow = () => {
        setShowPurchaseForm(false);
        setTicketCart([]); // Limpia el carrito al cancelar
        setRedirectedRaffleId(null); // Limpia el ID de redirección
    };

    // --- NUEVA LÓGICA DEL CARRITO ---
    const handleAddToCart = (ticketData) => {
        setTicketCart(prevCart => [...prevCart, ticketData]);
    };

    const handleRemoveFromCart = (indexToRemove) => {
        setTicketCart(prevCart => prevCart.filter((_, index) => index !== indexToRemove));
    };

    const handleConfirmPurchase = async () => {
        if (ticketCart.length === 0) {
            alert("No hay tiquetes en la lista para comprar.");
            return;
        }
        setIsSubmitting(true);
        let successfulTickets = 0;

        for (const ticketData of ticketCart) {
            try {
                //await axios.post('/api/v1/tickets/', ticketData);
                await apiClient.post('/tickets/', ticketData); // <-- CAMBIO
                successfulTickets++;
            } catch (err) {
                const errorMessage = err.response?.data?.detail || 'un error desconocido';
                alert(`Error al crear el tiquete para ${ticketData.name} con los números ${ticketData.numbers.join(', ')}: ${errorMessage}. La compra se ha detenido.`);
                setIsSubmitting(false);
                return; // Detiene el proceso si un tiquete falla
            }
        }

        setIsSubmitting(false);
        alert(`¡Compra completada! Se crearon ${successfulTickets} tiquetes exitosamente.`);
        setTicketCart([]);
        setShowPurchaseForm(false);
        fetchTickets(); // Refresca la lista de tiquetes principal
    };

    const totalPrice = useMemo(() => {
        return ticketCart.reduce((total, ticket) => total + ticket.price, 0);
    }, [ticketCart]);

    const handleConfirmPayment = async (ticketId) => {
        if (window.confirm('¿Confirma que ha recibido el pago de este tiquete?')) {
            try {
                await apiClient.patch(`/tickets/${ticketId}/confirm-payment`); // <-- CAMBIO
                //await axios.patch(`/api/v1/tickets/${ticketId}/confirm-payment`);
                // Actualizar el estado del tiquete en la UI localmente
                setTickets(prevTickets =>
                    prevTickets.map(t =>
                        t.id === ticketId ? { ...t, status: 'paid' } : t
                    )
                );
                alert('Pago confirmado exitosamente.');
            } catch (error) {
                console.error('Error al confirmar el pago:', error);
                const errorMessage = error.response?.data?.detail || 'No se pudo confirmar el pago.';
                alert(errorMessage);
            }
        }
    };

    const handleCancelTicket = async (ticketId) => {
        if (window.confirm('¿Está seguro de que desea anular este tiquete? Esta acción no se puede deshacer.')) {
            try {
                await apiClient.delete(`/tickets/${ticketId}/cancel`); // <-- CAMBIO
                //await axios.delete(`/api/v1/tickets/${ticketId}/cancel`);
                // Actualizar el estado del tiquete en la UI localmente
                setTickets(prevTickets =>
                    prevTickets.map(t =>
                        t.id === ticketId ? { ...t, status: 'cancelled' } : t
                    )
                );
                alert('Tiquete anulado exitosamente.');
            } catch (error) {
                console.error('Error al anular el tiquete:', error);
                const errorMessage = error.response?.data?.detail || 'No se pudo anular el tiquete.';
                alert(errorMessage);
            }
        }
    };

    // <-- AJUSTE 1: La función ahora recibe el objeto 'ticket' completo.
    const formatTicketNumbers = (ticket) => {
    let numbersSource = [];

    // Prioridad 1: Usar el snapshot si el tiquete está anulado.
    if (ticket.status === 'cancelled' && ticket.numbers_snapshot) {
        let snapshotData = ticket.numbers_snapshot;

        // --- AJUSTE DE ROBUSTEZ ---
        // Se verifica si es un string y, de ser así, se convierte a un array.
        if (typeof snapshotData === 'string') {
            try {
                snapshotData = JSON.parse(snapshotData);
            } catch (e) {
                console.error("Error al parsear numbers_snapshot:", e);
                snapshotData = []; // En caso de error, se usa un array vacío.
            }
        }
        
        // Se asegura de que sea un array antes de asignarlo
        if (Array.isArray(snapshotData)) {
            numbersSource = snapshotData;
        }
    } 
    // Prioridad 2: Para todos los demás estados, usar los números "en vivo".
    else if (ticket.numbers) {
        numbersSource = ticket.numbers;
    }

    // Finalmente, se formatea la salida
    if (numbersSource.length > 0) {
        return numbersSource.join(', ');
    }

    return 'N/A';
};

// --- NUEVA LÓGICA PARA CALCULAR EL DESGLOSE DE TOTALES ---
    const totalsBreakdown = useMemo(() => {
        const breakdown = {
            efectivo: { paid: 0, pending: 0, total: 0 },
            transferencia: { paid: 0, pending: 0, total: 0 },
            grandTotal: 0
        };

        ticketCart.forEach(ticket => {
            const method = ticket.payment_type; // 'efectivo' o 'transferencia'
            const status = ticket.status.toLowerCase() === 'paid' ? 'paid' : 'pending';
            
            if (breakdown[method]) {
                breakdown[method][status] += ticket.price;
                breakdown[method].total += ticket.price;
            }
            breakdown.grandTotal += ticket.price;
        });

        return breakdown;
    }, [ticketCart]);

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return styles.statusPaid;
            case 'pending': return styles.statusReserved;
            case 'expired': return styles.statusExpired;
            case 'cancelled': return styles.statusCancelled;
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className={styles.centeredMessage}>
                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                <p>Cargando transacciones...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${styles.centeredMessage} ${styles.errorMessage}`}>
                <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
                <p>{error}</p>
                <button onClick={fetchTickets} className={styles.retryButton}>Reintentar</button>
            </div>
        );
    }

    return (
        <div className={styles.salesManagementContainer}>
            <div className={styles.headerActions}>
                <h1 className={styles.pageTitle}>Gestión de Tiquetes</h1>
                <button onClick={showPurchaseForm ? handleCancelPurchaseFlow : handleShowPurchaseForm} className={styles.toggleFormButton}>
                    <FontAwesomeIcon icon={showPurchaseForm ? faTimes : faPlus} />
                    {showPurchaseForm ? 'Cancelar Compra' : 'Comprar Tiquete'}
                </button>
            </div>

            {showPurchaseForm ? (
                 // --- NUEVA ESTRUCTURA TIPO POS ---
                <div className={styles.posContainer}>
                    {/* Columna Izquierda: Formulario de Compra */}
                    <div className={styles.posFormColumn}>
                         
                        <div className={detailStyles.purchaseUiContainer}> {/* Reutilizamos la clase para mantener estilos */}
                            <TicketEditorForm 
                                raffles={raffles}
                                initialRaffleId={redirectedRaffleId}
                                onAddToCart={handleAddToCart}
                                onCancel={handleCancelPurchaseFlow}
                            />
                        </div>
                    </div>
                    {/* --- COLUMNA DEL CARRITO ACTUALIZADA --- */}
                    <div className={styles.posCartColumn}>
                        <div className={`${styles.cartContainer} ${styles.cartContainerVisible}`}>
                            <h2 className={styles.cartTitle}>
                                <FontAwesomeIcon icon={faShoppingCart} /> Tiquetes en la Compra
                            </h2>
                            {ticketCart.length > 0 ? (
                                <ul className={styles.cartList}>
                                    {ticketCart.map((ticket, index) => (
                                        <li key={index} className={styles.cartItem}>
                                            <div className={styles.cartItemInfo}>
                                                <span className={styles.cartItemRaffle}>{ticket.raffle_name}</span>
                                                <span className={styles.cartItemBuyerInfo}>
                                                    {ticket.name} • {ticket.phone}
                                                </span>
                                                <span className={styles.cartItemNumbers}>Números: {ticket.numbers.join(', ')}</span>
                                                <div className={styles.cartItemTags}>
                                                    <span className={`${styles.itemTag} ${styles.paymentMethodTag}`}>
                                                        {ticket.payment_type}
                                                    </span>
                                                    <span className={`${styles.itemTag} ${ticket.status.toLowerCase() === 'paid' ? styles.statusTagPaid : styles.statusTagPending}`}>
                                                        {ticket.status.toLowerCase() === 'paid' ? 'Pagado' : 'Pendiente'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleRemoveFromCart(index)} className={styles.cartItemRemove}>Quitar</button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={styles.emptyCartMessage}>Añade tiquetes desde el formulario de la izquierda.</p>
                            )}
                            
                            {/* --- SECCIÓN DE TOTALES ACTUALIZADA CON DESGLOSE --- */}
                            <div className={styles.cartTotal}>
                                {ticketCart.length > 0 && (
                                    <div className={styles.totalBreakdown}>
                                        {totalsBreakdown.transferencia.total > 0 && (
                                            <>
                                                <div className={styles.breakdownRow}>
                                                    <span>Transferencia (Pagado):</span>
                                                    <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(totalsBreakdown.transferencia.paid)}</span>
                                                </div>
                                                <div className={styles.breakdownRow}>
                                                    <span>Transferencia (Pendiente):</span>
                                                    <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(totalsBreakdown.transferencia.pending)}</span>
                                                </div>
                                                <div className={`${styles.breakdownRow} ${styles.subtotal}`}>
                                                    <span>Subtotal Transferencia:</span>
                                                    <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(totalsBreakdown.transferencia.total)}</span>
                                                </div>
                                            </>
                                        )}
                                        {totalsBreakdown.efectivo.total > 0 && (
                                            <>
                                                <div className={styles.breakdownRow}>
                                                    <span>Efectivo (Pagado):</span>
                                                    <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(totalsBreakdown.efectivo.paid)}</span>
                                                </div>
                                                <div className={styles.breakdownRow}>
                                                    <span>Efectivo (Pendiente):</span>
                                                    <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(totalsBreakdown.efectivo.pending)}</span>
                                                </div>
                                                <div className={`${styles.breakdownRow} ${styles.subtotal}`}>
                                                    <span>Subtotal Efectivo:</span>
                                                    <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(totalsBreakdown.efectivo.total)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                                <div className={styles.finalTotal}>
                                    <h3>Total: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(totalsBreakdown.grandTotal)}</h3>
                                    <button onClick={handleConfirmPurchase} className={styles.confirmPurchaseButton} disabled={isSubmitting || ticketCart.length === 0}>
                                        {isSubmitting ? (
                                            <><FontAwesomeIcon icon={faSpinner} spin /> Procesando...</>
                                        ) : (
                                            'Confirmar Compra'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    
                    {tickets.length > 0 ? (
                        <div className={styles.tableContainer}>
                            <table className={styles.salesTable}>
                                <thead>
                                    <tr>
                                        <th>ID Rifa</th>
                                        <th>Rifa</th>
                                        <th>Comprador</th>
                                        <th>Vendedor</th>
                                        <th>WhatsApp</th>
                                        <th>Números</th>
                                        <th>Fecha Creación</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map(ticket => (
                                        <tr key={ticket.id}>
                                            <td>{ticket.raffle_short_id || 'N/A'}</td>
                                            <td>{ticket.raffle_name}</td>
                                            <td>{ticket.name}</td>
                                            <td>{ticket.responsible || 'N/A'}</td>
                                            <td>{ticket.phone}</td>
                                            <td>{formatTicketNumbers(ticket)}</td>
                                            <td>{new Date(ticket.created_at).toLocaleString('es-ES')}</td>
                                            <td>
                                                <span className={getStatusClass(ticket.status)}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className={styles.actionsCell}>
                                                <Link to={`/ticket/${ticket.id}`} className={styles.viewButton} title="Ver detalles del tiquete">
                                                    <FontAwesomeIcon icon={faEye} /> Ver
                                                </Link>
                                                {ticket.status === 'pending' && (
                                                    <button
                                                        className={styles.confirmButton}
                                                        onClick={() => handleConfirmPayment(ticket.id)}
                                                        title="Confirmar que el pago fue recibido"
                                                    >
                                                        <FontAwesomeIcon icon={faCheckCircle} /> Confirmar
                                                    </button>
                                                )}
                                                {ticket.status === 'paid' && (
                                                        <a
                                                            href={`${process.env.REACT_APP_BACKEND_API_URL}/api/v1/tickets/${ticket.id}/image`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={styles.downloadButton}
                                                            title="Ver o descargar el comprobante"
                                                        >
                                                            <FontAwesomeIcon icon={faDownload} /> Comprobante
                                                        </a>
                                                    )}
                                                {(ticket.status === 'pending' || ticket.status === 'paid') && (
                                                    <button
                                                        className={styles.cancelButton}
                                                        onClick={() => handleCancelTicket(ticket.id)}
                                                        title="Anular tiquete y liberar números"
                                                    >
                                                        <FontAwesomeIcon icon={faTimesCircle} /> Anular
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className={styles.noTransactionsMessage}>No hay transacciones registradas.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default SalesManagementPage;
