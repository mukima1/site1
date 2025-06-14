// DOM Elements
const categoryBtns = document.querySelectorAll('.category-btn');
const presetBtns = document.querySelectorAll('.preset-btn');
const sourceOptions = document.querySelectorAll('input[name="source"]');
const imageSourceOptions = document.querySelectorAll('input[name="image-source"]');
const quoteText = document.getElementById('quote-text');
const authorName = document.getElementById('author-name');
const authorTitle = document.getElementById('author-title');
const uploadBtn = document.getElementById('upload-btn');
const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const fontFamily = document.getElementById('font-family');
const textColor = document.getElementById('text-color');
const bgTypeBtns = document.querySelectorAll('.bg-option-btn');
const bgColor = document.getElementById('bg-color');
const gradientColor = document.getElementById('gradient-color');
const gradientDirection = document.getElementById('gradient-direction');
const gradientControls = document.querySelector('.gradient-controls');
const addWatermark = document.getElementById('add-watermark');
const addBranding = document.getElementById('add-branding');
const generateBtn = document.getElementById('generate-btn');
const randomBtn = document.getElementById('random-btn');
const resetBtn = document.getElementById('reset-btn');
const sizeOptions = document.querySelectorAll('.size-option');
const quotePreview = document.getElementById('quote-preview');
const downloadPng = document.getElementById('download-png');
const downloadJpg = document.getElementById('download-jpg');
const shareBtn = document.getElementById('share-btn');

// Current settings
let currentSettings = {
    category: 'social',
    platform: 'twitter',
    source: 'famous',
    imageSource: 'stock',
    font: "'Montserrat', sans-serif",
    textColor: '#ffffff',
    bgType: 'solid',
    bgColor: '#1da1f2',
    gradientColor: '#0056b3',
    gradientDirection: 'to right',
    watermark: true,
    branding: true,
    size: 'square',
    customImage: null
};

// Sample quotes data with images
const sampleQuotes = {
    social: [
        {
            text: "The future of humanity is going to bifurcate in two directions: Either it's going to become multiplanetary, or it's going to remain confined to one planet and eventually there's going to be an extinction event.",
            author: "Elon Musk",
            title: "CEO of Tesla & SpaceX",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/800px-Elon_Musk_Royal_Society_%28crop2%29.jpg"
        },
        {
            text: "Success is not about how much money you make, it's about the difference you make in people's lives.",
            author: "Michelle Obama",
            title: "Former First Lady of the United States",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Michelle_Obama_2013_official_portrait.jpg/800px-Michelle_Obama_2013_official_portrait.jpg"
        },
        {
            text: "Your time is limited, so don't waste it living someone else's life.",
            author: "Steve Jobs",
            title: "Co-founder of Apple",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP.jpg/800px-Steve_Jobs_Headshot_2010-CROP.jpg"
        }
    ],
    personal: [
        {
            text: "Believe you can and you're halfway there.",
            author: "Theodore Roosevelt",
            title: "26th U.S. President",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/President_Roosevelt_-_Pach_Bros.jpg/800px-President_Roosevelt_-_Pach_Bros.jpg"
        },
        {
            text: "The only way to do great work is to love what you do.",
            author: "Steve Jobs",
            title: "Co-founder of Apple",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP.jpg/800px-Steve_Jobs_Headshot_2010-CROP.jpg"
        },
        {
            text: "Strive not to be a success, but rather to be of value.",
            author: "Albert Einstein",
            title: "Theoretical Physicist",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/800px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg"
        }
    ],
    inspiration: [
        {
            text: "In the middle of every difficulty lies opportunity.",
            author: "Albert Einstein",
            title: "Theoretical Physicist",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/800px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg"
        },
        {
            text: "The best way to predict the future is to create it.",
            author: "Peter Drucker",
            title: "Management Consultant",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Peter_Drucker.jpg/800px-Peter_Drucker.jpg"
        },
        {
            text: "Don't watch the clock; do what it does. Keep going.",
            author: "Sam Levenson",
            title: "Humorist",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Sam_Levenson_1975.JPG/800px-Sam_Levenson_1975.JPG"
        }
    ]
};

