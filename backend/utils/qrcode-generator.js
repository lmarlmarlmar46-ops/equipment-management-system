const QRCode = require('qrcode');

// Generate QR code as data URL
const generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    throw new Error(`QR Code generation failed: ${error.message}`);
  }
};

// Generate QR code as buffer (for file saving)
const generateQRCodeBuffer = async (data) => {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 300,
      margin: 2
    });
    return qrCodeBuffer;
  } catch (error) {
    throw new Error(`QR Code generation failed: ${error.message}`);
  }
};

module.exports = {
  generateQRCode,
  generateQRCodeBuffer
};
