// raffle-frontend/src/components/forms/RafflePurchaseForm.js
import React from 'react';
import styles from '../../pages/RaffleDetailPage.module.css'; // Adjust path as needed, or create separate form styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashAlt, faCreditCard, faTimes } from '@fortawesome/free-solid-svg-icons';

const RafflePurchaseForm = ({
    raffle,
    buyerWhatsApp, setBuyerWhatsApp,
    buyerName, setBuyerName,
    buyerLastName, setBuyerLastName,
    manualNumber, setManualNumber,
    numberInputMessage, setNumberInputMessage, // Added for direct use
    handleAddManualNumber, // Added for direct use
    randomQuantity, setRandomQuantity,
    handleGenerateRandomNumbers, // Added for direct use
    
    // --- MEJORA: PROPS PARA OBSEQUIOS ---
    giftQuantity, setGiftQuantity,
    handleGenerateGiftNumbers,
    giftNumbers,
    removeGiftNumber,

    selectedNumbers, 
    removeSelectedNumber, // Added for direct use
    totalPrice,
    handleAddToCart,
    handleCancelPurchase,
    formError
}) => {

    if (!raffle) return null; // Should not happen if form is shown, but good guard

    return (
        <div className={styles.purchaseUiContainer}>
            {formError && <p className={`${styles.inputMessage} ${styles.errorMessage}`}>{formError}</p>} 
            
            <div className={styles.purchaseSection}>
                <label htmlFor="buyerWhatsApp" className={styles.purchaseLabel}>Número de WhatsApp:</label>
                <input 
                    type="tel" 
                    id="buyerWhatsApp"
                    className={`${styles.purchaseInput} ${styles.whatsappInputHighlighted}`}
                    value={buyerWhatsApp}
                    onChange={(e) => setBuyerWhatsApp(e.target.value)}
                    placeholder="Ej: +573001234567"
                />
            </div>
            <div className={styles.nameInputsRow}>
                <div className={styles.purchaseSection}>
                    <label htmlFor="buyerName" className={styles.purchaseLabel}>Nombre:</label>
                    <input 
                        type="text" 
                        id="buyerName"
                        className={styles.purchaseInput}
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="Tu nombre"
                    />
                </div>
                <div className={styles.purchaseSection}>
                    <label htmlFor="buyerLastName" className={styles.purchaseLabel}>Apellido:</label>
                    <input 
                        type="text" 
                        id="buyerLastName"
                        className={styles.purchaseInput}
                        value={buyerLastName}
                        onChange={(e) => setBuyerLastName(e.target.value)}
                        placeholder="Tu apellido"
                    />
                </div>
            </div>

            <div className={styles.purchaseSection}>
                <label htmlFor="manualNumberInput" className={styles.purchaseLabel}>
                    Ingrese un número ({raffle.ticketDigits} dígitos):
                </label>
                <div className={styles.inputGroup}>
                    <input 
                        type="text" 
                        id="manualNumberInput"
                        className={styles.purchaseInput}
                        value={manualNumber}
                        onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, ''); 
                            if (val.length <= raffle.ticketDigits) {
                                setManualNumber(val);
                            }
                            if (setNumberInputMessage) setNumberInputMessage({ text: '', type: '' });
                        }}
                        placeholder={`Número de ${raffle.ticketDigits} dígitos`}
                        maxLength={raffle.ticketDigits} 
                    />
                    <button className={styles.addNumberButton} onClick={handleAddManualNumber} title="Añadir número">
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
                {numberInputMessage && numberInputMessage.text && (
                    <p className={`${styles.inputMessage} ${numberInputMessage.type === 'error' ? styles.errorMessage : styles.successMessage}`}>
                        {numberInputMessage.text}
                    </p>
                )}
            </div>

            <div className={styles.purchaseSection}>
                <label htmlFor="randomQuantityInput" className={styles.purchaseLabel}>Prueba suerte (números de {raffle.ticketDigits} dígitos):</label>
                <div className={styles.inputGroup}>
                    <input 
                        type="number" 
                        id="randomQuantityInput"
                        className={styles.purchaseInput} 
                        value={randomQuantity}
                        onChange={(e) => setRandomQuantity(e.target.value)}
                        placeholder="Cantidad de boletas"
                        min="1"
                    />
                    <button className={styles.addNumberButton} onClick={handleGenerateRandomNumbers} title="Generar números aleatorios">
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
            </div>

            {/* --- MEJORA: NUEVO INPUT PARA OBSEQUIOS --- */}
            <div className={styles.purchaseSection}>
                <label htmlFor="giftQuantityInput" className={styles.purchaseLabel}>Obsequio (Ingrese cuantos números gratuitos desea asignar):</label>
                <div className={styles.inputGroup}>
                    <input 
                        type="number" 
                        id="giftQuantityInput"
                        className={styles.purchaseInput} 
                        value={giftQuantity}
                        onChange={(e) => setGiftQuantity(e.target.value)}
                        placeholder="Cantidad de obsequios"
                        min="1"
                    />
                    <button className={styles.addNumberButton} onClick={handleGenerateGiftNumbers} title="Generar números de obsequio">
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
            </div>

            { (selectedNumbers.length > 0 || giftNumbers.length > 0) && (
                <div className={styles.selectedNumbersSection}>
                    <h4>Números Seleccionados ({raffle.ticketDigits} dígitos):</h4>
                    <div className={styles.selectedNumbersList}>
                        {/* Números comprados */}
                        {selectedNumbers.map(num => (
                            <div key={num} className={styles.selectedNumberItem}>
                                <span className={styles.selectedNumberTag}>{num}</span> 
                                <button onClick={() => removeSelectedNumber(num)} className={styles.removeNumberButton} title="Eliminar número">
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
                            </div>
                        ))}
                        {/* --- MEJORA: NÚMEROS DE OBSEQUIO CON ESTILO DIFERENTE --- */}
                        {giftNumbers.map(num => (
                            <div key={num} className={styles.selectedNumberItem}>
                                <span className={`${styles.selectedNumberTag} ${styles.giftNumberTag}`}>{num}</span> 
                                <button onClick={() => removeGiftNumber(num)} className={styles.removeNumberButton} title="Eliminar número de obsequio">
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className={styles.totalPriceSection}>
                        <p>Total a pagar: <span className={styles.totalPriceValue}>${totalPrice.toLocaleString()} {raffle.currency}</span></p>
                        <div className={styles.actionButtonsContainer}> 
                            <button className={`${styles.actionButton} ${styles.addToCartButton}`} onClick={handleAddToCart}> 
                                <FontAwesomeIcon icon={faCreditCard} /> Añadir al carrito
                            </button>
                            <button className={`${styles.actionButton} ${styles.cancelButton}`} onClick={handleCancelPurchase}> 
                                <FontAwesomeIcon icon={faTimes} /> Cancelar Compra
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {selectedNumbers.length === 0 && giftNumbers.length === 0 && (
                 <div className={styles.totalPriceSection}> 
                    <p>Seleccione o genere números de {raffle.ticketDigits} dígitos para añadirlos al carrito.</p> 
                </div>
            )}
        </div>
    );
};

export default RafflePurchaseForm;
