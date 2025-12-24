import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import './PayslipPreview.css';

// Helper function to convert number to words (Indian numbering system)
const numberToWords = (num) => {
    if (num === 0) return 'Zero';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertHundreds = (n) => {
        let str = '';
        if (n > 99) {
            str += ones[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n > 19) {
            str += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        } else if (n >= 10) {
            str += teens[n - 10] + ' ';
            return str;
        }
        if (n > 0) {
            str += ones[n] + ' ';
        }
        return str;
    };

    let word = '';
    const crore = Math.floor(num / 10000000);
    if (crore > 0) {
        word += convertHundreds(crore) + 'Crore ';
        num %= 10000000;
    }

    const lakh = Math.floor(num / 100000);
    if (lakh > 0) {
        word += convertHundreds(lakh) + 'Lakh ';
        num %= 100000;
    }

    const thousand = Math.floor(num / 1000);
    if (thousand > 0) {
        word += convertHundreds(thousand) + 'Thousand ';
        num %= 1000;
    }

    if (num > 0) {
        word += convertHundreds(num);
    }

    return word.trim() + ' Rupees only';
};

const PayslipPreview = ({ payslipData, companySettings, onBack, onSave, loading }) => {
    const totalEarnings = payslipData.basicSalary + payslipData.hra + payslipData.allowances;
    const totalDeductions = payslipData.deductions + (payslipData.lopAmount || 0);
    const netSalary = payslipData.netSalary;

    return (
        <div className="payslip-preview-overlay">
            <div className="payslip-preview-container">
                <div className="preview-header">
                    <button className="btn btn-secondary" onClick={onBack} disabled={loading}>
                        <ArrowLeft size={18} />
                        Back
                    </button>
                    <h2>Payslip Preview</h2>
                    <button className="btn btn-primary" onClick={onSave} disabled={loading}>
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Payslip'}
                    </button>
                </div>

                <div className="payslip-document-simple" style={{
                    padding: '40px',
                    backgroundColor: 'white',
                    maxWidth: '900px',
                    margin: '0 auto',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    {/* Company Header - Logo on left, info on right */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '20px',
                        marginBottom: '25px'
                    }}>
                        {companySettings?.logo_url && (
                            <div style={{ flexShrink: 0 }}>
                                <img
                                    src={companySettings.logo_url}
                                    alt="Company Logo"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                        )}
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                                {companySettings?.company_name || 'Talent Ops'}
                            </h1>
                            {companySettings?.company_address && (
                                <p style={{ fontSize: '11px', margin: '6px 0', color: '#333', lineHeight: '1.5' }}>
                                    {companySettings.company_address}
                                </p>
                            )}
                            {(companySettings?.company_email || companySettings?.company_phone) && (
                                <p style={{ fontSize: '11px', margin: '6px 0', color: '#333' }}>
                                    {[companySettings.company_email, companySettings.company_phone]
                                        .filter(Boolean)
                                        .join('    ')}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>
                            Pay slip for the month of {payslipData.month}
                        </h2>
                    </div>

                    {/* Employee Details Table */}
                    <table style={{
                        width: '100%',
                        border: '1px solid #000',
                        borderCollapse: 'collapse',
                        marginBottom: '20px',
                        fontSize: '11px'
                    }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #000', width: '25%' }}>Employee Code</td>
                                <td style={{ padding: '8px', border: '1px solid #000', width: '25%' }}>: {payslipData.payslipNumber}</td>
                                <td style={{ padding: '8px', border: '1px solid #000', width: '25%' }}>Company:</td>
                                <td style={{ padding: '8px', border: '1px solid #000', width: '25%' }}>{companySettings?.company_name || 'Talent Ops'}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>Base Location</td>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>: {payslipData.employeeLocation || 'N/A'}</td>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>Email:</td>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>{payslipData.employeeEmail}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>Date of Joining</td>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>: N/A</td>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>Employee Name:</td>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>{payslipData.employeeName}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>Leaves</td>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>: {payslipData.leaveDays}</td>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>Designation:</td>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>{payslipData.employeeRole}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Earnings/Deductions Table */}
                    <table style={{
                        width: '100%',
                        border: '1px solid #000',
                        borderCollapse: 'collapse',
                        marginBottom: '20px',
                        fontSize: '11px'
                    }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'left', fontWeight: 'bold' }} colSpan="2">Earnings</th>
                                <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'left', fontWeight: 'bold' }} colSpan="2">Deductions</th>
                            </tr>
                            <tr>
                                <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'left', fontWeight: 'bold' }}>Particulars</th>
                                <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', fontWeight: 'bold' }}>Rate / Month (₹)</th>
                                <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'left', fontWeight: 'bold' }}>Particulars</th>
                                <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', fontWeight: 'bold' }}>Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>Basic Salary</td>
                                <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right' }}>{payslipData.basicSalary.toLocaleString('en-IN')}</td>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>Professional Tax</td>
                                <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right' }}>0</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>House Rent Allowance (HRA)</td>
                                <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right' }}>{payslipData.hra.toLocaleString('en-IN')}</td>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>LOP</td>
                                <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right' }}>{(payslipData.lopAmount || 0).toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>Allowances</td>
                                <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right' }}>{payslipData.allowances.toLocaleString('en-IN')}</td>
                                <td style={{ padding: '8px', border: '1px solid #000' }}></td>
                                <td style={{ padding: '8px', border: '1px solid #000' }}></td>
                            </tr>
                            <tr style={{ fontWeight: 'bold' }}>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>Total Earnings</td>
                                <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right' }}>{totalEarnings.toLocaleString('en-IN')}</td>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>Total Deductions</td>
                                <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right' }}>{totalDeductions.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr style={{ fontWeight: 'bold', fontSize: '12px' }}>
                                <td style={{ padding: '8px', border: '1px solid #000' }}>Net Salary:</td>
                                <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right' }}>₹ {netSalary.toLocaleString('en-IN')}</td>
                                <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right' }} colSpan="2">₹ {netSalary.toLocaleString('en-IN')}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* In Words */}
                    <div style={{
                        marginBottom: '15px',
                        marginTop: '15px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #000',
                        fontSize: '11px'
                    }}>
                        In words: {numberToWords(Math.floor(netSalary))}
                    </div>

                    {/* Footer */}
                    <div style={{
                        textAlign: 'center',
                        marginTop: '30px',
                        fontSize: '10px',
                        fontStyle: 'italic',
                        color: '#666'
                    }}>
                        <p style={{ margin: '8px 0' }}>This is a computer-generated payslip and does not require a signature.</p>
                        <p style={{ margin: '8px 0' }}>Generated on: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayslipPreview;
