// Fonction pour charger les données dynamiques
function loadDynamicContent() {
    console.log("debut loadDynamicContent()")
    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            document.getElementById('dynamic-content').textContent = data.message;
        })
        .catch(error => {
            console.error('Erreur:', error);
            document.getElementById('dynamic-content').textContent = 'Erreur lors du chargement des données.';
        });
}

// Charger les données dynamiques au chargement de la page
window.onload = loadDynamicContent;
