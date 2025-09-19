import React from 'react';
import '../styles/confirmModal.css';

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p>{message}</p>
                <div className="modal-buttons">
                    <button onClick={onConfirm} className="confirm-button">Sim</button>
                    <button onClick={onCancel} className="cancel-button">Não</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;