// Stock images for different categories
const stockImages = {
    social: [
        "https://source.unsplash.com/random/800x800/?business",
        "https://source.unsplash.com/random/800x800/?technology",
        "https://source.unsplash.com/random/800x800/?office"
    ],
    personal: [
        "https://source.unsplash.com/random/800x800/?portrait",
        "https://source.unsplash.com/random/800x800/?person",
        "https://source.unsplash.com/random/800x800/?face"
    ],
    inspiration: [
        "https://source.unsplash.com/random/800x800/?nature",
        "https://source.unsplash.com/random/800x800/?mountain",
        "https://source.unsplash.com/random/800x800/?sunset"
    ]
};

// Initialize the app
function init() {
    // Set event listeners
    setupEventListeners();
    
    // Initialize with default values
    updateQuoteSample();
    updatePlatformStyle();
    toggleImageUpload();
    toggleGradientControls();
    
    // Load html2canvas script dynamically if not already loaded
    loadHtml2Canvas();
}

function setupEventListeners() {
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSettings.category = btn.dataset.category;
            updateQuoteSample();
        });
    });

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSettings.platform = btn.dataset.preset;
            updatePlatformStyle();
        });
    });

    sourceOptions.forEach(option => {
        option.addEventListener('change', () => {
            currentSettings.source = option.id;
            updateQuoteSample();
        });
    });

    imageSourceOptions.forEach(option => {
        option.addEventListener('change', () => {
            currentSettings.imageSource = option.id;
            toggleImageUpload();
            updateImage();
        });
    });

    uploadBtn.addEventListener('click', () => {
        imageUpload.click();
    });

    imageUpload.addEventListener('change', handleImageUpload);

    quoteText.addEventListener('input', updateQuoteText);
    authorName.addEventListener('input', updateAuthorName);
    authorTitle.addEventListener('input', updateAuthorTitle);

    fontFamily.addEventListener('change', () => {
        currentSettings.font = fontFamily.value;
        updateTextStyle();
    });

    textColor.addEventListener('input', () => {
        currentSettings.textColor = textColor.value;
        updateTextStyle();
    });

    bgTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            bgTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSettings.bgType = btn.dataset.bgType;
            toggleGradientControls();
            updateBackground();
        });
    });

    bgColor.addEventListener('input', () => {
        currentSettings.bgColor = bgColor.value;
        updateBackground();
    });

    gradientColor.addEventListener('input', () => {
        currentSettings.gradientColor = gradientColor.value;
        updateBackground();
    });

    gradientDirection.addEventListener('change', () => {
        currentSettings.gradientDirection = gradientDirection.value;
        updateBackground();
    });

    addWatermark.addEventListener('change', () => {
        currentSettings.watermark = addWatermark.checked;
        updateWatermark();
    });

    addBranding.addEventListener('change', () => {
        currentSettings.branding = addBranding.checked;
        updateBranding();
    });

    generateBtn.addEventListener('click', generateQuote);
    randomBtn.addEventListener('click', randomizeDesign);
    resetBtn.addEventListener('click', resetDesign);

    sizeOptions.forEach(option => {
        option.addEventListener('click', () => {
            sizeOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            currentSettings.size = option.dataset.size;
            updateSize();
        });
    });

    downloadPng.addEventListener('click', () => downloadQuote('png'));
    downloadJpg.addEventListener('click', () => downloadQuote('jpg'));
    shareBtn.addEventListener('click', shareQuote);
}

function loadHtml2Canvas() {
    if (typeof html2canvas === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        script.onload = () => console.log('html2canvas loaded successfully');
        script.onerror = () => console.error('Failed to load html2canvas');
        document.head.appendChild(script);
    }
}

