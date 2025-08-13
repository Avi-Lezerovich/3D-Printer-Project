import React from 'react'

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  width?: number
  height?: number
  lazy?: boolean
}

export default function Image({ lazy = true, decoding = 'async', loading, ...rest }: Props) {
  const finalLoading = loading ?? (lazy ? 'lazy' : undefined)
  return <img decoding={decoding as any} loading={finalLoading as any} {...rest} />
}
