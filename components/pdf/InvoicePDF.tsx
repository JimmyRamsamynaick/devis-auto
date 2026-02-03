import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

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
    color: '#2563EB',
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#9CA3AF',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 10,
  },
});

interface InvoicePDFProps {
  invoice: any;
}

export default function InvoicePDF({ invoice }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>JimmyTech</Text>
            <Text>Auterive 31190 France</Text>
            <Text>jimmyramsamynaick@gmail.com</Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.title}>FACTURE</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Numéro:</Text>
              <Text style={styles.metaValue}>{invoice.number}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date:</Text>
              <Text style={styles.metaValue}>{new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Échéance:</Text>
              <Text style={styles.metaValue}>{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>Facturé à:</Text>
          <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>{invoice.client.name}</Text>
          {invoice.client.companyName && <Text style={{ marginBottom: 2 }}>{invoice.client.companyName}</Text>}
          <Text>{invoice.client.address}</Text>
          <Text>{invoice.client.email}</Text>
          <Text>{invoice.client.phone}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colPrice}>Prix Unit.</Text>
            <Text style={styles.colTotal}>Total HT</Text>
          </View>
          {invoice.items.map((item: any, i: number) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{item.unitPrice.toFixed(2)} €</Text>
              <Text style={styles.colTotal}>{(item.quantity * item.unitPrice).toFixed(2)} €</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals} wrap={false}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total HT:</Text>
            <Text style={styles.metaValue}>{invoice.subtotal.toFixed(2)} €</Text>
          </View>
          {invoice.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Remise:</Text>
              <Text style={styles.metaValue}>-{invoice.discount.toFixed(2)} €</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA ({invoice.taxRate}%):</Text>
            <Text style={styles.metaValue}>{invoice.taxAmount.toFixed(2)} €</Text>
          </View>
          <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 5 }]}>
            <Text style={styles.grandTotal}>Total TTC:</Text>
            <Text style={styles.grandTotal}>{invoice.total.toFixed(2)} €</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Merci de votre confiance.</Text>
          <Text>Paiement accepté par Virement, PayPal ou Espèces.</Text>
          <Text>IBAN : FR76 2823 3000 0194 7896 0817 025</Text>
          <Text>En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée.</Text>
          <Text>Indemnité forfaitaire pour frais de recouvrement : 40 €.</Text>
        </View>

        <Text 
          style={styles.pageNumber} 
          render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} 
          fixed 
        />
      </Page>
    </Document>
  );
}
