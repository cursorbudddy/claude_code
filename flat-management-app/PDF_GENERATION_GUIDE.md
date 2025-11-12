# PDF Generation & Database Updates - Implementation Guide

## 📋 Overview

This document details the implementation of:
1. **Rental Agreement PDF Generation** - Automated PDF generation for rental contracts
2. **Database Update** - Adding flat_id support to expenses table

---

## 🚀 Features Implemented

### 1. Rental Agreement PDF Generator

**File:** `backend/utils/rentalAgreementGenerator.js`

Generates professional rental agreement PDFs with:
- Company header and branding
- Contract details (contract number, dates, duration, status)
- Party information (Landlord & Tenant details)
- Property details (Building, flat number, address)
- Complete terms and conditions (10 standard clauses)
- Payment summary with breakdown
- Signature sections
- Multi-page support with automatic page breaks
- Professional formatting and layout

### 2. API Endpoints

#### Generate PDF
```
POST /api/rentals/:id/generate-pdf
```

**Description:** Generates a PDF for the specified rental agreement

**Response:**
```json
{
  "message": "Rental agreement PDF generated successfully",
  "pdf_path": "/contracts/CON-20251112-001234.pdf",
  "download_url": "/api/rentals/1/download-pdf"
}
```

#### Download PDF
```
GET /api/rentals/:id/download-pdf
```

**Description:** Downloads the generated PDF file

**Response:** PDF file stream with appropriate headers

**Error Response (if PDF not generated):**
```json
{
  "error": "PDF not found. Please generate the PDF first.",
  "generate_url": "/api/rentals/1/generate-pdf"
}
```

### 3. Database Migration

**File:** `backend/database/migration_add_flat_id_to_expenses.sql`

**Changes:**
- Adds `flat_id` column to `expenses` table
- Foreign key reference to `flats(id)` with ON DELETE SET NULL
- Index on `flat_id` for optimized queries

**SQL:**
```sql
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS flat_id INTEGER REFERENCES flats(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_expenses_flat ON expenses(flat_id);
```

---

## 📦 Directory Structure

```
backend/
├── utils/
│   ├── invoiceGenerator.js          (existing)
│   ├── rentalAgreementGenerator.js  (NEW)
│   ├── paymentScheduleGenerator.js  (existing)
│   └── adminReportGenerator.js      (existing)
├── routes/
│   └── rentals.js                   (UPDATED - added PDF endpoints)
├── database/
│   ├── schema_enhanced.sql          (existing)
│   └── migration_add_flat_id_to_expenses.sql  (NEW)
├── contracts/                       (NEW - auto-created directory)
│   └── (Generated rental PDFs stored here)
├── invoices/                        (existing)
└── server.js                        (UPDATED - added /contracts static route)
```

---

## 🔧 Installation & Setup

### 1. Apply Database Migration

Run the migration SQL to add flat_id to expenses:

```bash
psql -U your_user -d your_database -f backend/database/migration_add_flat_id_to_expenses.sql
```

Or via your database client:
```sql
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS flat_id INTEGER REFERENCES flats(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_expenses_flat ON expenses(flat_id);
```

### 2. Ensure Dependencies

The PDF generator requires `pdfkit` and `moment`, which should already be installed from invoice generation:

```bash
cd backend
npm install pdfkit moment
```

### 3. Create Contracts Directory

The directory is auto-created on first use, but you can create it manually:

```bash
mkdir -p backend/contracts
```

### 4. Restart Server

```bash
cd backend
pm2 restart flat-management-app
# or
npm start
```

---

## 💻 Usage Examples

### Frontend Integration

#### 1. Generate Rental Agreement PDF

```javascript
import axios from 'axios';

// Generate PDF for rental agreement
const generateRentalPDF = async (rentalId) => {
  try {
    const response = await axios.post(`/api/rentals/${rentalId}/generate-pdf`);
    console.log('PDF generated:', response.data);

    return response.data; // Contains pdf_path and download_url
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw error;
  }
};
```

#### 2. Download Rental Agreement PDF

```javascript
// Download PDF directly
const downloadRentalPDF = (rentalId) => {
  const downloadUrl = `${API_BASE_URL}/api/rentals/${rentalId}/download-pdf`;
  window.open(downloadUrl, '_blank');
};

// Or with axios for more control
const downloadRentalPDFWithAxios = async (rentalId, contractNumber) => {
  try {
    const response = await axios.get(`/api/rentals/${rentalId}/download-pdf`, {
      responseType: 'blob'
    });

    // Create blob and download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contractNumber}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download PDF:', error);
    throw error;
  }
};
```

#### 3. Complete Workflow (Generate + Download)

```javascript
const handleGenerateAndDownload = async (rentalId) => {
  try {
    // Step 1: Generate PDF
    setLoading(true);
    const generateResponse = await axios.post(`/api/rentals/${rentalId}/generate-pdf`);

    console.log('PDF generated successfully');

    // Step 2: Download PDF
    setTimeout(() => {
      window.open(`${API_BASE_URL}${generateResponse.data.download_url}`, '_blank');
      setLoading(false);
    }, 500);

  } catch (error) {
    console.error('Error:', error);
    setLoading(false);
    alert('Failed to generate rental agreement');
  }
};
```

#### 4. Update Expenses with Flat Selection

