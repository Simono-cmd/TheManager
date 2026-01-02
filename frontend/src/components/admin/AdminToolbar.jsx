import React from 'react';

const AdminToolbar = ({ title, onAdd }) => {
    return (
        <div className="admin-header-row">
            <h2 className="admin-title">{title}</h2>

            <div className="admin-toolbar">
                <button className="admin-btn btn-add" onClick={onAdd}>
                    + Add
                </button>
            </div>
        </div>
    );
};

export default AdminToolbar;