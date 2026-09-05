export default function CiosLogo({ size = 95, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="केन्द्रीय मुक्त विद्यालयी शिक्षा संस्थान उत्तर प्रदेश Logo"
      width={size}
      height={size}
      className={className}
      style={{
        width: size ? `${size}px` : 'auto',
        height: size ? `${size}px` : 'auto',
        objectFit: 'contain',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  )
}