```javascript
// Create expense with flat_id
const createExpense = async (expenseData) => {
  try {
    const data = {
      building_id: expenseData.building_id,
      flat_id: expenseData.flat_id, // NEW - now supported
      expense_date: expenseData.expense_date,
      category: expenseData.category,
      description: expenseData.description,
      amount: expenseData.amount,
      payment_method: expenseData.payment_method,
      remarks: expenseData.remarks
    };

    const response = await axios.post('/api/expenses', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create expense:', error);
    throw error;
  }
};

// Filter expenses by flat
const getExpensesByFlat = async (flatId) => {
  try {
    const response = await axios.get('/api/expenses', {
      params: { flat_id: flatId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    throw error;
  }
};
```

---

## 🎨 PDF Sample Structure

The generated rental agreement PDF includes:

### Page 1:
- **Header:** Company name, contact info, logo
- **Title:** "RENTAL AGREEMENT"
- **Contract Details Box:**
  - Contract Number
  - Contract Date
  - Start Date / End Date
  - Duration
  - Status (Active/Inactive)
- **Party Details:**
  1. Landlord information
  2. Tenant information (name, ID, nationality, contact)
  3. Property details (building, flat, address)

### Page 2:
- **Terms and Conditions:** 10 comprehensive clauses
  1. Rental Period
  2. Rent Payment
  3. Security Deposit
  4. Advance Payment
  5. Property Maintenance
  6. Utilities
  7. Subletting
  8. Termination
  9. Late Payment
  10. Inspection

### Page 3:
- **Payment Summary Box:**
  - Rental Amount per period
  - Duration
  - Total Rent Amount
  - Advance Payment
  - Security Deposit
  - **TOTAL AMOUNT DUE**
- **Payment Note**

### Page 4:
- **Signatures Section:**
  - Landlord signature line
  - Tenant signature line
  - Date fields
- **Footer:** Auto-generated timestamp, page numbers

---

## 🔍 Testing

### Test Rental Agreement PDF Generation

```bash
# Using curl
curl -X POST http://localhost:5000/api/rentals/1/generate-pdf

# Response:
# {
#   "message": "Rental agreement PDF generated successfully",
#   "pdf_path": "/contracts/CON-20251112-001234.pdf",
#   "download_url": "/api/rentals/1/download-pdf"
# }

# Download PDF
curl -O http://localhost:5000/api/rentals/1/download-pdf
```

### Test Database Migration

```sql
-- Verify column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'expenses' AND column_name = 'flat_id';

-- Test insert with flat_id
INSERT INTO expenses (building_id, flat_id, expense_date, category, amount)
VALUES (1, 5, '2025-11-12', 'Maintenance', 150.00);

-- Test query with flat filter
SELECT * FROM expenses WHERE flat_id = 5;
```

---

## 📊 Updated Expenses API

### Create Expense (Updated)

```
POST /api/expenses
```

**Body:**
```json
{
  "building_id": 1,
  "flat_id": 5,           // NEW - optional
  "expense_date": "2025-11-12",
  "category": "Maintenance",
  "description": "AC repair in Flat 101",
  "amount": 150.00,
  "payment_method": "Cash",
  "remarks": "Urgent repair"
}
```

### Get Expenses (Updated)

```
GET /api/expenses?building_id=1&flat_id=5
```

**Query Parameters:**
- `building_id` (optional) - Filter by building
- `flat_id` (optional) - Filter by specific flat (NEW)
- `category` (optional) - Filter by category
- `start_date` (optional) - Filter by date range
- `end_date` (optional) - Filter by date range

---

## 🛡️ Error Handling

### Common Errors

1. **PDF Not Found (404)**
   ```json
   {
     "error": "PDF not found. Please generate the PDF first.",
     "generate_url": "/api/rentals/1/generate-pdf"
   }
   ```
   **Solution:** Call the generate endpoint first

2. **Rental Not Found (404)**
   ```json
   {
     "error": "Rental agreement not found"
   }
   ```
   **Solution:** Verify rental agreement ID exists

3. **PDF Generation Failed (500)**
   ```json
   {
     "error": "Failed to generate rental agreement PDF"
   }
   ```
   **Solution:** Check server logs, ensure pdfkit is installed

---

## 📁 File Locations

### Generated PDFs
- **Rental Agreements:** `backend/contracts/CON-YYYYMMDD-XXXXXX.pdf`
- **Invoices:** `backend/invoices/INV-YYYYMMDD-XXXXXX.pdf`
- **Reports:** `backend/reports/*.pdf`

### Static URLs
- Rental PDFs: `http://localhost:5000/contracts/CON-20251112-001234.pdf`
- Invoice PDFs: `http://localhost:5000/invoices/INV-20251112-010045.pdf`

---

## 🚨 Important Notes

1. **Contracts Directory:** Auto-created on first PDF generation
2. **File Naming:** Uses contract number from database (e.g., CON-20251112-001234.pdf)
3. **Currency:** Currently set to USD, can be changed in `_formatCurrency` method
4. **Terms:** Standard 10 clauses included, customize in `_addTermsAndConditions` method
5. **Company Info:** Update header details in `_addHeader` method
6. **Flat ID in Expenses:** Optional field, can be null for building-level expenses

---

## 🔄 Future Enhancements

Potential improvements:
- [ ] Customizable terms and conditions per agreement
- [ ] Digital signature integration
- [ ] Email PDF directly to tenant
- [ ] PDF preview before download
- [ ] Batch PDF generation
- [ ] PDF templates selection
- [ ] Multi-language support
- [ ] Watermarks for draft versions

---

## 📞 Support

For issues or questions:
- Check server logs: `pm2 logs flat-management-app`
- Verify database connection
- Ensure all dependencies installed
- Check file permissions for contracts directory

---

**Last Updated:** 2025-11-12
**Version:** 1.0.0
**Status:** ✅ Production Ready
