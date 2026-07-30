import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

import awningImage from '../../assets/windows/Plygem/awning.png'
import casementImage from '../../assets/windows/Plygem/casement.png'
import doubleHungImage from '../../assets/windows/Plygem/doublehung.png'
import geometricImage from '../../assets/windows/Plygem/geometric.png'
import pictureImage from '../../assets/windows/Plygem/picture.png'
import singleHungImage from '../../assets/windows/Plygem/singlehung.png'
import slidingImage from '../../assets/windows/Plygem/sliding.png'
import doorImage from '../../assets/door-hero.png'
import cronusLogo from '../../assets/cronus-logo.png'

type EstimateCustomer = {
  name: string
  email: string
  phone: string
}

type EstimateProject = {
  name: string
  address: string
  salesperson: string
}

type EstimateProduct = {
  id: string
  openingNumber: string
  location: string
  category: string
  width: string
  height: string
  impact: boolean
  price: number
  promotionalPrice: number
  savings: number
}

type EstimateDiscount = {
  id: string
  name: string
  amount: number
}

type EstimatePDFProps = {
  estimateNumber: string
  estimateDate: string
  customer: EstimateCustomer
  project: EstimateProject
  products: EstimateProduct[]
  discounts: EstimateDiscount[]
  windowCount: number
  doorCount: number
  retailPrice: number
  discountTotal: number
  discountPercentage: number
  projectTotal: number
}

const navy = '#082B63'
const gold = '#B59A68'
const green = '#13A85A'
const dark = '#202020'
const medium = '#5E5E5E'
const border = '#D8D8D8'
const soft = '#F7F7F5'

const styles = StyleSheet.create({
  page: {
    paddingTop: 26,
    paddingRight: 26,
    paddingBottom: 52,
    paddingLeft: 26,
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: dark,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    minHeight: 146,
    paddingBottom: 14,
  },
  headerLeft: {
    width: '60%',
    paddingRight: 20,
  },
  headerRight: {
    width: '40%',
    paddingTop: 7,
    paddingLeft: 22,
    borderLeftWidth: 1.2,
    borderLeftColor: gold,
  },
  logo: {
    width: 220,
    height: 82,
    objectFit: 'contain',
    objectPosition: 'left center',
  },
  customerBlock: {
    marginTop: 7,
  },
  customerLine: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  customerLabel: {
    width: 70,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.6,
    color: navy,
  },
  customerValue: {
    flex: 1,
    fontSize: 9,
    color: dark,
  },
  companyInfo: {
    fontSize: 8.7,
    lineHeight: 1.5,
  },
  companyDataLine: {
    marginBottom: 5,
    color: dark,
  },
  estimateMetaBlock: {
    marginTop: 20,
  },
  estimateMetaLine: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  estimateMetaLabel: {
    width: 72,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: navy,
  },
  estimateMetaValue: {
    flex: 1,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: dark,
  },
  blueBar: {
    height: 19,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: navy,
  },
  blueBarText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.4,
  },
  idColumn: { width: '8%' },
  roomColumn: { width: '15%' },
  sizeColumn: { width: '11%' },
  imageColumn: { width: '22%' },
  detailsColumn: { width: '26%' },
  priceColumn: { width: '18%' },
  productRow: {
    minHeight: 112,
    flexDirection: 'row',
    borderRightWidth: 0.8,
    borderBottomWidth: 0.8,
    borderLeftWidth: 0.8,
    borderColor: dark,
  },
  productCell: {
    paddingTop: 11,
    paddingRight: 7,
    paddingBottom: 9,
    paddingLeft: 7,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  roomText: {
    fontSize: 8,
    textTransform: 'uppercase',
  },
  sizeText: {
    fontSize: 8,
    lineHeight: 1.5,
  },
  productImageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: 92,
    height: 90,
    objectFit: 'contain',
  },
  detailsText: {
    fontSize: 7.3,
    lineHeight: 1.45,
    textTransform: 'uppercase',
  },
  pricingLabel: {
    fontSize: 6.4,
    color: medium,
    textTransform: 'uppercase',
  },
  retailPrice: {
    marginTop: 2,
    fontSize: 9,
    textDecoration: 'line-through',
  },
  promotionalLabel: {
    marginTop: 9,
    fontSize: 6.4,
    color: medium,
    textTransform: 'uppercase',
  },
  promotionalPrice: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: green,
  },
  savings: {
    marginTop: 9,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: green,
  },
  summary: {
    flexDirection: 'row',
    borderRightWidth: 0.8,
    borderBottomWidth: 0.8,
    borderLeftWidth: 0.8,
    borderColor: dark,
  },
  summaryCounts: {
    width: '52%',
    padding: 9,
  },
  summaryCountRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  summaryCountLabel: {
    width: 72,
    fontFamily: 'Helvetica-Bold',
  },
  summaryTotals: {
    width: '48%',
    padding: 9,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryTotalLabel: {
    fontFamily: 'Helvetica-Bold',
  },
  greenValue: {
    fontFamily: 'Helvetica-Bold',
    color: green,
  },
  projectTotal: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  termsHeader: {
    marginTop: 14,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: dark,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  termsLayout: {
    flexDirection: 'row',
    gap: 22,
    paddingTop: 10,
  },
  termsColumn: {
    flex: 1,
  },
  termBlock: {
    marginBottom: 9,
  },
  termTitle: {
    marginBottom: 2,
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
  },
  termBody: {
    fontSize: 7.1,
    lineHeight: 1.4,
  },
  salesCard: {
    marginBottom: 11,
    padding: 9,
    borderWidth: 0.8,
    borderColor: border,
    backgroundColor: soft,
  },
  salesRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  salesLabel: {
    width: 52,
    fontFamily: 'Helvetica-Bold',
  },
  paymentBox: {
    marginTop: 7,
    padding: 9,
    borderWidth: 0.8,
    borderColor: border,
  },
  paymentLine: {
    marginTop: 3,
    fontSize: 7.1,
  },
  footer: {
    position: 'absolute',
    right: 26,
    bottom: 15,
    left: 26,
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#888888',
    fontSize: 6.5,
  },
})

