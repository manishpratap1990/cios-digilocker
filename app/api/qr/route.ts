import { generateQRCode, getVerifyUrl } from '@/lib/qr'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const resultId = searchParams.get('resultId')

  if (!resultId) {
    return Response.json({ error: 'resultId required' }, { status: 400 })
  }

  try {
    const url = getVerifyUrl(resultId)
    const dataUrl = await generateQRCode(url)
    return Response.json({ dataUrl })
  } catch (error) {
    return Response.json({ error: 'QR generation failed' }, { status: 500 })
  }
}
