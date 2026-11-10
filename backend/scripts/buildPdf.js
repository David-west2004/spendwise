const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * Pure Node.js PDF Generator for Markdown Documentation
 * Generates valid PDF 1.4 files with zero external dependencies.
 */
class PDFDocument {
  constructor() {
    this.pageWidth = 595.28;  // A4
    this.pageHeight = 841.89; // A4
    this.marginLeft = 45;
    this.marginRight = 45;
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight;
    this.marginTop = 50;
    this.marginBottom = 50;

    this.pages = [];
    this.currentPage = null;
    this.y = this.pageHeight - this.marginTop;

    this.objects = [];
    this.nextObjId = 1;

    this.addPage();
  }

  allocateId() {
    return this.nextObjId++;
  }

  addPage() {
    if (this.currentPage) {
      this.pages.push(this.currentPage);
    }
    this.currentPage = {
      content: [],
    };
    this.y = this.pageHeight - this.marginTop;
  }

  checkPageBreak(neededHeight) {
    if (this.y - neededHeight < this.marginBottom) {
      this.addPage();
    }
  }

  escapePdfText(text) {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  drawRect(x, y, w, h, fillColor, strokeColor = null, lineWidth = 1) {
    let cmd = 'q\n';
    if (fillColor) {
      cmd += `${fillColor[0]} ${fillColor[1]} ${fillColor[2]} rg\n`;
      cmd += `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re\nf\n`;
    }
    if (strokeColor) {
      cmd += `${lineWidth} w\n`;
      cmd += `${strokeColor[0]} ${strokeColor[1]} ${strokeColor[2]} RG\n`;
      cmd += `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re\nS\n`;
    }
    cmd += 'Q\n';
    this.currentPage.content.push(cmd);
  }

  drawLine(x1, y1, x2, y2, color = [0.85, 0.85, 0.85], width = 1) {
    const cmd = `q\n${width} w\n${color[0]} ${color[1]} ${color[2]} RG\n${x1.toFixed(2)} ${y1.toFixed(2)} m\n${x2.toFixed(2)} ${y2.toFixed(2)} l\nS\nQ\n`;
    this.currentPage.content.push(cmd);
  }

  addText(text, options = {}) {
    const font = options.font || 'F1'; // F1: Helvetica, F2: Helvetica-Bold, F3: Courier, F4: Courier-Bold
    const size = options.size || 10;
    const color = options.color || [0.12, 0.16, 0.22];
    const x = options.x !== undefined ? options.x : this.marginLeft;
    const y = options.y !== undefined ? options.y : this.y;

    const escaped = this.escapePdfText(text);
    const cmd = `BT\n/${font} ${size} Tf\n${color[0]} ${color[1]} ${color[2]} rg\n${x.toFixed(2)} ${y.toFixed(2)} Td\n(${escaped}) Tj\nET\n`;
    this.currentPage.content.push(cmd);
  }

  // Estimate string width in points (approximation for Helvetica/Courier)
  approxWidth(text, size, isMono = false) {
    if (isMono) return text.length * size * 0.6;
    return text.length * size * 0.52;
  }

  wrapText(text, maxWidth, size, isMono = false) {
    if (isMono) {
      const maxChars = Math.floor(maxWidth / (size * 0.6));
      const lines = [];
      for (let i = 0; i < text.length; i += maxChars) {
        lines.push(text.slice(i, i + maxChars));
      }
      return lines;
    }

    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (this.approxWidth(testLine, size) <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines.length ? lines : [''];
  }

  renderTitle(title) {
    this.checkPageBreak(50);
    this.y -= 10;
    this.addText(title, { font: 'F2', size: 20, color: [0.01, 0.45, 0.65] });
    this.y -= 8;
    this.drawLine(this.marginLeft, this.y, this.marginLeft + this.contentWidth, this.y, [0.01, 0.52, 0.78], 2);
    this.y -= 22;
  }

  renderH2(text) {
    this.checkPageBreak(40);
    this.y -= 14;
    this.addText(text, { font: 'F2', size: 14, color: [0.07, 0.09, 0.15] });
    this.y -= 6;
    this.drawLine(this.marginLeft, this.y, this.marginLeft + this.contentWidth, this.y, [0.88, 0.90, 0.92], 1);
    this.y -= 16;
  }

  renderH3(text) {
    this.checkPageBreak(30);
    this.y -= 10;
    this.addText(text, { font: 'F2', size: 11.5, color: [0.12, 0.23, 0.54] });
    this.y -= 14;
  }

  renderH4(text) {
    this.checkPageBreak(25);
    this.y -= 8;
    this.addText(text, { font: 'F2', size: 10, color: [0.22, 0.25, 0.32] });
    this.y -= 12;
  }

  renderParagraph(text) {
    const lines = this.wrapText(text, this.contentWidth, 9.5);
    this.checkPageBreak(lines.length * 13 + 8);
    for (const line of lines) {
      this.addText(line, { font: 'F1', size: 9.5, color: [0.15, 0.18, 0.24] });
      this.y -= 13;
    }
    this.y -= 5;
  }

  renderBullet(text) {
    const indent = 15;
    const lines = this.wrapText(text, this.contentWidth - indent, 9.5);
    this.checkPageBreak(lines.length * 13 + 4);
    
    // Draw bullet dot
    this.drawRect(this.marginLeft + 3, this.y + 3, 3, 3, [0.2, 0.4, 0.6]);

    for (let i = 0; i < lines.length; i++) {
      this.addText(lines[i], {
        font: 'F1',
        size: 9.5,
        color: [0.15, 0.18, 0.24],
        x: this.marginLeft + indent,
      });
      this.y -= 13;
    }
    this.y -= 3;
  }

  renderCodeBlock(lines, lang = '') {
    const lineHeight = 11;
    const padY = 8;
    const padX = 10;
    const boxHeight = lines.length * lineHeight + padY * 2;

    this.checkPageBreak(Math.min(boxHeight, 150));

    // Draw dark code block container
    this.drawRect(
      this.marginLeft,
      this.y - boxHeight,
      this.contentWidth,
      boxHeight,
      [0.06, 0.09, 0.16],
      [0.15, 0.20, 0.30],
      1
    );

    let curY = this.y - padY - 8;
    for (const line of lines) {
      const cleanLine = line.replace(/\t/g, '  ');
      // Truncate line if it extends beyond code block width
      const truncated = cleanLine.slice(0, 88);
      this.addText(truncated, {
        font: 'F3',
        size: 8,
        color: [0.95, 0.96, 0.98],
        x: this.marginLeft + padX,
        y: curY,
      });
      curY -= lineHeight;
    }

    this.y -= boxHeight + 12;
  }

  renderTable(headers, rows) {
    const colCount = headers.length;
    const colWidth = this.contentWidth / colCount;
    const rowHeight = 18;
    const totalHeight = (rows.length + 1) * rowHeight + 10;

    this.checkPageBreak(Math.min(totalHeight, 120));

    let curY = this.y;

    // Header background
    this.drawRect(this.marginLeft, curY - rowHeight, this.contentWidth, rowHeight, [0.93, 0.95, 0.98]);

    // Header text
    headers.forEach((h, idx) => {
      this.addText(h.slice(0, Math.floor(colWidth / 6)), {
        font: 'F2',
        size: 8.5,
        color: [0.1, 0.2, 0.35],
        x: this.marginLeft + idx * colWidth + 6,
        y: curY - 13,
      });
    });

    curY -= rowHeight;

    // Rows
    rows.forEach((row, rIdx) => {
      if (curY - rowHeight < this.marginBottom) {
        this.addPage();
        curY = this.pageHeight - this.marginTop;
      }

      if (rIdx % 2 === 1) {
        this.drawRect(this.marginLeft, curY - rowHeight, this.contentWidth, rowHeight, [0.98, 0.98, 0.99]);
      }
      this.drawLine(this.marginLeft, curY, this.marginLeft + this.contentWidth, curY, [0.90, 0.90, 0.92], 0.5);

      row.forEach((cell, cIdx) => {
        const text = cell.slice(0, Math.floor(colWidth / 5.5));
        this.addText(text, {
          font: 'F1',
          size: 8,
          color: [0.2, 0.22, 0.28],
          x: this.marginLeft + cIdx * colWidth + 6,
          y: curY - 13,
        });
      });

      curY -= rowHeight;
    });

    // Outer border
    this.drawLine(this.marginLeft, this.y, this.marginLeft + this.contentWidth, this.y, [0.85, 0.85, 0.88], 1);
    this.drawLine(this.marginLeft, curY, this.marginLeft + this.contentWidth, curY, [0.85, 0.85, 0.88], 1);

    this.y = curY - 14;
  }

  buildPDF() {
    if (this.currentPage) {
      this.pages.push(this.currentPage);
    }

    const totalPages = this.pages.length;

    // Add page numbers to each page
    this.pages.forEach((p, index) => {
      const footerText = `SpendWise API Documentation  |  Page ${index + 1} of ${totalPages}`;
      const escaped = this.escapePdfText(footerText);
      const cmd = `BT\n/F1 8 Tf\n0.5 0.5 0.55 rg\n${(this.pageWidth / 2 - 80).toFixed(2)} 25.00 Td\n(${escaped}) Tj\nET\n`;
      p.content.push(cmd);
    });

    // Build PDF objects
    const objOffsets = [];
    let buf = Buffer.from('%PDF-1.4\n%âãÏÓ\n');

    const addObj = (data) => {
      const id = this.allocateId();
      const offset = buf.length;
      objOffsets[id] = offset;
      buf = Buffer.concat([buf, Buffer.from(`${id} 0 obj\n${data}\nendobj\n`)]);
      return id;
    };

    // Standard 14 Fonts (built-in, no embedding required)
    const fontHelveticaId = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    const fontHelveticaBoldId = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    const fontCourierId = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>');
    const fontCourierBoldId = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>');

    const procSetId = addObj('[/PDF /Text /ImageB /ImageC /ImageI]');

    const pageIds = [];
    const pagesObjId = this.allocateId(); // Reserve ID for Pages tree

    for (const page of this.pages) {
      const streamContent = Buffer.from(page.content.join(''));
      const compressed = zlib.deflateSync(streamContent);

      const streamId = addObj(`<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\n${compressed.toString('binary')}\nendstream`);

      const pageId = addObj(`<<
  /Type /Page
  /Parent ${pagesObjId} 0 R
  /MediaBox [0 0 ${this.pageWidth} ${this.pageHeight}]
  /Contents ${streamId} 0 R
  /Resources <<
    /ProcSet ${procSetId} 0 R
    /Font <<
      /F1 ${fontHelveticaId} 0 R
      /F2 ${fontHelveticaBoldId} 0 R
      /F3 ${fontCourierId} 0 R
      /F4 ${fontCourierBoldId} 0 R
    >>
  >>
>>`);
      pageIds.push(pageId);
    }

    // Define Pages catalog tree
    const kidsStr = pageIds.map((id) => `${id} 0 R`).join(' ');
    const offsetPages = buf.length;
    objOffsets[pagesObjId] = offsetPages;
    buf = Buffer.concat([buf, Buffer.from(`${pagesObjId} 0 obj\n<< /Type /Pages /Kids [${kidsStr}] /Count ${pageIds.length} >>\nendobj\n`)]);

    // Root Catalog
    const catalogId = addObj(`<< /Type /Catalog /Pages ${pagesObjId} 0 R >>`);

    // XRef table
    const startXref = buf.length;
    let xref = `xref\n0 ${this.nextObjId}\n0000000000 65535 f \n`;
    for (let i = 1; i < this.nextObjId; i++) {
      const o = objOffsets[i] || 0;
      xref += String(o).padStart(10, '0') + ' 00000 n \n';
    }

    const trailer = `trailer\n<< /Size ${this.nextObjId} /Root ${catalogId} 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
    buf = Buffer.concat([buf, Buffer.from(xref + trailer)]);

    return buf;
  }
}

function parseAndRenderMarkdown(mdText, doc) {
  const lines = mdText.split(/\r?\n/);
  let inCodeBlock = false;
  let codeLines = [];
  let codeLang = '';
  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Code block toggle
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      } else {
        inCodeBlock = false;
        doc.renderCodeBlock(codeLines, codeLang);
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      continue;
    }

    // Markdown Table
    if (line.startsWith('|') && line.endsWith('|')) {
      const parts = line.split('|').slice(1, -1).map((s) => s.trim());
      if (!inTable) {
        inTable = true;
        tableHeaders = parts;
        tableRows = [];
      } else {
        // Skip separator line |:---|:---|
        if (parts.every((p) => /^:?-+:?$/.test(p))) {
          continue;
        }
        tableRows.push(parts);
      }
      continue;
    } else if (inTable) {
      inTable = false;
      doc.renderTable(tableHeaders, tableRows);
    }

    // Empty lines
    if (!line) {
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      doc.renderTitle(line.slice(2));
    } else if (line.startsWith('## ')) {
      doc.renderH2(line.slice(3));
    } else if (line.startsWith('### ')) {
      doc.renderH3(line.slice(4));
    } else if (line.startsWith('#### ')) {
      doc.renderH4(line.slice(5));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      doc.renderBullet(line.slice(2));
    } else if (line === '---') {
      doc.checkPageBreak(15);
      doc.drawLine(doc.marginLeft, doc.y, doc.marginLeft + doc.contentWidth, doc.y, [0.85, 0.85, 0.85], 1);
      doc.y -= 14;
    } else {
      doc.renderParagraph(line);
    }
  }

  if (inTable) {
    doc.renderTable(tableHeaders, tableRows);
  }
}

function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const mdPath = path.join(projectRoot, 'API_DOCUMENTATION.md');
  const pdfPath = path.join(projectRoot, 'API_DOCUMENTATION.pdf');

  console.log(`Reading Markdown: ${mdPath}...`);
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  console.log('Generating structured PDF 1.4 document...');
  const doc = new PDFDocument();
  parseAndRenderMarkdown(mdContent, doc);

  const pdfBuffer = doc.buildPDF();
  fs.writeFileSync(pdfPath, pdfBuffer);

  const stats = fs.statSync(pdfPath);
  console.log(`✔ SUCCESS: ${pdfPath} generated (${stats.size} bytes)!`);
}

main();