function money(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function getProductImage(category: string) {
  const normalized = category
    .toLowerCase()
    .replace(/[*_()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (
    normalized.includes('sliding door') ||
    normalized.includes('french door') ||
    normalized.includes('entry door') ||
    normalized.includes('patio door') ||
    normalized === 'door'
  ) {
    return doorImage
  }

  if (normalized.includes('awning')) {
    return awningImage
  }

  if (normalized.includes('casement')) {
    return casementImage
  }

  if (
    normalized.includes('double hung') ||
    normalized.includes('doublehung')
  ) {
    return doubleHungImage
  }

  if (
    normalized.includes('geometric') ||
    normalized.includes('shape')
  ) {
    return geometricImage
  }

  if (
    normalized.includes('picture') ||
    normalized.includes('fixed')
  ) {
    return pictureImage
  }

  if (
    normalized.includes('single hung') ||
    normalized.includes('singlehung')
  ) {
    return singleHungImage
  }

  if (
    normalized.includes('sliding') ||
    normalized.includes('slider')
  ) {
    return slidingImage
  }

  return pictureImage
}

function productDetails(product: EstimateProduct) {
  return [
    'WINDOW - DOUBLE PANE',
    product.category,
    'WHITE',
    product.impact ? 'IMPACT' : 'NON-IMPACT',
    'SCREEN INCLUDED',
    'CLEAR GLASS',
    'NOT TEMPERED',
    'NO GRIDS',
  ]
}

export default function EstimatePDF({
  estimateNumber,
  estimateDate,
  customer,
  project,
  products,
  windowCount,
  doorCount,
  retailPrice,
  discountTotal,
  discountPercentage,
  projectTotal,
}: EstimatePDFProps) {
  return (
    <Document
      title={`Cronus Estimate ${estimateNumber}`}
      author="Cronus Windows & Doors LLC"
      subject="Window and door project estimate"
      creator="Cronus"
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            <Image src={cronusLogo} style={styles.logo} />

            <View style={styles.customerBlock}>
              <View style={styles.customerLine}>
                <Text style={styles.customerLabel}>
                  CUSTOMER:
                </Text>
                <Text style={styles.customerValue}>
                  {customer.name}
                </Text>
              </View>

              <View style={styles.customerLine}>
                <Text style={styles.customerLabel}>
                  ADDRESS:
                </Text>
                <Text style={styles.customerValue}>
                  {project.address}
                </Text>
              </View>

              <View style={styles.customerLine}>
                <Text style={styles.customerLabel}>
                  PHONE:
                </Text>
                <Text style={styles.customerValue}>
                  {customer.phone || '—'}
                </Text>
              </View>

              <View style={styles.customerLine}>
                <Text style={styles.customerLabel}>
                  EMAIL:
                </Text>
                <Text style={styles.customerValue}>
                  {customer.email || '—'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.companyInfo}>
              <Text style={styles.companyDataLine}>
                5642 Water Rose Rd
              </Text>
              <Text style={styles.companyDataLine}>
                Winter Garden, FL 34787
              </Text>
              <Text style={styles.companyDataLine}>
                321-320-8310
              </Text>
              <Text style={styles.companyDataLine}>
                info.cronus@mail.com
              </Text>
            </View>

            <View style={styles.estimateMetaBlock}>
              <View style={styles.estimateMetaLine}>
                <Text style={styles.estimateMetaLabel}>
                  DATE:
                </Text>
                <Text style={styles.estimateMetaValue}>
                  {estimateDate}
                </Text>
              </View>

              <View style={styles.estimateMetaLine}>
                <Text style={styles.estimateMetaLabel}>
                  ESTIMATE #:
                </Text>
                <Text style={styles.estimateMetaValue}>
                  {estimateNumber}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.blueBar} fixed>
          <Text style={[styles.blueBarText, styles.idColumn]}>
            ID#
          </Text>
          <Text style={[styles.blueBarText, styles.roomColumn]}>
            ROOM
          </Text>
          <Text style={[styles.blueBarText, styles.sizeColumn]}>
            SIZE
          </Text>
          <Text style={[styles.blueBarText, styles.imageColumn]}>
            IMAGE
          </Text>
          <Text style={[styles.blueBarText, styles.detailsColumn]}>
            DETAILS
          </Text>
          <Text style={[styles.blueBarText, styles.priceColumn]}>
            PRICE
          </Text>
        </View>

        {products.map((product) => (
          <View
            key={product.id}
            style={styles.productRow}
            wrap={false}
          >
            <View
              style={[
                styles.productCell,
                styles.idColumn,
              ]}
            >
              <Text style={styles.bold}>
                {product.openingNumber}
              </Text>
            </View>

            <View
              style={[
                styles.productCell,
                styles.roomColumn,
              ]}
            >
              <Text style={styles.roomText}>
                {product.location || '—'}
              </Text>
            </View>

            <View
              style={[
                styles.productCell,
                styles.sizeColumn,
              ]}
            >
              <Text style={styles.sizeText}>
                {product.width || '0'}W
              </Text>
              <Text style={styles.sizeText}>
                {product.height || '0'}H
              </Text>
            </View>

            <View
              style={[
                styles.productCell,
                styles.imageColumn,
                styles.productImageWrap,
              ]}
            >
              <Image
                src={getProductImage(product.category)}
                style={styles.productImage}
              />
            </View>

            <View
              style={[
                styles.productCell,
                styles.detailsColumn,
              ]}
            >
              {productDetails(product).map((detail) => (
                <Text
                  key={detail}
                  style={styles.detailsText}
                >
                  {detail}
                </Text>
              ))}
            </View>

            <View
              style={[
                styles.productCell,
                styles.priceColumn,
              ]}
            >
              <Text style={styles.pricingLabel}>
                Retail Price
              </Text>
              <Text style={styles.retailPrice}>
                {money(product.price)}
              </Text>

              <Text style={styles.promotionalLabel}>
                Promotional Price
              </Text>
              <Text style={styles.promotionalPrice}>
                {money(product.promotionalPrice)}
              </Text>

              <Text style={styles.savings}>
                YOU SAVE: {money(product.savings)}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.summary} wrap={false}>
          <View style={styles.summaryCounts}>
            <View style={styles.summaryCountRow}>
              <Text style={styles.summaryCountLabel}>
                WINDOWS:
              </Text>
              <Text>{windowCount}</Text>
            </View>

            <View style={styles.summaryCountRow}>
              <Text style={styles.summaryCountLabel}>
                DOORS:
              </Text>
              <Text>{doorCount}</Text>
            </View>
          </View>

          <View style={styles.summaryTotals}>
            <View style={styles.summaryTotalRow}>
              <Text style={styles.summaryTotalLabel}>
                RETAIL TOTAL:
              </Text>
              <Text style={styles.bold}>
                {money(retailPrice)}
              </Text>
            </View>

            <View style={styles.summaryTotalRow}>
              <Text style={styles.summaryTotalLabel}>
                DISCOUNT TOTAL:
              </Text>
              <Text style={styles.greenValue}>
                {money(discountTotal)}
              </Text>
            </View>

            <View style={styles.summaryTotalRow}>
              <Text style={styles.projectTotal}>
                PROJECT TOTAL:
              </Text>
              <Text style={styles.projectTotal}>
                {money(projectTotal)}
              </Text>
            </View>

            <Text style={{ marginTop: 3, fontSize: 6.5 }}>
              Effective savings: {discountPercentage.toFixed(2)}%
            </Text>
          </View>
        </View>

        <Text style={styles.termsHeader}>
          TERMS &amp; CONDITIONS
        </Text>

        <View style={styles.termsLayout}>
          <View style={styles.termsColumn}>
            <View style={styles.termBlock}>
              <Text style={styles.termTitle}>
                Estimate Validity
              </Text>
              <Text style={styles.termBody}>
                This proposal is valid for 60 days from the
                date of issue.
              </Text>
            </View>

            <View style={styles.termBlock}>
              <Text style={styles.termTitle}>
                Payment Terms
              </Text>
              <Text style={styles.termBody}>
                Cash payment: 50% deposit upon contract
                signing and 50% upon substantial completion.
                Financing options are available through our
                approved financing partners, subject to
                credit approval.
              </Text>
            </View>

            <View style={styles.termBlock}>
              <Text style={styles.termTitle}>
                Measurements
              </Text>
              <Text style={styles.termBody}>
                Final measurements will be verified by
                Cronus prior to manufacturing. Any required
                adjustments will be discussed with the
                customer before production.
              </Text>
            </View>

            <View style={styles.termBlock}>
              <Text style={styles.termTitle}>
                Production &amp; Installation
              </Text>
              <Text style={styles.termBody}>
                Estimated production and installation times
                may vary depending on product availability,
                custom orders, weather conditions, and
                manufacturer lead times.
              </Text>
            </View>

            <View style={styles.termBlock}>
              <Text style={styles.termTitle}>
                Permits
              </Text>
              <Text style={styles.termBody}>
                Permit fees are included unless otherwise
                stated in this proposal.
              </Text>
            </View>
          </View>

          <View style={styles.termsColumn}>
            <View style={styles.salesCard} wrap={false}>
              <View style={styles.salesRow}>
                <Text style={styles.salesLabel}>
                  SALES REP:
                </Text>
                <Text>{project.salesperson || '—'}</Text>
              </View>

              <View style={styles.salesRow}>
                <Text style={styles.salesLabel}>
                  CUSTOMER:
                </Text>
                <Text>{customer.name}</Text>
              </View>

              <View style={styles.salesRow}>
                <Text style={styles.salesLabel}>
                  PHONE:
                </Text>
                <Text>{customer.phone || '—'}</Text>
              </View>

              <View style={styles.salesRow}>
                <Text style={styles.salesLabel}>
                  EMAIL:
                </Text>
                <Text>{customer.email || '—'}</Text>
              </View>
            </View>

            <View style={styles.termBlock}>
              <Text style={styles.termTitle}>
                Warranty
              </Text>
              <Text style={styles.termBody}>
                Products and installation are covered under
                the applicable manufacturer's warranty and
                Cronus workmanship warranty.
              </Text>
            </View>

            <View style={styles.termBlock}>
              <Text style={styles.termTitle}>
                Change Orders
              </Text>
              <Text style={styles.termBody}>
                Any modifications requested after contract
                approval may result in additional charges
                and/or schedule changes.
              </Text>
            </View>

            <View style={styles.termBlock}>
              <Text style={styles.termTitle}>
                Cancellation
              </Text>
              <Text style={styles.termBody}>
                If this agreement qualifies for a
                cancellation period under applicable Florida
                law, the customer may cancel this contract
                within three (3) business days of signing,
                without penalty. After that period, a 35%
                cancellation fee will apply. If the products
                have entered manufacturing or production, a
                60% cancellation fee will apply due to custom
                manufacturing and production costs.
              </Text>
            </View>

            <View style={styles.termBlock}>
              <Text style={styles.termBody}>
                Please make all checks payable to Cronus
                Windows &amp; Doors LLC.
              </Text>
            </View>

            <View style={styles.paymentBox}>
              <Text style={styles.termTitle}>
                Bank Transfer Information
              </Text>
              <Text style={styles.paymentLine}>
                Bank: ______________________________
              </Text>
              <Text style={styles.paymentLine}>
                Account Name: Cronus Windows &amp; Doors LLC
              </Text>
              <Text style={styles.paymentLine}>
                Account Number: ____________________
              </Text>
              <Text style={styles.paymentLine}>
                Routing Number: ____________________
              </Text>
              <Text style={styles.paymentLine}>
                Reference: Customer Name / Estimate Number
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Cronus Windows &amp; Doors LLC</Text>
          <Text>
            {estimateNumber}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}
