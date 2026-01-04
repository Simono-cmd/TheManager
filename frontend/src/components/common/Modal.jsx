import React from 'react';
import '../../assets/styles/modal-style.css'
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}> {/* if we click outside of modal close the modal */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* only click what's on modal not underneath */}
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {children} {/* insert content in modal */}
                </div>
            </div>
        </div>
    );
};

export default Modal;