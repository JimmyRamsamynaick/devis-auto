import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Register font (optional, using standard fonts for now)
// Font.register({ family: 'Roboto', src: '...' });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  companyInfo: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2563EB', // Blue-600
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  meta: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  metaLabel: {
    width: 100,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  metaValue: {
    fontWeight: 'bold',
  },
  clientSection: {
    marginTop: 20,
    marginBottom: 40,
    padding: 15,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#374151',
    textTransform: 'uppercase',
  },
  table: {
    width: '100%',
    flexDirection: 'column',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  colDesc: { width: '50%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  
  totals: {
    alignSelf: 'flex-end',
    width: '40%',
    marginTop: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalLabel: {
    color: '#6B7280',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: '#2563EB',
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
});

interface QuoteItem {
  description: string
  quantity: number
  unitPrice: number
}

interface Client {
  name: string
  companyName?: string | null
  address: string | null
  email: string
  phone: string | null
}

interface Quote {
  number: string
  createdAt: Date | string
  validUntil: Date | string
  client: Client
  items: QuoteItem[]
  subtotal: number
  discount: number
  taxRate: number
  taxAmount: number
  total: number
}

interface QuotePDFProps {
  quote: Quote;
}

export const QuotePDF = ({ quote }: QuotePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>JimmyTech</Text>
          <Text>Auterive 31190 France</Text>
          <Text>jimmyramsamynaick@gmail.com</Text>
          <Text>SIRET: 123 456 789 00012</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.title}>DEVIS</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Numéro :</Text>
            <Text style={styles.metaValue}>{quote.number}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date :</Text>
            <Text style={styles.metaValue}>{new Date(quote.createdAt).toLocaleDateString('fr-FR')}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Valide jusqu&apos;au :</Text>
            <Text style={styles.metaValue}>{new Date(quote.validUntil).toLocaleDateString('fr-FR')}</Text>
          </View>
        </View>
      </View>

      {/* Client Info */}
      <View style={styles.clientSection}>
        <Text style={styles.sectionTitle}>Client</Text>
        <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>{quote.client.name}</Text>
        {quote.client.companyName && <Text style={{ marginBottom: 2 }}>{quote.client.companyName}</Text>}
        <Text>{quote.client.address || ''}</Text>
        <Text>{quote.client.email}</Text>
        <Text>{quote.client.phone || ''}</Text>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Description</Text>
          <Text style={styles.colQty}>Qté</Text>
          <Text style={styles.colPrice}>Prix Unitaire</Text>
          <Text style={styles.colTotal}>Total HT</Text>
        </View>
        {quote.items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>{item.unitPrice.toFixed(2)} €</Text>
            <Text style={styles.colTotal}>{(item.quantity * item.unitPrice).toFixed(2)} €</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total HT</Text>
          <Text>{quote.subtotal.toFixed(2)} €</Text>
        </View>
        {quote.discount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Remise</Text>
            <Text>-{quote.discount.toFixed(2)} €</Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TVA ({quote.taxRate}%)</Text>
          <Text>{quote.taxAmount.toFixed(2)} €</Text>
        </View>
        <View style={styles.grandTotal}>
          <Text style={styles.grandTotalLabel}>Total TTC</Text>
          <Text style={styles.grandTotalValue}>{quote.total.toFixed(2)} €</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Merci de votre confiance.</Text>
        <Text>Conditions de paiement : 30 jours fin de mois. Pas d&apos;escompte pour paiement anticipé.</Text>
      </View>
    </Page>
  </Document>
);