// Update quote sample based on category
function updateQuoteSample() {
    const quotes = sampleQuotes[currentSettings.category];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    quoteText.value = randomQuote.text;
    authorName.value = randomQuote.author;
    authorTitle.value = randomQuote.title;
    
    // Update image if using stock or famous person
    if (currentSettings.imageSource === 'stock' || currentSettings.source === 'famous') {
        const imageUrl = currentSettings.source === 'famous' ? randomQuote.image : 
                        stockImages[currentSettings.category][Math.floor(Math.random() * stockImages[currentSettings.category].length)];
        
        const authorImage = quotePreview.querySelector('.author-image');
        authorImage.style.backgroundImage = `url(${imageUrl})`;
        
        if (currentSettings.imageSource === 'stock') {
            imagePreview.innerHTML = '';
            const img = document.createElement('img');
            img.src = imageUrl;
            imagePreview.appendChild(img);
        }
    }
    
    updateQuoteText();
    updateAuthorName();
    updateAuthorTitle();
}

// Update platform style
function updatePlatformStyle() {
    // Remove all platform classes
    quotePreview.classList.remove(
        'twitter-style',
        'instagram-style',
        'facebook-style',
        'tiktok-style',
        'whatsapp-style'
    );
    
    // Add current platform class
    quotePreview.classList.add(`${currentSettings.platform}-style`);
    
    // Update platform watermark icon
    const watermarkIcon = quotePreview.querySelector('.platform-watermark i');
    if (watermarkIcon) {
        watermarkIcon.className = `fab fa-${currentSettings.platform}`;
    }
    
    // Update background color based on platform
    switch(currentSettings.platform) {
        case 'twitter':
            bgColor.value = '#1da1f2';
            break;
        case 'instagram':
            bgColor.value = '#e1306c';
            break;
        case 'facebook':
            bgColor.value = '#1877f2';
            break;
        case 'tiktok':
            bgColor.value = '#fe2c55';
            break;
        case 'whatsapp':
            bgColor.value = '#25d366';
            break;
    }
    
    currentSettings.bgColor = bgColor.value;
    updateBackground();
}

// Toggle image upload based on selection
function toggleImageUpload() {
    if (currentSettings.imageSource === 'custom') {
        uploadBtn.style.display = 'flex';
        imagePreview.querySelector('.placeholder-text').innerHTML = `
            <i class="fas fa-image"></i>
            <p>Upload your image</p>
        `;
    } else if (currentSettings.imageSource === 'stock') {
        uploadBtn.style.display = 'none';
        updateImage();
    } else {
        uploadBtn.style.display = 'none';
        updateImage();
    }
}

// Update the image based on current settings
function updateImage() {
    const authorImage = quotePreview.querySelector('.author-image');
    
    if (currentSettings.imageSource === 'none') {
        authorImage.style.backgroundImage = '';
        authorImage.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        imagePreview.innerHTML = `
            <div class="placeholder-text">
                <i class="fas fa-ban"></i>
                <p>No image will be used</p>
            </div>
        `;
    } else if (currentSettings.imageSource === 'stock') {
        const randomImage = stockImages[currentSettings.category][Math.floor(Math.random() * stockImages[currentSettings.category].length)];
        authorImage.style.backgroundImage = `url(${randomImage})`;
        imagePreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = randomImage;
        imagePreview.appendChild(img);
    } else if (currentSettings.imageSource === 'custom' && currentSettings.customImage) {
        authorImage.style.backgroundImage = `url(${currentSettings.customImage})`;
    }
}

// Handle image upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        // Validate image file
        if (!file.type.match('image.*')) {
            alert('Please select a valid image file (JPEG, PNG, etc.)');
            return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            // Store the image data
            currentSettings.customImage = event.target.result;
            
            // Display in preview
            imagePreview.innerHTML = '';
            const img = document.createElement('img');
            img.src = event.target.result;
            imagePreview.appendChild(img);
            
            // Set in quote preview
            const authorImage = quotePreview.querySelector('.author-image');
            authorImage.style.backgroundImage = `url(${event.target.result})`;
        };
        reader.onerror = function() {
            alert('Error reading the image file. Please try another image.');
        };
        reader.readAsDataURL(file);
    }
}

