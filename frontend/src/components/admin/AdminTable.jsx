import React from 'react';

const AdminTable = ({ columns, data, actions }) => {
    if (!data || data.length === 0) {
        return <div style={{padding: '20px', textAlign: 'center', color: '#686868'}}>No data to show</div>;
    }

    return (
        <div className="admin-table-wrapper">
            <table className="admin-table">
                <thead>
                <tr>
                    {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                    ))}
                    <th style={{width: '200px'}}>Actions</th>
                </tr>
                </thead>
                <tbody>
                {data.map((row) => (
                    <tr key={row.id}>
                        {columns.map((col) => (
                            <td key={`${row.id}-${col.key}`}>
                                {col.render ? col.render(row) : row[col.key]}
                            </td>
                        ))}
                        <td>
                            <button className="action-btn btn-details" onClick={() => actions.onDetails(row)}>Details</button>
                            <button className="action-btn btn-edit" onClick={() => actions.onEdit(row)}>Edit</button>
                            <button className="action-btn btn-delete" onClick={() => actions.onDelete(row)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminTable;