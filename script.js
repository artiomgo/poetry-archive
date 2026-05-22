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