// raffle-frontend/src/pages/RaffleDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './RaffleDetailPage.module.css';
import dashboardStyles from './DashboardPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faImage, faUsers, faTicketAlt, faBullseye } from '@fortawesome/free-solid-svg-icons';
import GaugeChart from '../components/GaugeChart';
import apiClient from '../../../core/api/apiClient';

const RaffleDetailPage = () => {
    const { raffleId } = useParams();
    const navigate = useNavigate();

    const [raffle, setRaffle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRaffleDetails = useCallback(async () => {
        try {
            setLoading(true);
            //const response = await axios.get(`/api/v1/raffle/${raffleId}`);
            const response = await apiClient.get(`/raffle/${raffleId}`); // <-- CAMBIO
            console.log('API Response:', response.data);
            setRaffle(response.data);
        } catch (error) {
            console.error('API Error:', error);
            setError("No se pudo cargar la rifa.");
        } finally {
            setLoading(false);
        }
    }, [raffleId]);

    useEffect(() => {
        fetchRaffleDetails();
    }, [fetchRaffleDetails]);

    const handlePurchaseRedirect = () => {
        navigate('/sales-management', { state: { raffleId: raffle.id } });
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return <span className={`${styles.statusBadge} ${styles.statusPaid}`}>Pagado</span>;
            case 'pending':
                return <span className={`${styles.statusBadge} ${styles.statusPending}`}>Pendiente</span>;
            default:
                return <span className={styles.statusBadge}>{status || 'N/A'}</span>;
        }
    };

    if (loading) return <div className={styles.statusMessage}>Cargando...</div>;
    if (error) return <div className={styles.statusMessage}>{error}</div>;
    if (!raffle) return <div className={styles.statusMessage}>Rifa no encontrada.</div>;

    const isPurchasable = raffle.status && (raffle.status.toLowerCase() === 'active' || raffle.status.toLowerCase() === 'pending');
    const stats = raffle.statistics || { tickets_sold: 0, total_tickets: 0, participants: 0 };
    const price = raffle.price || 0;

    return (
        <main className={styles.detailPageContent}>
            <div className={styles.headerSection}>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.raffleTitle}>{raffle.name}</h1>
                        <span className={styles.rafflePrice}>
                            ${price.toLocaleString('es-CO')} COP
                        </span>
                    </div>
                    {isPurchasable && (
                        <button className={styles.buyButton} onClick={handlePurchaseRedirect}>
                            <FontAwesomeIcon icon={faShoppingCart} />
                            Comprar Tiquete
                        </button>
                    )}
                </div>

            <div className={styles.imageGrid}>
                {[1, 2, 3].map((index) => (
                    <div key={index} className={styles.imageCard}>
                        <div className={styles.imagePlaceholder}>
                            <FontAwesomeIcon icon={faImage} />
                            <span>Imagen {index}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.descriptionSection}>
                <h2 className={styles.sectionTitle}>Descripción</h2>
                <p>{raffle.description || 'No hay descripción disponible.'}</p>
            </div>

            <div className={styles.statsSection}>
                <h2 className={styles.sectionTitle}>Estadísticas</h2>
                <div className={styles.statsGrid}>
                    <div className={dashboardStyles.kpiCard}>
                        <FontAwesomeIcon icon={faTicketAlt} className={dashboardStyles.kpiIcon} />
                        <div className={dashboardStyles.kpiInfo}>
                            <span className={dashboardStyles.kpiValue}>{stats.tickets_sold}</span>
                            <span className={dashboardStyles.kpiTitle}>Tiquetes Vendidos</span>
                        </div>
                    </div>
                    <div className={dashboardStyles.kpiCard}>
                        <FontAwesomeIcon icon={faUsers} className={dashboardStyles.kpiIcon} />
                        <div className={dashboardStyles.kpiInfo}>
                            <span className={dashboardStyles.kpiValue}>{stats.participants}</span>
                            <span className={dashboardStyles.kpiTitle}>Participantes Únicos</span>
                        </div>
                    </div>
                    <div className={dashboardStyles.kpiCard}>
                        <FontAwesomeIcon icon={faBullseye} className={dashboardStyles.kpiIcon} />
                        <div className={dashboardStyles.kpiInfo}>
                            <span className={dashboardStyles.kpiValue}>${(stats.tickets_sold * price).toLocaleString('es-CO')}</span>
                            <span className={dashboardStyles.kpiTitle}>Recaudo Actual</span>
                        </div>
                    </div>
                    <div className={styles.gaugeCard}>
                        <h3 className={styles.gaugeTitle}>Progreso de la Rifa</h3>
                        <GaugeChart value={stats.tickets_sold} total={stats.total_tickets} />
                    </div>
                </div>
            </div>

            <div className={styles.sponsorSection}>
                <h2 className={styles.sectionTitle}>Patrocinador Oficial</h2>
                <div className={styles.sponsorContent}>
                    <div className={styles.sponsorInfo}>
                        <h3 className={styles.sponsorName}>TecnoMundo Cali</h3>
                        <p>Los mejores precios en tecnología y electrodomésticos. ¡Visítanos en el centro comercial Centenario!</p>
                    </div>
                    <div className={styles.sponsorBanner}>
                        <img src="https://picsum.photos/seed/sponsor1/600/150" alt="Banner de patrocinador" />
                    </div>
                </div>
            </div>
            
            <div className={styles.soldTicketsSection}>
                <h2 className={styles.sectionTitle}>Boletas Compradas</h2>
                {raffle.sold_tickets && raffle.sold_tickets.length > 0 ? (
                    <div className={styles.ticketsTableContainer}>
                        <table className={styles.soldTicketsTable}>
                            <thead>
                                <tr>
                                    <th>Comprador</th>
                                    <th>Números</th>
                                    <th>Fecha Compra</th>
                                    <th>Estado</th>
                                    <th>Vendedor</th>
                                    <th>Acciones</th> {/* <-- Nueva columna */}
                                </tr>
                            </thead>
                            <tbody>
                                {raffle.sold_tickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td>{ticket.name}</td>
                                        <td>
                                            <div className={styles.numbersList}>
                                                {ticket.numbers.map(num => <span key={num} className={styles.numberTag}>{num}</span>)}
                                            </div>
                                        </td>
                                        {/* Usamos los datos reales de la API */}
                                        <td>{new Date(ticket.created_at).toLocaleDateString('es-ES')}</td>
                                        <td>{getStatusBadge(ticket.status)}</td>
                                        <td>{ticket.responsible}</td>
                                        {/* Nueva columna de acciones */}
                                        <td>
                                            <Link to={`/ticket/${ticket.id}`} className={styles.viewTicketButton}>
                                                Ver Tiquete
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>Aún no se han registrado boletas para esta rifa.</p>
                )}
            </div>
        </main>
    );
};

export default RaffleDetailPage;
