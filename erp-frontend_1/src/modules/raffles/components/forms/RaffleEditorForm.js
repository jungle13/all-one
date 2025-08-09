// raffle-frontend/src/components/forms/RaffleEditorForm.js
import React, { useState, useEffect, useMemo, useRef } from 'react';
import styles from '../../pages/ManageRafflesPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTimes, faPlusSquare, faEdit, faSave } from '@fortawesome/free-solid-svg-icons';


const generateDefaultExclusions = (digits, count) => {
    if (count <= 0 || !digits) return [];
    const universe = Math.pow(10, digits);
    const autoNumbers = [];
    for (let i = 0; i < count; i++) {
        const numToExclude = universe - 1 - i;
        autoNumbers.push(String(numToExclude).padStart(digits, '0'));
    }
    return autoNumbers;
};


const RaffleEditorForm = ({
    isEditing,
    raffleToEdit,
    onFormSubmit,
    onCancel,
    formError,
    uniqueSponsors,
    setShowSponsorModal
}) => {
    // --- ESTADO INTERNO DEL FORMULARIO ---
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [prizeCost, setPrizeCost] = useState(''); // <-- NUEVO ESTADO
    const [currency, setCurrency] = useState('COP');
    const [endDate, setEndDate] = useState('');
    const [dijitsPerNumber, setDijitsPerNumber] = useState('3');
    const [status, setStatus] = useState('active');
    
    // <-- Nuevos estados para la lógica de paquetes
    const [numbersPerTicket, setNumbersPerTicket] = useState(1);
    const [excludedNumbersStr, setExcludedNumbersStr] = useState('');

    // --- ESTADO PARA FUNCIONALIDADES EXISTENTES ---
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSponsored, setIsSponsored] = useState(false);
    const [selectedSponsorId, setSelectedSponsorId] = useState('');
    const [isDraggingOverRaffle, setIsDraggingOverRaffle] = useState(false);
    const raffleFileInputRef = useRef(null);

    // --- NUEVA LÓGICA DE ESTADO PARA LOS TAGS ---
    const [excludedNumbers, setExcludedNumbers] = useState([]); // Array para los tags
    const [currentInput, setCurrentInput] = useState(''); // El valor que se está escribiendo
    const [isAutoPopulated, setIsAutoPopulated] = useState(false); // Para controlar la población automática
    const tagInputRef = useRef(null);
    const [userHasEditedTags, setUserHasEditedTags] = useState(false);

    const hasSoldTickets = isEditing && raffleToEdit?.statistics?.tickets_sold > 0;

    // --- EFECTO PARA POBLAR EL FORMULARIO EN MODO EDICIÓN ---
    useEffect(() => {
        if (isEditing && raffleToEdit) {
            setName(raffleToEdit.name || '');
            setDescription(raffleToEdit.description || '');
            setPrice(raffleToEdit.price?.toString() || '');
            setPrizeCost(raffleToEdit.prize_cost?.toString() || ''); // <-- SE AÑADE prize_cost
            setEndDate(raffleToEdit.end_date ? new Date(raffleToEdit.end_date).toISOString().split('T')[0] : '');
            setDijitsPerNumber(raffleToEdit.dijits_per_number?.toString() || '3');
            setStatus(raffleToEdit.status || 'active');
            setImagePreview(raffleToEdit.image_url || null);
            setNumbersPerTicket(raffleToEdit.numbers_per_ticket || 1);
            setExcludedNumbers(raffleToEdit.excluded_numbers || []); // Carga los números excluidos existentes
            setUserHasEditedTags(false);
        } else {
            // Resetea a valores por defecto para un formulario nuevo
            setName(''); setDescription(''); setPrice(''); setEndDate('');
            setDijitsPerNumber('3'); setStatus('active'); setImagePreview(null);
            setNumbersPerTicket(1); setExcludedNumbersStr(''); setIsSponsored(false);
            setSelectedSponsorId('');
        }
    }, [isEditing, raffleToEdit]);

    // <-- CÁLCULO AUTOMÁTICO DE NÚMEROS A EXCLUIR ---
    const requiredExclusions = useMemo(() => {
        const digits = parseInt(dijitsPerNumber, 10);
        const numPerTicket = parseInt(numbersPerTicket, 10);
        if (digits > 0 && numPerTicket > 1) {
            const universe = Math.pow(10, digits);
            return universe % numPerTicket;
        }
        return 0;
    }, [dijitsPerNumber, numbersPerTicket]);

    // ===================================================================================
    // === INICIO DE LA LÓGICA DE TAGS CORREGIDA PARA CREACIÓN Y EDICIÓN ===
    // ===================================================================================
    useEffect(() => {
        // Si el usuario ya interactuó con los tags, no hacemos nada automático.
        if (userHasEditedTags) {
            return;
        }

        const formDigitsNum = parseInt(dijitsPerNumber, 10);

        // --- MODO EDICIÓN ---
        if (isEditing && raffleToEdit) {
            const dbDigits = raffleToEdit.dijits_per_number?.toString();

            // Si los dígitos cambian, se regenera desde cero.
            if (dbDigits !== dijitsPerNumber.toString()) {
                setExcludedNumbers(generateDefaultExclusions(formDigitsNum, requiredExclusions));
            } else {
                // Si los dígitos son iguales, se usa la lógica de fusión/completado.
                const dbExcluded = raffleToEdit.excluded_numbers || [];
                if (requiredExclusions === 0) {
                    setExcludedNumbers([]);
                    return;
                }
                if (dbExcluded.length >= requiredExclusions) {
                    setExcludedNumbers(dbExcluded.slice(0, requiredExclusions));
                    return;
                }
                let finalNumbers = [...dbExcluded];
                const existingNumbersSet = new Set(finalNumbers);
                const numbersToGenerate = requiredExclusions - finalNumbers.length;
                if (numbersToGenerate > 0) {
                    const universe = Math.pow(10, formDigitsNum);
                    let count = 0;
                    for (let i = universe - 1; i >= 0 && count < numbersToGenerate; i--) {
                        const numStr = String(i).padStart(formDigitsNum, '0');
                        if (!existingNumbersSet.has(numStr)) {
                            finalNumbers.push(numStr);
                            count++;
                        }
                    }
                }
                setExcludedNumbers(finalNumbers);
            }
        } 
        // --- MODO CREACIÓN ---
        else if (!isEditing) {
            // Si es una rifa nueva, simplemente genera los excluidos por defecto si se necesitan.
            setExcludedNumbers(generateDefaultExclusions(formDigitsNum, requiredExclusions));
        }

    }, [isEditing, raffleToEdit, requiredExclusions, dijitsPerNumber, userHasEditedTags]);
    // ===================================================================================
    // === FIN DE LA LÓGICA DE TAGS ===
    // ===================================================================================
    



   // --- MANEJADORES DE INTERACCIÓN CON LOS TAGS ---
    const handleInputChange = (e) => {
        setUserHasEditedTags(true);
        const value = e.target.value.replace(/[^0-9]/g, '');
        const digits = parseInt(dijitsPerNumber, 10);
        setCurrentInput(value);

        if (value.length === digits) {
            if (excludedNumbers.length < requiredExclusions && !excludedNumbers.includes(value)) {
                setExcludedNumbers([...excludedNumbers, value]);
                setCurrentInput('');
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace' && currentInput === '' && excludedNumbers.length > 0) {
            setUserHasEditedTags(true);
            const newNumbers = [...excludedNumbers];
            newNumbers.pop();
            setExcludedNumbers(newNumbers);
        }
    };

    const handleRemoveTag = (indexToRemove) => {
        setUserHasEditedTags(true);
        setExcludedNumbers(excludedNumbers.filter((_, index) => index !== indexToRemove));
    };

        // --- MANEJO DEL ENVÍO DEL FORMULARIO (VERSIÓN AJUSTADA PARA TAGS) ---
    const handleSubmit = (e) => {
        e.preventDefault();

        let payload;

        if (hasSoldTickets) {
            // Esta parte no cambia. Si la rifa está bloqueada, solo enviamos la fecha.
            payload = {
                end_date: new Date(endDate).toISOString(),
                prize_cost: parseFloat(prizeCost) || 0,
            };
        } else {
            // --- LÓGICA SIMPLIFICADA ---

            // 1. Validar que la cantidad de tags sea la correcta.
            if (requiredExclusions > 0 && excludedNumbers.length !== requiredExclusions) {
                alert(`Error: Debes excluir exactamente ${requiredExclusions} números.`);
                return;
            }

            // 2. Construir el payload usando directamente el array de 'excludedNumbers'.
            //    Ya no es necesario procesar un string.
            payload = {
                name, description, status,
                end_date: new Date(endDate).toISOString(),
                price: parseFloat(price),
                prize_cost: parseFloat(prizeCost) || 0, // <-- SE AÑADE prize_cost
                dijits_per_number: parseInt(dijitsPerNumber, 10),
                numbers_per_ticket: parseInt(numbersPerTicket, 10) || 1,
                excluded_numbers: excludedNumbers, // <-- Se usa el estado de los tags directamente.
                image_url: imagePreview,
            };
        }

        console.log("[FRONTEND - RaffleEditorForm] Payload construido. A punto de enviarlo al componente padre:", payload);
        onFormSubmit(payload, imageFile);
    };
    
    const handleRaffleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    const triggerRaffleFileInput = () => raffleFileInputRef.current?.click();
    const handleRemoveRaffleImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if(raffleFileInputRef.current) raffleFileInputRef.current.value = '';
    };

    return (
        <form onSubmit={handleSubmit} className={styles.createForm}>
            {hasSoldTickets && (
                <div className={styles.formLockedMessage}>
                    <p>Esta rifa ya tiene tiquetes vendidos. Solo se puede modificar la fecha del sorteo.</p>
                </div>
            )}
            <div className={styles.formGroup}>
                <label htmlFor="raffleName">Nombre <span className={styles.requiredStar}>*</span></label>
                <input type="text" id="raffleName" value={name} onChange={(e) => setName(e.target.value)} required disabled={hasSoldTickets} />
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label>Dígitos <span className={styles.requiredStar}>*</span></label>
                    <select value={dijitsPerNumber} onChange={e => setDijitsPerNumber(e.target.value)} disabled={hasSoldTickets} required>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label>Números por Tiquete <span className={styles.requiredStar}>*</span></label>
                    <input type="number" value={numbersPerTicket} onChange={e => setNumbersPerTicket(e.target.value)} min="1" disabled={hasSoldTickets} required />
                </div>
            </div>

             
            {numbersPerTicket > 1 && requiredExclusions > 0 && (
                <div className={styles.formGroup}>
                    <label>Números Excluidos</label>
                    <p className={styles.formHelpText}>
                        <b>Cálculo automático:</b> Debes excluir <strong>{requiredExclusions}</strong> números.
                        Si el campo está vacío, se excluirán los últimos {requiredExclusions}.
                    </p>
                    <div className={styles.tagInputContainer} onClick={() => tagInputRef.current.focus()} role="textbox" tabIndex={0}>
                        {excludedNumbers.map((num, index) => (
                            <span key={index} className={styles.tag}>
                                {num}
                                <button type="button" onClick={() => handleRemoveTag(index)} className={styles.tagRemoveButton}>&times;</button>
                            </span>
                        ))}
                        <input
                            ref={tagInputRef}
                            type="text"
                            value={currentInput}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={excludedNumbers.length < requiredExclusions ? "Añadir..." : ""}
                            className={styles.tagInput}
                            disabled={hasSoldTickets || excludedNumbers.length >= requiredExclusions}
                            maxLength={dijitsPerNumber}
                        />
                    </div>
                </div>
            )}

            <div className={styles.formGroup}>
                <label htmlFor="raffleDescription">Descripción</label>
                <textarea id="raffleDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" disabled={hasSoldTickets}></textarea>
            </div>
            
            <div className={styles.formGroup}>
                <label>Imagen Rifa</label>
                 <div className={`${styles.dropzone} ${isDraggingOverRaffle ? styles.dropzoneActive : ''}`}
                    onClick={!imagePreview && !hasSoldTickets ? triggerRaffleFileInput : undefined}>
                    <input type="file" accept="image/*" ref={raffleFileInputRef} onChange={handleRaffleFileChange} style={{ display: 'none' }} disabled={hasSoldTickets} />
                    {(!imagePreview || imagePreview === '#') ? (
                        <div className={styles.dropzonePrompt} role="button">
                            <FontAwesomeIcon icon={faUpload} className={styles.uploadIcon} /><p>Arrastra o clic</p><span>(JPG, PNG)</span>
                        </div>
                    ) : (
                        <div className={styles.imagePreviewContainer}>
                            <img src={imagePreview} alt="Vista previa" className={styles.imagePreview} />
                            {!hasSoldTickets && <button type="button" onClick={handleRemoveRaffleImage} className={styles.removeImageButton}><FontAwesomeIcon icon={faTimes} /></button>}
                        </div>
                    )}
                </div>
            </div>

            {/* --- SECCIÓN DE PRECIOS MODIFICADA --- */}
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="rafflePrice">Precio del Tiquete <span className={styles.requiredStar}>*</span></label>
                    <input type="number" id="rafflePrice" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="any" disabled={hasSoldTickets}/>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="rafflePrizeCost">Costo del Premio (Opcional)</label>
                    {/* El campo de costo del premio es editable incluso si hay ventas */}
                    <input type="number" id="rafflePrizeCost" value={prizeCost} onChange={(e) => setPrizeCost(e.target.value)} min="0" step="any" />
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="raffleEndDate">Fecha Sorteo <span className={styles.requiredStar}>*</span></label>
                    <input type="date" id="raffleEndDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                    <label>Estado Inicial</label>
                    <div className={styles.toggleSwitchContainer}>
                        <input type="checkbox" id="statusToggle" className={styles.toggleSwitchCheckbox} checked={status === 'active'} onChange={() => setStatus(prev => prev === 'active' ? 'pending' : 'active')} disabled={hasSoldTickets} />
                        <label htmlFor="statusToggle" className={styles.toggleSwitchLabel}></label>
                        <span className={styles.toggleStatusText}>{status === 'active' ? 'Activa' : 'Pendiente'}</span>
                    </div>
                </div>
            </div>

            <div className={styles.sponsorshipSectionContainer}>
                <div className={styles.formGroupSponsorToggle}>
                    <label className={styles.sponsorshipLabel}>Patrocinada?</label>
                    <div className={styles.toggleSwitchContainer}>
                        <input type="checkbox" id="isSponsoredToggle" className={styles.toggleSwitchCheckbox} checked={isSponsored} onChange={() => setIsSponsored(!isSponsored)} disabled={hasSoldTickets} />
                        <label htmlFor="isSponsoredToggle" className={styles.toggleSwitchLabel}></label>
                        <span className={styles.toggleStatusText}>{isSponsored ? 'Sí' : 'No'}</span>
                    </div>
                </div>
                {isSponsored && (
                    <>
                        <div className={styles.formGroupSponsorSelect}>
                            <label htmlFor="sponsorSelect">Patrocinador</label>
                            <select id="sponsorSelect" value={selectedSponsorId} onChange={(e) => setSelectedSponsorId(e.target.value)} className={styles.sponsorSelectDropdown} disabled={hasSoldTickets}>
                                <option value="">-- Seleccionar --</option>
                                {uniqueSponsors.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                                <option value="crear_nuevo">+ Crear Nuevo</option>
                            </select>
                        </div>
                        <div className={styles.formGroupSponsorEdit}>
                            <button type="button" onClick={() => setShowSponsorModal(true)} className={styles.editSponsorButton} disabled={hasSoldTickets}>
                                <FontAwesomeIcon icon={selectedSponsorId === 'crear_nuevo' || !selectedSponsorId ? faPlusSquare : faEdit} /> 
                                {selectedSponsorId === 'crear_nuevo' || !selectedSponsorId ? 'Añadir' : 'Editar'}
                            </button>
                        </div>
                    </>
                )}
            </div>
            
            <div className={styles.formActionsContainer}>
                {formError && <p className={styles.formErrorMessage}>{formError}</p>}
                <button type="submit" className={styles.submitFormButton}>
                    <FontAwesomeIcon icon={faSave} /> {isEditing ? 'Guardar Cambios' : 'Crear Rifa'}
                </button>
                 <button type="button" onClick={onCancel} className={styles.cancelButton}>Cancelar</button>
            </div>
        </form>
    );
};

export default RaffleEditorForm;