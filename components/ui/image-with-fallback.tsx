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
    const [fallbackError, setFallbackError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleError = (
      event: React.SyntheticEvent<HTMLImageElement, Event>
    ) => {
      setImageError(true);
      setIsLoading(false);
      // 커스텀 onError가 있으면 실행
      onError?.(event);
    };

    const handleFallbackError = (
      event: React.SyntheticEvent<HTMLImageElement, Event>
    ) => {
      setFallbackError(true);
      setIsLoading(false);
      // 커스텀 onError가 있으면 실행
      onError?.(event);
    };

    const handleLoad = () => {
      setIsLoading(false);
    };

    // 메인 이미지 실패했지만 fallback 이미지가 있고 아직 fallback 실패하지 않은 경우
    if (imageError && fallbackSrc && !fallbackError) {
      return (
        <div className={cn("relative", containerClassName)}>
          <Image
            {...props}
            ref={ref}
            src={fallbackSrc}
            alt={alt}
            className={className}
            onLoad={handleLoad}
            onError={handleFallbackError}
          />
        </div>
      );
    }

    // 메인 이미지 실패 시 (fallback 없거나 fallback도 실패한 경우)
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
