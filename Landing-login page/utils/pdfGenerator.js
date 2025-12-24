import jsPDF from 'jspdf';
import { supabase } from '../lib/supabaseClient';

/**
 * Safe text wrapper to prevent jsPDF errors
 * Ensures all values are valid strings or numbers
 */
const safeText = (value, fallback = '') => {
    // Handle null/undefined
    if (value === null || value === undefined) {
        console.warn('safeText: null/undefined value, using fallback:', fallback);
        return String(fallback);
    }

    // Handle NaN
    if (typeof value === 'number' && isNaN(value)) {
        console.warn('safeText: NaN value, using fallback:', fallback);
        return String(fallback);
    }

    // Handle objects (shouldn't happen, but just in case)
    if (typeof value === 'object') {
        console.warn('safeText: object value, using fallback:', fallback, value);
        return String(fallback);
    }

    // Convert to string and trim
    const result = String(value).trim();

    // If empty string, use fallback
    if (result === '') {
        return String(fallback);
    }

    return result;
};

/**
 * Safe number wrapper to prevent NaN errors
 * Ensures all values are valid numbers, never NaN or non-numeric
 */
const safeNumber = (value, fallback = 0) => {
    // Handle null/undefined
    if (value === null || value === undefined) {
        return fallback;
    }

    // Convert to number
    const num = Number(value);

    // Handle NaN
    if (isNaN(num)) {
        console.warn('safeNumber: NaN value, using fallback:', fallback);
        return fallback;
    }

    // Handle Infinity
    if (!isFinite(num)) {
        console.warn('safeNumber: Infinity value, using fallback:', fallback);
        return fallback;
    }

    return num;
};

/**
 * Convert number to words (Indian numbering system)
 */
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

/**
 * Generate PDF from payslip data with traditional table format
 */
