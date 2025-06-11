"use client";

import Image, { ImageProps } from "next/image";
import { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: string;
  fallbackMessage?: string;
  className?: string;
  containerClassName?: string;
  showBlurPlaceholder?: boolean;
  blurDataURL?: string;
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const defaultBlurDataURL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

export const ImageWithFallback = forwardRef<
  HTMLImageElement,
  ImageWithFallbackProps
>(
  (
    {
      src,
      alt,
      fallbackSrc,
      fallbackMessage = "이미지를 불러올 수 없습니다",
      className,
      containerClassName,
      showBlurPlaceholder = true,
      blurDataURL = defaultBlurDataURL,
      onError,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleError = (
      event: React.SyntheticEvent<HTMLImageElement, Event>
    ) => {
      setImageError(true);
      setIsLoading(false);
      // 커스텀 onError가 있으면 실행
      onError?.(event);
    };

    const handleLoad = () => {
      setIsLoading(false);
    };

    if (imageError && fallbackSrc) {
      return (
        <div className={cn("relative", containerClassName)}>
          <Image
            {...props}
            ref={ref}
            src={fallbackSrc}
            alt={alt}
            className={className}
            onLoad={handleLoad}
            onError={(event) => {
              setImageError(true);
              onError?.(event);
            }}
          />
        </div>
      );
    }

    if (imageError) {
      return (
        <div className={cn("relative", containerClassName)}>
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <p className="text-muted-foreground text-sm">{fallbackMessage}</p>
          </div>
        </div>
      );
    }

    return (
      <div className={cn("relative", containerClassName)}>
        <Image
          {...props}
          ref={ref}
          src={src}
          alt={alt}
          className={className}
          onError={handleError}
          onLoad={handleLoad}
          placeholder={showBlurPlaceholder ? "blur" : "empty"}
          blurDataURL={showBlurPlaceholder ? blurDataURL : undefined}
        />
      </div>
    );
  }
);

ImageWithFallback.displayName = "ImageWithFallback";
