const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

class RentalAgreementGenerator {
  constructor() {
    this.contractsDir = path.join(__dirname, '../contracts');

    // Create contracts directory if it doesn't exist
    if (!fs.existsSync(this.contractsDir)) {
      fs.mkdirSync(this.contractsDir, { recursive: true });
    }
  }

  /**
   * Generate rental agreement PDF
   * @param {Object} rentalData - Rental agreement data
   * @param {Object} tenantData - Tenant data
   * @param {Object} buildingData - Building data
   * @param {Object} flatData - Flat data
   * @returns {Promise<string>} - Path to generated PDF
   */
  async generateRentalAgreement(rentalData, tenantData, buildingData, flatData) {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `${rentalData.contract_number}.pdf`;
        const filePath = path.join(this.contractsDir, fileName);

        // Create PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        // Pipe to file
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Add content
        this._addHeader(doc);
        this._addTitle(doc);
        this._addContractDetails(doc, rentalData);
        this._addPartyDetails(doc, tenantData, buildingData, flatData);
        this._addTermsAndConditions(doc, rentalData);
        this._addPaymentDetails(doc, rentalData);
        this._addSignatures(doc, rentalData);
        this._addFooter(doc);

        // Finalize PDF
        doc.end();

        writeStream.on('finish', () => {
          resolve(`/contracts/${fileName}`);
        });

        writeStream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  _addHeader(doc) {
    // Company/App Header
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('FLAT MANAGEMENT SYSTEM', 50, 50)
      .fontSize(10)
      .font('Helvetica')
      .text('Property Management Services', 50, 80)
      .text('Email: info@flatmanagement.com', 50, 95)
      .text('Phone: +968 1234 5678', 50, 110);

    // Add logo placeholder
    doc
      .fontSize(40)
      .fillColor('#2c3e50')
      .text('FM', 500, 50)
      .fillColor('#000000');

    // Line separator
    doc
      .moveTo(50, 130)
      .lineTo(560, 130)
      .strokeColor('#2c3e50')
      .lineWidth(2)
      .stroke();
  }

  _addTitle(doc) {
    doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .fillColor('#2c3e50')
      .text('RENTAL AGREEMENT', 50, 150, { align: 'center', width: 510 })
      .fillColor('#000000');
  }

  _addContractDetails(doc, rentalData) {
    const col1X = 50;
    const col2X = 350;
    let currentY = 190;

    // Contract details box
    doc
      .roundedRect(50, currentY, 510, 80, 5)
      .strokeColor('#2c3e50')
      .lineWidth(1)
      .stroke();

    currentY += 15;

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Contract Number:', col1X + 10, currentY)
      .font('Helvetica')
      .text(rentalData.contract_number, col1X + 130, currentY);

    doc
      .font('Helvetica-Bold')
      .text('Contract Date:', col2X, currentY)
      .font('Helvetica')
      .text(moment(rentalData.created_at).format('DD MMM YYYY'), col2X + 100, currentY);

    currentY += 20;

    doc
      .font('Helvetica-Bold')
      .text('Start Date:', col1X + 10, currentY)
      .font('Helvetica')
      .text(moment(rentalData.start_date).format('DD MMM YYYY'), col1X + 130, currentY);

    doc
      .font('Helvetica-Bold')
      .text('End Date:', col2X, currentY)
      .font('Helvetica')
      .text(moment(rentalData.end_date).format('DD MMM YYYY'), col2X + 100, currentY);

    currentY += 20;

    doc
      .font('Helvetica-Bold')
      .text('Duration:', col1X + 10, currentY)
      .font('Helvetica')
      .text(`${rentalData.duration_value} ${rentalData.duration_unit}`, col1X + 130, currentY);

    doc
      .font('Helvetica-Bold')
      .text('Status:', col2X, currentY)
      .font('Helvetica')
      .fillColor(rentalData.is_active ? '#28a745' : '#dc3545')
      .text(rentalData.is_active ? 'ACTIVE' : 'INACTIVE', col2X + 100, currentY)
      .fillColor('#000000');
  }

  _addPartyDetails(doc, tenantData, buildingData, flatData) {
    let currentY = 290;

    // LANDLORD section
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#2c3e50')
      .text('1. LANDLORD (First Party)', 50, currentY)
      .fillColor('#000000');

    currentY += 25;

    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Flat Management System', 70, currentY)
      .text('Property Management Services', 70, currentY + 15)
      .text('Email: info@flatmanagement.com', 70, currentY + 30)
      .text('Phone: +968 1234 5678', 70, currentY + 45);

    currentY += 80;

    // TENANT section
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#2c3e50')
      .text('2. TENANT (Second Party)', 50, currentY)
      .fillColor('#000000');

    currentY += 25;

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Name: ${tenantData.name}`, 70, currentY)
      .text(`ID Number: ${tenantData.id_number}`, 70, currentY + 15)
      .text(`Nationality: ${tenantData.nationality || 'N/A'}`, 70, currentY + 30)
      .text(`Contact: ${tenantData.country_code || ''} ${tenantData.contact_number || 'N/A'}`, 70, currentY + 45);

    currentY += 80;

    // PROPERTY section
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#2c3e50')
      .text('3. PROPERTY DETAILS', 50, currentY)
      .fillColor('#000000');

    currentY += 25;

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Building: ${buildingData.name}`, 70, currentY)
      .text(`Flat Number: ${flatData.flat_number}`, 70, currentY + 15)
      .text(`Floor: ${flatData.floor_number || 'N/A'}`, 70, currentY + 30);

    if (buildingData.address) {
      doc.text(`Address: ${buildingData.address}`, 70, currentY + 45, { width: 480 });
    }
  }