export const generatePayslipPDF = async (payslipData, companySettings) => {
    console.log('=== PDF Generation Started ===');
    console.log('Payslip Data:', payslipData);
    console.log('Company Settings:', companySettings);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const marginLeft = 15;
    const marginRight = 15;
    const contentWidth = pageWidth - marginLeft - marginRight;

    let yPos = 20;

    // Black text color for everything
    pdf.setTextColor(0, 0, 0);

    // ===== COMPANY HEADER WITH LOGO (if provided) =====
    const headerStartY = yPos;
    let logoWidth = 0;
    let logoX = marginLeft;

    if (companySettings?.logo_url) {
        try {
            // Logo dimensions
            logoWidth = 25;
            const logoHeight = 25;

            // Calculate total header width and center it
            const totalHeaderWidth = logoWidth + 10 + 120; // logo + gap + estimated text width
            const headerStartX = (pageWidth - totalHeaderWidth) / 2;
            logoX = headerStartX;

            pdf.addImage(companySettings.logo_url, 'PNG', logoX, yPos, logoWidth, logoHeight);
        } catch (error) {
            console.error('Error adding logo to PDF:', error);
            logoWidth = 0;
        }
    }

    // Company name and address position
    const textX = logoWidth > 0 ? logoX + logoWidth + 10 : pageWidth / 2;
    const textAlign = logoWidth > 0 ? 'left' : 'center';

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(safeText(companySettings?.company_name, 'Talent Ops'), textX, yPos + 5, { align: textAlign });
    yPos += 13;

    // Company address
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    if (companySettings?.company_address) {
        const addressLines = pdf.splitTextToSize(safeText(companySettings.company_address, ''), 120);
        addressLines.forEach(line => {
            pdf.text(line, textX, yPos, { align: textAlign });
            yPos += 4;
        });
    }

    // Contact info
    if (companySettings?.company_email || companySettings?.company_phone) {
        const contactParts = [];
        if (companySettings.company_email) contactParts.push(companySettings.company_email);
        if (companySettings.company_phone) contactParts.push(companySettings.company_phone);
        pdf.text(contactParts.join('    '), textX, yPos, { align: textAlign });
        yPos += 10;
    } else {
        yPos += 6;
    }

    // ===== TITLE =====
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Pay slip for the month of ${safeText(payslipData.month, 'N/A')}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // ===== EMPLOYEE DETAILS TABLE =====
    const tableStartY = yPos;
    const tableWidth = contentWidth;
    const col1Width = tableWidth / 2;
    const col2Width = tableWidth / 2;
    const rowHeight = 7;

    pdf.setLineWidth(0.3);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);

    // Draw outer border
    pdf.rect(marginLeft, tableStartY, tableWidth, rowHeight * 4);

    // Employee details data
    const leftDetails = [
        ['Employee Code', `PAY-${safeText(payslipData.payslipNumber, 'N/A').replace('PAY-', '')}`],
        ['Base Location', safeText(payslipData.employeeLocation, 'N/A')],
        ['Date of Joining', 'N/A'],
        ['Leaves', String(safeNumber(payslipData.leaveDays, 0))]
    ];

    const rightDetails = [
        ['Company:', safeText(companySettings?.company_name, 'Talent Ops')],
        ['Email:', safeText(payslipData.employeeEmail, 'N/A')],
        ['Employee Name:', safeText(payslipData.employeeName, 'N/A')],
        ['Designation:', safeText(payslipData.employeeRole, 'Employee')]
    ];

    // Draw employee details rows
    leftDetails.forEach((row, index) => {
        const currentY = tableStartY + (index * rowHeight);

        // Left column
        pdf.text(row[0], marginLeft + 2, currentY + 5);
        pdf.text(': ' + row[1], marginLeft + 30, currentY + 5);

        // Right column
        pdf.text(rightDetails[index][0], marginLeft + col1Width + 2, currentY + 5);
        pdf.text(rightDetails[index][1], marginLeft + col1Width + 30, currentY + 5);

        // Horizontal line
        if (index < 3) {
            pdf.line(marginLeft, currentY + rowHeight, marginLeft + tableWidth, currentY + rowHeight);
        }
    });

    // Vertical divider
    pdf.line(marginLeft + col1Width, tableStartY, marginLeft + col1Width, tableStartY + (rowHeight * 4));

    yPos = tableStartY + (rowHeight * 4) + 10;

    // ===== EARNINGS/DEDUCTIONS TABLE =====
    const earningsDeductionsY = yPos;

    // Table headers
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);

    // Draw outer border for two-column table
    pdf.rect(marginLeft, earningsDeductionsY, tableWidth, rowHeight);
    pdf.text('Earnings', marginLeft + 2, earningsDeductionsY + 5);
    pdf.text('Deductions', marginLeft + col1Width + 2, earningsDeductionsY + 5);

    // Vertical divider
    pdf.line(marginLeft + col1Width, earningsDeductionsY, marginLeft + col1Width, earningsDeductionsY + rowHeight);

    yPos = earningsDeductionsY + rowHeight;

    // Sub-headers
    pdf.rect(marginLeft, yPos, tableWidth, rowHeight);
    pdf.setFontSize(9);
    pdf.text('Particulars', marginLeft + 2, yPos + 5);
    pdf.text('Rate / Month (Rs.)', marginLeft + col1Width - 38, yPos + 5);
    pdf.text('Particulars', marginLeft + col1Width + 2, yPos + 5);
    pdf.text('Amount (Rs.)', marginLeft + tableWidth - 28, yPos + 5);
    pdf.line(marginLeft + col1Width, yPos, marginLeft + col1Width, yPos + rowHeight);

    yPos += rowHeight;

    pdf.setFont('helvetica', 'normal');

    // Earnings
    const earnings = [
        ['Basic Salary', safeNumber(payslipData.basicSalary, 0)],
        ['House Rent Allowance (HRA)', safeNumber(payslipData.hra, 0)],
        ['Allowances', safeNumber(payslipData.allowances, 0)]
    ];

    // Deductions
    const deductions = [
        ['Professional Tax', 0],
        ['LOP', safeNumber(payslipData.lopAmount, 0)]
    ];

    const maxRows = Math.max(earnings.length, deductions.length);

    for (let i = 0; i < maxRows; i++) {
        pdf.rect(marginLeft, yPos, tableWidth, rowHeight);

        // Earnings
        if (i < earnings.length) {
            pdf.text(earnings[i][0], marginLeft + 2, yPos + 5);
            pdf.text(earnings[i][1].toLocaleString('en-IN'), marginLeft + col1Width - 8, yPos + 5, { align: 'right' });
        }

        // Deductions
        if (i < deductions.length) {
            pdf.text(deductions[i][0], marginLeft + col1Width + 2, yPos + 5);
            pdf.text(deductions[i][1].toLocaleString('en-IN'), marginLeft + tableWidth - 8, yPos + 5, { align: 'right' });
        }

        pdf.line(marginLeft + col1Width, yPos, marginLeft + col1Width, yPos + rowHeight);
        yPos += rowHeight;
    }

    // Total Earnings / Total Deductions
    const totalEarnings = safeNumber(payslipData.basicSalary, 0) + safeNumber(payslipData.hra, 0) + safeNumber(payslipData.allowances, 0);
    const totalDeductions = safeNumber(payslipData.deductions, 0) + safeNumber(payslipData.lopAmount, 0);

    pdf.setFont('helvetica', 'bold');
    pdf.rect(marginLeft, yPos, tableWidth, rowHeight);
    pdf.text('Total Earnings', marginLeft + 2, yPos + 5);
    pdf.text(safeNumber(totalEarnings, 0).toLocaleString('en-IN'), marginLeft + col1Width - 8, yPos + 5, { align: 'right' });
    pdf.text('Total Deductions', marginLeft + col1Width + 2, yPos + 5);
    pdf.text(safeNumber(totalDeductions, 0).toLocaleString('en-IN'), marginLeft + tableWidth - 8, yPos + 5, { align: 'right' });
    pdf.line(marginLeft + col1Width, yPos, marginLeft + col1Width, yPos + rowHeight);

    yPos += rowHeight;

    // Net Salary
    const netSalary = safeNumber(payslipData.netSalary, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.rect(marginLeft, yPos, tableWidth, rowHeight);
    pdf.text('Net Salary:', marginLeft + 2, yPos + 5);
    const netSalaryText = 'Rs. ' + netSalary.toLocaleString('en-IN');
    pdf.text(netSalaryText, marginLeft + col1Width - 8, yPos + 5, { align: 'right' });
    pdf.text(netSalaryText, marginLeft + tableWidth - 8, yPos + 5, { align: 'right' });
    pdf.line(marginLeft + col1Width, yPos, marginLeft + col1Width, yPos + rowHeight);

    yPos += rowHeight + 8;

    // In words
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const inWords = `In words: ${numberToWords(Math.floor(netSalary))}`;
    pdf.text(inWords, marginLeft, yPos);

    // Draw line under "in words"
    yPos += 2;
    pdf.line(marginLeft, yPos, marginLeft + tableWidth, yPos);

    yPos += 10;

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('This is a computer-generated payslip and does not require a signature.', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;

    const generatedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    pdf.text(`Generated on: ${generatedDate}`, pageWidth / 2, yPos, { align: 'center' });

    return pdf;
};

/**
 * Upload PDF to Supabase storage
 * Uses upsert: false to prevent accidental overwrites
 * If duplicate detected, generates a new unique number with timestamp
 */
export const uploadPayslipPDF = async (pdf, payslipNumber, employeeId) => {
    const pdfBlob = pdf.output('blob');
    let fileName = `${employeeId}/${payslipNumber}.pdf`;

    console.log(`Uploading payslip to: ${fileName}`);

    // First attempt - use the generated payslip number
    let { data, error } = await supabase.storage
        .from('PAYSLIPS')
        .upload(fileName, pdfBlob, {
            contentType: 'application/pdf',
            upsert: false  // Do NOT overwrite existing files
        });

    // If duplicate detected, generate a unique number with timestamp
    if (error && error.message?.includes('already exists')) {
        console.warn('Duplicate file detected, generating unique number...');
        const timestamp = Date.now().toString().slice(-4);
        const uniquePayslipNumber = `${payslipNumber}-${timestamp}`;
        fileName = `${employeeId}/${uniquePayslipNumber}.pdf`;

        console.log(`Retrying with unique number: ${fileName}`);

        // Retry with unique number
        const retryResult = await supabase.storage
            .from('PAYSLIPS')
            .upload(fileName, pdfBlob, {
                contentType: 'application/pdf',
                upsert: false
            });

        data = retryResult.data;
        error = retryResult.error;
    }

    if (error) {
        console.error('Error uploading PDF:', error);
        throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('PAYSLIPS')
        .getPublicUrl(fileName);

    return urlData.publicUrl;
};
