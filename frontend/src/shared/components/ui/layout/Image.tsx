import React from 'react'

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  width?: number
  height?: number
  lazy?: boolean
}

export default function Image({ lazy = true, decoding = 'async', loading, onLoad, onError, ...rest }: Props) {
  const finalLoading: Props['loading'] = loading ?? (lazy ? 'lazy' : undefined)
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => { onLoad?.(e) }
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => { onError?.(e) }
  return <img decoding={decoding} loading={finalLoading} onLoad={handleLoad} onError={handleError} {...rest} />
}
