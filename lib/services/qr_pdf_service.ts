/**
 * BAGANI — QR Code Matrix Generator & Isolated Printable PDF Tag Service
 * Ensures ONLY the designated printable QR Tag (Logo, Plant Name & SVG QR Code)
 * is printed — completely excluding the website header, top menu, bottom menu,
 * and all other page elements.
 */

import * as Print from 'expo-print';
import { Image, Platform } from 'react-native';
import QRCode from 'qrcode';
import { PlantModel, QrTagSize } from '../models/plant_model';

const LOGO_ASSET = require('../../assets/images/logo.png');

export class QrPdfService {
  /**
   * Resolves the official BAGANI logo URI for embedding inside printable HTML tags
   */
  static getLogoUri(): string {
    try {
      if (Platform.OS === 'web') {
        if (typeof LOGO_ASSET === 'string') return LOGO_ASSET;
        if (LOGO_ASSET && typeof LOGO_ASSET.uri === 'string') {
          return LOGO_ASSET.uri;
        }
        if (LOGO_ASSET && typeof LOGO_ASSET.default === 'string') {
          return LOGO_ASSET.default;
        }
      }
      const resolved = Image.resolveAssetSource(LOGO_ASSET);
      return resolved?.uri || '';
    } catch {
      return '';
    }
  }

  /**
   * Generates standard ISO/IEC 18004 QR code boolean matrix with Reed-Solomon error correction
   * Scannable by any smartphone camera (Google Lens, Apple iOS Camera, Xiaomi, Samsung)
   */
  static generateVisualQrMatrix(payload: string): boolean[][] {
    try {
      const qr = QRCode.create(payload || 'BAGANI-QR', {
        errorCorrectionLevel: 'M',
      });
      const size = qr.modules.size;
      const matrix: boolean[][] = [];
      for (let r = 0; r < size; r++) {
        const row: boolean[] = [];
        for (let c = 0; c < size; c++) {
          row.push(qr.modules.get(r, c) === 1);
        }
        matrix.push(row);
      }
      return matrix;
    } catch {
      return Array.from({ length: 21 }, () => Array(21).fill(false));
    }
  }

