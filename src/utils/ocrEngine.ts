import Tesseract from 'tesseract.js';

export async function extractPdfText(file: File, maxPages = 3): Promise<string> {
    // Carga dinámica de pdf.js v3 desde CDN para evitar problemas de bundlers (.mjs) y MIME types en Hostinger
    if (!(window as any).pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error("No se pudo cargar lector PDF"));
        });
    }

    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

    const pages = Math.min(pdf.numPages, Math.max(1, maxPages));
    let out = '';

    for (let pageNum = 1; pageNum <= pages; pageNum += 1) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const text = content.items
            .map((it: any) => (typeof it.str === 'string' ? it.str : ''))
            .filter(Boolean)
            .join(' ');
        
        out += text + '\n';
    }

    // Si el texto digitalizado es muy corto, probablemente sea una imagen escaneada
    if (out.trim().length < 30) {
        const page1 = await pdf.getPage(1);
        const viewport = page1.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page1.render({ canvasContext: context, viewport } as any).promise;
            
            const result = await Tesseract.recognize(canvas, 'spa');
            return result.data.text;
        }
    }

    return out;
}

export async function extractImageText(file: File | HTMLCanvasElement): Promise<string> {
  const result = await Tesseract.recognize(file, 'spa');
  return result.data.text;
}

export async function extractFileText(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
      return extractPdfText(file);
  }
  return extractImageText(file);
}
