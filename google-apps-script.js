// ============================================================
//  SIPAMO — Google Apps Script
//  Coller ce code sur https://script.google.com
//  Puis : Déployer > Nouveau déploiement > Application Web
//         Exécuter en tant que : Moi
//         Accès : Tout le monde
// ============================================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // ⚠️ Remplacez l'ID ci-dessous par l'ID de VOTRE Google Sheets
    // L'ID se trouve dans l'URL : docs.google.com/spreadsheets/d/  >>ID<<  /edit
    const SHEET_ID = '1q2buykI8D0MeEQQcI9IkjKy37sqEK9cHvhsIE-208y0';

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Commandes');

    // Si la feuille est vide, ajouter les en-têtes automatiquement
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Référence', 'Date', 'Nom', 'Téléphone', 'Email',
        'Ville', 'Quartier', 'Articles',
        'Total Produits', 'Frais Livraison', 'Total À Payer',
        'Date Livraison', 'Heure Livraison',
        'Lien Bon de Commande', 'Lien Facture',
        'order_data' // Colonne cachée — JSON brut pour facture-bon.html et bon-commande.html
      ]);
    }

    // Ajouter la ligne de commande
    sheet.appendRow([
      data.ref            || '',
      data.date           || '',
      data.nom            || '',
      data.telephone      || '',
      data.email          || '',
      data.ville          || '',
      data.quartier       || '',
      data.articles       || '',
      data.total_produits || '',
      data.frais_livraison|| '',
      data.total_payer    || '',
      data.date_livraison || '',
      data.heure_livraison|| '',
      data.lien_bon       || '',
      data.lien_facture   || '',
      data.order_data     || '' // JSON brut de la commande complète
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Lecture d'une commande par référence (appelée par facture-bon.html et bon-commande.html) ──
// URL : ...exec?ref=SIP-XXXXXXXXXX
function doGet(e) {
  try {
    const ref = e.parameter.ref;
    if (!ref) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Paramètre ref manquant' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const SHEET_ID = '1q2buykI8D0MeEQQcI9IkjKy37sqEK9cHvhsIE-208y0';
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Commandes');
    const data  = sheet.getDataRange().getValues();

    // Ligne 0 = en-têtes, on cherche la colonne "Référence" (col 0) et "order_data" (col 15)
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === ref) {
        const orderData = data[i][15]; // Colonne order_data
        if (orderData) {
          return ContentService
            .createTextOutput(JSON.stringify({ success: true, data: orderData }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Commande introuvable' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
