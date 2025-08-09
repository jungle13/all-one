// raffle-frontend/src/components/forms/SponsorForm.js
import React from 'react';
import styles from '../../pages/ManageRafflesPage.module.css'; // Adjust path or use shared form styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTimes } from '@fortawesome/free-solid-svg-icons';

const SponsorForm = ({
    formSponsorName, setFormSponsorName,
    formSponsorDescription, setFormSponsorDescription,
    formSponsorImagePreview,
    // Image upload handlers for sponsor
    isDraggingOverSponsor, 
    handleSponsorDrop, 
    handleSponsorDragOver, 
    handleSponsorDragEnter, 
    handleSponsorDragLeave, 
    triggerSponsorFileInput, 
    sponsorFileInputRef, 
    handleSponsorFileChange, 
    handleRemoveSponsorImage,
    sponsorModalError // Error message string specifically for the sponsor modal form
}) => {
    return (
        <>
            {sponsorModalError && <p className={styles.formErrorMessage}>{sponsorModalError}</p>}
            <div className={styles.formGroup}>
                <label htmlFor="modalSponsorName">Nombre Patrocinador <span className={styles.requiredStar}>*</span></label>
                <input 
                    type="text" 
                    id="modalSponsorName" 
                    value={formSponsorName} 
                    onChange={(e) => setFormSponsorName(e.target.value)} 
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="modalSponsorDescription">Descripción Patrocinador</label>
                <textarea 
                    id="modalSponsorDescription" 
                    value={formSponsorDescription} 
                    onChange={(e) => setFormSponsorDescription(e.target.value)} 
                    rows="3"
                ></textarea>
            </div>
            <div className={styles.formGroup}>
                <label>Imagen Patrocinador</label>
                <div 
                    className={`${styles.dropzone} ${isDraggingOverSponsor ? styles.dropzoneActive : ''}`}
                    onClick={!formSponsorImagePreview ? triggerSponsorFileInput : undefined} 
                    onDrop={handleSponsorDrop} 
                    onDragOver={handleSponsorDragOver} 
                    onDragEnter={handleSponsorDragEnter} 
                    onDragLeave={handleSponsorDragLeave}
                >
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={sponsorFileInputRef} 
                        onChange={handleSponsorFileChange} 
                        style={{ display: 'none' }} 
                    />
                    {!formSponsorImagePreview ? (
                        <div className={styles.dropzonePrompt} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && triggerSponsorFileInput()}>
                            <FontAwesomeIcon icon={faUpload} className={styles.uploadIcon} /><p>Arrastra o clic</p><span>(JPG, PNG)</span>
                        </div>
                    ) : (
                        <div className={styles.imagePreviewContainer}>
                            <img src={formSponsorImagePreview} alt="Vista previa de patrocinador" className={styles.imagePreview} />
                            <button type="button" onClick={handleRemoveSponsorImage} className={styles.removeImageButton} title="Eliminar imagen de patrocinador">
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SponsorForm;
