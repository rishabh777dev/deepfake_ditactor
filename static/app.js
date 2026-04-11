// ═══════════════════════════════════════════════
// TruthGuard AI — Frontend Logic (v2 with multi-media)
// ═══════════════════════════════════════════════

// ─── Background Particles ──────────────────────
function createParticles() {
    const container = document.getElementById('bgParticles');
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'];
    for (let i = 0; i < 25; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 6 + 2;
        p.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            animation-duration: ${Math.random() * 20 + 15}s;
            animation-delay: ${Math.random() * 15}s;
            filter: blur(${Math.random() * 2}px);
        `;
        container.appendChild(p);
    }
}

// ─── Media Type Config ────────────────────────
const MEDIA_CONFIG = {
    audio: {
        icon: '🎤',
        previewIcon: '🎵',
        title: 'Upload Audio for Analysis',
        desc: 'Drag & drop an audio file or click to browse',
        formats: 'Supports: MP3, WAV, OGG, M4A, WEBM',
        btnText: 'Choose Audio File',
        accept: 'audio/*',
    },
    video: {
        icon: '🎬',
        previewIcon: '🎞️',
        title: 'Upload Video for Analysis',
        desc: 'Drag & drop a video file or click to browse',
        formats: 'Supports: MP4, MOV, AVI, WEBM, MKV',
        btnText: 'Choose Video File',
        accept: 'video/*',
    },
    image: {
        icon: '🖼️',
        previewIcon: '🖼️',
        title: 'Upload Image for Analysis',
        desc: 'Drag & drop an image or click to browse',
        formats: 'Supports: JPG, PNG, WEBP, GIF, BMP',
        btnText: 'Choose Image File',
        accept: 'image/*',
    },
    text: {
        // Handled specially
    }
};

let currentMediaType = 'audio';
let selectedFile = null;

// ─── DOM References ───────────────────────────
const audioInput    = document.getElementById('audioInput');
const uploadBtn     = document.getElementById('uploadBtn');
const dropZone      = document.getElementById('dropZone');
const textZone      = document.getElementById('textZone');
const textClaimInput = document.getElementById('textClaimInput');
const analyzeTextBtn = document.getElementById('analyzeTextBtn');
const filePreview   = document.getElementById('filePreview');
const fileNameEl    = document.getElementById('fileName');
const fileSizeEl    = document.getElementById('fileSize');
const removeFileBtn = document.getElementById('removeFile');
const analyzeBtn    = document.getElementById('analyzeBtn');
const progressSection = document.getElementById('progressSection');
const resultsSection  = document.getElementById('resultsSection');
const uploadSection   = document.querySelector('.upload-section');

// ─── Tab Switching ────────────────────────────
document.querySelectorAll('.media-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Reset file and text
        selectedFile = null;
        audioInput.value = '';
        textClaimInput.value = '';
        filePreview.style.display = 'none';

        // Update active tab
        document.querySelectorAll('.media-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentMediaType = tab.dataset.type;

        // Display correct zone
        if (currentMediaType === 'text') {
            dropZone.style.display = 'none';
            textZone.style.display = 'block';
        } else {
            textZone.style.display = 'none';
            dropZone.style.display = 'block';
            
            // Update UI for media
            const cfg = MEDIA_CONFIG[currentMediaType];
            document.getElementById('uploadIcon').textContent = cfg.icon;
            document.getElementById('uploadTitle').textContent = cfg.title;
            document.getElementById('uploadDesc').textContent = cfg.desc;
            document.getElementById('uploadFormats').textContent = cfg.formats;
            document.getElementById('uploadBtnText').textContent = cfg.btnText;
            audioInput.accept = cfg.accept;
        }
    });
});

// ─── Upload Handling ──────────────────────────
uploadBtn.addEventListener('click', () => audioInput.click());
dropZone.addEventListener('click', (e) => {
    if (e.target !== uploadBtn) audioInput.click();
});

audioInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleFileSelect(e.target.files[0]);
});

// Drag & Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
});

function handleFileSelect(file) {
    selectedFile = file;
    const cfg = MEDIA_CONFIG[currentMediaType];
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatBytes(file.size);
    document.getElementById('previewIcon').textContent = cfg.previewIcon;
    filePreview.style.display = 'block';
    dropZone.style.display = 'none';
}

removeFileBtn.addEventListener('click', () => {
    selectedFile = null;
    audioInput.value = '';
    filePreview.style.display = 'none';
    dropZone.style.display = 'block';
});

// ─── Analysis (Video/Image/Audio) ─────────────
analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    await performAnalysis('/api/analyze', true);
});

// ─── Fact-Check (Text) ────────────────────────
analyzeTextBtn.addEventListener('click', async () => {
    if (!textClaimInput.value.trim()) {
        alert("Please paste a claim or news snippet first.");
        return;
    }
    await performAnalysis('/api/factcheck', false);
});

async function performAnalysis(endpoint, isFormData) {
    let btnText, btnLoading, btn;
    if (isFormData) {
        btn = analyzeBtn;
        btnText = document.querySelector('.analyze-btn-text');
        btnLoading = document.querySelector('.analyze-btn-loading');
    } else {
        btn = analyzeTextBtn;
        btnText = analyzeTextBtn.querySelector('.analyze-btn-text');
        btnLoading = analyzeTextBtn.querySelector('.analyze-btn-loading');
    }

    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    btn.disabled = true;

    uploadSection.style.display = 'none';
    progressSection.style.display = 'flex';
    resultsSection.style.display = 'none';

    await animateSteps();

    try {
        let options = { method: 'POST' };
        if (isFormData) {
            const formData = new FormData();
            formData.append('media', selectedFile);
            options.body = formData;
        } else {
            options.headers = { 'Content-Type': 'application/json' };
            options.body = JSON.stringify({ claim: textClaimInput.value.trim() });
        }

        const response = await fetch(endpoint, options);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();

        progressSection.style.display = 'none';
        displayResults(data);

    } catch (err) {
        console.error(err);
        progressSection.style.display = 'none';
        uploadSection.style.display = 'flex';
        alert(`Analysis failed: ${err.message}`);
    } finally {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        btn.disabled = false;
    }
}

async function animateSteps() {
    const steps  = ['step1', 'step2', 'step3', 'step4'];
    const delays = [300, 900, 1500, 2100];
    for (let i = 0; i < steps.length; i++) {
        await sleep(delays[i]);
        document.getElementById(steps[i]).classList.add('active');
        if (i > 0) {
            document.getElementById(steps[i-1]).classList.remove('active');
            document.getElementById(steps[i-1]).classList.add('done');
        }
    }
    await sleep(700);
    document.getElementById(steps[steps.length-1]).classList.remove('active');
    document.getElementById(steps[steps.length-1]).classList.add('done');
}

// ─── Display Results ──────────────────────────
function displayResults(data) {
    resultsSection.style.display = 'block';

    const verdict  = data.verdict;
    const score    = data.confidence_score;
    const isText   = (data.file_info && data.file_info.media_type === 'TEXT');

    const verdictCard  = document.getElementById('verdictCard');
    const verdictBadge = document.getElementById('verdictBadge');
    const scoreValueEl = document.getElementById('scoreValue');
    const verdictText  = document.getElementById('verdictText');
    const verdictDesc  = document.getElementById('verdictDesc');
    const scoreRing    = document.getElementById('scoreRingFill');

    if (isText) {
        // --- FACT CHECK LOGIC ---
        const classMap = { 'FALSE': 'fake', 'MISLEADING': 'suspicious', 'TRUE': 'real', 'UNVERIFIABLE': 'suspicious' };
        verdictCard.className = 'verdict-card ' + (classMap[verdict] || 'real');

        const badgeMap = { 'FALSE': '🚨 DANGEROUS DISINFORMATION', 'MISLEADING': '⚠️ MISLEADING CLAIM', 'TRUE': '✅ VERIFIED FACT', 'UNVERIFIABLE': '🔍 UNVERIFIABLE CLAIM' };
        verdictBadge.textContent = badgeMap[verdict] || verdict;

        verdictText.textContent = verdict;
        verdictDesc.textContent = data.explanation || '';

        animateNumber(scoreValueEl, 0, score, 1800);
        
        const circumference = 534;
        setTimeout(() => {
            scoreRing.style.strokeDashoffset = circumference - (score / 100) * circumference;
        }, 200);

        // Hide media cards
        document.getElementById('voiceCard').style.display = 'none';
        document.getElementById('spectralCard').style.display = 'none';
        
        // Show Gemini card for OSINT details
        const geminiCard = document.getElementById('geminiCard');
        geminiCard.style.display = 'block';
        document.querySelector('#geminiCard h3').textContent = 'OSINT Search Context';
        
        document.getElementById('geminiTranscript').style.display = 'block';
        document.querySelector('#geminiTranscript .transcript-label').textContent = 'Sources Analyzed';
        
        if (data.sources && data.sources.length > 0) {
            document.getElementById('transcriptText').innerHTML = data.sources.map(s => `<a href="${s}" target="_blank" style="color:var(--accent-cyan)">${s}</a>`).join('<br>');
        } else {
            document.getElementById('transcriptText').textContent = "No definitive sources could be retrieved.";
        }
        
        document.getElementById('geminiStats').innerHTML = '';
        document.getElementById('geminiAssessment').textContent = '';
        document.getElementById('geminiFlags').innerHTML = '';

        // Recommendations
        const recsList = document.getElementById('recsList');
        recsList.innerHTML = `<div class="rec-item">Source verification completed using Live DuckDuckGo OSINT analysis joined with Gemini inference.</div>`;
        
    } else {
        // --- MEDIA DEEPFAKE LOGIC ---
        const analysis = data.analysis;
        const classMap = { 'FAKE': 'fake', 'SUSPICIOUS': 'suspicious', 'LIKELY REAL': 'real' };
        verdictCard.className = 'verdict-card ' + (classMap[verdict] || 'real');

        const badgeMap = { 'FAKE': '🚨 DEEPFAKE DETECTED', 'SUSPICIOUS': '⚠️ SUSPICIOUS', 'LIKELY REAL': '✅ LIKELY AUTHENTIC' };
        verdictBadge.textContent = badgeMap[verdict] || verdict;

        const descMap = {
            'FAKE': 'Our AI has detected strong indicators of synthetic manipulation. This content is very likely a deepfake.',
            'SUSPICIOUS': 'This content shows anomalies that may indicate manipulation. Treat with caution.',
            'LIKELY REAL': 'No significant indicators of deepfake manipulation were found.',
        };
        verdictText.textContent = verdict;
        verdictDesc.textContent = descMap[verdict] || '';

        animateNumber(scoreValueEl, 0, score, 1800);

        const circumference = 534;
        setTimeout(() => {
            scoreRing.style.strokeDashoffset = circumference - (score / 100) * circumference;
        }, 200);

        // Primary Analysis (Voice / Motion / Visual)
        const prim = analysis ? analysis.primary : null;
    if (prim) {
        document.getElementById('voiceCard').style.display = 'block';
        document.querySelector('#voiceCard h3').textContent = prim.title;
        document.querySelector('#voiceCard .analysis-icon').textContent = prim.icon;
        renderMetrics('voiceMetrics', prim.metrics);
        renderFlags('voiceFlags', prim.flags);
    } else {
        document.getElementById('voiceCard').style.display = 'none';
    }

    // Spectral Analysis
    const sp = analysis ? analysis.spectral : null;
    if (sp) {
        document.getElementById('spectralCard').style.display = 'block';
        document.querySelector('#spectralCard h3').textContent = sp.title;
        document.querySelector('#spectralCard .analysis-icon').textContent = sp.icon;
        renderMetrics('spectralMetrics', sp.metrics);
        renderFlags('spectralFlags', sp.flags);
    } else {
        document.getElementById('spectralCard').style.display = 'none';
    }

    renderFlags('metadataFlags', analysis?.metadata?.flags || []);
    renderFlags('viralFlags', analysis?.viral?.flags || []);

    // Gemini AI
    const gemini = analysis ? analysis.gemini_analysis : null;
    if (gemini && gemini.available) {
        document.getElementById('geminiCard').style.display = 'block';

        if (gemini.transcript && gemini.transcript !== 'No speech detected') {
            document.getElementById('geminiTranscript').style.display = 'block';
            document.getElementById('transcriptText').textContent = gemini.transcript;
        }

        const statsEl = document.getElementById('geminiStats');
        const statColor = (val) => {
            if (['High','Extreme','Clearly Synthetic'].includes(val)) return '#ef4444';
            if (['Medium','Moderate','Slightly Unnatural'].includes(val)) return '#f59e0b';
            return '#10b981';
        };
        statsEl.innerHTML = [
            { label: 'Speech Naturalness', value: gemini.speech_naturalness || 'N/A' },
            { label: 'Content Risk',       value: gemini.content_risk       || 'N/A' },
            { label: 'Urgency Level',      value: gemini.urgency_level      || 'N/A' },
            { label: 'Gemini Fake Score',  value: gemini.score + '%' },
        ].map(s => `
            <div class="gemini-stat">
                <div class="gemini-stat-label">${s.label}</div>
                <div class="gemini-stat-value" style="color:${statColor(s.value)}">${s.value}</div>
            </div>
        `).join('');

        if (gemini.assessment)
            document.getElementById('geminiAssessment').textContent = `"${gemini.assessment}"`;
        if (gemini.flags?.length)
            renderFlags('geminiFlags', gemini.flags);
    }

    // Recommendations
    const recsList = document.getElementById('recsList');
    recsList.innerHTML = data.recommendations.map(r =>
        `<div class="rec-item">${r}</div>`
    ).join('');

    // File info
    const fi = data.file_info;
    document.getElementById('fileInfoGrid').innerHTML = `
        <div class="file-info-item">
            <div class="file-info-label">Filename</div>
            <div class="file-info-value" style="word-break:break-all;font-size:12px">${fi.filename}</div>
        </div>
        <div class="file-info-item">
            <div class="file-info-label">File Size</div>
            <div class="file-info-value">${fi.file_size_kb} KB</div>
        </div>
        <div class="file-info-item">
            <div class="file-info-label">Media Type</div>
            <div class="file-info-value">${fi.media_type || 'Audio'}</div>
        </div>
    `;

    } // end else block for media deepfakes
    
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Metric Bars ──────────────────────────────
function renderMetrics(containerId, metrics) {
    const el = document.getElementById(containerId);
    el.innerHTML = metrics.map(m => {
        const pct   = Math.round(m.value * 100);
        const color = m.isRisk ? '#ef4444' : '#10b981';
        return `
            <div class="metric">
                <div class="metric-label">
                    <span>${m.label}</span>
                    <span style="color:${color}">${pct}%</span>
                </div>
                <div class="metric-bar">
                    <div class="metric-bar-fill" style="background:${color}" data-width="${pct}"></div>
                </div>
            </div>
        `;
    }).join('');
    setTimeout(() => {
        el.querySelectorAll('.metric-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.width + '%';
        });
    }, 300);
}

function renderFlags(containerId, flags) {
    const el = document.getElementById(containerId);
    el.innerHTML = flags.map(f => {
        const isBad = /detected|mismatch|artifact|unusual|abnorm|missing|stitched|manipul|synthetic|deepfake|unnatural|anomal|inconsist|⚠️|🚨|re-encoding|extreme|severe|critical/i.test(f);
        return `<div class="flag"><span class="flag-icon">${isBad ? '🔴' : '🟢'}</span><span>${f}</span></div>`;
    }).join('');
}

// ─── New Analysis ──────────────────────────────
document.getElementById('newAnalysisBtn').addEventListener('click', () => {
    selectedFile = null;
    audioInput.value = '';
    filePreview.style.display = 'none';
    dropZone.style.display = 'block';
    resultsSection.style.display = 'none';
    document.getElementById('geminiCard').style.display = 'none';
    document.getElementById('geminiTranscript').style.display = 'none';
    uploadSection.style.display = 'flex';
    document.getElementById('scoreRingFill').style.strokeDashoffset = '534';
    ['step1','step2','step3','step4'].forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('active','done');
    });
    const btnText    = document.querySelector('.analyze-btn-text');
    const btnLoading = document.querySelector('.analyze-btn-loading');
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
    analyzeBtn.disabled = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── Share ────────────────────────────────────
document.getElementById('shareBtn').addEventListener('click', () => {
    const verdict = document.getElementById('verdictText').textContent;
    const score   = document.getElementById('scoreValue').textContent;
    const shareText = `🛡️ TruthGuard AI Analysis Result\n\nVerdict: ${verdict}\nFake Probability: ${score}\n\n${verdict === 'FAKE' ? '🛑 DO NOT forward this content — it is a deepfake!\n' : ''}Verified by TruthGuard AI — Stopping digital riots before they start.`;
    if (navigator.share) {
        navigator.share({ title: 'TruthGuard AI Result', text: shareText });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            const btn = document.getElementById('shareBtn');
            btn.textContent = '✅ Copied to Clipboard!';
            setTimeout(() => { btn.textContent = '📤 Share Verified Result'; }, 2500);
        });
    }
});

// ─── Helpers ──────────────────────────────────
function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function animateNumber(el, from, to, duration) {
    const start = performance.now();
    const update = (time) => {
        const progress = Math.min((time - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(from + (to - from) * eased) + '%';
        if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
}

// ─── Init ─────────────────────────────────────
createParticles();
