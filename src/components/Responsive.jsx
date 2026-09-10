import { moderateScale, textScale } from '../utils/responsiveSize';

export const responsiveFontSize = size => textScale(size);

export const responsivePadding = size => moderateScale(size);