  /**
   * Generates a crisp vector <svg> QR code so browsers and printers always
   * render solid black modules even when "Background graphics" is disabled.
   */
  static buildQrSvg(payload: string, cellPx = 8): string {
    const matrix = this.generateVisualQrMatrix(payload);
    const dim = matrix.length * cellPx;
    const rects: string[] = [];

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          rects.push(
            `<rect x="${c * cellPx}" y="${
              r * cellPx
            }" width="${cellPx}" height="${cellPx}" fill="#111827" />`
          );
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" style="display:block;margin:0 auto;">
      <rect width="${dim}" height="${dim}" fill="#FFFFFF" />
      ${rects.join('')}
    </svg>`;
  }

  /**
   * Web-specific isolated print handler: mounts ONLY the printable QR tag area
   * into #bagani-print-mount and hides #root and all app chrome during @media print.
   */
  private static triggerIsolatedWebPrint(bodyInnerMarkup: string): void {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    let styleEl = document.getElementById(
      'bagani-print-isolation-style'
    ) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'bagani-print-isolation-style';
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      @media screen {
        #bagani-print-mount {
          display: none !important;
        }
      }
      @media print {
        @page {
          margin: 12mm;
        }
        html, body {
          background: #FFFFFF !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: auto !important;
          overflow: visible !important;
        }
        body > *:not(#bagani-print-mount) {
          display: none !important;
        }
        #bagani-print-mount {
          display: flex !important;
          justify-content: center !important;
          align-items: flex-start !important;
          width: 100% !important;
          background: #FFFFFF !important;
          padding: 16px !important;
          font-family: 'Inter', 'Hind Siliguri', 'Noto Sans Bengali', sans-serif !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;

    let mountEl = document.getElementById('bagani-print-mount');
    if (!mountEl) {
      mountEl = document.createElement('div');
      mountEl.id = 'bagani-print-mount';
      document.body.appendChild(mountEl);
    }

    mountEl.innerHTML = bodyInnerMarkup;

    const imgs = Array.from(mountEl.querySelectorAll('img'));
    const waitPromises = imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        })
    );

    Promise.all(waitPromises).then(() => {
      setTimeout(() => {
        window.print();
      }, 120);
    });
  }

  /**
   * Prints a single customizable plant QR tag (Logo, Plant Name, QR Code, Custom Quote & Planting Date with Plant Age)
   */
  static async printSingleTagPdf(
    plant: PlantModel,
    tagSize: QrTagSize,
    customQuote: string,
    customOwner: string,
    customPlantedDate?: string
  ): Promise<void> {
    const logoUri = this.getLogoUri();
    const cellPx =
      tagSize === 'small'
        ? 8
        : tagSize === 'large'
        ? 11
        : tagSize === 'qr_only'
        ? 9
        : 9;
    const svgQr = this.buildQrSvg(plant.qrCodeId, cellPx);

    const widthPx =
      tagSize === 'small'
        ? 250
        : tagSize === 'large'
        ? 380
        : tagSize === 'qr_only'
        ? 220
        : 310;

    const targetPlantedDate =
      customPlantedDate || plant.plantedDateIso?.slice(0, 10) || new Date().toISOString().slice(0, 10);

    let ageLabel = '';
    try {
      const diffMs = Math.max(0, Date.now() - new Date(targetPlantedDate).getTime());
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const yrs = Math.floor(days / 365);
      const mos = Math.floor((days % 365) / 30);
      if (yrs > 0) {
        ageLabel = `${yrs}y ${mos}m (${days}d)`;
      } else if (mos > 0) {
        ageLabel = `${mos}m (${days}d)`;
      } else {
        ageLabel = `${days} days`;
      }
    } catch {}

    const cardMarkup = `
      <div style="width:${widthPx}px;border:2px dashed #167A45;border-radius:16px;background:#FFFFFF;padding:20px;text-align:center;box-sizing:border-box;margin:0 auto;">
        ${
          logoUri
            ? `<img src="${logoUri}" alt="BAGANI" style="width:92px;height:66px;object-fit:contain;display:block;margin:0 auto 4px auto;" />`
            : ''
        }
        <div style="font-size:11px;font-weight:800;color:#167A45;letter-spacing:0.6px;margin-bottom:6px;">
          BAGANI • SMART GARDEN TAG
        </div>
        ${
          tagSize !== 'qr_only'
            ? `<div style="font-size:18px;font-weight:800;color:#17231C;margin:4px 0;">
                 ${plant.nameBengali} (${plant.nameEnglish})
               </div>
               <div style="font-size:12.5px;color:#66736A;font-weight:600;margin-bottom:10px;">
                 ${plant.variety} • ${
                plant.isAllSeason ? 'All-Season / বারোমাসি' : 'Seasonal / মৌসুমি'
              }
               </div>`
            : `<div style="font-size:15px;font-weight:800;color:#17231C;margin:4px 0 8px 0;">
                 ${plant.nameEnglish}
               </div>`
        }
        <div style="display:inline-block;padding:10px;border:2px solid #167A45;border-radius:12px;background:#FFFFFF;margin:6px auto;">
          ${svgQr}
        </div>
        <div style="font-family:monospace;font-size:11.5px;color:#167A45;margin-top:6px;font-weight:700;">
          ${plant.qrCodeId}
        </div>
        ${
          tagSize !== 'qr_only'
            ? `<div style="font-size:12.5px;font-style:italic;color:#167A45;margin-top:8px;font-weight:700;">
                 “${customQuote}”
               </div>
               <div style="font-size:11.5px;color:#167A45;margin-top:5px;font-weight:700;">
                 📅 Planted: ${targetPlantedDate} ${ageLabel ? `• Age: ${ageLabel}` : ''}
               </div>
               <div style="font-size:11px;color:#66736A;margin-top:3px;font-weight:600;">
                 👤 ${customOwner} • 📍 ${plant.rooftopZone}
               </div>`
            : ''
        }
      </div>
    `;

    if (Platform.OS === 'web') {
      this.triggerIsolatedWebPrint(cardMarkup);
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>BAGANI QR Tag - ${plant.nameEnglish}</title>
        </head>
        <body style="font-family:'Inter','Hind Siliguri',sans-serif;display:flex;justify-content:center;padding:24px;background:#FFFFFF;margin:0;">
          ${cardMarkup}
        </body>
      </html>
    `;

    await Print.printAsync({ html });
  }

