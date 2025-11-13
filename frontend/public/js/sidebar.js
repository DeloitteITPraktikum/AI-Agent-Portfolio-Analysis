// sidebar.js
// Allgemeine Logik für die Sidebar: mehrere ausklappbare Menüs

console.log('Sidebar-Script geladen');

function initSidebar() {
  // Alle Header, die ein Untermenü haben
  const toggleHeaders = document.querySelectorAll('.nav-header[data-target]');

  toggleHeaders.forEach(header => {
    const targetId = header.getAttribute('data-target');
    const target = document.getElementById(targetId);
    const icon = header.querySelector('.nav-header-icon');

    if (!target || !icon) {
      console.warn('Kein Ziel oder Icon gefunden für Header:', header.textContent);
      return;
    }

    header.addEventListener('click', () => {
      target.classList.toggle('hidden');

      // Pfeil anpassen
      if (target.classList.contains('hidden')) {
        icon.textContent = '▸'; // zu
      } else {
        icon.textContent = '▾'; // offen
      }
    });
  });
}

// Script steht am Ende des <body>, DOM ist schon da:
initSidebar();



