// script.js
let stream = null;
let currentMode = 'auto';
let scanHistory = JSON.parse(localStorage.getItem('lensHistory')) || [];

const modes = [
    { id: 'auto', icon: '🔍', name: 'Auto Search' },
    { id: 'text', icon: '📝', name: 'Text &amp; Translate' },
    { id: 'plant', icon: '🌿', name: 'Plants &amp; Animals' },
    { id: 'product', icon: '🛍️', name: 'Shopping' },
    { id: 'place', icon: '🏛️', name: 'Places' },
    { id: 'qr', icon: '📱', name: 'QR / Barcode' }
];

const demoResults = {
    auto: { title: "Wireless Headphones", subtitle: "Sony WH-1000XM5 • $398", match: "98%", info: "Premium noise-cancelling headphones. Available at Amazon, Best Buy." },
    text: { title: "Detected Text", subtitle: "Hello, how are you today?", match: "100%", info: "Translated to Spanish: Hola, ¿cómo estás hoy?" },
    plant: { title: "Monstera Deliciosa", subtitle: "Swiss Cheese Plant", match: "95%", info: "Popular indoor plant. Needs indirect light and weekly watering." },
    product: { title: "Red Sneakers", subtitle: "Nike Air Force 1", match: "92%", info: "Similar products found near you for $89–$120." },
    place: { title: "Eiffel Tower", subtitle: "Paris, France", match: "99%", info: "Iconic landmark. Open today 9AM–11PM." },
    qr: { title: "QR Code Detected", subtitle: "https://example.com", match: "100%", info: "Link copied to clipboard!" }
};

// Initialize
$(document).ready(function () {
    renderModes();
    renderHistory();
    console.log('%c📸 AI Lens Web initialized – Ready to identify anything!', 'color:#4285f4;font-weight:bold');
});

function renderModes() {
    // Mode pills in camera
    const pillsHTML = modes.map(m => 
        `<button onclick="setMode('${m.id}')" class="mode-pill btn btn-outline-light rounded-pill px-4 py-2 d-flex align-items-center gap-2 ${m.id === currentMode ? 'active' : ''}">
            <span>${m.icon}</span> ${m.name}
        </button>`
    ).join('');
    $('#mode-pills').html(pillsHTML);

    // Modes grid
    const gridHTML = modes.map(m => `
        <div class="col-6 col-md-4 col-lg-2">
            <div onclick="setMode('${m.id}'); simulateScan('${m.id}');" class="card bg-dark border-0 text-center p-4 result-card h-100">
                <div class="fs-1 mb-3">${m.icon}</div>
                <h6>${m.name}</h6>
            </div>
        </div>
    `).join('');
    $('#modes-grid').html(gridHTML);
}

function setMode(mode) {
    currentMode = mode;
    renderModes();
}

async function startCamera() {
    const placeholder = document.getElementById('camera-placeholder');
    placeholder.style.display = 'none';
    
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const video = document.getElementById('video-feed');
        video.srcObject = stream;
        video.play();
        
        // Start fake AR detection loop
        startARSimulation();
    } catch (err) {
        alert("📸 Camera access denied or not available. Try uploading a photo instead.");
        placeholder.style.display = 'flex';
    }
}

function usePhotoUpload() {
    document.getElementById('photo-upload').click();
}

document.getElementById('photo-upload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function (ev) {
        const video = document.getElementById('video-feed');
        video.srcObject = null;
        video.poster = ev.target.result;
        document.getElementById('camera-placeholder').style.display = 'none';
        simulateScan(currentMode);
    };
    reader.readAsDataURL(file);
});

function startARSimulation() {
    const canvas = document.getElementById('ar-overlay');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 480;
    
    let frame = 0;
    const interval = setInterval(() => {
        if (!stream) { clearInterval(interval); return; }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Fake AR bounding box
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(180 + Math.sin(frame/10)*20, 120, 440, 240);
        
        // Fake label
        document.getElementById('ar-label').classList.remove('d-none');
        document.getElementById('detected-object').textContent = 'Detected: Headphones';
        
        frame++;
        if (frame > 60) {
            clearInterval(interval);
            simulateScan(currentMode);
        }
    }, 80);
}

function simulateScan(mode) {
    const resultsHTML = `
    <div class="col-lg-8 mx-auto">
        <div class="card bg-dark border-primary result-card">
            <div class="card-body p-4">
                <div class="d-flex gap-4">
                    <div class="flex-shrink-0">
                        <div class="bg-secondary rounded-4" style="width:180px;height:180px;background:url('https://picsum.photos/id/${Math.floor(Math.random()*100)+10}/600/600') center/cover;"></div>
                    </div>
                    <div class="flex-grow-1">
                        <span class="badge bg-success mb-2">${demoResults[mode].match} Match</span>
                        <h3>${demoResults[mode].title}</h3>
                        <p class="text-info">${demoResults[mode].subtitle}</p>
                        <p class="text-muted">${demoResults[mode].info}</p>
                        <div class="mt-4">
                            <button onclick="saveToHistory()" class="btn btn-outline-primary me-3">💾 Save to History</button>
                            <button onclick="copyToClipboard()" class="btn btn-primary">🔗 Search on Web</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    
    $('#results-container').html(resultsHTML);
    
    // Add to history
    setTimeout(() => {
        scanHistory.unshift({
            mode: mode,
            title: demoResults[mode].title,
            subtitle: demoResults[mode].subtitle,
            time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
        });
        if (scanHistory.length > 8) scanHistory.pop();
        localStorage.setItem('lensHistory', JSON.stringify(scanHistory));
        renderHistory();
    }, 1200);
}

function saveToHistory() {
    alert("✅ Saved to your Lens History!");
}

function copyToClipboard() {
    alert("🔗 Link copied – ready to search on the web!");
}

function renderHistory() {
    if (scanHistory.length === 0) {
        $('#history-grid').html(`<div class="col-12 text-center py-5 text-muted">No scans yet. Start identifying with the camera above!</div>`);
        return;
    }
    
    const html = scanHistory.map(item => `
        <div class="col-md-4 col-lg-3">
            <div class="card bg-dark border-primary h-100">
                <div class="card-body">
                    <small class="text-muted">${item.time}</small>
                    <h6 class="mt-2">${item.title}</h6>
                    <p class="small text-info">${item.subtitle}</p>
                </div>
            </div>
        </div>
    `).join('');
    $('#history-grid').html(html);
}