  _addTermsAndConditions(doc, rentalData) {
    doc.addPage();
    let currentY = 50;

    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#2c3e50')
      .text('TERMS AND CONDITIONS', 50, currentY, { align: 'center', width: 510 })
      .fillColor('#000000');

    currentY += 35;

    const terms = [
      {
        title: 'Rental Period',
        content: `This agreement is valid from ${moment(rentalData.start_date).format('DD MMM YYYY')} to ${moment(rentalData.end_date).format('DD MMM YYYY')}, for a duration of ${rentalData.duration_value} ${rentalData.duration_unit}.`
      },
      {
        title: 'Rent Payment',
        content: `The tenant agrees to pay ${this._formatCurrency(rentalData.rental_amount)} per ${rentalData.rental_period} as rental payment. Payment shall be made on or before the due date specified in the payment schedule.`
      },
      {
        title: 'Security Deposit',
        content: `A security deposit of ${this._formatCurrency(rentalData.security_deposit || 0)} has been paid by the tenant, which will be refunded upon satisfactory completion of the tenancy period and property handover.`
      },
      {
        title: 'Advance Payment',
        content: `An advance payment of ${this._formatCurrency(rentalData.advance_amount || 0)} has been received from the tenant.`
      },
      {
        title: 'Property Maintenance',
        content: 'The tenant shall maintain the property in good condition and shall be responsible for any damages caused during the tenancy period, excluding normal wear and tear.'
      },
      {
        title: 'Utilities',
        content: 'The tenant shall be responsible for all utility bills including electricity, water, internet, and other services consumed during the tenancy period.'
      },
      {
        title: 'Subletting',
        content: 'The tenant shall not sublet the property or any part thereof without prior written consent from the landlord.'
      },
      {
        title: 'Termination',
        content: 'Either party may terminate this agreement by providing 30 days written notice. Early termination by the tenant may result in forfeiture of advance payments and security deposit as per applicable laws.'
      },
      {
        title: 'Late Payment',
        content: 'Late payment of rent beyond the due date may incur a late fee. The tenant must ensure timely payment to avoid penalties.'
      },
      {
        title: 'Inspection',
        content: 'The landlord reserves the right to inspect the property with prior notice to the tenant.'
      }
    ];

    doc.fontSize(10).font('Helvetica');

    terms.forEach((term, index) => {
      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      doc
        .font('Helvetica-Bold')
        .text(`${index + 1}. ${term.title}`, 50, currentY);

      currentY += 15;

      doc
        .font('Helvetica')
        .text(term.content, 70, currentY, { width: 480, align: 'justify' });

      currentY += doc.heightOfString(term.content, { width: 480 }) + 15;
    });
  }