// Update quote text
function updateQuoteText() {
    const quoteDisplay = quotePreview.querySelector('.quote-text');
    if (quoteDisplay) {
        quoteDisplay.textContent = quoteText.value || 'Your generated quote will appear here with beautiful styling and professional design.';
    }
}

// Update author name
function updateAuthorName() {
    const authorDisplay = quotePreview.querySelector('.author-name');
    if (authorDisplay) {
        authorDisplay.textContent = authorName.value || 'Author Name';
    }
}

// Update author title
function updateAuthorTitle() {
    const titleDisplay = quotePreview.querySelector('.author-title');
    if (titleDisplay) {
        titleDisplay.textContent = authorTitle.value || 'Position/Title';
    }
}

// Update text style
function updateTextStyle() {
    const quoteDisplay = quotePreview.querySelector('.quote-content');
    if (quoteDisplay) {
        quoteDisplay.style.fontFamily = currentSettings.font;
        quoteDisplay.style.color = currentSettings.textColor;
    }
}

// Toggle gradient controls
function toggleGradientControls() {
    if (currentSettings.bgType === 'gradient') {
        gradientControls.classList.remove('hidden');
    } else {
        gradientControls.classList.add('hidden');
    }
    updateBackground();
}

// Update background
function updateBackground() {
    let bgValue;
    
    switch(currentSettings.bgType) {
        case 'solid':
            bgValue = currentSettings.bgColor;
            break;
        case 'gradient':
            if (currentSettings.gradientDirection === 'circle') {
                bgValue = `radial-gradient(circle, ${currentSettings.bgColor}, ${currentSettings.gradientColor})`;
            } else {
                bgValue = `linear-gradient(${currentSettings.gradientDirection}, ${currentSettings.bgColor}, ${currentSettings.gradientColor})`;
            }
            break;
        case 'image':
            // For image background, we would set a background image
            // This would be implemented when we have image background functionality
            bgValue = currentSettings.bgColor; // Fallback
            break;
        default:
            bgValue = currentSettings.bgColor;
    }
    
    quotePreview.style.background = bgValue;
}

// Update watermark visibility
function updateWatermark() {
    const watermark = quotePreview.querySelector('.platform-watermark');
    if (watermark) {
        watermark.style.display = currentSettings.watermark ? 'block' : 'none';
    }
}

// Update branding visibility
function updateBranding() {
    const branding = quotePreview.querySelector('.brand-watermark');
    if (branding) {
        branding.style.display = currentSettings.branding ? 'block' : 'none';
    }
}

// Update size
function updateSize() {
    switch(currentSettings.size) {
        case 'square':
            quotePreview.style.width = '500px';
            quotePreview.style.height = '500px';
            break;
        case 'story':
            quotePreview.style.width = '500px';
            quotePreview.style.height = '800px';
            break;
        case 'post':
            quotePreview.style.width = '800px';
            quotePreview.style.height = '500px';
            break;
        case 'custom':
            // For custom, we could add additional controls for exact dimensions
            quotePreview.style.width = '600px';
            quotePreview.style.height = '600px';
            break;
    }
}

// Generate quote
function generateQuote() {
    // Update all elements
    updateQuoteText();
    updateAuthorName();
    updateAuthorTitle();
    updateTextStyle();
    updateBackground();
    updateWatermark();
    updateBranding();
    updateSize();
    
    // Show success animation
    showSuccessAnimation();
}

function showSuccessAnimation() {
    const preview = document.getElementById('quote-display');
    preview.classList.add('success-animation');
    setTimeout(() => {
        preview.classList.remove('success-animation');
    }, 1000);
}

