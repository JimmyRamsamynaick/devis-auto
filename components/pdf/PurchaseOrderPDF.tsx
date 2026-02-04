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
  colDesc: { width: '85%' },
  colQty: { width: '15%', textAlign: 'center' },
  
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
  signatureSection: {
    marginTop: 40,
    marginLeft: 30,
  },
  cgvPage: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  cgvTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#111827',
  },
  cgvSection: {
    marginBottom: 10,
  },
  cgvSectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#374151',
  },
  cgvText: {
    marginBottom: 3,
    color: '#4B5563',
    textAlign: 'justify',
  },
});

interface PurchaseOrderPDFProps {
  purchaseOrder: any;
}

export default function PurchaseOrderPDF({ purchaseOrder }: PurchaseOrderPDFProps) {
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
            <Text style={styles.title}>BON DE COMMANDE</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Numéro:</Text>
              <Text style={styles.metaValue}>{purchaseOrder.number}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date:</Text>
              <Text style={styles.metaValue}>{new Date(purchaseOrder.createdAt).toLocaleDateString('fr-FR')}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Valide jusqu&apos;au:</Text>
              <Text style={styles.metaValue}>{new Date(purchaseOrder.validUntil).toLocaleDateString('fr-FR')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>Pour:</Text>
          <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>{purchaseOrder.client.name}</Text>
          {purchaseOrder.client.companyName && <Text style={{ marginBottom: 2 }}>{purchaseOrder.client.companyName}</Text>}
          <Text>{purchaseOrder.client.address}</Text>
          <Text>{purchaseOrder.client.email}</Text>
          <Text>{purchaseOrder.client.phone}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qté</Text>
          </View>
          {purchaseOrder.items.map((item: any, i: number) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.signatureSection} wrap={false}>
          <Text style={{ marginBottom: 15 }}>Bon pour accord, lu et approuvé le : ____________________</Text>
          <Text>Signature :</Text>
        </View>

        <View style={styles.footer} wrap={false}>
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

      <Page style={styles.cgvPage}>
        <Text style={styles.cgvTitle}>CONDITIONS GÉNÉRALES DE VENTE ET DE PRESTATIONS</Text>
        
        <View style={styles.cgvSection}>
          <Text style={styles.cgvSectionTitle}>ARTICLE 1 - CHAMPS D'APPLICATION</Text>
          <Text style={styles.cgvText}>
            Les présentes conditions générales de vente (CGV) s'appliquent, sans restriction ni réserve, à l'ensemble des prestations de services et ventes de marchandises réalisées par le prestataire auprès de clients professionnels ou particuliers. Le fait de passer commande ou d'accepter un devis implique l'adhésion entière et sans réserve du client aux présentes CGV.
          </Text>
        </View>

        <View style={styles.cgvSection}>
          <Text style={styles.cgvSectionTitle}>ARTICLE 2 - PRIX ET MODALITÉS DE PAIEMENT</Text>
          <Text style={styles.cgvText}>
            Les services et produits sont fournis aux tarifs en vigueur figurant sur le devis ou la facture. Les prix sont exprimés en Euros (€).
            Le paiement est exigible à la date indiquée sur la facture. Les modes de règlements acceptés sont : Virement bancaire, PayPal ou Espèces.
            Aucun escompte ne sera consenti en cas de paiement anticipé.
          </Text>
        </View>

        <View style={styles.cgvSection}>
          <Text style={styles.cgvSectionTitle}>ARTICLE 3 - RETARD DE PAIEMENT</Text>
          <Text style={styles.cgvText}>
            En cas de défaut de paiement total ou partiel des marchandises livrées ou des prestations réalisées au jour de la réception, l'acheteur doit verser une pénalité de retard égale à 3 fois le taux de l'intérêt légal.
            Le taux de l'intérêt légal retenu est celui en vigueur au jour de la livraison des marchandises.
            Cette pénalité est calculée sur le montant TTC de la somme restant due, et court à compter de la date d'échéance du prix sans qu'aucune mise en demeure préalable ne soit nécessaire.
            En sus des indemnités de retard, toute somme, y compris l'acompte, non payée à sa date d'échéance produira de plein droit le paiement d'une indemnité forfaitaire de 40 euros due au titre des frais de recouvrement.
          </Text>
        </View>

        <View style={styles.cgvSection}>
          <Text style={styles.cgvSectionTitle}>ARTICLE 4 - RÉSERVE DE PROPRIÉTÉ</Text>
          <Text style={styles.cgvText}>
            Le prestataire conserve la propriété des biens vendus jusqu'au paiement intégral du prix, en principal et en accessoires. À ce titre, si l'acheteur fait l'objet d'un redressement ou d'une liquidation judiciaire, le prestataire se réserve le droit de revendiquer, dans le cadre de la procédure collective, les marchandises vendues et restées impayées.
          </Text>
        </View>

        <View style={styles.cgvSection}>
          <Text style={styles.cgvSectionTitle}>ARTICLE 5 - LIVRAISON ET RÉALISATION</Text>
          <Text style={styles.cgvText}>
            La livraison est effectuée au lieu indiqué par l'acheteur sur le bon de commande. Le délai de livraison indiqué lors de l'enregistrement de la commande n'est donné qu'à titre indicatif et n'est aucunement garanti. Par voie de conséquence, tout retard raisonnable dans la livraison des produits ne pourra pas donner lieu au profit de l'acheteur à l'allocation de dommages et intérêts ou à l'annulation de la commande.
          </Text>
        </View>

        <View style={styles.cgvSection}>
          <Text style={styles.cgvSectionTitle}>ARTICLE 6 - FORCE MAJEURE</Text>
          <Text style={styles.cgvText}>
            La responsabilité du prestataire ne pourra pas être mise en oeuvre si la non-exécution ou le retard dans l'exécution de l'une de ses obligations décrites dans les présentes conditions générales de vente découle d'un cas de force majeure. À ce titre, la force majeure s'entend de tout événement extérieur, imprévisible et irrésistible au sens de l'article 1148 du Code civil.
          </Text>
        </View>

        <View style={styles.cgvSection}>
          <Text style={styles.cgvSectionTitle}>ARTICLE 7 - TRIBUNAL COMPÉTENT</Text>
          <Text style={styles.cgvText}>
            Tout litige relatif à l'interprétation et à l'exécution des présentes conditions générales de vente est soumis au droit français. À défaut de résolution amiable, le litige sera porté devant le Tribunal de Commerce du lieu du siège social du prestataire.
          </Text>
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
