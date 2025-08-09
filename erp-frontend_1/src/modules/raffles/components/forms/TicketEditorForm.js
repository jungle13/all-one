// raffle-frontend/src/components/forms/TicketEditorForm.js

import React, { useState, useMemo, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './TicketEditorForm.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashAlt, faCreditCard, faTimes, faSpinner, faSyncAlt, faUpload } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../services/api'; // <-- CAMBIO (la ruta relativa es diferente)

const TicketCreateForm = ({ raffles, initialRaffleId, onAddToCart, onCancel }) => {
    const [selectedRaffleId, setSelectedRaffleId] = useState(initialRaffleId || '');
    
    const raffle = useMemo(() => raffles.find(r => r.id === selectedRaffleId), [raffles, selectedRaffleId]);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [manualNumber, setManualNumber] = useState('');
    const [selectedNumbers, setSelectedNumbers] = useState([]);
    const [paymentType, setPaymentType] = useState('transferencia');
    const [isPayingNow, setIsPayingNow] = useState(true);
    const [paymentDate, setPaymentDate] = useState('');
    const [paymentProofFile, setPaymentProofFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [numberInputMessage, setNumberInputMessage] = useState({ text: '', type: '' });
    const [formError, setFormError] = useState('');
    // --- NUEVOS ESTADOS PARA LA SUBIDA DE COMPROBANTES ---
    const [paymentProofUrl, setPaymentProofUrl] = useState('');
    const [paymentProofPreview, setPaymentProofPreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const uploadInputRef = useRef(null); // <-- AÑADE ESTA LÍNEA

    useEffect(() => {
        setSelectedNumbers([]);
        setManualNumber('');
        setNumberInputMessage({ text: '', type: '' });
    }, [selectedRaffleId]);

    const ticketDigits = raffle?.dijits_per_number || 2;
    const numbersPerTicket = raffle?.numbers_per_ticket || 1;

    // --- MANEJADOR PARA LA SUBIDA DE ARCHIVOS ---
    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setPaymentProofPreview(URL.createObjectURL(file)); // Muestra vista previa local
        setIsUploading(true);
        setFormError('');

        const formData = new FormData();
        formData.append('upload_file', file);

        try {
            // Este es el nuevo endpoint genérico que debes crear en el backend
            //const response = await axios.post('/api/v1/uploads/proof', formData);
            const response = await apiClient.post('/uploads/proof', formData); // <-- CAMBIO
            setPaymentProofUrl(response.data.url); // Guarda la URL del archivo subido
        } catch (err) {
            const msg = err.response?.data?.detail || 'Error al subir el archivo.';
            setFormError(msg);
            setPaymentProofPreview(''); // Limpia la vista previa en caso de error
        } finally {
            setIsUploading(false);
        }
    };

    // --- MANEJADOR PARA ELIMINAR EL COMPROBANTE ---
    const handleRemoveProof = () => {
        setPaymentProofUrl('');
        setPaymentProofPreview('');
        if (uploadInputRef.current) {
            uploadInputRef.current.value = null; // Resetea el input de archivo
        }
    };

    const totalPrice = useMemo(() => {
        if (!raffle) return 0;
        return raffle.price * (selectedNumbers.length / numbersPerTicket);
    }, [selectedNumbers.length, numbersPerTicket, raffle]);

    const handleAddTicketToCart = () => {
        if (!phone.trim() || !firstName.trim() || !lastName.trim()) {
            setFormError('Por favor, complete su nombre, apellido y WhatsApp.');
            return;
        }
        if (selectedNumbers.length !== numbersPerTicket) {
            setFormError(`Debes seleccionar un total de ${numbersPerTicket} números para este tiquete.`);
            return;
        }
        
        let ticketStatus = isPayingNow ? 'PAID' : 'PENDING';
        let finalPaymentDate = isPayingNow ? new Date().toISOString().split('T')[0] : paymentDate;

        if (!isPayingNow && !paymentDate) {
            setFormError("Por favor, indique la fecha en que realizará el pago.");
            return;
        }

        const ticketForCart = {
            raffle_id: raffle.id,
            raffle_name: raffle.name, // Para mostrar en el carrito
            name: `${firstName} ${lastName}`,
            phone: phone,
            numbers: selectedNumbers,
            payment_type: paymentType,
            status: ticketStatus,
            payment_date: finalPaymentDate,
            payment_proof_url: paymentProofUrl, // <-- SE AÑADE LA URL DEL COMPROBANTE
            price: raffle.price // Guardamos el precio para el total
        };

        onAddToCart(ticketForCart);

        // Limpiar campos para el siguiente tiquete
        setSelectedNumbers([]);
        setManualNumber('');
        setFormError('');
        setNumberInputMessage({ text: '¡Tiquete añadido! Puedes añadir otro.', type: 'success' });
    };

    const handleAddManualNumber = async () => {
        if (!manualNumber.trim() || manualNumber.length !== ticketDigits) {
            setNumberInputMessage({ text: `El número debe tener ${ticketDigits} dígitos.`, type: 'error' });
            return;
        }
        if (selectedNumbers.length >= numbersPerTicket) {
            setNumberInputMessage({ text: `Ya has seleccionado el máximo de ${numbersPerTicket} números.`, type: 'error' });
            return;
        }

        const formattedNumber = manualNumber.padStart(ticketDigits, '0');
        setNumberInputMessage({ text: '', type: '' });
        setIsLoading(true);

        try {
            const response = await apiClient.get(`/raffle/${raffle.id}/check-number/${formattedNumber}`); // <-- CAMBIO
            //const response = await axios.get(`/api/v1/raffle/${raffle.id}/check-number/${formattedNumber}`);
            if (response.data.is_available) {
                setSelectedNumbers(prev => [...new Set([...prev, formattedNumber])]);
                setManualNumber('');
                setNumberInputMessage({ text: `Número ${formattedNumber} añadido con éxito.`, type: 'success' });
            } else {
                setNumberInputMessage({ text: `El número ${formattedNumber} no está disponible.`, type: 'error' });
            }
        } catch (err) {
            setNumberInputMessage({ text: 'Error al verificar el número.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualNumberKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddManualNumber();
        }
    };
    
    const handleGenerateRandomNumbers = async () => {
        const numbersNeeded = numbersPerTicket - selectedNumbers.length;
        if (numbersNeeded <= 0) {
            setNumberInputMessage({ text: 'Ya has completado todos los números para tu tiquete.', type: 'info' });
            return;
        }
        
        setIsLoading(true);
        setNumberInputMessage({ text: `Generando ${numbersNeeded} número(s) aleatorio(s)...`, type: 'info' });

        try {
            //const response = await axios.get(`/api/v1/raffle/${raffle.id}/random-numbers/${numbersNeeded}`);
            const response = await apiClient.get(`/raffle/${raffle.id}/random-numbers/${numbersNeeded}`); // <-- CAMBIO
            const generatedNumbers = response.data.numbers;

            if (generatedNumbers && generatedNumbers.length === numbersNeeded) {
                setSelectedNumbers(prev => [...new Set([...prev, ...generatedNumbers])]);
                setNumberInputMessage({ text: `${generatedNumbers.length} número(s) aleatorio(s) añadidos.`, type: 'success' });
            } else {
                throw new Error("La respuesta del API no fue la esperada.");
            }
        } catch (error) {
            const detail = error.response?.data?.detail || 'Error al generar números aleatorios.';
            setNumberInputMessage({ text: detail, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const removeSelectedNumber = (numberToRemove) => {
        setSelectedNumbers(prev => prev.filter(num => num !== numberToRemove));
    };

    const handleCreateTicket = async () => {
        if (!phone.trim() || !firstName.trim() || !lastName.trim()) {
            setFormError('Por favor, complete su nombre, apellido y WhatsApp.');
            return;
        }
        if (selectedNumbers.length !== numbersPerTicket) {
            setFormError(`Debes seleccionar un total de ${numbersPerTicket} números para continuar.`);
            return;
        }
        
        let ticketStatus;
        let paymentData = {
            payment_date: null,
            payment_proof_url: null,
        }

        if (isPayingNow) {
            ticketStatus = 'PAID';
            paymentData.payment_date = new Date().toISOString().split('T')[0]; 
            
            if (paymentProofFile) {
                paymentData.payment_proof_url = "https://url-simulada.com/comprobante.jpg";
            } 
        } else {
            // --- LÓGICA AJUSTADA PARA PAGO PENDIENTE ---
            ticketStatus = 'PENDING';
            // Validamos que el usuario haya escogido una fecha futura
            if (!paymentDate) {
                setFormError("Por favor, indique la fecha en que realizará el pago.");
                return;
            }
            paymentData.payment_date = paymentDate; // <-- Guardamos la fecha seleccionada
        }

        setIsLoading(true);
        setFormError('');


        const payload = {
            raffle_id: raffle.id,
            name: `${firstName} ${lastName}`,
            phone: phone,
            numbers: selectedNumbers,
            payment_type: paymentType,
            status: ticketStatus,
            payment_date: paymentData.payment_date,
            payment_proof_url: paymentData.payment_proof_url,
        };

        console.log("Enviando payload al backend:", JSON.stringify(payload, null, 2));

        try {
            //const response = await axios.post('/api/v1/tickets/', payload);
            const response = await apiClient.post('/tickets/', payload); // <-- CAMBIO
            console.log("¡Tiquete creado con éxito en el backend!", response.data);
            onPurchaseSuccess(response.data); // <-- Pasa el tiquete creado al padre
        } catch (err) {
            console.error("Error al crear el tiquete:", err.response?.data || err.message);
            let errorMessage = 'No se pudo crear el tiquete.';
            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail) && err.response.data.detail.length > 0) {
                    errorMessage = err.response.data.detail[0].msg || 'Error de validación. Por favor, revise los datos.';
                } else if (typeof err.response.data.detail === 'string') {
                    errorMessage = err.response.data.detail;
                }
            }
            setFormError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.purchaseUiContainer}>
            <div className={styles.purchaseSection}>
                <label className={styles.purchaseLabel}>Seleccionar Rifa:</label>
                <select 
                    value={selectedRaffleId}
                    onChange={(e) => setSelectedRaffleId(e.target.value)}
                    className={styles.purchaseInput}
                >
                    <option value="" disabled>-- Elige una rifa --</option>
                    {raffles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
            </div>

                <>
                    {formError && <p className={`${styles.errorMessage} ${styles.inputMessage}`}>{formError}</p>}
                    
                    <div className={styles.nameInputsRow}>
                        <div className={styles.purchaseSection}>
                            <label className={styles.purchaseLabel}>Nombre:</label>
                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Tu nombre" className={styles.purchaseInput} />
                        </div>
                        <div className={styles.purchaseSection}>
                            <label className={styles.purchaseLabel}>Apellido:</label>
                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Tu apellido" className={styles.purchaseInput} />
                        </div>
                    </div>
                    <div className={styles.purchaseSection}>
                        <label className={styles.purchaseLabel}>Número de WhatsApp:</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej: 3001234567" className={`${styles.purchaseInput} ${styles.whatsappInputHighlighted}`} />
                    </div>

                    <hr className={styles.divider} />

                    <div className={styles.purchaseSection}>
                        <label className={styles.purchaseLabel}>Elige tus números ({selectedNumbers.length}/{numbersPerTicket}):</label>
                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                value={manualNumber}
                                onChange={(e) => setManualNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                onKeyDown={handleManualNumberKeyDown}
                                placeholder={`Número de ${ticketDigits} dígitos`}
                                maxLength={ticketDigits}
                                disabled={selectedNumbers.length >= numbersPerTicket || isLoading}
                                className={styles.purchaseInput}
                            />
                            <button type="button" onClick={handleAddManualNumber} disabled={isLoading} className={styles.addNumberButton}><FontAwesomeIcon icon={faPlus} /></button>
                        </div>
                        {numberInputMessage.text && <p className={`${styles.inputMessage} ${numberInputMessage.type === 'error' ? styles.errorMessage : styles.successMessage}`}>{numberInputMessage.text}</p>}
                        
                        <div className={styles.selectedNumbersList}>
                            {selectedNumbers.map(num => (
                                <div key={num} className={styles.selectedNumberItem}>
                                    <span className={styles.selectedNumberTag}>{num}</span>
                                    <button onClick={() => removeSelectedNumber(num)} className={styles.removeNumberButton}><FontAwesomeIcon icon={faTrashAlt} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className={styles.purchaseSection}>
                         <button className={styles.generateButton} onClick={handleGenerateRandomNumbers} disabled={selectedNumbers.length >= numbersPerTicket || isLoading}>
                            <FontAwesomeIcon icon={faSyncAlt} /> Generar {numbersPerTicket - selectedNumbers.length > 0 ? `${numbersPerTicket - selectedNumbers.length} números restantes` : 'Números Completos'}
                        </button>
                    </div>

                    <hr className={styles.divider} />

                    <div className={styles.purchaseSection}>
                        <label className={styles.purchaseLabel}>Método de Pago:</label>
                        <div className={styles.togglePayment}>
                            <button type="button" onClick={() => setPaymentType('transferencia')} className={paymentType === 'transferencia' ? styles.active : ''}>Transferencia</button>
                            <button type="button" onClick={() => setPaymentType('efectivo')} className={paymentType === 'efectivo' ? styles.active : ''}>Efectivo</button>
                        </div>
                    </div>

                    <div className={styles.purchaseSection}>
                        <div className={styles.checkboxGroup}>
                            <input type="checkbox" id="isPayingNow" checked={isPayingNow} onChange={(e) => setIsPayingNow(e.target.checked)} />
                            <label htmlFor="isPayingNow">Pago realizado en este momento</label>
                        </div>
                        {!isPayingNow && (
                             <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className={`${styles.purchaseInput} ${styles.dateInput}`} />
                        )}
                    </div>

                    {/* --- SECCIÓN DE COMPROBANTE DE PAGO ACTUALIZADA --- */}
                    <div className={styles.purchaseSection}>
                        <label className={styles.purchaseLabel}>Comprobante de Pago (Opcional):</label>
                        <div className={styles.proofUploader}>
                            <input type="file" ref={uploadInputRef} onChange={handleFileSelect} style={{ display: 'none' }} accept=".jpg,.jpeg,.png" disabled={!raffle || isUploading} />
                            
                            {paymentProofPreview ? (
                                <div className={styles.imagePreviewContainer}>
                                    <img src={paymentProofPreview} alt="Vista previa" className={styles.imagePreview} />
                                    <button type="button" onClick={handleRemoveProof} className={styles.removeImageButton} title="Quitar imagen">
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.dropzone} onClick={() => !isUploading && uploadInputRef.current?.click()} role="button">
                                    {isUploading ? (
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faUpload} className={styles.uploadIcon} />
                                            <p>Adjuntar Comprobante</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.totalPriceSection}>
                        <button className={styles.createTicketButton} onClick={handleAddTicketToCart} disabled={isLoading || selectedNumbers.length !== numbersPerTicket}>
                            <FontAwesomeIcon icon={faPlus} /> Añadir Tiquete a la Compra
                        </button>
                        <button type="button" onClick={onCancel} className={styles.cancelButtonForm}>Cancelar</button>
                    </div>
                </>
            
        </div>
    );
};

export default TicketCreateForm;
