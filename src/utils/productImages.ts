import awningImage from '../assets/windows/Plygem/awning.png'
import casementImage from '../assets/windows/Plygem/casement.png'
import doubleHungImage from '../assets/windows/Plygem/doublehung.png'
import geometricImage from '../assets/windows/Plygem/geometric.png'
import pictureImage from '../assets/windows/Plygem/picture.png'
import singleHungImage from '../assets/windows/Plygem/singlehung.png'
import slidingImage from '../assets/windows/Plygem/sliding.png'

function normalizeProductName(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[*_()-]/g, ' ')
    .replace(/\s+/g, ' ')
}

export function getProductImage(
  productCategory?: unknown,
  productLabel?: unknown,
) {
  const productName = normalizeProductName(
    productCategory || productLabel,
  )

  if (productName.includes('awning')) {
    return awningImage
  }

  if (productName.includes('casement')) {
    return casementImage
  }

  if (
    productName.includes('double hung') ||
    productName.includes('doublehung')
  ) {
    return doubleHungImage
  }

  if (
    productName.includes('geometric') ||
    productName.includes('shape')
  ) {
    return geometricImage
  }

  if (productName.includes('picture')) {
    return pictureImage
  }

  if (
    productName.includes('single hung') ||
    productName.includes('singlehung')
  ) {
    return singleHungImage
  }

  if (
    productName.includes('sliding') ||
    productName.includes('slider')
  ) {
    return slidingImage
  }

  return ''
}