  /**
   * Prints an entire A4 sheet containing all registered rooftop plant QR tags
   * (Only the tags grid — never the website header or menus)
   */
  static async printBatchA4SheetPdf(
    plants: PlantModel[],
    ownerName: string,
    quote: string
  ): Promise<void> {
    const logoUri = this.getLogoUri();
    const cardsHtml = plants
      .map((plant) => {
        const svgQr = this.buildQrSvg(plant.qrCodeId, 7);
        const pDate = plant.plantedDateIso?.slice(0, 10);
        let pAge = '';
        if (pDate) {
          try {
            const diff = Math.max(0, Date.now() - new Date(pDate).getTime());
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const y = Math.floor(days / 365);
            const m = Math.floor((days % 365) / 30);
            pAge = y > 0 ? `${y}y ${m}m` : m > 0 ? `${m}m` : `${days}d`;
          } catch {}
        }
        return `
          <div style="width:225px;border:1.5px dashed #167A45;border-radius:14px;padding:12px;text-align:center;background:#FFFFFF;page-break-inside:avoid;box-sizing:border-box;">
            ${
              logoUri
                ? `<img src="${logoUri}" alt="BAGANI" style="width:68px;height:48px;object-fit:contain;display:block;margin:0 auto 3px auto;" />`
                : ''
            }
            <div style="font-size:10px;font-weight:800;color:#167A45;">BAGANI • SMART TAG</div>
            <div style="font-size:14px;font-weight:800;color:#17231C;margin-top:2px;">${
              plant.nameBengali
            } (${plant.nameEnglish})</div>
            <div style="font-size:11px;color:#66736A;">${plant.variety}</div>
            <div style="display:inline-block;padding:8px;border:1.5px solid #167A45;border-radius:8px;margin:6px auto;background:#FFFFFF;">
              ${svgQr}
            </div>
            <div style="font-family:monospace;font-size:10.5px;font-weight:700;color:#167A45;">${
              plant.qrCodeId
            }</div>
            <div style="font-size:11px;color:#167A45;margin-top:4px;font-weight:600;">“${quote}”</div>
            ${pDate ? `<div style="font-size:9.5px;color:#167A45;margin-top:2px;font-weight:700;">📅 ${pDate} ${pAge ? `(${pAge})` : ''}</div>` : ''}
            <div style="font-size:10px;color:#66736A;margin-top:2px;">${ownerName}</div>
          </div>
        `;
      })
      .join('');

    const sheetMarkup = `
      <div style="width:100%;max-width:760px;margin:0 auto;background:#FFFFFF;">
        <div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;">
          ${cardsHtml}
        </div>
      </div>
    `;

    if (Platform.OS === 'web') {
      this.triggerIsolatedWebPrint(sheetMarkup);
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>BAGANI A4 Batch QR Tags Sheet</title>
        </head>
        <body style="font-family:'Inter','Hind Siliguri',sans-serif;padding:16px;background:#FFFFFF;margin:0;">
          ${sheetMarkup}
        </body>
      </html>
    `;

    await Print.printAsync({ html });
  }
}
