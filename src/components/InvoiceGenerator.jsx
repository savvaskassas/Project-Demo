import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './InvoiceGenerator.css';

const InvoiceGenerator = ({ onSubmit, onCancel, project, initialData = null }) => {
  const [formData, setFormData] = useState({
    type: initialData?.type || 'invoice',
    invoiceNumber: initialData?.invoiceNumber || generateInvoiceNumber(),
    date: initialData?.date || new Date().toISOString().split('T')[0],
    dueDate: initialData?.dueDate || '',
    
    // Στοιχεία Εταιρείας
    companyName: 'Εταιρεία Μου ΑΕ',
    companyAddress: 'Διεύθυνση Εταιρείας 123\n12345 Αθήνα',
    companyPhone: '210-1234567',
    companyEmail: 'info@company.gr',
    companyTaxId: '123456789',
    companyDoy: 'ΔΟΥ Αθηνών',
    companyActivity: 'Κατασκευαστικές Εργασίες',
    
    // Στοιχεία Πελάτη
    clientName: project?.client || '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    clientTaxId: '',
    clientDoy: '',
    clientType: 'individual', // individual, company
    
    // Στοιχεία Προσφοράς/Προτιμολογίου
    validUntil: '',
    deliveryTime: '',
    paymentTerms: '',
    
    // Στοιχεία Τιμολογίου
    transportMethod: '',
    transportCost: 0,
    
    // Στοιχεία Απόδειξης
    receiptType: 'service', // service, product
    
    projectTitle: project?.projectTitle || '',
    items: initialData?.items || [{
      id: 1,
      description: '',
      quantity: 1,
      unit: 'τεμ.',
      unitPrice: 0,
      total: 0
    }],
    subtotal: 0,
    taxRate: 24,
    taxAmount: 0,
    total: 0,
    notes: '',
    terms: 'Όροι πληρωμής: 30 ημέρες'
  });

  function generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    return `INV-${year}${month}${day}-${time}`;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const invoiceTypes = [
    { value: 'invoice', label: '📄 Τιμολόγιο', description: 'Για επιχειρήσεις - Πλήρη φορολογικά στοιχεία' },
    { value: 'receipt', label: '🧾 Απόδειξη', description: 'Για ιδιώτες - Απλοποιημένα στοιχεία' },
    { value: 'quote', label: '💼 Προσφορά', description: 'Προσφορά τιμών - Χωρίς φορολογικές υποχρεώσεις' },
    { value: 'proforma', label: '📋 Προτιμολόγιο', description: 'Προκαταβολικό έγγραφο' }
  ];

  // Καθορισμός πεδίων που εμφανίζονται για κάθε τύπο παραστατικού
  const getRequiredFields = (type) => {
    const baseFields = {
      invoice: {
        company: ['companyName', 'companyTaxId', 'companyDoy', 'companyAddress', 'companyPhone', 'companyEmail', 'companyActivity'],
        client: ['clientName', 'clientTaxId', 'clientDoy', 'clientAddress', 'clientType'],
        document: ['dueDate', 'transportMethod', 'transportCost'],
        items: true,
        tax: true
      },
      receipt: {
        company: ['companyName', 'companyTaxId', 'companyAddress', 'companyPhone'],
        client: ['clientName'],
        document: ['receiptType'],
        items: true,
        tax: true
      },
      quote: {
        company: ['companyName', 'companyAddress', 'companyPhone', 'companyEmail'],
        client: ['clientName', 'clientAddress', 'clientPhone', 'clientEmail'],
        document: ['validUntil', 'deliveryTime', 'paymentTerms'],
        items: true,
        tax: false
      },
      proforma: {
        company: ['companyName', 'companyTaxId', 'companyAddress', 'companyPhone', 'companyEmail'],
        client: ['clientName', 'clientTaxId', 'clientAddress'],
        document: ['dueDate', 'paymentTerms'],
        items: true,
        tax: true
      }
    };
    return baseFields[type] || baseFields.invoice;
  };

  const isFieldRequired = (fieldName, section = null) => {
    const required = getRequiredFields(formData.type);
    if (section) {
      return required[section]?.includes(fieldName) || false;
    }
    return Object.values(required).some(fields => 
      Array.isArray(fields) ? fields.includes(fieldName) : false
    );
  };

  const shouldShowField = (fieldName, section = null) => {
    return isFieldRequired(fieldName, section);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Αν αλλάζει ο τύπος παραστατικού, ενημερώνουμε τα προεπιλεγμένα πεδία
    if (name === 'type') {
      const defaults = getTypeDefaults(value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ...defaults,
        // Επανυπολογισμός συνόλων με τον νέο τύπο
        taxAmount: getRequiredFields(value).tax ? (prev.subtotal + (parseFloat(prev.transportCost) || 0)) * (defaults.taxRate / 100) : 0,
        total: getRequiredFields(value).tax ? 
          (prev.subtotal + (parseFloat(prev.transportCost) || 0)) + ((prev.subtotal + (parseFloat(prev.transportCost) || 0)) * (defaults.taxRate / 100)) :
          prev.subtotal + (parseFloat(prev.transportCost) || 0)
      }));
    } 
    // Αν αλλάζει το κόστος μεταφοράς, επανυπολογίζουμε τα σύνολα
    else if (name === 'transportCost') {
      setFormData(prev => {
        const transportCost = parseFloat(value || 0);
        const baseAmount = prev.subtotal + transportCost;
        const taxAmount = getRequiredFields(prev.type).tax ? baseAmount * (prev.taxRate / 100) : 0;
        const total = baseAmount + taxAmount;

        return {
          ...prev,
          [name]: value,
          taxAmount,
          total
        };
      });
    }
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getTypeDefaults = (type) => {
    const defaults = {
      invoice: {
        terms: 'Όροι πληρωμής: 30 ημέρες από την έκδοση του τιμολογίου',
        taxRate: 24,
        transportMethod: 'Ιδίοις μέσοις',
        transportCost: 0
      },
      receipt: {
        terms: 'Ευχαριστούμε για την προτίμησή σας',
        taxRate: 24,
        receiptType: 'service'
      },
      quote: {
        terms: 'Η προσφορά ισχύει για περιορισμένο χρονικό διάστημα',
        taxRate: 0,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 ημέρες από σήμερα
        deliveryTime: '2-3 εβδομάδες',
        paymentTerms: '50% προκαταβολή, 50% στην παράδοση'
      },
      proforma: {
        terms: 'Προτιμολόγιο - Δεν αποτελεί φορολογικό στοιχείο',
        taxRate: 24,
        paymentTerms: 'Πληρωμή προ της παράδοσης'
      }
    };
    return defaults[type] || {};
  };

  const handleItemChange = (itemId, field, value) => {
    setFormData(prev => {
      const newItems = prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // Αυτόματος υπολογισμός συνόλου γραμμής
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = parseFloat(updatedItem.quantity || 0) * parseFloat(updatedItem.unitPrice || 0);
          }
          
          return updatedItem;
        }
        return item;
      });

      // Αυτόματος υπολογισμός συνολικών
      const subtotal = newItems.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
      const transportCost = parseFloat(prev.transportCost || 0);
      const baseAmount = subtotal + transportCost;
      
      // Υπολογισμός ΦΠΑ μόνο για τύπους που το απαιτούν
      const taxAmount = getRequiredFields(prev.type).tax ? baseAmount * (prev.taxRate / 100) : 0;
      const total = baseAmount + taxAmount;

      return {
        ...prev,
        items: newItems,
        subtotal,
        taxAmount,
        total
      };
    });
  };

  const addItem = () => {
    const newId = Math.max(...formData.items.map(item => item.id)) + 1;
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        id: newId,
        description: '',
        quantity: 1,
        unit: 'τεμ.',
        unitPrice: 0,
        total: 0
      }]
    }));
  };

  const removeItem = (itemId) => {
    if (formData.items.length > 1) {
      setFormData(prev => {
        const newItems = prev.items.filter(item => item.id !== itemId);
        
        // Επανυπολογισμός συνολικών
        const subtotal = newItems.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
        const transportCost = parseFloat(prev.transportCost || 0);
        const baseAmount = subtotal + transportCost;
        const taxAmount = getRequiredFields(prev.type).tax ? baseAmount * (prev.taxRate / 100) : 0;
        const total = baseAmount + taxAmount;

        return {
          ...prev,
          items: newItems,
          subtotal,
          taxAmount,
          total
        };
      });
    }
  };

  const generatePDF = async () => {
    try {
      console.log('Ξεκινά η δημιουργία PDF...', formData);
      
      // Έλεγχος ότι υπάρχουν δεδομένα
      if (!formData.items || formData.items.length === 0) {
        alert('Παρακαλώ προσθέστε τουλάχιστον ένα είδος στο παραστατικό');
        return;
      }

      if (!formData.clientName.trim()) {
        alert('Παρακαλώ συμπληρώστε το όνομα του πελάτη');
        return;
      }

      // Δημιουργία HTML
      const htmlContent = generateInvoiceHTML(formData);
      console.log('HTML Content generated:', htmlContent.substring(0, 200) + '...');

      // Δημιουργία ενός προσωρινού div με το παραστατικό
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm';
      tempDiv.style.height = 'auto';
      tempDiv.style.padding = '0';
      tempDiv.style.margin = '0';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.4';
      tempDiv.style.color = '#000';
      tempDiv.style.backgroundColor = '#fff';
      tempDiv.style.boxSizing = 'border-box';
      tempDiv.style.overflow = 'visible';
      
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);

      console.log('Temp div created and added to DOM');

      // Περίμενε λίγο για το rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Creating canvas...');

      // Δημιουργία canvas από το HTML με βελτιωμένες ρυθμίσεις
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: true,
        allowTaint: false,
        foreignObjectRendering: false,
        letterRendering: true,
        width: 794, // A4 width at 96 DPI
        height: Math.max(tempDiv.scrollHeight, 1123), // A4 height minimum
        windowWidth: 794,
        windowHeight: 1123
      });

      console.log('Canvas created:', canvas.width, 'x', canvas.height);

      // Αφαίρεση του προσωρινού div
      document.body.removeChild(tempDiv);

      // Έλεγχος ότι το canvas δημιουργήθηκε σωστά
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Το canvas δεν δημιουργήθηκε σωστά');
      }

      // Δημιουργία PDF
      console.log('Creating PDF...');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Υπολογισμός διαστάσεων εικόνας
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      
      // Προσαρμογή στις διαστάσεις A4 με περιθώρια
      const margin = 10; // 10mm περιθώρια
      const maxWidth = pdfWidth - (2 * margin);
      const maxHeight = pdfHeight - (2 * margin);
      
      let imgWidth = maxWidth;
      let imgHeight = imgWidth / ratio;
      
      // Αν το ύψος υπερβαίνει τη σελίδα, προσάρμοσε βάσει ύψους
      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = imgHeight * ratio;
      }
      
      const imgX = (pdfWidth - imgWidth) / 2;
      const imgY = margin;

      // Προσθήκη εικόνας στο PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      console.log('Adding image to PDF...');
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight, '', 'FAST');
      
      // Προσθήκη metadata στο PDF
      const typeLabel = getTypeLabel(formData.type).replace(/[^\w\s]/gi, '');
      pdf.setProperties({
        title: `${typeLabel} ${formData.invoiceNumber}`,
        subject: `${typeLabel} για ${formData.clientName}`,
        author: formData.companyName,
        creator: 'Σύστημα Διαχείρισης Έργων'
      });
      
      // Δημιουργία ονόματος αρχείου
      const docType = typeLabel.replace(/\s+/g, '_');
      const clientName = formData.clientName
        .replace(/[^a-zA-Zα-ωΑ-Ω0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 20); // Περιορισμός μήκους
      const date = formData.date.replace(/-/g, '');
      const fileName = `${docType}_${formData.invoiceNumber}_${clientName}_${date}.pdf`;
      
      console.log('Saving PDF:', fileName);
      
      // Αποθήκευση του PDF
      pdf.save(fileName);
      
      // Μήνυμα επιτυχίας
      const successMessage = `✅ Το PDF δημιουργήθηκε επιτυχώς!

📄 Τύπος: ${getTypeLabel(formData.type)}
🔢 Αριθμός: ${formData.invoiceNumber}
👤 Πελάτης: ${formData.clientName}
💰 Αξία: €${formData.total.toFixed(2)}
📁 Αρχείο: ${fileName}`;
      
      alert(successMessage);
      console.log('PDF creation completed successfully');
      
    } catch (error) {
      console.error('Λεπτομερές σφάλμα κατά τη δημιουργία PDF:', error);
      
      // Καθαρισμός DOM σε περίπτωση σφάλματος
      const tempDivs = document.querySelectorAll('div[style*="position: absolute"][style*="left: -9999px"]');
      tempDivs.forEach(div => {
        try {
          document.body.removeChild(div);
        } catch (e) {
          console.warn('Could not remove temp div:', e);
        }
      });
      
      // Λεπτομερές μήνυμα σφάλματος
      let errorMessage = `❌ Σφάλμα κατά τη δημιουργία PDF\n\n`;
      
      if (error.message.includes('html2canvas')) {
        errorMessage += `Πρόβλημα με τη δημιουργία εικόνας από το HTML.\n`;
        errorMessage += `Δοκιμάστε να:\n`;
        errorMessage += `• Ανανεώστε τη σελίδα και δοκιμάστε ξανά\n`;
        errorMessage += `• Ελέγξτε ότι όλα τα πεδία είναι συμπληρωμένα\n`;
      } else if (error.message.includes('jsPDF')) {
        errorMessage += `Πρόβλημα με τη δημιουργία του PDF αρχείου.\n`;
      } else {
        errorMessage += `Γενικό πρόβλημα: ${error.message}\n`;
      }
      
      errorMessage += `\nΑν το πρόβλημα επιμένει, δοκιμάστε την εκτύπωση του παραστατικού.`;
      
      alert(errorMessage);
    }
  };

  const generateInvoiceHTML = (invoiceData) => {
    const formatCurrency = (amount) => `€${parseFloat(amount || 0).toFixed(2)}`;
    
    const getTypeLabel = (type) => {
      const types = {
        'invoice': 'ΤΙΜΟΛΟΓΙΟ',
        'receipt': 'ΑΠΟΔΕΙΞΗ',
        'quote': 'ΠΡΟΣΦΟΡΑ',
        'proforma': 'ΠΡΟΤΙΜΟΛΟΓΙΟ'
      };
      return types[type] || 'ΠΑΡΑΣΤΑΤΙΚΟ';
    };

    const getTypeColor = (type) => {
      const colors = {
        'invoice': '#2196F3',
        'receipt': '#4CAF50', 
        'quote': '#FF9800',
        'proforma': '#9C27B0'
      };
      return colors[type] || '#2196F3';
    };

    // Καθορισμός πεδίων που εμφανίζονται για κάθε τύπο παραστατικού (local copy)
    const getRequiredFieldsLocal = (type) => {
      const baseFields = {
        invoice: {
          company: ['companyName', 'companyTaxId', 'companyDoy', 'companyAddress', 'companyPhone', 'companyEmail', 'companyActivity'],
          client: ['clientName', 'clientTaxId', 'clientDoy', 'clientAddress', 'clientType'],
          document: ['dueDate', 'transportMethod', 'transportCost'],
          items: true,
          tax: true
        },
        receipt: {
          company: ['companyName', 'companyTaxId', 'companyAddress', 'companyPhone'],
          client: ['clientName'],
          document: ['receiptType'],
          items: true,
          tax: true
        },
        quote: {
          company: ['companyName', 'companyAddress', 'companyPhone', 'companyEmail'],
          client: ['clientName', 'clientAddress', 'clientPhone', 'clientEmail'],
          document: ['validUntil', 'deliveryTime', 'paymentTerms'],
          items: true,
          tax: false
        },
        proforma: {
          company: ['companyName', 'companyTaxId', 'companyAddress', 'companyPhone', 'companyEmail'],
          client: ['clientName', 'clientTaxId', 'clientAddress'],
          document: ['dueDate', 'paymentTerms'],
          items: true,
          tax: true
        }
      };
      return baseFields[type] || baseFields.invoice;
    };

    const shouldShowFieldLocal = (fieldName, section = null) => {
      const required = getRequiredFieldsLocal(invoiceData.type);
      if (section) {
        return required[section]?.includes(fieldName) || false;
      }
      return Object.values(required).some(fields => 
        Array.isArray(fields) ? fields.includes(fieldName) : false
      );
    };

    // Υπολογισμός συνόλων με κόστος μεταφοράς
    const subtotal = invoiceData.subtotal || 0;
    const transportCost = parseFloat(invoiceData.transportCost || 0);
    const baseAmount = subtotal + transportCost;
    const taxAmount = getRequiredFieldsLocal(invoiceData.type).tax ? baseAmount * (invoiceData.taxRate / 100) : 0;
    const total = baseAmount + taxAmount;

    return `
      <div style="font-family: 'Arial', sans-serif; max-width: 794px; margin: 0 auto; padding: 15mm; color: #000; line-height: 1.4; background: #fff;">
        
        <!-- Header Section -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid ${getTypeColor(invoiceData.type)}; padding-bottom: 20px; margin-bottom: 25px;">
          <div style="flex: 1;">
            <h1 style="margin: 0 0 8px 0; font-size: 22px; color: ${getTypeColor(invoiceData.type)}; font-weight: bold;">${invoiceData.companyName}</h1>
            ${shouldShowFieldLocal('companyTaxId', 'company') ? `<div style="margin-bottom: 4px; font-size: 12px;"><strong>ΑΦΜ:</strong> ${invoiceData.companyTaxId}</div>` : ''}
            ${shouldShowFieldLocal('companyDoy', 'company') ? `<div style="margin-bottom: 4px; font-size: 12px;"><strong>ΔΟΥ:</strong> ${invoiceData.companyDoy}</div>` : ''}
            ${invoiceData.companyGemiNumber ? `<div style="margin-bottom: 4px; font-size: 12px;"><strong>Αρ. ΓΕΜΗ:</strong> ${invoiceData.companyGemiNumber}</div>` : ''}
            ${shouldShowFieldLocal('companyActivity', 'company') ? `<div style="margin-bottom: 8px; font-size: 11px; color: #666;">${invoiceData.companyActivity}</div>` : ''}
            <div style="margin-bottom: 4px; font-size: 11px;">${invoiceData.companyAddress.replace(/\n/g, '<br>')}</div>
            <div style="font-size: 11px;">
              ${shouldShowFieldLocal('companyPhone', 'company') ? `Τηλ: ${invoiceData.companyPhone}` : ''}
              ${shouldShowFieldLocal('companyEmail', 'company') ? ` | Email: ${invoiceData.companyEmail}` : ''}
            </div>
            ${invoiceData.companyIban ? `<div style="margin-top: 4px; font-size: 10px; color: #666;"><strong>IBAN:</strong> ${invoiceData.companyIban}</div>` : ''}
          </div>
          <div style="text-align: right; min-width: 200px;">
            <h2 style="margin: 0 0 8px 0; font-size: 24px; color: ${getTypeColor(invoiceData.type)}; font-weight: bold;">${getTypeLabel(invoiceData.type)}</h2>
            <div style="margin-bottom: 4px; font-size: 14px; font-weight: bold;">Αρ. ${invoiceData.invoiceNumber}</div>
            <div style="margin-bottom: 4px; font-size: 12px;">Ημ/νία: ${new Date(invoiceData.date).toLocaleDateString('el-GR')}</div>
            ${invoiceData.dueDate ? `<div style="font-size: 12px; color: #d32f2f;">Λήξη: ${new Date(invoiceData.dueDate).toLocaleDateString('el-GR')}</div>` : ''}
            ${invoiceData.validUntil ? `<div style="font-size: 12px; color: #f57c00;">Ισχύει έως: ${new Date(invoiceData.validUntil).toLocaleDateString('el-GR')}</div>` : ''}
          </div>
        </div>

        <!-- Client Information -->
        <div style="margin-bottom: 20px; padding: 12px; border: 1px solid #e0e0e0; background: #fafafa; border-radius: 4px;">
          <h3 style="margin: 0 0 8px 0; font-size: 13px; color: ${getTypeColor(invoiceData.type)}; text-transform: uppercase;">
            ${invoiceData.type === 'quote' ? 'Στοιχεία Ενδιαφερομένου:' : 'Στοιχεία Πελάτη:'}
          </h3>
          <div style="font-weight: bold; margin-bottom: 4px; font-size: 12px;">${invoiceData.clientName}</div>
          
          ${shouldShowFieldLocal('clientTaxId', 'client') && invoiceData.clientTaxId ? `<div style="margin-bottom: 4px; font-size: 11px;"><strong>ΑΦΜ:</strong> ${invoiceData.clientTaxId}</div>` : ''}
          ${shouldShowFieldLocal('clientDoy', 'client') && invoiceData.clientDoy ? `<div style="margin-bottom: 4px; font-size: 11px;"><strong>ΔΟΥ:</strong> ${invoiceData.clientDoy}</div>` : ''}
          ${invoiceData.clientAddress ? `<div style="margin-bottom: 4px; font-size: 11px;">${invoiceData.clientAddress.replace(/\n/g, '<br>')}</div>` : ''}
          ${invoiceData.clientPhone || invoiceData.clientEmail ? `<div style="font-size: 11px;">${invoiceData.clientPhone ? `Τηλ: ${invoiceData.clientPhone}` : ''}${invoiceData.clientPhone && invoiceData.clientEmail ? ' | ' : ''}${invoiceData.clientEmail ? `Email: ${invoiceData.clientEmail}` : ''}</div>` : ''}
        </div>

        ${invoiceData.projectTitle ? `<div style="margin-bottom: 20px; padding: 8px 12px; border-left: 4px solid ${getTypeColor(invoiceData.type)}; background: #f5f5f5; font-size: 12px;"><strong>Έργο:</strong> ${invoiceData.projectTitle}</div>` : ''}

        <!-- Special Document Fields -->
        ${(invoiceData.type === 'quote' || invoiceData.type === 'invoice' || invoiceData.type === 'receipt' || invoiceData.type === 'proforma') && 
          (invoiceData.deliveryTime || invoiceData.paymentTerms || invoiceData.transportMethod || invoiceData.receiptType) ? `
          <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #e0e0e0; background: #f9f9f9; border-radius: 4px;">
            <h4 style="margin: 0 0 8px 0; font-size: 12px; color: ${getTypeColor(invoiceData.type)};">
              ${invoiceData.type === 'quote' ? 'Στοιχεία Προσφοράς:' : 
                invoiceData.type === 'invoice' ? 'Στοιχεία Παράδοσης:' :
                invoiceData.type === 'receipt' ? 'Στοιχεία Απόδειξης:' : 'Στοιχεία Προτιμολογίου:'}
            </h4>
            ${invoiceData.deliveryTime ? `<div style="font-size: 11px; margin-bottom: 3px;"><strong>Χρόνος Παράδοσης:</strong> ${invoiceData.deliveryTime}</div>` : ''}
            ${invoiceData.paymentTerms ? `<div style="font-size: 11px; margin-bottom: 3px;"><strong>Όροι Πληρωμής:</strong> ${invoiceData.paymentTerms}</div>` : ''}
            ${invoiceData.transportMethod ? `<div style="font-size: 11px; margin-bottom: 3px;"><strong>Μεταφορά:</strong> ${invoiceData.transportMethod}</div>` : ''}
            ${invoiceData.receiptType ? `<div style="font-size: 11px;"><strong>Τύπος:</strong> ${
              invoiceData.receiptType === 'service' ? 'Παροχή Υπηρεσιών' :
              invoiceData.receiptType === 'product' ? 'Πώληση Προϊόντων' : 'Μικτό (Προϊόντα & Υπηρεσίες)'
            }</div>` : ''}
          </div>
        ` : ''}

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
          <thead>
            <tr style="background: ${getTypeColor(invoiceData.type)}; color: white;">
              <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Περιγραφή</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; width: 80px;">Ποσότητα</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; width: 60px;">Μονάδα</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold; width: 90px;">Τιμή</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold; width: 90px;">Σύνολο</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.items.map((item, index) => `
              <tr style="background: ${index % 2 === 0 ? '#fff' : '#f9f9f9'};">
                <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">${item.description}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.unit}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(item.unitPrice)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals Section -->
        <div style="margin-top: 20px; text-align: right; font-size: 12px;">
          <div style="margin-bottom: 5px; padding: 5px 10px; background: #f5f5f5;">
            <strong>Υποσύνολο: ${formatCurrency(subtotal)}</strong>
          </div>
          
          ${transportCost > 0 ? `
            <div style="margin-bottom: 5px; padding: 5px 10px; background: #f0f8ff;">
              <strong>Μεταφορικά: ${formatCurrency(transportCost)}</strong>
            </div>
          ` : ''}

          ${getRequiredFieldsLocal(invoiceData.type).tax ? `
            <div style="margin-bottom: 5px; padding: 5px 10px; background: #fff3e0;">
              <strong>ΦΠΑ (${invoiceData.taxRate}%): ${formatCurrency(taxAmount)}</strong>
            </div>
          ` : ''}
          
          <div style="font-weight: bold; font-size: 16px; padding: 8px 10px; background: ${getTypeColor(invoiceData.type)}; color: white; border-radius: 4px;">
            ${invoiceData.type === 'quote' ? 'ΣΥΝΟΛΙΚΗ ΑΞΙΑ' : 'ΤΕΛΙΚΟ ΣΥΝΟΛΟ'}: ${formatCurrency(total)}
          </div>
          
          ${invoiceData.type === 'quote' ? `
            <div style="margin-top: 8px; padding: 6px 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; font-size: 10px; color: #856404;">
              * Η προσφορά δεν περιλαμβάνει ΦΠΑ
            </div>
          ` : ''}
        </div>

        <!-- Ψηφιακή Υπογραφή -->
        ${(invoiceData.requiresSignature && invoiceData.signatoryName) ? `
          <div style="margin-top: 15px; padding: 8px; border: 1px solid #7b68ee; background: #f5f3ff; border-radius: 4px;">
            <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #7b68ee;">Ψηφιακή Υπογραφή:</h4>
            <div style="font-size: 11px; line-height: 1.4;">
              <strong>Υπογράφων:</strong> ${invoiceData.signatoryName}<br>
              ${invoiceData.signatoryPosition ? `<strong>Θέση:</strong> ${invoiceData.signatoryPosition}<br>` : ''}
              <div style="margin-top: 8px; font-style: italic; color: #7b68ee;">
                ✓ Απαιτείται ψηφιακή υπογραφή για την εγκυρότητα του εγγράφου
              </div>
            </div>
          </div>
        ` : ''}

        <!-- AADE MARK -->
        ${(invoiceData.type === 'invoice' && invoiceData.submittedToAADE) ? `
          <div style="margin-top: 15px; padding: 8px; border: 1px solid #28a745; background: #e8f5e8; border-radius: 4px;">
            <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #28a745;">Υποβολή AADE:</h4>
            <div style="font-size: 11px; line-height: 1.4;">
              <strong>✓ Υποβλήθηκε στο AADE</strong><br>
              ${invoiceData.aadeMark ? `<strong>MARK:</strong> ${invoiceData.aadeMark}` : '<em>Αναμονή MARK από AADE</em>'}
            </div>
          </div>
        ` : ''}

        <!-- Τρόπος Πληρωμής -->
        ${invoiceData.paymentMethod ? `
          <div style="margin-top: 15px; padding: 8px; border: 1px solid #17a2b8; background: #e7f7f9; border-radius: 4px;">
            <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #17a2b8;">Πληρωμή:</h4>
            <div style="font-size: 11px; line-height: 1.4;">
              <strong>Τρόπος Πληρωμής:</strong> ${
                invoiceData.paymentMethod === 'cash' ? 'Μετρητά' :
                invoiceData.paymentMethod === 'card' ? 'Κάρτα' :
                invoiceData.paymentMethod === 'bank_transfer' ? 'Τραπεζικό έμβασμα' :
                invoiceData.paymentMethod === 'deposit' ? 'Κατάθεση σε λογαριασμό' :
                invoiceData.paymentMethod === 'check' ? 'Επιταγή' :
                invoiceData.paymentMethod === 'iban' ? 'Κατάθεση σε IBAN' :
                invoiceData.paymentMethod
              }
            </div>
          </div>
        ` : ''}

        <!-- Υπεύθυνα Πρόσωπα -->
        ${(invoiceData.type !== 'receipt' && (invoiceData.issuedBy || invoiceData.issuedByPosition)) ? `
          <div style="margin-top: 20px; padding: 10px; border: 1px solid #e0e0e0; background: #f0f8ff; border-radius: 4px;">
            <h4 style="margin: 0 0 8px 0; font-size: 12px; color: ${getTypeColor(invoiceData.type)}; font-weight: bold;">Υπεύθυνα Πρόσωπα:</h4>
            ${invoiceData.issuedBy ? `<div style="font-size: 11px; margin-bottom: 3px;"><strong>Υπεύθυνος Έκδοσης:</strong> ${invoiceData.issuedBy}</div>` : ''}
            ${invoiceData.issuedByPosition ? `<div style="font-size: 11px;"><strong>Θέση/Ιδιότητα:</strong> ${invoiceData.issuedByPosition}</div>` : ''}
          </div>
        ` : ''}

        <!-- Ψηφιακή Υπογραφή -->
        ${((invoiceData.type === 'quote' || invoiceData.type === 'proforma') && invoiceData.requiresSignature) ? `
          <div style="margin-top: 15px; padding: 12px; border: 2px solid #7b68ee; background: #f8f6ff; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; font-size: 12px; color: #7b68ee; font-weight: bold; text-align: center;">✍️ ΨΗΦΙΑΚΗ ΥΠΟΓΡΑΦΗ</h4>
            ${invoiceData.signatoryName ? `<div style="font-size: 11px; margin-bottom: 5px; text-align: center;"><strong>Υπογράφων:</strong> ${invoiceData.signatoryName}</div>` : ''}
            ${invoiceData.signatoryPosition ? `<div style="font-size: 11px; text-align: center;"><strong>Θέση:</strong> ${invoiceData.signatoryPosition}</div>` : ''}
            <div style="margin-top: 15px; border-top: 1px solid #7b68ee; height: 30px; position: relative;">
              <div style="position: absolute; bottom: 0; right: 10px; font-size: 9px; color: #666;">Υπογραφή</div>
            </div>
          </div>
        ` : ''}

        <!-- AADE MARK -->
        ${(invoiceData.type === 'invoice' && invoiceData.submittedToAADE && invoiceData.aadeMark) ? `
          <div style="margin-top: 15px; padding: 10px; border: 2px solid #28a745; background: #e8f5e8; border-radius: 4px; text-align: center;">
            <h4 style="margin: 0 0 5px 0; font-size: 12px; color: #28a745; font-weight: bold;">📄 ΥΠΟΒΟΛΗ AADE</h4>
            <div style="font-size: 11px; color: #155724;"><strong>MARK:</strong> ${invoiceData.aadeMark}</div>
            <div style="font-size: 9px; color: #666; margin-top: 3px;">Υποβλήθηκε στην ΑΑΔΕ</div>
          </div>
        ` : ''}

        <!-- Παρακράτηση για Δημόσιο -->
        ${(invoiceData.type === 'invoice' && invoiceData.clientType === 'public' && invoiceData.subtotal > 0) ? `
          <div style="margin-top: 15px; padding: 10px; border: 1px solid #ffc107; background: #fff3cd; border-radius: 4px;">
            <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #856404; font-weight: bold;">💰 ΠΑΡΑΚΡΑΤΗΣΗ ΦΟΡΟΥ</h4>
            <div style="font-size: 11px; margin-bottom: 3px;"><strong>Καθαρή Αξία:</strong> €${parseFloat(invoiceData.subtotal || 0).toFixed(2)}</div>
            <div style="font-size: 11px; color: #856404;"><strong>Παρακράτηση MTPY 0.06%:</strong> €${(parseFloat(invoiceData.subtotal || 0) * 0.0006).toFixed(2)}</div>
          </div>
        ` : ''}

        <!-- Notes and Terms -->
        ${invoiceData.notes ? `
          <div style="margin-top: 20px; padding: 10px; border: 1px solid #e0e0e0; background: #f9f9f9; border-radius: 4px;">
            <h4 style="margin: 0 0 8px 0; font-size: 12px; color: ${getTypeColor(invoiceData.type)};">Σημειώσεις:</h4>
            <div style="font-size: 11px; line-height: 1.4;">${invoiceData.notes}</div>
          </div>
        ` : ''}
        
        <div style="margin-top: 15px; padding: 8px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 10px; color: #666; font-style: italic;">
          ${invoiceData.terms}
        </div>

        <!-- Document Type Specific Footer -->
        ${invoiceData.type === 'proforma' ? `
          <div style="margin-top: 15px; padding: 8px; background: #fce4ec; border: 1px solid #f8bbd9; border-radius: 4px; text-align: center; font-size: 10px; color: #880e4f;">
            <strong>ΠΡΟΣΟΧΗ:</strong> Το προτιμολόγιο δεν αποτελεί φορολογικό στοιχείο
          </div>
        ` : ''}

        <!-- Print Footer -->
        <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 9px; color: #999;">
          Εκτυπώθηκε: ${new Date().toLocaleDateString('el-GR')} ${new Date().toLocaleTimeString('el-GR')}
        </div>
      </div>
    `;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Δημιουργία επαγγελματικού τίτλου για το παραστατικό
    const invoiceTypeLabel = invoiceTypes.find(t => t.value === formData.type)?.label || 'Παραστατικό';
    const professionalTitle = `${invoiceTypeLabel} #${formData.invoiceNumber} - ${formData.clientName}`;
    
    const invoiceItem = {
      type: 'invoice',
      title: professionalTitle,
      client: formData.clientName,
      date: formData.date,
      startEndDates: formData.dueDate ? `Λήξη: ${formData.dueDate}` : '',
      stage: 'Εκδόθηκε',
      notes: `Συνολική Αξία: €${formData.total.toFixed(2)}${formData.vatAmount > 0 ? ` (ΦΠΑ: €${formData.vatAmount.toFixed(2)})` : ''}${formData.notes ? '\nΣημειώσεις: ' + formData.notes : ''}`,
      invoiceData: {
        ...formData,
        timestamp: Date.now(),
        createdBy: 'InvoiceGenerator',
        version: '1.0'
      },
      // Προσθήκη πεδίων για εκτύπωση και PDF
      canPrint: true,
      canExportPDF: true,
      exportType: 'invoice' // Για να ξέρει το ProjectItemCard τι τύπο εξαγωγής να κάνει
    };

    const documentEntry = {
      id: `doc-${Date.now()}`,
      invoiceNumber: formData.invoiceNumber,
      type: formData.type,
      date: formData.date,
      clientName: formData.clientName,
      amount: formData.total,
      createdAt: new Date().toISOString()
    };

    console.log('🧾 Δημιουργία παραστατικού:', {
      invoiceNumber: formData.invoiceNumber,
      client: formData.clientName,
      total: formData.total,
      title: professionalTitle
    });

    // Εμφάνιση επιτυχούς μηνύματος
    alert(`✅ Το παραστατικό ${formData.invoiceNumber} δημιουργήθηκε επιτυχώς!
    
📋 Στοιχεία:
• Αριθμός: ${formData.invoiceNumber}
• Πελάτης: ${formData.clientName}
• Αξία: €${formData.total.toFixed(2)}
• Ημερομηνία: ${formatDate(formData.date)}

✨ Το παραστατικό αποθηκεύτηκε στα στοιχεία του έργου!`);
    
    onSubmit(invoiceItem, documentEntry);
  };

  const formatCurrency = (amount) => {
    return `€${parseFloat(amount || 0).toFixed(2)}`;
  };

  const getTypeLabel = (type) => {
    return invoiceTypes.find(t => t.value === type)?.label || 'Παραστατικό';
  };

  const getTypeColor = (type) => {
    const colors = {
      'invoice': '#2196F3',
      'receipt': '#4CAF50', 
      'quote': '#FF9800',
      'proforma': '#9C27B0'
    };
    return colors[type] || '#2196F3';
  };

  return (
    <div className="invoice-generator">
      <div className="invoice-header">
        <h2>🧾 Δημιουργία Παραστατικού</h2>
        <div className="invoice-actions">
          <button type="button" className="pdf-btn" onClick={generatePDF}>
            📄 Εξαγωγή PDF
          </button>
          <button type="button" className="preview-btn" onClick={() => window.print()}>
            🖨️ Προεπισκόπηση
          </button>
          <button type="button" className="cancel-btn" onClick={onCancel}>
            ✕ Ακύρωση
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="invoice-form">
        {/* Τύπος Παραστατικού */}
        <div className="form-section">
          <h3>Στοιχεία Παραστατικού</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Τύπος Παραστατικού</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                {invoiceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <small className="field-description">
                {invoiceTypes.find(t => t.value === formData.type)?.description}
              </small>
            </div>
            <div className="form-group">
              <label>Αριθμός Παραστατικού</label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Ημερομηνία Έκδοσης</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            {(formData.type === 'invoice' || formData.type === 'proforma') && (
              <div className="form-group">
                <label>Ημερομηνία Λήξης</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Στοιχεία Εταιρείας */}
        <div className="form-section">
          <h3>Στοιχεία Εταιρείας</h3>
          <div className="form-row">
            {shouldShowField('companyName', 'company') && (
              <div className="form-group">
                <label>Επωνυμία *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}
            {shouldShowField('companyTaxId', 'company') && (
              <div className="form-group">
                <label>ΑΦΜ *</label>
                <input
                  type="text"
                  name="companyTaxId"
                  value={formData.companyTaxId}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{9}"
                  title="Εισάγετε 9ψήφιο ΑΦΜ"
                />
              </div>
            )}
            {shouldShowField('companyDoy', 'company') && (
              <div className="form-group">
                <label>ΔΟΥ *</label>
                <input
                  type="text"
                  name="companyDoy"
                  value={formData.companyDoy}
                  onChange={handleInputChange}
                  required
                  placeholder="π.χ. ΔΟΥ Αθηνών"
                />
              </div>
            )}
          </div>
          {shouldShowField('companyActivity', 'company') && (
            <div className="form-row">
              <div className="form-group">
                <label>Είδος Επιχείρησης</label>
                <input
                  type="text"
                  name="companyActivity"
                  value={formData.companyActivity}
                  onChange={handleInputChange}
                  placeholder="π.χ. Κατασκευαστικές Εργασίες"
                />
              </div>
            </div>
          )}
          {shouldShowField('companyAddress', 'company') && (
            <div className="form-row">
              <div className="form-group full-width">
                <label>Διεύθυνση *</label>
                <textarea
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleInputChange}
                  rows="3"
                  required
                  placeholder="Οδός, Αριθμός&#10;ΤΚ, Πόλη"
                />
              </div>
            </div>
          )}
          <div className="form-row">
            {shouldShowField('companyPhone', 'company') && (
              <div className="form-group">
                <label>Τηλέφωνο {isFieldRequired('companyPhone', 'company') ? '*' : ''}</label>
                <input
                  type="text"
                  name="companyPhone"
                  value={formData.companyPhone}
                  onChange={handleInputChange}
                  required={isFieldRequired('companyPhone', 'company')}
                  placeholder="210-1234567"
                />
              </div>
            )}
            {shouldShowField('companyEmail', 'company') && (
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleInputChange}
                  placeholder="info@company.gr"
                />
              </div>
            )}
          </div>
        </div>

        {/* Στοιχεία Πελάτη */}
        <div className="form-section">
          <h3>Στοιχεία Πελάτη</h3>
          {shouldShowField('clientType', 'client') && (
            <div className="form-row">
              <div className="form-group">
                <label>Τύπος Πελάτη</label>
                <select
                  name="clientType"
                  value={formData.clientType}
                  onChange={handleInputChange}
                >
                  <option value="individual">Ιδιώτης</option>
                  <option value="company">Επιχείρηση</option>
                </select>
              </div>
            </div>
          )}
          <div className="form-row">
            {shouldShowField('clientName', 'client') && (
              <div className="form-group">
                <label>
                  {formData.clientType === 'company' ? 'Επωνυμία Εταιρείας' : 'Όνομα/Επωνυμία'} *
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  required
                  placeholder={formData.clientType === 'company' ? 'Εταιρεία ΑΕ' : 'Όνομα Επώνυμο'}
                />
              </div>
            )}
            {shouldShowField('clientTaxId', 'client') && (
              <div className="form-group">
                <label>
                  ΑΦΜ {formData.type === 'invoice' ? '*' : ''}
                </label>
                <input
                  type="text"
                  name="clientTaxId"
                  value={formData.clientTaxId}
                  onChange={handleInputChange}
                  required={formData.type === 'invoice'}
                  pattern="[0-9]{9}"
                  title="Εισάγετε 9ψήφιο ΑΦΜ"
                  placeholder="123456789"
                />
              </div>
            )}
            {shouldShowField('clientDoy', 'client') && (
              <div className="form-group">
                <label>ΔΟΥ Πελάτη</label>
                <input
                  type="text"
                  name="clientDoy"
                  value={formData.clientDoy}
                  onChange={handleInputChange}
                  placeholder="π.χ. ΔΟΥ Θεσσαλονίκης"
                />
              </div>
            )}
          </div>
          {shouldShowField('clientAddress', 'client') && (
            <div className="form-row">
              <div className="form-group full-width">
                <label>Διεύθυνση {isFieldRequired('clientAddress', 'client') ? '*' : ''}</label>
                <textarea
                  name="clientAddress"
                  value={formData.clientAddress}
                  onChange={handleInputChange}
                  rows="3"
                  required={isFieldRequired('clientAddress', 'client')}
                  placeholder="Οδός, Αριθμός&#10;ΤΚ, Πόλη"
                />
              </div>
            </div>
          )}
          <div className="form-row">
            {shouldShowField('clientPhone', 'client') && (
              <div className="form-group">
                <label>Τηλέφωνο</label>
                <input
                  type="text"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  placeholder="210-1234567"
                />
              </div>
            )}
            {shouldShowField('clientEmail', 'client') && (
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  placeholder="client@email.gr"
                />
              </div>
            )}
          </div>
        </div>

        {/* Ειδικά Πεδία ανά Τύπο Παραστατικού */}
        {(shouldShowField('validUntil', 'document') || 
          shouldShowField('deliveryTime', 'document') || 
          shouldShowField('paymentTerms', 'document') ||
          shouldShowField('transportMethod', 'document') ||
          shouldShowField('receiptType', 'document')) && (
          <div className="form-section">
            <h3>
              {formData.type === 'quote' && 'Στοιχεία Προσφοράς'}
              {formData.type === 'invoice' && 'Στοιχεία Τιμολογίου'}
              {formData.type === 'receipt' && 'Στοιχεία Απόδειξης'}
              {formData.type === 'proforma' && 'Στοιχεία Προτιμολογίου'}
            </h3>
            
            {/* Πεδία για Προσφορά */}
            {formData.type === 'quote' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Ισχύει Μέχρι *</label>
                    <input
                      type="date"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Χρόνος Παράδοσης</label>
                    <input
                      type="text"
                      name="deliveryTime"
                      value={formData.deliveryTime}
                      onChange={handleInputChange}
                      placeholder="π.χ. 2-3 εβδομάδες"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Όροι Πληρωμής</label>
                    <input
                      type="text"
                      name="paymentTerms"
                      value={formData.paymentTerms}
                      onChange={handleInputChange}
                      placeholder="π.χ. 50% προκαταβολή, 50% στην παράδοση"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Πεδία για Τιμολόγιο */}
            {formData.type === 'invoice' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Τρόπος Μεταφοράς</label>
                  <select
                    name="transportMethod"
                    value={formData.transportMethod}
                    onChange={handleInputChange}
                  >
                    <option value="">Επιλέξτε...</option>
                    <option value="Ιδίοις μέσοις">Ιδίοις μέσοις</option>
                    <option value="Μεταφορική εταιρεία">Μεταφορική εταιρεία</option>
                    <option value="Courier">Courier</option>
                    <option value="Παραλαβή από κατάστημα">Παραλαβή από κατάστημα</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Κόστος Μεταφοράς (€)</label>
                  <input
                    type="number"
                    name="transportCost"
                    value={formData.transportCost}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

            {/* Πεδία για Απόδειξη */}
            {formData.type === 'receipt' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Τύπος Απόδειξης</label>
                  <select
                    name="receiptType"
                    value={formData.receiptType}
                    onChange={handleInputChange}
                  >
                    <option value="service">Παροχή Υπηρεσιών</option>
                    <option value="product">Πώληση Προϊόντων</option>
                    <option value="mixed">Μικτό (Προϊόντα & Υπηρεσίες)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Πεδία για Προτιμολόγιο */}
            {formData.type === 'proforma' && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Όροι Πληρωμής</label>
                  <input
                    type="text"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleInputChange}
                    placeholder="π.χ. Πληρωμή προ της παράδοσης"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Έργο */}
        <div className="form-section">
          <h3>Στοιχεία Έργου</h3>
          <div className="form-group">
            <label>Τίτλος Έργου</label>
            <input
              type="text"
              name="projectTitle"
              value={formData.projectTitle}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Γραμμές Παραστατικού */}
        <div className="form-section">
          <h3>Γραμμές Παραστατικού</h3>
          <div className="items-table">
            <div className="table-header">
              <div className="col-description">Περιγραφή</div>
              <div className="col-quantity">Ποσότητα</div>
              <div className="col-unit">Μονάδα</div>
              <div className="col-price">Τιμή Μονάδας</div>
              <div className="col-total">Σύνολο</div>
              <div className="col-actions">Ενέργειες</div>
            </div>
            
            {formData.items.map(item => (
              <div key={item.id} className="table-row">
                <div className="col-description">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    placeholder="Περιγραφή υπηρεσίας/προϊόντος"
                    required
                  />
                </div>
                <div className="col-quantity">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-unit">
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                    placeholder="τεμ."
                  />
                </div>
                <div className="col-price">
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-total">
                  {formatCurrency(item.total)}
                </div>
                <div className="col-actions">
                  <button
                    type="button"
                    className="remove-item-btn"
                    onClick={() => removeItem(item.id)}
                    disabled={formData.items.length === 1}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button type="button" className="add-item-btn" onClick={addItem}>
            + Προσθήκη Γραμμής
          </button>
        </div>

        {/* Σύνολα */}
        <div className="form-section totals-section">
          <h3>Σύνολα</h3>
          <div className="totals-grid">
            <div className="total-row">
              <label>Υποσύνολο:</label>
              <span>{formatCurrency(formData.subtotal)}</span>
            </div>
            
            {/* Κόστος μεταφοράς για τιμολόγια */}
            {formData.type === 'invoice' && formData.transportCost > 0 && (
              <div className="total-row">
                <label>Μεταφορικά:</label>
                <span>{formatCurrency(formData.transportCost)}</span>
              </div>
            )}

            {/* ΦΠΑ μόνο για τιμολόγια, αποδείξεις και προτιμολόγια */}
            {getRequiredFields(formData.type).tax && (
              <div className="total-row">
                <label>
                  ΦΠΑ ({formData.taxRate}%):
                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value || 0);
                      const baseAmount = formData.subtotal + (formData.transportCost || 0);
                      setFormData(prev => ({
                        ...prev,
                        taxRate: rate,
                        taxAmount: baseAmount * (rate / 100),
                        total: baseAmount + (baseAmount * (rate / 100))
                      }));
                    }}
                    min="0"
                    max="100"
                    step="0.1"
                    style={{ width: '60px', marginLeft: '10px' }}
                  />
                </label>
                <span>{formatCurrency(formData.taxAmount)}</span>
              </div>
            )}
            
            <div className="total-row final">
              <label>
                {formData.type === 'quote' ? 'Συνολική Αξία:' : 'Τελικό Σύνολο:'}
              </label>
              <span>{formatCurrency(formData.total)}</span>
            </div>

            {/* Πληροφορίες για προσφορά */}
            {formData.type === 'quote' && (
              <div className="quote-info">
                <small>* Η προσφορά δεν περιλαμβάνει ΦΠΑ</small>
              </div>
            )}
          </div>
        </div>

        {/* Σημειώσεις και Όροι */}
        <div className="form-section">
          <h3>Σημειώσεις και Όροι</h3>
          <div className="form-group">
            <label>Σημειώσεις</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Πρόσθετες σημειώσεις..."
            />
          </div>
          <div className="form-group">
            <label>Όροι Πληρωμής</label>
            <textarea
              name="terms"
              value={formData.terms}
              onChange={handleInputChange}
              rows="2"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn">
            💾 Αποθήκευση Παραστατικού
          </button>
        </div>
      </form>

      {/* Προεπισκόπηση για εκτύπωση */}
      <div className="invoice-preview print-only">
        <div className="preview-header">
          <div className="company-info">
            <h1>{formData.companyName}</h1>
            <div className="address">{formData.companyAddress}</div>
            <div className="contact">
              Τηλ: {formData.companyPhone} | Email: {formData.companyEmail}
            </div>
            <div className="tax-id">ΑΦΜ: {formData.companyTaxId}</div>
          </div>
          <div className="invoice-info">
            <h2>{getTypeLabel(formData.type)}</h2>
            <div className="invoice-number">Αρ. {formData.invoiceNumber}</div>
            <div className="invoice-date">Ημ/νία: {formData.date}</div>
            {formData.dueDate && <div className="due-date">Λήξη: {formData.dueDate}</div>}
          </div>
        </div>

        <div className="client-info">
          <h3>Στοιχεία Πελάτη:</h3>
          <div className="client-name">{formData.clientName}</div>
          {formData.clientAddress && <div className="client-address">{formData.clientAddress}</div>}
          {formData.clientTaxId && <div className="client-tax-id">ΑΦΜ: {formData.clientTaxId}</div>}
        </div>

        {formData.projectTitle && (
          <div className="project-info">
            <strong>Έργο:</strong> {formData.projectTitle}
          </div>
        )}

        <table className="items-table">
          <thead>
            <tr>
              <th>Περιγραφή</th>
              <th>Ποσότητα</th>
              <th>Μονάδα</th>
              <th>Τιμή</th>
              <th>Σύνολο</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map(item => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td>{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totals">
          <div className="subtotal">Υποσύνολο: {formatCurrency(formData.subtotal)}</div>
          <div className="tax">ΦΠΑ ({formData.taxRate}%): {formatCurrency(formData.taxAmount)}</div>
          <div className="total">Τελικό Σύνολο: {formatCurrency(formData.total)}</div>
        </div>

        {formData.notes && (
          <div className="notes">
            <strong>Σημειώσεις:</strong> {formData.notes}
          </div>
        )}

        <div className="terms">
          {formData.terms}
        </div>
      </div>
    </div>
  );
};

// Export της generateInvoiceHTML για χρήση σε άλλα components
export const generateInvoiceHTML = (invoiceData) => {
  const formatCurrency = (amount) => `€${parseFloat(amount || 0).toFixed(2)}`;
  
  const getTypeLabel = (type) => {
    const types = {
      'invoice': 'ΤΙΜΟΛΟΓΙΟ',
      'receipt': 'ΑΠΟΔΕΙΞΗ',
      'quote': 'ΠΡΟΣΦΟΡΑ',
      'proforma': 'ΠΡΟΤΙΜΟΛΟΓΙΟ'
    };
    return types[type] || 'ΠΑΡΑΣΤΑΤΙΚΟ';
  };

  const getTypeColor = (type) => {
    const colors = {
      'invoice': '#2196F3',
      'receipt': '#4CAF50',
      'quote': '#FF9800', 
      'proforma': '#9C27B0'
    };
    return colors[type] || '#2196F3';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="el">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${getTypeLabel(invoiceData.type)} ${invoiceData.invoiceNumber}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.4;
          color: #000;
          background: #fff;
          padding: 20mm;
          font-size: 11px;
        }
        
        .invoice-container {
          max-width: 170mm;
          margin: 0 auto;
          background: white;
          border: 1px solid #ddd;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .invoice-header {
          background: linear-gradient(135deg, ${getTypeColor(invoiceData.type)}22, ${getTypeColor(invoiceData.type)}11);
          border-bottom: 3px solid ${getTypeColor(invoiceData.type)};
          padding: 15px 20px;
          position: relative;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .company-info h1 {
          color: ${getTypeColor(invoiceData.type)};
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .company-details {
          font-size: 10px;
          color: #666;
          line-height: 1.3;
        }
        
        .invoice-type {
          text-align: right;
          background: ${getTypeColor(invoiceData.type)};
          color: white;
          padding: 8px 15px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
        }
        
        .invoice-number {
          text-align: right;
          font-size: 12px;
          font-weight: bold;
          color: #333;
        }
        
        .invoice-body { padding: 20px; }
        
        .parties-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 20px;
        }
        
        .party-info {
          flex: 1;
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          background: #fafafa;
        }
        
        .party-title {
          font-weight: bold;
          color: ${getTypeColor(invoiceData.type)};
          margin-bottom: 8px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 10px;
        }
        
        .items-table th {
          background: ${getTypeColor(invoiceData.type)};
          color: white;
          padding: 8px;
          text-align: left;
          font-weight: bold;
          font-size: 9px;
        }
        
        .items-table td {
          padding: 6px 8px;
          border-bottom: 1px solid #eee;
        }
        
        .items-table tr:nth-child(even) {
          background: #f9f9f9;
        }
        
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        .totals-section {
          margin-top: 20px;
          border-top: 2px solid ${getTypeColor(invoiceData.type)};
          padding-top: 15px;
        }
        
        .totals-table {
          width: 100%;
          font-size: 11px;
        }
        
        .totals-table td {
          padding: 4px 8px;
          border: none;
        }
        
        .total-row {
          font-weight: bold;
          font-size: 12px;
          background: ${getTypeColor(invoiceData.type)}22;
          border-top: 2px solid ${getTypeColor(invoiceData.type)};
        }
        
        .payment-info {
          margin-top: 20px;
          padding: 12px;
          background: #f8f9fa;
          border-left: 4px solid ${getTypeColor(invoiceData.type)};
          font-size: 10px;
        }
        
        .notes-section {
          margin-top: 15px;
          padding: 10px;
          background: #fff9e6;
          border: 1px solid #ffeb3b;
          border-radius: 4px;
          font-size: 10px;
        }
        
        .footer {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
          font-size: 8px;
          color: #999;
        }
        
        .tax-info {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          font-size: 9px;
          color: #666;
        }
        
        ${invoiceData.type === 'proforma' ? `
        .proforma-warning {
          background: #fff3cd;
          border: 1px solid #ffecb5;
          color: #856404;
          padding: 10px;
          margin: 15px 0;
          border-radius: 4px;
          text-align: center;
          font-weight: bold;
          font-size: 10px;
        }
        ` : ''}
        
        @media print {
          body { margin: 0; padding: 0; }
          .invoice-container { box-shadow: none; border: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="invoice-header">
          <div class="header-content">
            <div class="company-info">
              <h1>${invoiceData.companyName || 'ΕΤΑΙΡΙΑ ΑΕ'}</h1>
              <div class="company-details">
                ${invoiceData.companyAddress || 'Διεύθυνση Εταιρίας'}<br>
                ΤΚ: ${invoiceData.companyPostal || '12345'}, ${invoiceData.companyCity || 'Αθήνα'}<br>
                ΤΗΛ: ${invoiceData.companyPhone || '210-1234567'}<br>
                EMAIL: ${invoiceData.companyEmail || 'info@company.gr'}
              </div>
            </div>
            <div class="invoice-info">
              <div class="invoice-type">${getTypeLabel(invoiceData.type)}</div>
              <div class="invoice-number">
                <strong>Αρ. ${invoiceData.invoiceNumber}</strong><br>
                <span style="font-size: 10px;">Ημ/νία: ${formatDate(invoiceData.date)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="invoice-body">
          <!-- Parties Information -->
          <div class="parties-section">
            <div class="party-info">
              <div class="party-title">Στοιχεία Εκδότη</div>
              <strong>${invoiceData.companyName || 'ΕΤΑΙΡΙΑ ΑΕ'}</strong><br>
              ΑΦΜ: ${invoiceData.companyVAT || '123456789'}<br>
              ΔΟΥ: ${invoiceData.companyTaxOffice || 'Α\' ΑΘΗΝΩΝ'}<br>
              ${invoiceData.companyGEMI ? `ΓΕΜΗ: ${invoiceData.companyGEMI}<br>` : ''}
              ${invoiceData.companyActivity || 'Επαγγελματική Δραστηριότητα'}
            </div>
            <div class="party-info">
              <div class="party-title">Στοιχεία Πελάτη</div>
              <strong>${invoiceData.clientName}</strong><br>
              ${invoiceData.clientAddress || ''}<br>
              ${invoiceData.clientCity ? `${invoiceData.clientPostal || ''} ${invoiceData.clientCity}<br>` : ''}
              ${invoiceData.clientVAT ? `ΑΦΜ: ${invoiceData.clientVAT}<br>` : ''}
              ${invoiceData.clientTaxOffice ? `ΔΟΥ: ${invoiceData.clientTaxOffice}<br>` : ''}
              ${invoiceData.clientPhone ? `ΤΗΛ: ${invoiceData.clientPhone}` : ''}
            </div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 50px;">Α/Α</th>
                <th>Περιγραφή</th>
                <th style="width: 60px;" class="text-center">Ποσότητα</th>
                <th style="width: 80px;" class="text-right">Τιμή Μον.</th>
                <th style="width: 80px;" class="text-right">Σύνολο</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items?.map((item, index) => `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${item.description || ''}</td>
                  <td class="text-center">${item.quantity || 1}</td>
                  <td class="text-right">${formatCurrency(item.price)}</td>
                  <td class="text-right">${formatCurrency((item.quantity || 1) * (item.price || 0))}</td>
                </tr>
              `).join('') || `
                <tr>
                  <td class="text-center">1</td>
                  <td>Υπηρεσίες/Προϊόντα</td>
                  <td class="text-center">1</td>
                  <td class="text-right">${formatCurrency(invoiceData.subtotal || invoiceData.total)}</td>
                  <td class="text-right">${formatCurrency(invoiceData.subtotal || invoiceData.total)}</td>
                </tr>
              `}
            </tbody>
          </table>

          <!-- Totals -->
          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td style="width: 70%;"></td>
                <td><strong>Υποσύνολο:</strong></td>
                <td class="text-right"><strong>${formatCurrency(invoiceData.subtotal || invoiceData.total)}</strong></td>
              </tr>
              ${invoiceData.discountAmount > 0 ? `
              <tr>
                <td></td>
                <td>Έκπτωση (${invoiceData.discountPercentage || 0}%):</td>
                <td class="text-right">-${formatCurrency(invoiceData.discountAmount)}</td>
              </tr>
              ` : ''}
              ${invoiceData.vatAmount > 0 ? `
              <tr>
                <td></td>
                <td>ΦΠΑ (${invoiceData.vatPercentage || 24}%):</td>
                <td class="text-right">${formatCurrency(invoiceData.vatAmount)}</td>
              </tr>
              ` : ''}
              ${invoiceData.withholdingAmount > 0 ? `
              <tr>
                <td></td>
                <td>Παρακράτηση (${invoiceData.withholdingPercentage || 0}%):</td>
                <td class="text-right">-${formatCurrency(invoiceData.withholdingAmount)}</td>
              </tr>
              ` : ''}
              <tr class="total-row">
                <td></td>
                <td><strong>ΣΥΝΟΛΟ:</strong></td>
                <td class="text-right"><strong>${formatCurrency(invoiceData.total)}</strong></td>
              </tr>
            </table>
          </div>

          <!-- Payment Information -->
          ${invoiceData.paymentMethod || invoiceData.paymentTerms ? `
          <div class="payment-info">
            <strong>Στοιχεία Πληρωμής:</strong><br>
            ${invoiceData.paymentMethod ? `Τρόπος Πληρωμής: ${invoiceData.paymentMethod}<br>` : ''}
            ${invoiceData.paymentTerms ? `Όροι Πληρωμής: ${invoiceData.paymentTerms}<br>` : ''}
            ${invoiceData.bankAccount ? `Λογαριασμός: ${invoiceData.bankAccount}` : ''}
          </div>
          ` : ''}

          <!-- Notes -->
          ${invoiceData.notes ? `
          <div class="notes-section">
            <strong>Σημειώσεις:</strong><br>
            ${invoiceData.notes}
          </div>
          ` : ''}

          <!-- Tax Information -->
          <div class="tax-info">
            <div>
              <strong>Φορολογικά Στοιχεία:</strong><br>
              ${invoiceData.companyVAT ? `ΑΦΜ Εκδότη: ${invoiceData.companyVAT}` : ''}<br>
              ${invoiceData.companyTaxOffice ? `ΔΟΥ: ${invoiceData.companyTaxOffice}` : ''}
            </div>
            <div>
              <strong>Ημερομηνία Έκδοσης:</strong><br>
              ${formatDate(invoiceData.date)}
            </div>
          </div>

          ${invoiceData.type === 'proforma' ? `
          <div class="proforma-warning">
            <strong>ΠΡΟΣΟΧΗ:</strong> Το προτιμολόγιο δεν αποτελεί φορολογικό στοιχείο
          </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer">
            Εκτυπώθηκε: ${new Date().toLocaleDateString('el-GR')} ${new Date().toLocaleTimeString('el-GR')}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default InvoiceGenerator;
