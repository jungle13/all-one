// raffle-frontend/src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import axios from 'axios';

// Se importan los estilos del carrusel
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import styles from './Home.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faImage, faClock, faPlayCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

// --- Funciones de formato (sin cambios) ---
const formatTicketNumberDisplay = (number, digits) => {
    if (number === undefined || number === null || digits === undefined) return 'N/A';
    return String(number).padStart(digits, '0');
};

const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no definida';
    try {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
};

const Home = () => {
    const [raffles, setRaffles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRaffles = async () => {
            try {
                const response = await axios.get('/api/v1/raffle/');
                setRaffles(response.data.raffles || []);
            } catch (err) {
                setError("No se pudieron cargar las rifas. Intenta de nuevo más tarde.");
                console.error("Error fetching raffles:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRaffles();
    }, []);

    // --- CAMBIO: Filtro ajustado a los estados 'active' y 'pending' ---
    const activeRaffles = raffles.filter(r => r.status && (r.status.toLowerCase() === 'active' || r.status.toLowerCase() === 'pending'));
    const finishedRaffles = raffles.filter(r => r.status && r.status.toLowerCase() === 'finished');

    const handleAddButtonClick = (e, raffleId) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = `/raffle/${raffleId}`;
    };

    const renderRaffleCard = (raffle) => {
        const ticketDigits = raffle.dijits_per_number || 2;
        const displayPrice = (typeof raffle.price === 'number' && !isNaN(raffle.price)) ? raffle.price.toLocaleString() : 'N/A';

        // --- CAMBIO: La lógica de status vuelve a usar 'active', 'pending' y 'finished' ---
        let statusIcon, statusClass, statusText;
        switch (raffle.status?.toLowerCase()) {
            case 'active':
                statusIcon = faPlayCircle;
                statusClass = styles.statusActive;
                statusText = "Activa";
                break;
            case 'pending':
                statusIcon = faClock;
                statusClass = styles.statusPending;
                statusText = "Pendiente";
                break;
            case 'finished':
                statusIcon = faCheckCircle;
                statusClass = styles.statusFinished;
                statusText = "Finalizada";
                break;
            default:
                statusIcon = faImage;
                statusClass = '';
                statusText = raffle.status || 'Desconocido';
        }
        
        const isLinkActive = raffle.status?.toLowerCase() === 'active' || raffle.status?.toLowerCase() === 'pending';

        const cardInnerContent = (
            <div className={styles.card}>
                <div className={styles.cardImageContainer}>
                    {raffle.image_url && raffle.image_url !== '#' ? (
                        <img src={raffle.image_url} alt={raffle.name} className={styles.cardImage} />
                    ) : (
                        <FontAwesomeIcon icon={faImage} className={styles.imagePlaceholderIcon} />
                    )}
                </div>
                <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{raffle.name}</h3>
                    
                    <div className={`${styles.statusBadge} ${statusClass}`}>
                        <FontAwesomeIcon icon={statusIcon} />
                        <span>{statusText}</span>
                    </div>

                    <p className={styles.cardInfoText}>Sorteo: {formatDate(raffle.end_date)}</p>
                    <p className={styles.cardInfoText}>Dígitos: {ticketDigits}</p>
                    
                    {isLinkActive ? (
                        <div className={styles.cardDetails}>
                            <div className={styles.priceAndButtonContainer}>
                                <p className={styles.cardPrice}>{`$${displayPrice} COP c/u`}</p>
                                <button 
                                    className={`${styles.addRaffleButton}`}
                                    onClick={(e) => handleAddButtonClick(e, raffle.id)}
                                    title="Ver detalles y comprar"
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                            </div>
                            <div className={styles.cardProgressContainer}>
                                <div
                                    className={styles.cardProgressBar}
                                    style={{ width: `${raffle.statistics?.total_tickets > 0 ? ((raffle.statistics.tickets_sold / raffle.statistics.total_tickets) * 100).toFixed(0) : 0}%` }}
                                ></div>
                            </div>
                            <p className={styles.cardProgressText}><small>{`${raffle.statistics?.tickets_sold || 0} de ${raffle.statistics?.total_tickets || 'N/A'} vendidos`}</small></p>
                        </div>
                    ) : (
                        <div className={styles.cardFinishedInfo}>
                            <p><strong>Ganador:</strong> {raffle.winner || 'N/A'}</p>
                            <p><strong>Número:</strong> {formatTicketNumberDisplay(raffle.winningNumber, ticketDigits)}</p>
                        </div>
                    )}
                </div>
            </div>
        );

        return (
            <Link to={`/raffle/${raffle.id}`} key={raffle.id} className={isLinkActive ? styles.cardLink : styles.cardLinkInactive}>
                {cardInnerContent}
            </Link>
        );
    };

    const carouselSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
    };

    const promoImages = [
        { id: 1, url: 'https://picsum.photos/seed/promo1/1200/400', alt: 'Promoción 1' },
        { id: 2, url: 'https://picsum.photos/seed/promo2/1200/400', alt: 'Promoción 2' },
        { id: 3, url: 'https://picsum.photos/seed/promo3/1200/400', alt: 'Promoción 3' },
    ];

    if (isLoading) {
        return <div className={styles.page}><p className={styles.noRafflesMessage}>Cargando rifas...</p></div>;
    }

    if (error) {
        return <div className={styles.page}><p className={styles.noRafflesMessage}>{error}</p></div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.carouselContainer}>
                <Slider {...carouselSettings}>
                    {promoImages.map(image => (
                        <div key={image.id}>
                            <img src={image.url} alt={image.alt} className={styles.carouselImage} />
                        </div>
                    ))}
                </Slider>
            </div>

            <h2 className={styles.sectionTitle}>Rifas Disponibles</h2>
            <div className={styles.cardContainer}>
                {activeRaffles.length > 0 ? (
                    activeRaffles.map((raffle) => renderRaffleCard(raffle))
                ) : (
                    <p className={styles.noRafflesMessage}>No hay rifas activas o pendientes en este momento.</p>
                )}
            </div>

            <h2 className={styles.sectionTitle}>Rifas Finalizadas</h2>
            <div className={styles.cardContainer}>
                {finishedRaffles.length > 0 ? (
                    finishedRaffles.map((raffle) => renderRaffleCard(raffle))
                ) : (
                    <p className={styles.noRafflesMessage}>No hay rifas finalizadas.</p>
                )}
            </div>
        </div>
    );
};

export default Home;