// src/components/admin/AdminTable.jsx
import React from 'react';

const AdminTable = ({ columns, data, actions }) => {
    if (!data || data.length === 0) {
        return <div style={{padding: '20px', textAlign: 'center', color: '#777'}}>Brak danych do wyświetlenia.</div>;
    }

    return (
        <div className="admin-table-wrapper">
            <table className="admin-table">
                <thead>
                <tr>
                    {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                    ))}
                    <th style={{width: '200px'}}>Akcje</th>
                </tr>
                </thead>
                <tbody>
                {data.map((row) => (
                    <tr key={row.id}>
                        {columns.map((col) => (
                            <td key={`${row.id}-${col.key}`}>
                                {/* Obsługa renderowania niestandardowego (np. format daty) lub zwykłego tekstu */}
                                {col.render ? col.render(row) : row[col.key]}
                            </td>
                        ))}
                        <td>
                            <button className="action-btn btn-details" onClick={() => actions.onDetails(row)}>Info</button>
                            <button className="action-btn btn-edit" onClick={() => actions.onEdit(row)}>Edytuj</button>
                            <button className="action-btn btn-delete" onClick={() => actions.onDelete(row)}>Usuń</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminTable;