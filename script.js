
/* --- ОБНОВЛЕННАЯ ЛУПА: МЯГКИЙ ЗУМ И ПРИЦЕЛ --- */
document.addEventListener('DOMContentLoaded', () => {
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
            
            // 1. Движение фокуса картинки (оставляем старую логику для плавности)
            const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
            const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
            
            // Добавляем небольшую задержку для transform-origin, чтобы картинка не дергалась
            requestAnimationFrame(() => {
                img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
            });

            // 2. Движение квадратного прицела
            // Центрируем прицел относительно курсора
            const lensWidth = lens.offsetWidth;
            const lensHeight = lens.offsetHeight;
            
            let lensX = (e.clientX - rect.left) - (lensWidth / 2);
            let lensY = (e.clientY - rect.top) - (lensHeight / 2);

            // Ограничиваем прицел, чтобы он не вылезал за границы контейнера
            if (lensX > rect.width - lensWidth) { lensX = rect.width - lensWidth; }
            if (lensX < 0) { lensX = 0; }
            if (lensY > rect.height - lensHeight) { lensY = rect.height - lensHeight; }
            if (lensY < 0) { lensY = 0; }

            // Двигаем прицел
            lens.style.left = `${lensX}px`;
            lens.style.top = `${lensY}px`;
        });

        // При уходе мыши плавно возвращаем фокус в центр
        container.addEventListener('mouseleave', () => {
            img.style.transformOrigin = 'center center';
        });
    });
});