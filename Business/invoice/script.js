document.addEventListener('DOMContentLoaded', function() {
  // Initialize variables
  const { jsPDF } = window.jspdf;
  let logoDataUrl = null;
  
  // DOM Elements
  const themeColorInput = document.getElementById('theme-color');
  const logoInput = document.getElementById('logo-input');
  const logoPreview = document.getElementById('logo-preview');
  const addItemBtn = document.getElementById('add-item');
  const itemsTable = document.getElementById('items-table').getElementsByTagName('tbody')[0];
  const subtotalEl = document.getElementById('subtotal');
  const taxAmountEl = document.getElementById('tax-amount');
  const discountTypeEl = document.getElementById('discount-type');
  const discountValueEl = document.getElementById('discount-value');
  const discountAmountEl = document.getElementById('discount-amount');
  const totalEl = document.getElementById('total');
  const saveDraftBtn = document.getElementById('save-draft');
  const clearFormBtn = document.getElementById('clear-form');
  const generatePdfBtn = document.getElementById('generate-pdf');
  const currencySelect = document.getElementById('currency');

  // Initialize form with default values
  document.getElementById('invoice-date').valueAsDate = new Date();
  
  // Add event listeners
  themeColorInput.addEventListener('input', updateThemeColor);
  logoInput.addEventListener('change', handleLogoUpload);
  addItemBtn.addEventListener('click', addItemRow);
  itemsTable.addEventListener('input', calculateTotals);
  saveDraftBtn.addEventListener('click', saveDraft);
  clearFormBtn.addEventListener('click', clearForm);
  generatePdfBtn.addEventListener('click', generatePDF);
  currencySelect.addEventListener('change', calculateTotals);
  discountTypeEl.addEventListener('change', calculateTotals);
  discountValueEl.addEventListener('input', calculateTotals);
  
  // Load draft if exists
  loadDraft();
  
  // Add first item row by default
  addItemRow();
  
  // Functions
  function updateThemeColor() {
    const color = themeColorInput.value;
    document.documentElement.style.setProperty('--primary-color', color);
    
    // Calculate a lighter version for some elements
    const primaryLight = lightenColor(color, 20);
    document.documentElement.style.setProperty('--primary-light', primaryLight);
  }
  
  function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return "#" + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  }
  
  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        logoDataUrl = event.target.result;
        logoPreview.innerHTML = `<img src="${logoDataUrl}" alt="Company Logo">`;
      };
      reader.readAsDataURL(file);
    }
  }
  
  function addItemRow() {
    const row = itemsTable.insertRow();
    row.innerHTML = `
      <td><input type="text" class="item-desc" placeholder="Item description" required></td>
      <td><input type="number" class="item-qty" min="0.01" step="0.01" value="1"></td>
      <td><input type="number" class="item-price" min="0" step="0.01" placeholder="0.00" required></td>
      <td>
        <select class="item-tax">
          <option value="0">0%</option>
          <option value="5">5%</option>
          <option value="10">10%</option>
          <option value="15">15%</option>
          <option value="18">18%</option>
        </select>
      </td>
      <td class="item-total">${formatCurrency(0, currencySelect.value)}</td>
      <td><button class="btn remove-item">×</button></td>
    `;
    
    // Add event listener to remove button
    row.querySelector('.remove-item').addEventListener('click', function() {
      row.remove();
      calculateTotals();
    });
    
    // Add event listeners to inputs
    const inputs = row.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('input', calculateTotals);
    });
  }
  
  function calculateTotals() {
    const currencyCode = currencySelect.value;
    let subtotal = 0;
    let totalTax = 0;
    const rows = itemsTable.querySelectorAll('tr');
    
    rows.forEach(row => {
      const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
      const price = parseFloat(row.querySelector('.item-price').value) || 0;
      const taxRate = parseFloat(row.querySelector('.item-tax').value) || 0;
      
      const itemSubtotal = qty * price;
      const itemTax = itemSubtotal * (taxRate / 100);
      const itemTotal = itemSubtotal + itemTax;
      
      row.querySelector('.item-total').textContent = formatCurrency(itemTotal, currencyCode);
      subtotal += itemSubtotal;
      totalTax += itemTax;
    });
    
    // Calculate discount
    let discountAmount = 0;
    const discountType = discountTypeEl.value;
    const discountValue = parseFloat(discountValueEl.value) || 0;
    
    if (discountType === 'percentage') {
      discountAmount = subtotal * (discountValue / 100);
    } else if (discountType === 'fixed') {
      discountAmount = discountValue;
    }
    
    const total = subtotal + totalTax - discountAmount;
    
    // Update UI
    subtotalEl.textContent = formatCurrency(subtotal, currencyCode);
    taxAmountEl.textContent = formatCurrency(totalTax, currencyCode);
    discountAmountEl.textContent = formatCurrency(discountAmount, currencyCode);
    totalEl.textContent = formatCurrency(total, currencyCode);
  }
  
  function formatCurrency(amount, currencyCode) {
    const formatters = {
      'USD': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      'EUR': new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
      'GBP': new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
      'UGX': new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }),
      'KES': new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }),
      'TZS': new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }),
      'ZAR': new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })
    };
    
    // Fallback for browsers that don't support all currencies
    if (formatters[currencyCode]) {
      return formatters[currencyCode].format(amount);
    } else {
      // Default formatting
      const symbols = {
        'USD': '$', 'EUR': '€', 'GBP': '£', 
        'UGX': 'USh', 'KES': 'KSh', 'TZS': 'TSh', 'ZAR': 'R'
      };
      const symbol = symbols[currencyCode] || '$';
      return symbol + ' ' + amount.toFixed(currencyCode === 'UGX' || currencyCode === 'KES' || currencyCode === 'TZS' ? 0 : 2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
  }
  
  function saveDraft() {
    const formData = {
      company: {
        name: document.getElementById('company-name').value,
        address: document.getElementById('company-address').value,
        email: document.getElementById('company-email').value,
        phone: document.getElementById('company-phone').value,
        tax: document.getElementById('company-tax').value,
        website: document.getElementById('company-website').value
      },
      client: {
        name: document.getElementById('client-name').value,
        address: document.getElementById('client-address').value,
        email: document.getElementById('client-email').value,
        phone: document.getElementById('client-phone').value,
        tax: document.getElementById('client-tax').value
      },
      invoice: {
        number: document.getElementById('invoice-number').value,
        date: document.getElementById('invoice-date').value,
        dueDate: document.getElementById('due-date').value,
        terms: document.getElementById('payment-terms').value
      },
      items: getItemsData(),
      notes: document.getElementById('notes').value,
      terms: document.getElementById('terms').value,
      discount: {
        type: discountTypeEl.value,
        value: discountValueEl.value
      },
      themeColor: themeColorInput.value,
      logo: logoDataUrl,
      currency: currencySelect.value
    };
    
    localStorage.setItem('invoiceDraft', JSON.stringify(formData));
    showToast('Draft saved successfully!');
  }
  
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
  
  function loadDraft() {
    const draft = localStorage.getItem('invoiceDraft');
    if (draft) {
      const formData = JSON.parse(draft);
      
      // Company details
      document.getElementById('company-name').value = formData.company.name || '';
      document.getElementById('company-address').value = formData.company.address || '';
      document.getElementById('company-email').value = formData.company.email || '';
      document.getElementById('company-phone').value = formData.company.phone || '';
      document.getElementById('company-tax').value = formData.company.tax || '';
      document.getElementById('company-website').value = formData.company.website || '';
      
      // Client details
      document.getElementById('client-name').value = formData.client.name || '';
      document.getElementById('client-address').value = formData.client.address || '';
      document.getElementById('client-email').value = formData.client.email || '';
      document.getElementById('client-phone').value = formData.client.phone || '';
      document.getElementById('client-tax').value = formData.client.tax || '';
      
      // Invoice details
      document.getElementById('invoice-number').value = formData.invoice.number || '';
      document.getElementById('invoice-date').value = formData.invoice.date || '';
      document.getElementById('due-date').value = formData.invoice.dueDate || '';
      document.getElementById('payment-terms').value = formData.invoice.terms || 'Net 30';
      
      // Items
      if (formData.items && formData.items.length > 0) {
        itemsTable.innerHTML = '';
        formData.items.forEach(item => {
          addItemRow();
          const lastRow = itemsTable.rows[itemsTable.rows.length - 1];
          lastRow.querySelector('.item-desc').value = item.description || '';
          lastRow.querySelector('.item-qty').value = item.quantity || 1;
          lastRow.querySelector('.item-price').value = item.price || 0;
          lastRow.querySelector('.item-tax').value = item.tax || 0;
        });
      }
      
      // Other fields
      document.getElementById('notes').value = formData.notes || '';
      document.getElementById('terms').value = formData.terms || '';
      discountTypeEl.value = formData.discount?.type || 'none';
      discountValueEl.value = formData.discount?.value || 0;
      themeColorInput.value = formData.themeColor || '#4F46E5';
      updateThemeColor();
      
      if (formData.logo) {
        logoDataUrl = formData.logo;
        logoPreview.innerHTML = `<img src="${logoDataUrl}" alt="Company Logo">`;
      }
      
      if (formData.currency) {
        currencySelect.value = formData.currency;
      }
      
      calculateTotals();
    }
  }
  
  function getItemsData() {
    const items = [];
    const rows = itemsTable.querySelectorAll('tr');
    
    rows.forEach(row => {
      items.push({
        description: row.querySelector('.item-desc').value,
        quantity: row.querySelector('.item-qty').value,
        price: row.querySelector('.item-price').value,
        tax: row.querySelector('.item-tax').value
      });
    });
    
    return items;
  }
  
  function clearForm() {
    if (confirm('Are you sure you want to clear the form? All unsaved data will be lost.')) {
      // Clear all input fields
      document.getElementById('company-name').value = '';
      document.getElementById('company-address').value = '';
      document.getElementById('company-email').value = '';
      document.getElementById('company-phone').value = '';
      document.getElementById('company-tax').value = '';
      document.getElementById('company-website').value = '';
      
      document.getElementById('client-name').value = '';
      document.getElementById('client-address').value = '';
      document.getElementById('client-email').value = '';
      document.getElementById('client-phone').value = '';
      document.getElementById('client-tax').value = '';
      
      document.getElementById('invoice-number').value = '';
      document.getElementById('invoice-date').valueAsDate = new Date();
      document.getElementById('due-date').value = '';
      document.getElementById('payment-terms').value = 'Net 30';
      
      document.getElementById('notes').value = '';
      document.getElementById('terms').value = '';
      
      // Clear items table
      itemsTable.innerHTML = '';
      
      // Reset logo
      logoPreview.innerHTML = '';
      logoDataUrl = null;
      logoInput.value = '';
      
      // Reset theme and currency
      themeColorInput.value = '#4F46E5';
      updateThemeColor();
      currencySelect.value = 'UGX';
      
      // Reset discount
      discountTypeEl.value = 'none';
      discountValueEl.value = 0;
      
      // Add a default item row
      addItemRow();
      
      // Recalculate totals
      calculateTotals();
      
      showToast('Form cleared successfully!');
    }
  }
  
  function generatePDF() {
    // Validate required fields
    if (!document.getElementById('company-name').value) {
      showToast('Please enter your company name');
      return;
    }
    
    if (!document.getElementById('client-name').value) {
      showToast('Please enter client name');
      return;
    }
    
    if (!document.getElementById('invoice-number').value) {
      showToast('Please enter invoice number');
      return;
    }
    
    // Get all values
    const currencyCode = currencySelect.value;
    const companyName = document.getElementById('company-name').value;
    const companyAddress = document.getElementById('company-address').value;
    const companyEmail = document.getElementById('company-email').value;
    const companyPhone = document.getElementById('company-phone').value;
    const companyTax = document.getElementById('company-tax').value;
    const companyWebsite = document.getElementById('company-website').value;
    
    const clientName = document.getElementById('client-name').value;
    const clientAddress = document.getElementById('client-address').value;
    const clientEmail = document.getElementById('client-email').value;
    const clientPhone = document.getElementById('client-phone').value;
    const clientTax = document.getElementById('client-tax').value;
    
    const invoiceNumber = document.getElementById('invoice-number').value;
    const invoiceDate = document.getElementById('invoice-date').value;
    const dueDate = document.getElementById('due-date').value;
    const paymentTerms = document.getElementById('payment-terms').value;
    
    const notes = document.getElementById('notes').value;
    const terms = document.getElementById('terms').value;
    
    const items = getItemsData();
    const discountType = discountTypeEl.value;
    const discountValue = parseFloat(discountValueEl.value) || 0;
    
    // Calculate totals
    let subtotal = 0;
    let totalTax = 0;
    
    items.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const taxRate = parseFloat(item.tax) || 0;
      
      subtotal += qty * price;
      totalTax += (qty * price) * (taxRate / 100);
    });
    
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = subtotal * (discountValue / 100);
    } else if (discountType === 'fixed') {
      discountAmount = discountValue;
    }
    
    const total = subtotal + totalTax - discountAmount;
    
    // Create new PDF with landscape orientation for more space
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const primaryColor = themeColorInput.value;
    const primaryLight = lightenColor(primaryColor, 20);
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Add watermark
    doc.setFontSize(80);
    doc.setTextColor(240, 240, 240);
    doc.setFont('helvetica', 'normal');
    doc.text(companyName, pageWidth / 2, 140, { angle: -30, align: 'center' });
    
    // Reset styles
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    // Header with logo and company info
    let headerY = margin;
    
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'JPEG', margin, headerY, 40, 25);
      headerY += 30;
    } else {
      doc.setFontSize(18);
      doc.setTextColor(primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(companyName, margin, headerY + 10);
      headerY += 15;
    }
    
    // Company details
    doc.setFontSize(10);
    doc.setTextColor(100);
    
    const companyDetails = [
      companyAddress,
      `Email: ${companyEmail}`,
      `Phone: ${companyPhone}`,
      companyTax && `Tax ID: ${companyTax}`,
      companyWebsite && `Website: ${companyWebsite}`
    ].filter(Boolean);
    
    companyDetails.forEach((detail, index) => {
      doc.text(detail, margin, headerY + (index * 5));
    });
    
    // Invoice header
    const invoiceHeaderY = margin;
    doc.setFontSize(24);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - margin, invoiceHeaderY + 10, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    
    const invoiceDetails = [
      `Invoice #: ${invoiceNumber}`,
      `Date: ${formatDate(invoiceDate)}`,
      dueDate && `Due Date: ${formatDate(dueDate)}`,
      `Payment Terms: ${paymentTerms}`
    ].filter(Boolean);
    
    invoiceDetails.forEach((detail, index) => {
      doc.text(detail, pageWidth - margin, invoiceHeaderY + 20 + (index * 5), { align: 'right' });
    });
    
    // Client section
    const clientY = logoDataUrl ? margin + 60 : margin + 40;
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', margin, clientY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(clientName, margin, clientY + 5);
    
    const clientDetails = [
      clientAddress,
      clientEmail && `Email: ${clientEmail}`,
      clientPhone && `Phone: ${clientPhone}`,
      clientTax && `Tax ID: ${clientTax}`
    ].filter(Boolean);
    
    clientDetails.forEach((detail, index) => {
      doc.text(detail, margin, clientY + 10 + (index * 5));
    });
    
    // Items table
    const tableY = clientY + 30 + (clientDetails.length * 5);
    
    // Prepare table data
    const tableData = items.map(item => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const taxRate = parseFloat(item.tax) || 0;
      const itemTotal = (qty * price) * (1 + (taxRate / 100));
      
      return [
        item.description,
        qty.toFixed(2),
        formatCurrency(price, currencyCode),
        `${taxRate}%`,
        formatCurrency(itemTotal, currencyCode)
      ];
    });
    
    // Add table
    doc.autoTable({
      startY: tableY,
      head: [['Description', 'Qty', 'Unit Price', 'Tax', 'Total']],
      body: tableData,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        textColor: 60,
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' },
        1: { cellWidth: 15, halign: 'right' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
      },
      styles: {
        cellPadding: 4,
        lineColor: primaryLight,
        lineWidth: 0.2
      },
      didDrawPage: function(data) {
        // Footer on each page
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Page ${data.pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }
    });
    
    // Totals section
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.setTextColor(60);
    
    // Subtotal
    doc.text('Subtotal:', pageWidth - margin - 70, finalY);
    doc.text(formatCurrency(subtotal, currencyCode), pageWidth - margin, finalY, { align: 'right' });
    
    // Tax
    doc.text('Tax:', pageWidth - margin - 70, finalY + 5);
    doc.text(formatCurrency(totalTax, currencyCode), pageWidth - margin, finalY + 5, { align: 'right' });
    
    // Discount
    if (discountAmount > 0) {
      const discountText = discountType === 'percentage' ? 
        `Discount (${discountValue}%)` : 'Discount';
      doc.text(discountText, pageWidth - margin - 70, finalY + 10);
      doc.text(`-${formatCurrency(discountAmount, currencyCode)}`, pageWidth - margin, finalY + 10, { align: 'right' });
    }
    
    // Total
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.text('TOTAL:', pageWidth - margin - 70, finalY + 20);
    doc.text(formatCurrency(total, currencyCode), pageWidth - margin, finalY + 20, { align: 'right' });
    
    // Payment instructions
    const paymentY = finalY + 30;
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT INSTRUCTIONS:', margin, paymentY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60);
    doc.text('Please make payment using the following details:', margin, paymentY + 5);
    
    const paymentDetails = [
      'Bank: Equity Bank Uganda Limited',
      `Account Name: ${companyName}`,
      'Account Number: 1234567890',
      'Branch: Kampala Road',
      'SWIFT Code: EQBLUGKA',
      `Amount Due: ${formatCurrency(total, currencyCode)}`
    ];
    
    paymentDetails.forEach((detail, index) => {
      doc.text(detail, margin, paymentY + 10 + (index * 5));
    });
    
    // Notes
    if (notes) {
      const notesY = paymentY + 10 + (paymentDetails.length * 5) + 5;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor);
      doc.text('NOTES:', margin, notesY);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60);
      const splitNotes = doc.splitTextToSize(notes, contentWidth);
      doc.text(splitNotes, margin, notesY + 5);
    }
    
    // Terms
    if (terms) {
      const termsY = notes ? doc.lastAutoTable.finalY + 20 : doc.lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor);
      doc.text('TERMS & CONDITIONS:', margin, termsY);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60);
      const splitTerms = doc.splitTextToSize(terms, contentWidth);
      doc.text(splitTerms, margin, termsY + 5);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Thank you for your business!', pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
    doc.text('This is a computer generated invoice. No signature required.', pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });
    
    // Save the PDF
    doc.save(`invoice_${invoiceNumber}.pdf`);
  }
  
  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
});

// Add toast notification styles
const style = document.createElement('style');
style.textContent = `
.toast-notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background-color: #4F46E5;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  opacity: 0;
  transition: all 0.3s ease;
}
.toast-notification.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}
`;
document.head.appendChild(style);