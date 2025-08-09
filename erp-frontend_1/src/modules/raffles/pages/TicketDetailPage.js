// raffle-frontend/src/pages/TicketDetailPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './TicketDetailPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faImage, faUpload, faEye, faTrashAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../services/api'; // <-- CAMBIO

const TicketDetailPage = () => {
    const { ticketId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- NUEVOS ESTADOS PARA EL MODAL DE IMAGEN ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const uploadInputRef = useRef(null);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/tickets/${ticketId}`); // <-- CAMBIO
                //const response = await axios.get(`/api/v1/tickets/${ticketId}`);
                setTicket(response.data);
                setError('');
            } catch (err) {
                setError('Error al cargar los detalles del tiquete.');
                console.error('Error fetching ticket details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [ticketId]);

    // --- NUEVOS MANEJADORES PARA LA SECCIÓN DE COMPROBANTES ---
    const handleViewImage = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleTriggerUpload = () => uploadInputRef.current?.click();

    const handleProofUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Lógica para subir el archivo (pendiente de backend)
            //alert(`Funcionalidad pendiente: Subir el archivo "${file.name}" para el tiquete ${ticketId}.`);
             const formData = new FormData();
             formData.append('proof_file', file);
             apiClient.patch(`/tickets/${ticketId}/proof`, formData) // <-- CAMBIO
             //axios.patch(`/api/v1/tickets/${ticketId}/proof`, formData)
                .then(response => {
                    // Actualiza el estado del tiquete con la nueva información del backend
                    setTicket(response.data); 
                    alert("Comprobante subido con éxito.");
                })
                .catch(err => {
                    console.error('Error uploading file:', err);
                    alert("Error al subir el comprobante: " + (err.response?.data?.detail || err.message));
                });
            // --- FIN DEL CÓDIGO ACTIVADO ---
        }
    };

    const handleDeleteProof = () => {
        if (window.confirm('¿Está seguro de que desea eliminar este comprobante de pago?')) {
            // --- CÓDIGO A ACTIVAR ---
            // Se eliminó el alert y se descomentó esta sección.
            apiClient.delete(`/tickets/${ticketId}/proof`) // <-- CAMBIO
            //axios.delete(`/api/v1/tickets/${ticketId}/proof`)
                .then(response => {
                    // Actualiza el estado para reflejar que el comprobante fue eliminado
                    setTicket(response.data); 
                    alert("Comprobante eliminado con éxito.");
                })
                .catch(err => {
                    console.error('Error deleting proof:', err);
                    alert("Error al eliminar el comprobante: " + (err.response?.data?.detail || err.message));
                });
            // --- FIN DEL CÓDIGO ACTIVADO ---
        }
    };
    
    const getStatusInfo = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return { text: 'Pagado', className: styles.statusPaid };
            case 'pending': return { text: 'Pendiente', className: styles.statusPending };
            case 'cancelled': return { text: 'Anulado', className: styles.statusCancelled };
            default: return { text: status || 'N/A', className: '' };
        }
    };
    
    if (loading) return <div className={styles.centeredMessage}>Cargando...</div>;
    if (error) return <div className={styles.centeredMessage}>{error}</div>;
    if (!ticket) return <div className={styles.centeredMessage}>No se encontró el tiquete.</div>;

    const statusInfo = getStatusInfo(ticket.status);
    const generatedReceiptUrl = `/api/v1/tickets/${ticket.id}/image`;

    return (
        <div className={styles.ticketDetailContainer}>
            {/* --- SECCIÓN DE INFORMACIÓN DEL TIQUETE (AJUSTADA) --- */}
            <div className={styles.ticketInfo}>
                <h1 className={styles.pageTitle}>Detalle del Tiquete</h1>
                <p><strong>Rifa:</strong> {ticket.raffle_name} ({ticket.raffle_short_id})</p>
                <p><strong>Comprador:</strong> {ticket.name}</p>
                <p><strong>WhatsApp:</strong> {ticket.phone}</p>
                <p><strong>Números Comprados:</strong> {ticket.numbers.join(', ')}</p>
                <p><strong>Valor del Tiquete:</strong> ${ticket.raffle_price.toLocaleString('es-CO')} COP</p>
                <p><strong>Fecha de Compra:</strong> {new Date(ticket.created_at).toLocaleString('es-ES')}</p>
                <p><strong>Fecha del Sorteo:</strong> {new Date(ticket.raffle_end_date).toLocaleString('es-ES')}</p>
                <p>
                    <strong>Estado del Tiquete:</strong>
                    <span className={`${styles.statusBadge} ${statusInfo.className}`}>{statusInfo.text}</span>
                </p>
                {ticket.status === 'pending' && ticket.payment_date && (
                    <p><strong>Fecha Límite de Pago:</strong> {new Date(ticket.payment_date).toLocaleDateString('es-ES')}</p>
                )}
                <p><strong>ID Único del Tiquete:</strong> {ticket.id}</p>
            </div>

            {/* --- NUEVA SECCIÓN DE COMPROBANTES --- */}
            <div className={styles.proofsSection}>
                <h2 className={styles.sectionTitle}>Comprobantes</h2>
                <div className={styles.proofsGrid}>
                    {/* Tarjeta para el Comprobante Generado Automáticamente */}
                    <div className={styles.proofCard}>
                        <img src={generatedReceiptUrl} alt="Comprobante generado" className={styles.proofImage} />
                        <div className={styles.proofOverlay}>
                            <p>Comprobante Oficial</p>
                            <div className={styles.proofActions}>
                                <button onClick={() => handleViewImage(generatedReceiptUrl)} title="Ver más grande">
                                    <FontAwesomeIcon icon={faEye} />
                                </button>
                                <a href={generatedReceiptUrl} download={`Comprobante_${ticket.id}.jpg`} title="Descargar">
                                    <FontAwesomeIcon icon={faDownload} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta para el Comprobante Subido por el Usuario */}
                    <div className={styles.proofCard}>
                        {ticket.payment_proof_url ? (
                            <img src={ticket.payment_proof_url} alt="Comprobante de pago" className={styles.proofImage} />
                        ) : (
                            <div className={styles.proofPlaceholder}>
                                <FontAwesomeIcon icon={faImage} />
                                <span>No hay comprobante de pago adjunto</span>
                            </div>
                        )}
                        <div className={styles.proofOverlay}>
                            <p>Comprobante de Pago</p>
                            <div className={styles.proofActions}>
                                <input type="file" ref={uploadInputRef} onChange={handleProofUpload} style={{ display: 'none' }} accept=".jpg,.jpeg,.png" />
                                <button onClick={handleTriggerUpload} title="Subir comprobante">
                                    <FontAwesomeIcon icon={faUpload} />
                                </button>
                                {ticket.payment_proof_url && (
                                    <>
                                        <button onClick={() => handleViewImage(ticket.payment_proof_url)} title="Ver más grande">
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        <button onClick={handleDeleteProof} title="Eliminar comprobante" className={styles.deleteButton}>
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- NUEVO MODAL PARA VISUALIZAR IMAGEN --- */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.modalCloseButton} onClick={handleCloseModal}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                        <img src={selectedImage} alt="Vista previa del comprobante" className={styles.modalImage} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketDetailPage;