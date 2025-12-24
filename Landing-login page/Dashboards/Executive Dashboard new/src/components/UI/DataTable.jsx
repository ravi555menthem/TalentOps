import React from 'react';
import { MoreHorizontal, ArrowUpDown, Search } from 'lucide-react';

const DataTable = ({ columns, data, title, onAction }) => {
    return (
        <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-sm)',
            padding: 'var(--spacing-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-md)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{title}</h3>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button
                        onClick={() => onAction('Search')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}
                    >
                        <Search size={16} /> Search
                    </button>

                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {columns.map((col, index) => (
                                <th key={index} style={{
                                    textAlign: 'left',
                                    padding: '12px 16px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {col.header}
                                        <ArrowUpDown size={12} />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} style={{ padding: '16px', fontSize: '0.9rem' }}>
                                        {col.render ? col.render(row) : row[col.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--spacing-sm)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <span>Showing {data.length} results</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button disabled style={{ padding: '4px 8px', opacity: 0.5 }}>Previous</button>
                    <button style={{ padding: '4px 8px', color: 'var(--accent)', fontWeight: 600 }}>Next</button>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
