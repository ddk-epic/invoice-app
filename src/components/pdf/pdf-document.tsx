import React from "react";

import Logo from "./logo";

import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { Overline, UnderLine } from "./pdf-components";

import { InvoiceData, PrivateContact } from "@/constants/types";
import { toEuro, deShortDate, idPrefix } from "@/lib/utils";

interface PdfDocumentProps {
  data: InvoiceData;
  privateData: PrivateContact;
}

function PdfDocument(props: PdfDocumentProps) {
  const { data: invoice, privateData } = props;

  const total = invoice.total;
  const tax = invoice.taxRate / 100;
  const subtotal = total / (1 + tax);
  const taxAmount = total - subtotal;

  const indent = 3;

  const s = StyleSheet.create({
    page: {
      flexDirection: "column",
      fontSize: 10,
      lineHeight: 1.4,

      padding: 32,
      paddingTop: 36,
      paddingRight: 36,
    },
    ml: {
      marginLeft: indent,
    },
    bold: {
      fontWeight: 600,
    },
    inline: {
      flexDirection: "row",
    },
    header: {
      flexDirection: "column",
      lineHeight: 0.7,
    },
    logo: {
      paddingBottom: 18,
    },
    contacts: {
      flexDirection: "column",
      width: 210,
      //borderWidth: 1,
    },
    boxRight: {
      textAlign: "right",
      paddingRight: indent + 2,
    },
    tableHeader: {
      flexDirection: "row",
      width: 526,
    },
  });

  return (
    <Document title={idPrefix(invoice.invoiceId)} language="german">
      <Page size="A4" dpi={300} style={s.page}>
        {/* header */}
        <View style={s.inline}>
          <View style={s.logo}>
            <Logo color={"#2f2f2f"} />
          </View>
          {/* sender information */}
          <View>
            <View
              style={[
                s.inline,
                { paddingLeft: 127, gap: "5rem", paddingBottom: indent },
              ]}
            >
              <Text>Mobil: {privateData.phone}</Text>
              <Text>Email: {privateData.email}</Text>
            </View>
            <View
              style={[
                s.inline,
                { paddingLeft: 127, gap: "5rem", paddingBottom: indent },
              ]}
            >
              <Text>{/* details... */}</Text>
              <Text>{/* details... */}</Text>
            </View>
          </View>
        </View>
        {/* details header */}
        <View style={s.header}>
          <Overline />
          <View style={[s.inline, { gap: "5rem" }]}>
            <Text style={s.ml}>Rechnungsnummer: {invoice.invoiceId}</Text>
            <Text>Rechnungsdatum: {deShortDate(invoice.invoiceDate)}</Text>
          </View>
          <UnderLine />
        </View>
        {/* contacts */}
        <View style={{ paddingVertical: 22 }}>
          <View style={s.inline}>
            <View style={[s.ml, s.contacts]}>
              <Text style={s.bold}>Lieferanschrift</Text>
              <Text>{invoice.sendTo.name}</Text>
              <Text>{invoice.sendTo.owner}</Text>
              <Text>{invoice.sendTo.address.street}</Text>
              <Text>
                {invoice.sendTo.address.zip + " " + invoice.sendTo.address.city}
              </Text>
              <Text>{invoice.sendTo.address.country}</Text>
            </View>
            <View>
              <View style={s.contacts}>
                <Text style={s.bold}>Rechnungsadresse</Text>
                <Text>{invoice.invoiceTo.name}</Text>
                <Text>{invoice.invoiceTo.owner}</Text>
                <Text>{invoice.invoiceTo.address.street}</Text>
                <Text>
                  {invoice.invoiceTo.address.zip +
                    " " +
                    invoice.invoiceTo.address.city}
                </Text>
                <Text>{invoice.invoiceTo.address.country}</Text>
              </View>
            </View>
          </View>
        </View>
        {/* invoice date */}
        <View style={s.boxRight}>
          <Text style={s.bold}>{deShortDate(invoice.invoiceDate)}</Text>
        </View>
        {/* table header */}
        <View style={s.header}>
          <Overline />
          <View style={[s.ml, s.tableHeader]}>
            <Text style={[s.bold, { width: 30 }]}>Nr.</Text>
            <Text style={[s.bold, { width: 274 }]}>Umschreibung</Text>
            <Text style={[s.bold, { width: 73, textAlign: "right" }]}>
              Menge
            </Text>
            <Text style={[s.bold, { width: 71, textAlign: "right" }]}>
              Preis
            </Text>
            <Text style={[s.bold, { width: 71, textAlign: "right" }]}>
              Nettowert
            </Text>
          </View>
          <UnderLine />
        </View>
        {/* table items */}
        <View style={s.ml}>
          {invoice.items.map((item, index) => (
            // @ts-ignore
            <View key={item.id} style={s.inline}>
              <Text style={[{ width: 30 }]}>{index + 1}</Text>
              <Text style={[{ width: 273 }]}>
                {item.description}
                {item.brand && " " + item.brand.toUpperCase()}
                {item.weight && ", "}
                {item.perBox ? item.perBox + " X " + item.weight : item.weight}
              </Text>
              <Text style={[{ width: 72, textAlign: "right" }]}>
                {item.quantity}
              </Text>
              <Text style={[{ width: 72, textAlign: "right" }]}>
                {toEuro(item.rate)}
              </Text>
              <Text style={[{ width: 72, textAlign: "right" }]}>
                {toEuro(item.amount)}
              </Text>
            </View>
          ))}
        </View>
        {/* total header */}
        <View style={s.header}>
          <Overline />
          <View style={s.tableHeader}>
            <Text style={{ width: 384 }}></Text>
            <Text style={[s.bold, { width: 88 }]}>Gesamtbetrag</Text>
            <Text style={[s.bold, { width: 50, textAlign: "right" }]}>
              {toEuro(total)}
            </Text>
          </View>
          <UnderLine />
        </View>
        {/* total details */}
        <View></View>
        <View style={{ alignItems: "flex-end", paddingTop: 12 }}>
          <View style={[s.inline]}>
            <Text style={[s.bold, { width: 150, textAlign: "right" }]}>
              Rechnungsbetrag (Netto)
            </Text>
            <Text style={[s.bold, s.boxRight, { width: 77 }]}>
              {toEuro(subtotal)}
            </Text>
          </View>
          <View style={[s.inline]}>
            <Text style={[s.bold, { width: 150, textAlign: "right" }]}>
              MwSt. von {invoice.taxRate},00 %:
            </Text>
            <Text style={[s.bold, s.boxRight, { width: 77 }]}>
              {toEuro(taxAmount)}
            </Text>
          </View>
          <View style={[s.inline]}>
            <Text style={[s.bold, { width: 150, textAlign: "right" }]}>
              Rechnungsbetrag (Brutto)
            </Text>
            <Text style={[s.bold, s.boxRight, { width: 77 }]}>
              {toEuro(total)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default PdfDocument;
