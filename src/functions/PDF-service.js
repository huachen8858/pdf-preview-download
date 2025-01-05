import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

const docFontsize = 8;
const footerContactInfoFontSize = 7.5;
const logoUrl = "/assets/logo.png";
const customFontUrl = "/assets/fonts/NotoSansSC-Regular.ttf";

const CompanyName = "Copany Name 公司名";
const ContactInfo =
  "5F, No. 123, Section 3, Ren'ai Road, Da'an District, Taipei City, Taiwan.";

// Function to wrap description (used in all table product description column)
function wrapDesc(text, maxWidth, font, fontSize) {
  const words = text.split(" ");
  let lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) lines.push(currentLine);

  return lines;
}

// Function to draw Left and Right Info (include address in zh font)
function drawInfoBlock(
  page,
  x,
  y,
  info,
  font,
  customFontEmbed,
  useCustomFont = false
) {
  const margin = 50;
  const lineHeight = 15;

  info.forEach((text, index) => {
    // Address: using cutomFont & wrap text if too long
    if (index == 1 && useCustomFont) {
      const addressWidth = (page.getWidth() - margin) / 2;

      let currentLine = "";
      let currentX = x;
      let currentY = y;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const testLine = currentLine + char;
        const lineWidth = customFontEmbed.widthOfTextAtSize(testLine, 8);

        if (lineWidth < addressWidth) {
          currentLine = testLine;
        } else {
          // Draw current line if too long
          page.drawText(currentLine, {
            x: currentX,
            y: currentY,
            size: 8,
            font: customFontEmbed,
            color: rgb(0, 0, 0),
          });
          currentY -= lineHeight;
          currentLine = char;
        }
      }

      // Draw the last line
      if (currentLine) {
        page.drawText(currentLine.trim(), {
          x: currentX,
          y: currentY,
          size: 8,
          font: customFontEmbed,
          color: rgb(0, 0, 0),
        });
      }
    } else {
      // Default drawing for other fields
      page.drawText(text, {
        x,
        y,
        size: 8,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    }
  });
}

// Function to Add Page Number
function addPageNumbers(pdfDoc, width, margin, font, fontSize) {
  const totalPages = pdfDoc.getPageCount();
  for (let i = 1; i <= totalPages; i++) {
    const page = pdfDoc.getPage(i - 1);
    page.drawText(`${i} of ${totalPages}`, {
      x:
        width -
        190 -
        font.widthOfTextAtSize(`${i} of ${totalPages}`, fontSize) / 2,
      y: margin + 604.5,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  }
}

// Generate Packing List PDF (PL)
export async function genPLPdf(shippingData) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const pageSize = [595.28, 841.89]; // A4 size
  const margin = 50;
  const lineHeight = 15;

  // Load fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Custom Fonts (zh)
  const loadCustomFont = async () => {
    const fontBytes = await fetch(customFontUrl).then((res) =>
      res.arrayBuffer()
    );
    return fontBytes;
  };
  const customFont = await loadCustomFont();
  const customFontEmbed = await pdfDoc.embedFont(customFont);

  // Logo
  const logoImageBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
  const logoImage = await pdfDoc.embedPng(logoImageBytes);
  const logoDims = logoImage.scale(0.1);

  const addNewPage = () => {
    const page = pdfDoc.addPage(pageSize);
    const { width, height } = page.getSize();

    /**
     * Logo
     */
    const logoX = (width - logoDims.width) / 2;
    const logoY = height - margin - logoDims.height;

    page.drawImage(logoImage, {
      x: logoX,
      y: logoY,
      width: logoDims.width,
      height: logoDims.height,
    });

    let currentY = logoY - 20;

    /**
     * Draw Receiver & Sender Info (Left & Right)
     */
    const leftInfo = [
      `Receiver: ${shippingData.receiver.name || ""}`,
      `Address: ${shippingData.receiver.address || ""}`,
      ``,

      `Company: ${shippingData.receiver.company || ""}`,
      `Tel: ${shippingData.receiver.tel || ""}`,
      `Email: ${shippingData.receiver.email || ""}`,
      ``,
    ];

    const rightInfo = [
      `Sender: ${shippingData.sender.name || ""}`,
      `Address: ${shippingData.sender.address || ""}`,
      ``,
      `Company: ${shippingData.sender.company || ""}`,
      `Tel: ${shippingData.sender.tel || ""}`,
      `Email: ${shippingData.sender.email || ""}`,
      `Page No.: `,
    ];

    drawInfoBlock(
      page,
      margin,
      currentY,
      leftInfo,
      font,
      customFontEmbed,
      true
    );
    drawInfoBlock(
      page,
      width / 2 + 50,
      currentY,
      rightInfo,
      font,
      customFontEmbed,
      true
    );

    /**
     * Footer
     */
    const footerMargin = 30;
    const lineY = footerMargin;

    // divider
    page.drawRectangle({
      x: margin,
      y: lineY,
      width: width - margin * 2,
      height: 1,
      color: rgb(0, 0, 0),
    });

    // Company Info
    const textWidth = customFontEmbed.widthOfTextAtSize(
      CompanyName,
      docFontsize
    );
    const xCenter = (width - textWidth) / 2;
    page.drawText(CompanyName, {
      x: xCenter,
      y: footerMargin + 8,
      size: docFontsize,
      font: customFontEmbed,
      color: rgb(0, 0, 0),
    });

    // Contact Info
    const contactTextWidth = customFontEmbed.widthOfTextAtSize(
      ContactInfo,
      footerContactInfoFontSize
    );
    const contactXCenter = (width - contactTextWidth) / 2;

    page.drawText(ContactInfo, {
      x: contactXCenter,
      y: footerMargin - 10,
      size: footerContactInfoFontSize,
      font,
      color: rgb(0, 0, 0),
    });

    return page;
  };

  let currentPage = addNewPage();
  const { width, height } = currentPage.getSize();

  let currentY = 620;

  // Draw Table
  const headers = ["No.", "Item", "Prod Description", "Qty", "Weight"];
  const columnWidths = [50, 100, 240, 50, 50];

  // Table Header
  const drawTableHeader = (page, y) => {
    let x = margin;
    const title = "Shipping Item List";
    const titleFontSize = 14;

    // Table Title
    page.drawText(title, {
      x: width / 2 - font.widthOfTextAtSize(title, titleFontSize) / 2,
      y,
      size: titleFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    headers.forEach((header, index) => {
      page.drawText(header, {
        x,
        y: y - 20,
        size: 8,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      x += columnWidths[index];
    });

    page.drawRectangle({
      x: margin,
      y: y - 10,
      width: columnWidths.reduce((a, b) => a + b, 0),
      height: 1,
      color: rgb(0, 0, 0),
    });
    page.drawRectangle({
      x: margin,
      y: y - 26,
      width: columnWidths.reduce((a, b) => a + b, 0),
      height: 1,
      color: rgb(0, 0, 0),
    });

    return y - lineHeight - 25;
  };

  currentY = drawTableHeader(currentPage, currentY);

  // Draw Table Info
  const columnWidthsCopy = [...columnWidths];
  shippingData.shippingItemList.forEach((item, index) => {
    if (currentY < margin + 50) {
      currentPage = addNewPage();
      currentY = height - margin;
      currentY = drawTableHeader(currentPage, 620);
    }

    let x = margin;

    // Draw No. row
    let no = (index + 1).toString();
    currentPage.drawText(no, {
      x,
      y: currentY,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });
    x += columnWidthsCopy[0];
    
    // Draw item row
    currentPage.drawText(item.item, {
      x,
      y: currentY,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });
    x += columnWidthsCopy[1];

    // Prod Description
    if (item.prodDescription && item.prodDescription.length > 0) {
      const prodDescriptionText = item.prodDescription.join("\n");
      const descriptionLines = prodDescriptionText
        .split("\n")
        .flatMap((line) => wrapDesc(line, columnWidthsCopy[2], font, 10));
      descriptionLines.forEach((line, i) => {
        if (currentY < margin + 50) {
          currentPage = addNewPage();
          const nextPageY = 620;
          currentY = drawTableHeader(currentPage, nextPageY);
          x = margin + columnWidthsCopy[1] + 50; // Reset X position
        }
        currentPage.drawText(line, {
          x,
          y: currentY,
          size: 8,
          font,
          color: rgb(0, 0, 0),
        });
        currentY -= lineHeight;
      });
    } else {
      // Adjust currentY if no description
      currentY -= lineHeight;
    }

    x += columnWidths[2];

    // Other columns (Qty & Weight)
    const otherColumns = [item.qty, item.weight];
    otherColumns.forEach((text, index) => {
      currentPage.drawText(text, {
        x,
        y: currentY + lineHeight,
        size: 8,
        font,
        color: rgb(0, 0, 0),
      });
      x += columnWidthsCopy[index + 3];
    });

    currentY -= lineHeight;
  });

  // black divider below the table
  currentPage.drawRectangle({
    x: margin,
    y: currentY + 6,
    width: columnWidths.reduce((a, b) => a + b, 0),
    height: 1,
    color: rgb(0, 0, 0),
  });

  // Page Number
  addPageNumbers(pdfDoc, width, margin, font, docFontsize);

  // Finalize and create URL
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const pdfUrl = URL.createObjectURL(blob);
  return pdfUrl;
}
