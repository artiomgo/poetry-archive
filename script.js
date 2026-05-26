document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================
       1. ОБНОВЛЕННАЯ ЛУПА: МЯГКИЙ ЗУМ И ПРИЦЕЛ
       ========================================== */
    const imageContainers = document.querySelectorAll('.image-container');

    imageContainers.forEach(container => {
        const img = container.querySelector('img');

        // Создаем элемент линзы-прицела, если его еще нет в HTML
        let lens = container.querySelector('.image-lens');
        if (!lens) {
            lens = document.createElement('div');
            lens.classList.add('image-lens');
            container.appendChild(lens);
        }

        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            
            // Движение фокуса картинки
            const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
            const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
            
            requestAnimationFrame(() => {
                img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
            });

            // Движение квадратного прицела
            const lensWidth = lens.offsetWidth;
            const lensHeight = lens.offsetHeight;
            
            let lensX = (e.clientX - rect.left) - (lensWidth / 2);
            let lensY = (e.clientY - rect.top) - (lensHeight / 2);

            // Ограничиваем прицел
            if (lensX > rect.width - lensWidth) { lensX = rect.width - lensWidth; }
            if (lensX < 0) { lensX = 0; }
            if (lensY > rect.height - lensHeight) { lensY = rect.height - lensHeight; }
            if (lensY < 0) { lensY = 0; }

            lens.style.left = `${lensX}px`;
            lens.style.top = `${lensY}px`;
        });

        // При уходе мыши плавно возвращаем фокус в центр
        container.addEventListener('mouseleave', () => {
            img.style.transformOrigin = 'center center';
        });
    });


    /* ==========================================
       2. УПРАВЛЕНИЕ ЗВУКОМ, ПЕРЕМОТКОЙ И ПАМЯТЬЮ
       ========================================== */
    const audio = document.getElementById('archive-audio');
    const audioBtn = document.getElementById('audio-toggle');
    const tracklist = document.querySelectorAll('#audio-tracklist li');
    
    // Элементы управления
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const timeCurrent = document.getElementById('time-current');
    const timeTotal = document.getElementById('time-total');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeLevel = document.getElementById('volume-level');

    if (audio) {
        
        // --- 1. ПАМЯТЬ МЕЖДУ СТРАНИЦАМИ ---
        const savedSrc = localStorage.getItem('archive_audio_src');
        const savedTime = localStorage.getItem('archive_audio_time');
        const isPlaying = localStorage.getItem('archive_audio_playing');
        const savedVolume = localStorage.getItem('archive_audio_volume');

        // Восстанавливаем громкость
        if (savedVolume !== null) {
            audio.volume = parseFloat(savedVolume);
            if (volumeLevel) volumeLevel.style.width = `${audio.volume * 100}%`;
        } else {
            audio.volume = 0.5; // Громкость по умолчанию
            if (volumeLevel) volumeLevel.style.width = '50%';
        }

        // Восстанавливаем трек
        if (savedSrc && isPlaying === 'true') {
            audio.src = savedSrc;
            audio.currentTime = parseFloat(savedTime);
            
            let playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    syncTracklistUI(savedSrc);
                }).catch(e => console.log("Автозапуск заблокирован браузером"));
            }
        }

        window.addEventListener('beforeunload', () => {
            if (!audio.paused) {
                localStorage.setItem('archive_audio_src', audio.src);
                localStorage.setItem('archive_audio_time', audio.currentTime);
                localStorage.setItem('archive_audio_playing', 'true');
            } else {
                localStorage.setItem('archive_audio_playing', 'false');
            }
            // Громкость сохраняется при каждом клике на ползунок
        });

        // --- 2. СИНХРОНИЗАЦИЯ ИНТЕРФЕЙСА (АВТОМАТИКА) ---
        // Если музыка играет - меняем тексты везде
        audio.addEventListener('play', () => {
            if (audioBtn) { audioBtn.textContent = 'sound: on'; audioBtn.style.color = '#000000'; }
            if (playPauseBtn) playPauseBtn.textContent = 'pause';
        });

        // Если музыка на паузе - меняем тексты везде
        audio.addEventListener('pause', () => {
            if (audioBtn) { audioBtn.textContent = 'sound: off'; audioBtn.style.color = '#999999'; }
            if (playPauseBtn) playPauseBtn.textContent = 'play';
        });

        // --- 3. КНОПКИ ПЛЕЙ/ПАУЗА ---
        const togglePlay = () => {
            if (audio.paused) audio.play();
            else audio.pause();
        };

        if (audioBtn) audioBtn.addEventListener('click', togglePlay);
        if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);

        // --- 4. ЛОГИКА ТРЕКЛИСТА ---
        if (tracklist.length > 0) {
            tracklist.forEach(track => {
                track.addEventListener('click', function() {
                    tracklist.forEach(t => t.classList.remove('active-track'));
                    this.classList.add('active-track');
                    audio.src = this.getAttribute('data-src');
                    audio.play(); 
                });
            });
        }


        const formatTime = (time) => {
            if (isNaN(time)) return "00:00";
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        };

        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                const progressPercent = (audio.currentTime / audio.duration) * 100;
                if (progressBar) progressBar.style.width = `${progressPercent}%`;
                if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
                if (timeTotal) timeTotal.textContent = formatTime(audio.duration);
            }
        });

        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                const rect = progressContainer.getBoundingClientRect();
                const clickPercent = (e.clientX - rect.left) / rect.width;
                audio.currentTime = clickPercent * audio.duration;
            });
        }
        if (volumeSlider) {
            volumeSlider.addEventListener('click', (e) => {
                const rect = volumeSlider.getBoundingClientRect();
                let clickX = e.clientX - rect.left;
                
                // Защита от выхода за границы
                if (clickX < 0) clickX = 0;
                if (clickX > rect.width) clickX = rect.width;
                
                const newVolume = clickX / rect.width;
                
                audio.volume = newVolume;
                volumeLevel.style.width = `${newVolume * 100}%`;
                localStorage.setItem('archive_audio_volume', newVolume);
            });
        }

        function syncTracklistUI(currentSrc) {
            if (tracklist.length > 0) {
                tracklist.forEach(t => t.classList.remove('active-track'));
                tracklist.forEach(t => {
                    if (currentSrc.includes(t.getAttribute('data-src'))) {
                        t.classList.add('active-track');
                    }
                });
            }
        }
    }

}); // <-- ГЛАВНАЯ ЗАКРЫВАЮЩАЯ СКОБКА (НЕ УДАЛЯТЬ!)