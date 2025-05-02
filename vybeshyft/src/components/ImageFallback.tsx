import { useState, useEffect } from 'react';

interface ImageFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc: string;
}

/**
 * A component to display an image with a fallback if the primary image fails to load
 */
const ImageFallback = ({ src, fallbackSrc, alt, className, ...props }: ImageFallbackProps) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [error, setError] = useState(false);

  // Update source when prop changes
  useEffect(() => {
    if (src !== imgSrc && !error) {
      setImgSrc(src);
    }
  }, [src]);

  const handleError = () => {
    if (!error) {
      console.warn(`Image failed to load: ${imgSrc}`);
      setImgSrc(fallbackSrc);
      setError(true);
    }
  };

  // If it's a base64 image, just use it directly - these can't fail
  const isBase64 = imgSrc?.startsWith('data:image/');

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt}
      className={className}
      onError={!isBase64 ? handleError : undefined}
      {...props}
    />
  );
};

export default ImageFallback; 