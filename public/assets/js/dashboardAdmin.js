// REQUIERE REALZIAR CORRECTAMENTE
// NO FUNCIONA COMO SE ESPERA
// Esto no es una muestra final del producto, esta sujeto a cambios.
function showPage(page) {

    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.id === page);
    });

    document.querySelectorAll('.menu a').forEach(a => {
        a.classList.toggle('active', a.dataset.page === page);
    });

    history.pushState({page: page}, '', `#${page}`);
}

document.querySelectorAll('.menu a').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        showPage(a.dataset.page);
    });
});

window.addEventListener('popstate', e => {
    if(e.state && e.state.page) showPage(e.state.page);
});

window.addEventListener('DOMContentLoaded', () => {
    const hashPage = window.location.hash.replace('#','') || 'inicio';
    showPage(hashPage);
});
