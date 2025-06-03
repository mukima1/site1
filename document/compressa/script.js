document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const dropArea = document.getElementById('dropArea');
    const fileInfo = document.getElementById('fileInfo');
    const compressBtn = document.getElementById('compressBtn');
    const resultsDiv = document.getElementById('results');
    const downloadLink = document.getElementById('downloadLink');
    
    // Compression options
    const removeMetadata = document.getElementById('removeMetadata');
    const flattenAnnotations = document.getElementById('flattenAnnotations');
    const optimizeImages = document.getElementById('optimizeImages');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    
    // Result elements
    const originalSizeEl = document.getElementById('originalSize');
    const compressedSizeEl = document.getElementById('compressedSize');
    const reductionEl = document.getElementById('reduction');
    
    let pdfFile = null;
    let originalSize = 0;
    
    // Update quality value display
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = `${qualitySlider.value}%`;
    });
    
    // Handle file selection
    dropArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', async (e) => {
        if (e.target.files.length) {
            pdfFile = e.target.files[0];
            originalSize = pdfFile.size;
            updateFileInfo();
            compressBtn.disabled = false;
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
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf') {
                pdfFile = file;
                originalSize = pdfFile.size;
                updateFileInfo();
                compressBtn.disabled = false;
            } else {
                alert('Please upload a PDF file.');
            }
        }
    });
    
    // Handle compress button click
    compressBtn.addEventListener('click', async () => {
        if (!pdfFile) return;
        
        try {
            compressBtn.disabled = true;
            compressBtn.textContent = 'Compressing...';
            
            const compressedPdfBytes = await compressPdf(pdfFile);
            
            // Show results
            showResults(compressedPdfBytes);
            
        } catch (error) {
            alert('Error compressing PDF: ' + error.message);
            console.error(error);
        } finally {
            compressBtn.disabled = false;
            compressBtn.textContent = 'Compress PDF';
        }
    });
    
    // Update file info display
    function updateFileInfo() {
        fileInfo.textContent = `${pdfFile.name} (${formatFileSize(originalSize)})`;
        resultsDiv.style.display = 'none';
    }
    
    // Format file size in KB/MB
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
        else return (bytes / 1048576).toFixed(2) + ' MB';
    }
    
    // Calculate percentage reduction
    function calculateReduction(original, compressed) {
        const reduction = ((original - compressed) / original) * 100;
        return reduction.toFixed(2) + '%';
    }
    
    // Main compression function
    async function compressPdf(file) {
        const arrayBuffer = await file.arrayBuffer();
        
        // Load the PDF document
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, {
            ignoreEncryption: true,
        });
        
        // Remove metadata if option is checked
        if (removeMetadata.checked) {
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('');
            pdfDoc.setCreator('');
            pdfDoc.setCreationDate(new Date(0));
            pdfDoc.setModificationDate(new Date(0));
        }
        
        // Flatten annotations if option is checked
        if (flattenAnnotations.checked) {
            // Note: PDF-Lib doesn't directly support annotation flattening
            // This would require more advanced processing
        }
        
        // Optimize images if option is checked
        if (optimizeImages.checked) {
            const quality = parseInt(qualitySlider.value) / 100;
            const pages = pdfDoc.getPages();
            
            for (const page of pages) {
                const images = await page.node.context.enumerateIndirectObjects();
                
                for (const [ref, obj] of images) {
                    if (obj instanceof PDFLib.PDFImage) {
                        try {
                            // This is a simplified approach - actual image compression would require
                            // more sophisticated processing or a different library
                            const imageBytes = await obj.decode();
                            const resizedBytes = await resizeImage(imageBytes, quality);
                            await obj.reset(resizedBytes, obj.getWidth(), obj.getHeight());
                        } catch (error) {
                            console.warn('Failed to optimize image:', error);
                        }
                    }
                }
            }
        }
        
        // Save with compression options
        const pdfBytes = await pdfDoc.save({
            useObjectStreams: true,
            // PDF-Lib doesn't support direct compression options
            // This is where you might integrate with a more advanced library
        });
        
        return pdfBytes;
    }
    
    // Simulated image resizing function
    // In a real implementation, you would use the browser's Canvas API or a library like pica
    async function resizeImage(imageBytes, quality) {
        // This is a placeholder - actual implementation would:
        // 1. Create an Image object from the bytes
        // 2. Draw to a canvas with reduced quality
        // 3. Export the canvas to compressed image data
        
        // For this demo, we'll just return the original bytes
        // In a real app, you would implement proper image compression
        return imageBytes;
    }
    
    // Show compression results
    function showResults(compressedPdfBytes) {
        const compressedSize = compressedPdfBytes.byteLength;
        
        originalSizeEl.textContent = formatFileSize(originalSize);
        compressedSizeEl.textContent = formatFileSize(compressedSize);
        reductionEl.textContent = calculateReduction(originalSize, compressedSize);
        
        // Create download link
        const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        downloadLink.href = url;
        downloadLink.download = `compressed_${pdfFile.name.replace('.pdf', '')}.pdf`;
        
        resultsDiv.style.display = 'block';
    }
});