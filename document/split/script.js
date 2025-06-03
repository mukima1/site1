document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const dropArea = document.getElementById('dropArea');
    const splitBtn = document.getElementById('splitBtn');
    const splitMethod = document.getElementById('splitMethod');
    const optionContents = document.querySelectorAll('.option-content');
    const previewContainer = document.getElementById('previewContainer');
    const resultsDiv = document.getElementById('results');
    const downloadLinks = document.getElementById('downloadLinks');
    const pageCountSpan = document.getElementById('pageCount');
    
    let pdfFile = null;
    let pdfDoc = null;
    let pageCount = 0;
    
    // Handle file selection
    dropArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', async (e) => {
        if (e.target.files.length) {
            pdfFile = e.target.files[0];
            await loadPdf(pdfFile);
        }
    });
    
    // Handle drag and drop
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('dragover');
    });
    
    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('dragover');
    });
    
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            pdfFile = e.dataTransfer.files[0];
            if (pdfFile.type === 'application/pdf') {
                loadPdf(pdfFile);
            } else {
                alert('Please upload a PDF file.');
            }
        }
    });
    
    // Handle split method change
    splitMethod.addEventListener('change', () => {
        optionContents.forEach(content => content.style.display = 'none');
        document.getElementById(splitMethod.value + 'Pages').style.display = 'block';
    });
    
    // Handle split button click
    splitBtn.addEventListener('click', async () => {
        if (!pdfDoc) return;
        
        const method = splitMethod.value;
        let pageRanges = [];
        
        try {
            if (method === 'single') {
                const pagesInput = document.getElementById('pageNumbers').value.trim();
                pageRanges = parsePageNumbers(pagesInput);
            } 
            else if (method === 'range') {
                const rangesInput = document.getElementById('ranges').value.trim();
                pageRanges = parsePageRanges(rangesInput);
            } 
            else if (method === 'every') {
                const n = parseInt(document.getElementById('nValue').value);
                if (n < 1) throw new Error('N must be at least 1');
                pageRanges = splitEveryNPages(n);
            }
            
            if (pageRanges.length === 0) {
                throw new Error('No valid page ranges specified');
            }
            
            const splitDocs = await splitPdf(pdfDoc, pageRanges);
            showResults(splitDocs, pageRanges);
            
        } catch (error) {
            alert('Error: ' + error.message);
            console.error(error);
        }
    });
    
    // Load PDF file and show preview
    async function loadPdf(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            pageCount = pdfDoc.getPageCount();
            pageCountSpan.textContent = `(${pageCount} pages)`;
            
            await renderPreview();
            splitBtn.disabled = false;
            
        } catch (error) {
            alert('Error loading PDF: ' + error.message);
            console.error(error);
        }
    }
    
    // Render PDF preview thumbnails
    async function renderPreview() {
        previewContainer.innerHTML = '';
        
        // For demo purposes, we'll just show page numbers
        // In a real app, you might use PDF.js to render actual thumbnails
        for (let i = 0; i < pageCount; i++) {
            const pageDiv = document.createElement('div');
            pageDiv.className = 'page-thumbnail';
            pageDiv.innerHTML = `
                <div style="width:100px;height:141px;background:#eee;display:flex;align-items:center;justify-content:center;">
                    Page ${i + 1}
                </div>
                <small>Page ${i + 1}</small>
            `;
            previewContainer.appendChild(pageDiv);
        }
    }
    
    // Parse single page numbers input (e.g., "1,3,5-7")
    function parsePageNumbers(input) {
        if (!input) throw new Error('Please enter page numbers');
        
        const parts = input.split(',');
        const pages = new Set();
        
        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(Number);
                if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > pageCount) {
                    throw new Error(`Invalid page range: ${part}`);
                }
                for (let i = start; i <= end; i++) {
                    pages.add(i);
                }
            } else {
                const num = Number(part);
                if (isNaN(num) || num < 1 || num > pageCount) {
                    throw new Error(`Invalid page number: ${part}`);
                }
                pages.add(num);
            }
        }
        
        // Convert to array of single-page ranges
        return Array.from(pages).sort((a, b) => a - b).map(p => [p, p]);
    }
    
    // Parse page ranges input (one per line)
    function parsePageRanges(input) {
        if (!input) throw new Error('Please enter page ranges');
        
        const lines = input.split('\n');
        const ranges = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            if (trimmed.includes('-')) {
                const [start, end] = trimmed.split('-').map(Number);
                if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > pageCount) {
                    throw new Error(`Invalid page range: ${trimmed}`);
                }
                ranges.push([start, end]);
            } else {
                const num = Number(trimmed);
                if (isNaN(num) || num < 1 || num > pageCount) {
                    throw new Error(`Invalid page number: ${trimmed}`);
                }
                ranges.push([num, num]);
            }
        }
        
        return ranges;
    }
    
    // Generate page ranges for splitting every N pages
    function splitEveryNPages(n) {
        const ranges = [];
        let start = 1;
        
        while (start <= pageCount) {
            const end = Math.min(start + n - 1, pageCount);
            ranges.push([start, end]);
            start = end + 1;
        }
        
        return ranges;
    }
    
    // Split PDF according to page ranges
    async function splitPdf(pdfDoc, pageRanges) {
        const resultDocs = [];
        
        for (const [start, end] of pageRanges) {
            const newPdf = await PDFLib.PDFDocument.create();
            
            // Copy pages (note: pdf-lib uses 0-based indexing)
            for (let i = start - 1; i < end; i++) {
                const [page] = await newPdf.copyPages(pdfDoc, [i]);
                newPdf.addPage(page);
            }
            
            const pdfBytes = await newPdf.save();
            resultDocs.push(pdfBytes);
        }
        
        return resultDocs;
    }
    
    // Show download links for split PDFs
    function showResults(splitDocs, pageRanges) {
        downloadLinks.innerHTML = '';
        
        splitDocs.forEach((pdfBytes, i) => {
            const [start, end] = pageRanges[i];
            const rangeText = start === end ? `Page ${start}` : `Pages ${start}-${end}`;
            
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.className = 'download-link';
            link.download = `split_${i + 1}_${rangeText.replace(/\s+/g, '_')}.pdf`;
            link.textContent = `Download ${rangeText}`;
            
            downloadLinks.appendChild(link);
        });
        
        resultsDiv.style.display = 'block';
    }
});