// Randomize design
function randomizeDesign() {
    // Random category
    const categories = ['social', 'personal', 'inspiration'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    document.querySelector(`.category-btn[data-category="${randomCategory}"]`).click();
    
    // Random platform
    const platforms = ['twitter', 'instagram', 'facebook', 'tiktok', 'whatsapp'];
    const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
    document.querySelector(`.preset-btn[data-preset="${randomPlatform}"]`).click();
    
    // Random source
    const sources = ['famous', 'personal', 'news'];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    document.getElementById(randomSource).checked = true;
    
    // Random image source
    const imageSources = ['stock', 'custom', 'none'];
    const randomImageSource = imageSources[Math.floor(Math.random() * imageSources.length)];
    document.getElementById(randomImageSource).checked = true;
    
    // Random font
    const fonts = [
        "'Montserrat', sans-serif",
        "'Playfair Display', serif",
        "'Poppins', sans-serif",
        "Arial, sans-serif",
        "Georgia, serif"
    ];
    const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
    fontFamily.value = randomFont;
    
    // Random colors
    const randomTextColor = getRandomColor();
    textColor.value = randomTextColor;
    
    const randomBgColor = getRandomColor();
    bgColor.value = randomBgColor;
    
    const randomGradientColor = getRandomColor();
    gradientColor.value = randomGradientColor;
    
    // Random gradient direction
    const directions = ['to right', 'to bottom', 'to bottom right', 'circle'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    gradientDirection.value = randomDirection;
    
    // Random bg type
    const bgTypes = ['solid', 'gradient', 'image'];
    const randomBgType = bgTypes[Math.floor(Math.random() * bgTypes.length)];
    document.querySelector(`.bg-option-btn[data-bg-type="${randomBgType}"]`).click();
    
    // Random size
    const sizes = ['square', 'story', 'post', 'custom'];
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
    document.querySelector(`.size-option[data-size="${randomSize}"]`).click();
    
    // Random watermark and branding
    addWatermark.checked = Math.random() > 0.5;
    addBranding.checked = Math.random() > 0.5;
    
    // Update all settings
    currentSettings = {
        category: randomCategory,
        platform: randomPlatform,
        source: randomSource,
        imageSource: randomImageSource,
        font: randomFont,
        textColor: randomTextColor,
        bgType: randomBgType,
        bgColor: randomBgColor,
        gradientColor: randomGradientColor,
        gradientDirection: randomDirection,
        watermark: addWatermark.checked,
        branding: addBranding.checked,
        size: randomSize,
        customImage: currentSettings.customImage // Preserve custom image if exists
    };
    
    // Update UI
    updateQuoteSample();
    updatePlatformStyle();
    toggleImageUpload();
    toggleGradientControls();
    updateTextStyle();
    updateBackground();
    updateWatermark();
    updateBranding();
    updateSize();
    
    // 30% chance to use a random image if custom is selected
    if (currentSettings.imageSource === 'custom' && Math.random() > 0.7) {
        const randomImageUrl = `https://source.unsplash.com/random/800x800/?${randomCategory},${Math.random()}`;
        currentSettings.customImage = randomImageUrl;
        
        const authorImage = quotePreview.querySelector('.author-image');
        authorImage.style.backgroundImage = `url(${randomImageUrl})`;
        
        imagePreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = randomImageUrl;
        imagePreview.appendChild(img);
    }
    
    // Show animation
    showSuccessAnimation();
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Reset design
function resetDesign() {
    // Reset to default settings
    document.querySelector('.category-btn[data-category="social"]').click();
    document.querySelector('.preset-btn[data-preset="twitter"]').click();
    document.getElementById('famous').checked = true;
    document.getElementById('stock').checked = true;
    
    quoteText.value = '';
    authorName.value = '';
    authorTitle.value = '';
    
    fontFamily.value = "'Montserrat', sans-serif";
    textColor.value = '#ffffff';
    
    document.querySelector('.bg-option-btn[data-bg-type="solid"]').click();
    bgColor.value = '#1da1f2';
    gradientColor.value = '#0056b3';
    gradientDirection.value = 'to right';
    
    addWatermark.checked = true;
    addBranding.checked = true;
    
    document.querySelector('.size-option[data-size="square"]').click();
    
    currentSettings = {
        category: 'social',
        platform: 'twitter',
        source: 'famous',
        imageSource: 'stock',
        font: "'Montserrat', sans-serif",
        textColor: '#ffffff',
        bgType: 'solid',
        bgColor: '#1da1f2',
        gradientColor: '#0056b3',
        gradientDirection: 'to right',
        watermark: true,
        branding: true,
        size: 'square',
        customImage: null
    };
    
    // Update UI
    updateQuoteSample();
    updatePlatformStyle();
    toggleImageUpload();
    toggleGradientControls();
    updateTextStyle();
    updateBackground();
    updateWatermark();
    updateBranding();
    updateSize();
    
    // Reset image preview
    imagePreview.innerHTML = `
        <div class="placeholder-text">
            <i class="fas fa-image"></i>
            <p>Image preview will appear here</p>
        </div>
    `;
    
    const authorImage = quotePreview.querySelector('.author-image');
    authorImage.style.backgroundImage = '';
    authorImage.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
}

// Download quote as image
function downloadQuote(format) {
    if (typeof html2canvas === 'undefined') {
        alert('The image conversion library is still loading. Please try again in a few seconds.');
        return;
    }
    
    // Show loading indicator
    const previewContainer = document.getElementById('quote-display');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<div class="spinner"></div><p>Generating image...</p>';
    previewContainer.appendChild(loadingIndicator);
    
    // Options for html2canvas
    const options = {
        scale: 2, // Higher quality
        logging: false,
        useCORS: true, // For cross-origin images
        allowTaint: true,
        backgroundColor: null // Transparent background for PNG
    };
    
    // Capture the quote preview
    html2canvas(quotePreview, options).then(canvas => {
        // Remove loading indicator
        previewContainer.removeChild(loadingIndicator);
        
        // Create download link
        const link = document.createElement('a');
        let filename = `quote-${new Date().getTime()}`;
        
        if (format === 'png') {
            link.href = canvas.toDataURL('image/png');
            filename += '.png';
        } else {
            link.href = canvas.toDataURL('image/jpeg', 0.9); // 0.9 quality for JPG
            filename += '.jpg';
        }
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }).catch(err => {
        console.error('Error generating image:', err);
        previewContainer.removeChild(loadingIndicator);
        alert('Error generating the image. Please try again.');
    });
}

// Share quote
function shareQuote() {
    if (navigator.share) {
        // Use Web Share API if available
        navigator.share({
            title: 'Check out this awesome quote!',
            text: `${quoteText.value} - ${authorName.value}`,
            url: window.location.href
        }).catch(err => {
            console.log('Error sharing:', err);
            fallbackShare();
        });
    } else {
        fallbackShare();
    }
}

function fallbackShare() {
    // Fallback for browsers without Web Share API
    const text = `${quoteText.value}\n\n- ${authorName.value}\n\nCreated with Ultimate100FreeTools Quote Generator`;
    const url = window.location.href;
    
    // Try to copy to clipboard
    if (navigator.clipboard) {
        navigator.clipboard.writeText(`${text}\n\n${url}`).then(() => {
            alert('Copied to clipboard! You can now paste it anywhere.');
        }).catch(err => {
            console.error('Failed to copy:', err);
            prompt('Copy this text to share:', `${text}\n\n${url}`);
        });
    } else {
        prompt('Copy this text to share:', `${text}\n\n${url}`);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add some CSS for loading indicator and animations
const style = document.createElement('style');
style.textContent = `
    .loading-indicator {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    
    .loading-indicator p {
        margin-top: 10px;
        font-weight: 600;
        color: var(--primary-color);
    }
    
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(67, 97, 238, 0.2);
        border-radius: 50%;
        border-top-color: var(--primary-color);
        animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .success-animation {
        animation: pulse 0.5s ease;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);