  _addPaymentDetails(doc, rentalData) {
    doc.addPage();
    let currentY = 50;

    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#2c3e50')
      .text('PAYMENT SUMMARY', 50, currentY, { align: 'center', width: 510 })
      .fillColor('#000000');

    currentY += 35;

    // Payment details box
    doc
      .roundedRect(50, currentY, 510, 200, 5)
      .strokeColor('#2c3e50')
      .lineWidth(1)
      .stroke();

    currentY += 20;

    const payments = [
      { label: 'Rental Amount per ' + rentalData.rental_period, value: rentalData.rental_amount },
      { label: 'Duration', value: `${rentalData.duration_value} ${rentalData.duration_unit}` },
      { label: 'Total Rent Amount', value: rentalData.rental_amount * rentalData.duration_value },
      { label: 'Advance Payment', value: rentalData.advance_amount || 0 },
      { label: 'Security Deposit', value: rentalData.security_deposit || 0 }
    ];

    doc.fontSize(11).font('Helvetica');

    payments.forEach((payment) => {
      doc
        .font('Helvetica-Bold')
        .text(payment.label + ':', 70, currentY)
        .font('Helvetica')
        .text(
          typeof payment.value === 'number' ? this._formatCurrency(payment.value) : payment.value,
          380,
          currentY
        );

      currentY += 25;
    });

    currentY += 10;

    // Total
    doc
      .rect(50, currentY, 510, 30)
      .fillColor('#2c3e50')
      .fill();

    doc
      .fontSize(12)
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .text('TOTAL AMOUNT DUE:', 70, currentY + 8)
      .text(this._formatCurrency(rentalData.total_amount_due || 0), 380, currentY + 8)
      .fillColor('#000000');

    currentY += 50;

    // Payment note
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666666')
      .text(
        'Note: Payment schedule has been auto-generated and will be provided separately. Please ensure timely payments as per the schedule.',
        50,
        currentY,
        { width: 510, align: 'justify' }
      )
      .fillColor('#000000');
  }

  _addSignatures(doc, rentalData) {
    let currentY = doc.y + 60;

    // Check if we need a new page
    if (currentY > 650) {
      doc.addPage();
      currentY = 50;
    }

    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#2c3e50')
      .text('SIGNATURES', 50, currentY, { align: 'center', width: 510 })
      .fillColor('#000000');

    currentY += 40;

    // Landlord signature
    doc
      .fontSize(10)
      .font('Helvetica')
      .text('LANDLORD (First Party)', 70, currentY);

    doc
      .moveTo(70, currentY + 50)
      .lineTo(250, currentY + 50)
      .strokeColor('#000000')
      .lineWidth(1)
      .stroke();

    doc
      .fontSize(9)
      .text('Signature', 70, currentY + 55)
      .text('Date: _______________', 70, currentY + 70);

    // Tenant signature
    doc
      .fontSize(10)
      .font('Helvetica')
      .text('TENANT (Second Party)', 350, currentY);

    doc
      .moveTo(350, currentY + 50)
      .lineTo(530, currentY + 50)
      .strokeColor('#000000')
      .lineWidth(1)
      .stroke();

    doc
      .fontSize(9)
      .text('Signature', 350, currentY + 55)
      .text('Date: _______________', 350, currentY + 70);
  }

  _addFooter(doc) {
    const pageCount = doc.bufferedPageRange().count;

    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);

      const pageHeight = 842; // A4 height in points

      // Footer line
      doc
        .moveTo(50, pageHeight - 80)
        .lineTo(560, pageHeight - 80)
        .strokeColor('#e0e0e0')
        .lineWidth(1)
        .stroke();

      // Footer text
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#666666')
        .text(
          'This is a computer-generated rental agreement and is valid without signature.',
          50,
          pageHeight - 65,
          { align: 'center', width: 510 }
        )
        .text(
          `Document generated on ${moment().format('DD MMM YYYY, HH:mm')} | Page ${i + 1} of ${pageCount}`,
          50,
          pageHeight - 50,
          { align: 'center', width: 510 }
        )
        .fillColor('#000000');
    }
  }

  _formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  /**
   * Get rental agreement file path
   */
  getContractPath(contractNumber) {
    return path.join(this.contractsDir, `${contractNumber}.pdf`);
  }

  /**
   * Check if rental agreement PDF exists
   */
  contractExists(contractNumber) {
    const filePath = this.getContractPath(contractNumber);
    return fs.existsSync(filePath);
  }
}

module.exports = new RentalAgreementGenerator();
