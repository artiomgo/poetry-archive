document.addEventListener('DOMContentLoaded', () => {
    const slats = document.querySelectorAll('.slat');
    if (slats.length === 0) return;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const maxScroll = 400; // Дистанция открытия (в пикселях)

        let angle = (scrollY / maxScroll) * 90;
        if (angle > 90) angle = 90;

        slats.forEach(slat => {
            // Поворачиваем створки по оси X
            slat.style.transform = `rotateX(${angle}deg)`;
        });
    });
});
/* --- ЛУПА: ОТСЛЕЖИВАНИЕ КУРСА НА ИЛЛЮСТРАЦИЯХ --- */
document.addEventListener('DOMContentLoaded', () => {
    const imageContainers = document.querySelectorAll('.image-container');

    imageContainers.forEach(container => {
        const img = container.querySelector('img');

        container.addEventListener('mousemove', (e) => {
            // Получаем размеры и позицию контейнера
            const rect = container.getBoundingClientRect();
            
            // Вычисляем позицию мыши внутри контейнера в процентах
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            // Сдвигаем точку фокуса изображения под курсор
            img.style.transformOrigin = `${x}% ${y}%`;
        });

        // Когда убираем мышку, плавно возвращаем фокус в центр
        container.addEventListener('mouseleave', () => {
            img.style.transformOrigin = 'center center';
        });
    });
});