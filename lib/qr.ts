import QRCodeLib from 'qrcode'

export async function generateQRCode(url: string): Promise<string> {
  const dataUrl = await QRCodeLib.toDataURL(url, {
    width: 200,
    margin: 2,
    color: {
      dark: '#1e3a5f',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  })
  return dataUrl
}

export function getVerifyUrl(resultId: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return `${base}/verify/${resultId}`
}
