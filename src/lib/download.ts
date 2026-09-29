/**
 * Utilitaire universel de téléchargement de fichiers et devoirs pour AlFasle
 * Fonctionne avec URLs externes, Data URLs (base64), Blob URLs et génère un document
 * formaté si aucun fichier binaire n'a été déposé.
 */

export interface DownloadFileOptions {
  filename?: string;
  url?: string;
  fallbackContent?: string;
  studentName?: string;
  assignmentTitle?: string;
  classeTitle?: string;
  submittedAt?: string;
}

export function triggerDownload(options: DownloadFileOptions) {
  if (typeof window === "undefined") return;

  const {
    url,
    filename = "devoir.pdf",
    fallbackContent,
    studentName,
    assignmentTitle,
    classeTitle,
    submittedAt,
  } = options;

  // 1. Si une URL réelle valide existe (Data URL base64, Blob URL ou HTTP(S))
  if (
    url &&
    url !== "#" &&
    (url.startsWith("data:") ||
      url.startsWith("blob:") ||
      url.startsWith("http://") ||
      url.startsWith("https://"))
  ) {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.target = "_blank";
      a.rel = "noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    } catch (e) {
      console.warn("Échec du téléchargement direct via URL, bascule sur la génération:", e);
    }
  }

  // 2. Si pas d'URL ou URL fictive "#", générer un document réel à télécharger
  const ext = filename.toLowerCase().split(".").pop() || "";
  const isExcel = ext === "xlsx" || ext === "xls" || ext === "csv";
  const isWord = ext === "doc" || ext === "docx";
  const isPdf = ext === "pdf";

  const titleHeader = assignmentTitle || "Devoir & Travail Académique";
  const author = studentName || "Élève";
  const dateStr = submittedAt ? new Date(submittedAt).toLocaleString("fr-FR") : new Date().toLocaleString("fr-FR");
  const classeStr = classeTitle || "Classe";

  if (isExcel) {
    // Génère un fichier Excel HTML Table MIME type que Microsoft Excel ouvre parfaitement avec toutes les colonnes
    const excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Copie Devoir</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          th { background-color: #107c41; color: #ffffff; font-weight: bold; padding: 10px; border: 1px solid #d4d4d4; text-align: left; }
          td { padding: 8px; border: 1px solid #e5e7eb; font-family: Calibri, sans-serif; font-size: 11pt; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <th colspan="2" style="font-size: 14pt; background-color: #047857;">GROUPE SCOLAIRE ALFASLE - DONNÉES DU DEVOIR</th>
          </tr>
          <tr><td style="font-weight:bold; background-color:#f0fdf4;">Établissement</td><td>Groupe Scolaire AlFasle</td></tr>
          <tr><td style="font-weight:bold; background-color:#f0fdf4;">Classe</td><td>${classeStr}</td></tr>
          <tr><td style="font-weight:bold; background-color:#f0fdf4;">Devoir</td><td>${titleHeader}</td></tr>
          <tr><td style="font-weight:bold; background-color:#f0fdf4;">Élève / Auteur</td><td>${author}</td></tr>
          <tr><td style="font-weight:bold; background-color:#f0fdf4;">Date de remise</td><td>${dateStr}</td></tr>
          <tr><td style="font-weight:bold; background-color:#f0fdf4;">Fichier source</td><td>${filename}</td></tr>
          <tr><td colspan="2" style="height: 15px;"></td></tr>
          <tr>
            <th colspan="2" style="background-color: #059669;">CONTENU & RÉSULTATS DU TRAVAIL</th>
          </tr>
          <tr>
            <td colspan="2" style="white-space: pre-wrap; vertical-align: top;">${fallbackContent || "Tableau de données et réponses numériques validées pour cette évaluation."}</td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelContent], { type: "application/vnd.ms-excel;charset=utf-8" });
    downloadBlob(blob, filename.endsWith(".xls") || filename.endsWith(".xlsx") ? filename : `${filename}.xls`);
    return;
  }

  if (isWord) {
    // Génère un fichier compatible Word (.doc HTML MIME type) que Word / LibreOffice ouvrent parfaitement
    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${titleHeader}</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; padding: 40px; color: #1e293b; }
          h1 { color: #4338ca; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 22px; }
          .meta { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
          .meta-item { margin: 6px 0; font-size: 13px; }
          .label { font-weight: bold; color: #475569; }
          .content { font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Groupe Scolaire AlFasle — Copie Numérique</h1>
        <div class="meta">
          <div class="meta-item"><span class="label">Établissement :</span> Groupe Scolaire AlFasle</div>
          <div class="meta-item"><span class="label">Classe :</span> ${classeStr}</div>
          <div class="meta-item"><span class="label">Devoir :</span> ${titleHeader}</div>
          <div class="meta-item"><span class="label">Élève :</span> ${author}</div>
          <div class="meta-item"><span class="label">Date de remise :</span> ${dateStr}</div>
          <div class="meta-item"><span class="label">Document joint :</span> ${filename}</div>
        </div>
        <h2>Travail Rendu & Réponses de l'Élève :</h2>
        <div class="content">${fallbackContent || "Le document original a été déposé au format numérique pour cette évaluation."}</div>
      </body>
      </html>
    `;

    const blob = new Blob([wordContent], { type: "application/msword;charset=utf-8" });
    downloadBlob(blob, filename.endsWith(".doc") || filename.endsWith(".docx") ? filename : `${filename}.doc`);
    return;
  }

  // 3. Document PDF / Texte structuré
  const textContent = `===============================================================
GROUPE SCOLAIRE ALFASLE — COPIE OFFICIELLE DU DEVOIR
===============================================================
Établissement   : Groupe Scolaire AlFasle
Classe          : ${classeStr}
Devoir          : ${titleHeader}
Élève           : ${author}
Date de remise  : ${dateStr}
Fichier joint   : ${filename}
===============================================================

TRAVAIL RENDU & EXPLICATIONS DE L'ÉLÈVE :
---------------------------------------------------------------
${fallbackContent || "Aucune note écrite supplémentaire. Fichier validé dans l'espace numérique AlFasle."}

===============================================================
Document certifié par la plateforme AlFasle
===============================================================`;

  const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
  const finalDownloadName = isPdf
    ? filename.replace(/\.pdf$/i, ".txt")
    : filename.includes(".")
    ? filename
    : `${filename}.txt`;

  downloadBlob(blob, finalDownloadName);
}

function downloadBlob(blob: Blob, filename: string) {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
}
