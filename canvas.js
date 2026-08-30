// ============================================================================
// CANVAS DETECTOR DE DISPAROS - INTERFAZ VISUAL
// ============================================================================

class DetectorUI {
    constructor() {
        this.canvas = document.getElementById('mainCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.animationId = null;
        this.particles = [];
        this.waves = [];
        this.events = [];
        this.time = 0;
        this.isDetecting = false;
        this.detectionIntensity = 0;
        
        // Datos de detección
        this.detectionData = {
            latitude: 10.396528,
            longitude: -75.506694,
            zone: 'Sector Centro',
            confidence: 94,
            frequency: 3850,
            decibels: 167,
            duration: 145,
            sample_id: 'GUNSHOT-2026-07-14-001'
        };
        
        // Autoridades
        this.authorities = [
            { name: 'ANARTEL', status: 'pending', color: '#00d9ff' },
            { name: 'Ministerio de Comunicaciones', status: 'pending', color: '#ff006e' },
            { name: 'ANIC', status: 'pending', color: '#00ff00' },
            { name: 'Belinda MK', status: 'pending', color: '#ffa500' },
            { name: 'Ultra Conclaves', status: 'pending', color: '#00d9ff' },
            { name: 'Contrato Isaquio', status: 'pending', color: '#ff006e' },
            { name: 'Belithoricos', status: 'pending', color: '#00ff00' }
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.renderAuthorities();
        this.startAnimation();
        this.addLog('✅ Sistema inicializado correctamente', 'success');
    }
    
    setupEventListeners() {
        document.getElementById('btnSimular').addEventListener('click', () => this.simulateDetection());
        document.getElementById('btnReporte').addEventListener('click', () => this.generateReport());
        document.getElementById('btnLimpiar').addEventListener('click', () => this.clearAll());
    }
    
    renderAuthorities() {
        const list = document.getElementById('authoritiesList');
        list.innerHTML = this.authorities.map((auth, idx) => `
            <div class="authority-item" id="auth-${idx}">
                <span class="authority-dot" style="background: ${auth.color};"></span>
                <span class="authority-name">${auth.name}</span>
                <span class="authority-status">${auth.status}</span>
            </div>
        `).join('');
    }
    
    startAnimation() {
        this.animate();
    }
    
    animate() {
        this.clearCanvas();
        this.time++;
        
        // Dibujar grid
        this.drawGrid();
        
        // Dibujar zona de detección (mapa)
        this.drawDetectionZone();
        
        // Dibujar espectrograma (frecuencias)
        this.drawSpectrogram();
        
        // Dibujar ondas si está detectando
        if (this.isDetecting) {
            this.updateWaves();
            this.drawWaves();
            this.updateParticles();
            this.drawParticles();
        }
        
        // Dibujar indicadores
        this.drawIndicators();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    clearCanvas() {
        this.ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawGrid() {
        const gridSize = 50;
        this.ctx.strokeStyle = 'rgba(0, 217, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawDetectionZone() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2.5;
        const radius = 100 + this.detectionIntensity * 50;
        
        // Círculo de detección (pulsante)
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, `rgba(0, 217, 255, ${0.3 + this.detectionIntensity * 0.2})`);
        gradient.addColorStop(0.7, `rgba(0, 217, 255, ${0.1 + this.detectionIntensity * 0.1})`);
        gradient.addColorStop(1, 'rgba(0, 217, 255, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Borde del círculo
        this.ctx.strokeStyle = `rgba(0, 217, 255, ${0.5 + this.detectionIntensity * 0.5})`;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Coordenadas en el centro
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = 'bold 14px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`📍 ${this.detectionData.latitude.toFixed(3)}°N`, centerX, centerY - 20);
        this.ctx.fillText(`${this.detectionData.longitude.toFixed(3)}°W`, centerX, centerY + 20);
    }
    
    drawSpectrogram() {
        const x = 50;
        const y = 380;
        const width = 300;
        const height = 80;
        
        // Marco
        this.ctx.strokeStyle = 'rgba(255, 0, 110, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // Barras de frecuencia
        const frequencies = [3850, 7200, 10500];
        const barWidth = width / frequencies.length;
        
        frequencies.forEach((freq, idx) => {
            const barHeight = (freq / 12000) * height * (0.5 + this.detectionIntensity * 0.5);
            const xPos = x + idx * barWidth + 10;
            const yPos = y + height - barHeight;
            
            const gradient = this.ctx.createLinearGradient(xPos, yPos, xPos, y + height);
            gradient.addColorStop(0, '#ff006e');
            gradient.addColorStop(1, '#ff0099');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(xPos, yPos, barWidth - 20, barHeight);
        });
        
        // Etiqueta
        this.ctx.fillStyle = '#ff006e';
        this.ctx.font = 'bold 12px Courier New';
        this.ctx.fillText('ESPECTROGRAMA DE FRECUENCIA', x + width / 2, y - 10);
    }
    
    drawWaves() {
        this.waves.forEach(wave => {
            this.ctx.strokeStyle = `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            for (let i = 0; i < wave.points.length; i++) {
                const point = wave.points[i];
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            }
            this.ctx.stroke();
        });
    }
    
    updateWaves() {
        // Crear nuevas ondas
        if (this.time % 5 === 0 && this.detectionIntensity > 0.3) {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2.5;
            
            this.waves.push({
                radius: 0,
                maxRadius: 200,
                opacity: 1,
                color: { r: Math.random() * 100 + 155, g: 217, b: 255 },
                points: []
            });
        }
        
        // Actualizar ondas
        this.waves = this.waves.filter(wave => {
            wave.radius += 3;
            wave.opacity = 1 - (wave.radius / wave.maxRadius);
            
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2.5;
            
            wave.points = [];
            for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
                const x = centerX + Math.cos(angle) * wave.radius;
                const y = centerY + Math.sin(angle) * wave.radius;
                wave.points.push({ x, y });
            }
            
            return wave.radius < wave.maxRadius;
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    updateParticles() {
        // Crear nuevas partículas
        if (this.time % 3 === 0 && this.detectionIntensity > 0.5) {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2.5;
            
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 3 + 2;
                
                this.particles.push({
                    x: centerX,
                    y: centerY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    opacity: 1,
                    size: Math.random() * 3 + 2,
                    color: { r: 0, g: 217, b: 255 }
                });
            }
        }
        
        // Actualizar partículas
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.opacity -= 0.02;
            return p.opacity > 0;
        });
    }
    
    drawIndicators() {
        const padding = 20;
        
        // Confianza (arriba derecha)
        this.drawGauge(this.canvas.width - 250, padding, 'CONFIANZA', this.detectionData.confidence, '%');
        
        // Decibeles (abajo derecha)
        this.drawGauge(this.canvas.width - 250, this.canvas.height - 100, 'DECIBELES', this.detectionData.decibels, 'dB');
        
        // Frecuencia (arriba izquierda)
        this.drawFrequencyDisplay(padding, padding);
    }
    
    drawGauge(x, y, label, value, unit) {
        const size = 80;
        const percentage = Math.min(value / 100, 1);
        
        // Círculo de fondo
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Borde
        this.ctx.strokeStyle = '#00d9ff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Indicador (arco)
        this.ctx.strokeStyle = '#ff006e';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(x + size / 2, y + size / 2, size / 2 - 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * percentage);
        this.ctx.stroke();
        
        // Valor en el centro
        this.ctx.fillStyle = '#00d9ff';
        this.ctx.font = 'bold 20px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${value}${unit}`, x + size / 2, y + size / 2);
        
        // Etiqueta
        this.ctx.fillStyle = '#ffa500';
        this.ctx.font = '10px Courier New';
        this.ctx.fillText(label, x + size / 2, y + size + 15);
    }
    
    drawFrequencyDisplay(x, y) {
        const width = 200;
        const height = 60;
        
        // Marco
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // Título
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 12px Courier New';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('FRECUENCIA PICO', x + 10, y + 15);
        
        // Valor
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 24px Courier New';
        this.ctx.fillText(`${this.detectionData.frequency} Hz`, x + 10, y + 45);
    }
    
    simulateDetection() {
        this.isDetecting = true;
        this.addLog('🔍 Simulando detección de disparo...', 'info');
        
        // Animación de detección
        let frame = 0;
        const maxFrames = 60;
        
        const animateDetection = () => {
            if (frame < maxFrames) {
                this.detectionIntensity = Math.sin((frame / maxFrames) * Math.PI);
                frame++;
                requestAnimationFrame(animateDetection);
            } else {
                this.detectionIntensity = 0;
                this.isDetecting = false;
                this.addLog('✅ Detección completada', 'success');
            }
        };
        
        animateDetection();
        
        // Enviar a autoridades
        this.sendToAuthorities();
    }
    
    sendToAuthorities() {
        this.addLog('📬 Enviando reportes a autoridades...', 'warning');
        
        this.authorities.forEach((auth, idx) => {
            setTimeout(() => {
                auth.status = 'sent';
                const elem = document.getElementById(`auth-${idx}`);
                if (elem) {
                    elem.querySelector('.authority-status').textContent = '✓ Enviado';
                    elem.querySelector('.authority-status').style.color = '#00ff00';
                }
                this.addLog(`📧 Reporte enviado a ${auth.name}`, 'success');
            }, idx * 300);
        });
    }
    
    generateReport() {
        this.addLog('📄 Generando reporte con Gemini AI...', 'info');
        
        setTimeout(() => {
            const report = `
╔═══════════════════════════════════════════╗
║  REPORTE DE DETECCIÓN - GEMINI AI        ║
╚═══════════════════════════════════════════╝

🎯 MUESTRA: ${this.detectionData.sample_id}
📍 UBICACIÓN: ${this.detectionData.zone}
⏰ CONFIANZA: ${this.detectionData.confidence}%
🔊 FRECUENCIA: ${this.detectionData.frequency} Hz
🎵 DECIBELES: ${this.detectionData.decibels} dB SPL
⏱️ DURACIÓN: ${this.detectionData.duration} ms

✅ VALIDACIÓN LEGAL: APROBADO
🏛️ AUTORIDADES: 7/7 notificadas
            `;
            
            this.addLog('✅ Reporte generado exitosamente', 'success');
            console.log(report);
            alert(report);
        }, 500);
    }
    
    clearAll() {
        this.isDetecting = false;
        this.detectionIntensity = 0;
        this.particles = [];
        this.waves = [];
        this.authorities.forEach(auth => auth.status = 'pending');
        this.renderAuthorities();
        this.addLog('🗑️ Sistema limpiado', 'warning');
    }
    
    addLog(message, type = 'info') {
        const logContainer = document.getElementById('logContainer');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }
}

// Inicializar cuando carga la página
window.addEventListener('DOMContentLoaded', () => {
    new DetectorUI();
});