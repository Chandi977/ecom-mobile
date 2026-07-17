import React, { useEffect, useMemo, useState } from 'react';
import FastImage from 'react-native-fast-image';
import { ImagePath } from '../../utils/ImagePath';
import { getProductImages } from '../../utils/productCatalog';

// Bundled placeholder shown when a product has no image or the remote image
// fails to load — the mobile counterpart of the web app's ProductImage
// fallback. Pass either a resolved `uri` string or a `product` to derive it.
const FALLBACK_SOURCE = ImagePath.spLogo;

const ProductImage = ({
  product,
  uri,
  style,
  resizeMode = FastImage.resizeMode.contain,
  priority = FastImage.priority.high,
  onLoadStart,
  onLoadEnd,
  ...rest
}) => {
  const candidates = useMemo(() => {
    const list = [];
    if (uri) list.push(uri);
    if (product) {
      getProductImages(product).forEach(item => {
        if (item?.image && !list.includes(item.image)) list.push(item.image);
      });
    }
    return list;
  }, [product, uri]);
  const candidateKey = candidates.join('|');
  const [candidateIndex, setCandidateIndex] = useState(0);
  const resolvedUri = candidates[candidateIndex] || '';
  const showFallback = !resolvedUri;

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidateKey]);

  // When we render the local placeholder there are no reliable remote load
  // events, so proactively signal start/end — otherwise a caller that gates a
  // spinner on onLoadEnd (e.g. the product detail hero) would hang forever.
  useEffect(() => {
    if (showFallback) {
      onLoadStart && onLoadStart();
      onLoadEnd && onLoadEnd();
    }
  }, [showFallback, onLoadStart, onLoadEnd]);

  if (showFallback) {
    return (
      <FastImage
        {...rest}
        style={style}
        source={FALLBACK_SOURCE}
        resizeMode={resizeMode}
      />
    );
  }

  return (
    <FastImage
      {...rest}
      style={style}
      source={{ uri: resolvedUri, priority, cache: FastImage.cacheControl.web }}
      resizeMode={resizeMode}
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
      onError={() => {
        setCandidateIndex(currentIndex => {
          return Math.min(currentIndex + 1, candidates.length);
        });
      }}
    />
  );
};

export default ProductImage;
