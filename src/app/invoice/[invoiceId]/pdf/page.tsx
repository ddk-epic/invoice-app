import React from "react";
import { notFound } from "next/navigation";
import { QUERIES } from "@/server/db/queries";
import { InvoiceData } from "@/constants/types";
import { unstable_cache } from "next/cache";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import PdfViewer from "@/components/pdf-viewer";
import Logo from "@/components/pdf/logo";
import { Overline, UnderLine } from "@/components/pdf/pdf-components";

interface InvoiceGeneratorProps {
  params: Promise<{ invoiceId: string }>;
}

const getCachedInvoiceData = unstable_cache(
  async (invoiceId: string) => QUERIES.getInvoiceById(invoiceId),
  ["invoiceId"],
  {
    tags: ["invoiceData"],
    revalidate: 60 * 60 * 1, // 1 hour(s)
  }
);

async function InvoiceGenerator(props: InvoiceGeneratorProps) {
  const { invoiceId } = await props.params;
  const invoice = (await getCachedInvoiceData(invoiceId))[0] as InvoiceData;

  //console.log(invoice);

  if (!invoice) notFound();

  const indent = 3;

  const s = StyleSheet.create({
    page: {
      flexDirection: "column",
      fontSize: 10,
      lineHeight: 1.25,

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
    lineRow: {
      flexDirection: "column",
    },
    logo: {
      flexGrow: 1,
      paddingBottom: 18,
    },
    contacts: {
      flexDirection: "column",
      width: 210,
      //borderWidth: 1,
    },
    invDate: {
      textAlign: "right",
      marginRight: indent,
    },
    tableHeader: {
      flexDirection: "row",
      width: 526,
    },
  });

  const PdfDocument = (
    <Document title={`INV-00${invoiceId}`}>
      <Page size="A4" dpi={300} style={s.page}>
        {/* header */}
        <View style={s.inline}>
          <View style={s.logo}>
            <Logo color={"#2f2f2f"} />
          </View>
          <View style={[s.inline, { gap: "5rem" }]}>
            <Text>Mobil: 0124 82591253</Text>
            <Text>Email: test@gmail.com</Text>
          </View>
        </View>
        {/* divider */}
        <View style={s.lineRow}>
          <Overline />
          <View style={[s.inline, { gap: "5rem" }]}>
            <Text style={s.ml}>Rechnungsnummer: {invoice.invoiceId}</Text>
            <Text>Rechnungsdatum: {invoice.invoiceDate}</Text>
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
              <Text>{invoice.sendTo.address?.street}</Text>
              <Text>
                {invoice.sendTo.address?.zip +
                  " " +
                  invoice.sendTo.address?.city}
              </Text>
              <Text>{invoice.sendTo.address?.country}</Text>
            </View>
            <View>
              <View style={s.contacts}>
                <Text style={s.bold}>Rechnungsadresse</Text>
                <Text>{invoice.invoiceTo.name}</Text>
                <Text>{invoice.invoiceTo.owner}</Text>
                <Text>{invoice.invoiceTo.address?.street}</Text>
                <Text>
                  {invoice.invoiceTo.address?.zip +
                    " " +
                    invoice.invoiceTo.address?.city}
                </Text>
                <Text>{invoice.invoiceTo.address?.country}</Text>
              </View>
            </View>
          </View>
        </View>
        {/* invoice date */}
        <View style={s.invDate}>
          <Text style={s.bold}>{invoice.invoiceDate}</Text>
        </View>
        {/* table header */}
        <View style={s.lineRow}>
          <Overline />
          <View style={[s.ml, s.tableHeader]}>
            <Text style={[s.bold, { width: 30 }]}>Nr.</Text>
            <Text style={[s.bold, { width: 318 }]}>Umschreibung</Text>
            <Text style={[s.bold, { paddingRight: 44 }]}>Menge</Text>
            <Text style={[s.bold, { paddingRight: 25 }]}>Preis</Text>
            <Text style={[s.bold, { paddingRight: indent }]}>Nettowert</Text>
          </View>
          <UnderLine />
        </View>
        {/* table items */}
        <View style={s.ml}>
          {invoice.items.map((item) => (
            <View key={item.id} style={s.inline}>
              <Text style={[{ width: 30 }]}>{item.id}</Text>
              <Text style={[{ width: 339 }]}>{item.description}</Text>
              <Text style={[{ width: 50 }]}>{item.quantity}</Text>
              <Text style={[{ width: 50 }]}>{item.rate / 100} €</Text>
              <Text style={[{ width: 50, textAlign: "right" }]}>
                {item.amount / 100} €
              </Text>
            </View>
          ))}
        </View>
        <View>
          <Text></Text>
        </View>
      </Page>
    </Document>
  );

  return (
    <main className="top h-screen">
      <PdfViewer document={PdfDocument} />
    </main>
  );

  // return (
  //   <main className="wrapper top">
  //     <div className="my-8 space-y-4">
  //       <div>
  //         <h2>
  //           Invoice: {invoice.invoiceId}({invoice.id})
  //         </h2>
  //         <div>Invoice Date: {invoice.invoiceDate}</div>
  //         <div>Due Date: {invoice.dueDate}</div>
  //       </div>
  //       <div>
  //         <div>Sender Name: {invoice.sender.name}</div>
  //         <div>Send To: {invoice.sendTo.name}</div>
  //         <div>Invoice To: {invoice.invoiceTo.name}</div>
  //       </div>
  //       <div>
  //         Items:
  //         {invoice.items.map((item) => (
  //           <div key={item.id}>{item.description}</div>
  //         ))}
  //       </div>
  //       <div>
  //         <div>Total: {invoice.total / 100}€</div>
  //         <div>Tax Rate: {invoice.taxRate}%</div>
  //       </div>
  //       <div>
  //         <div>Created At: {new Date(invoice.createdAt).toLocaleString()}</div>
  //         <div>Updated At: {new Date(invoice.updatedAt).toLocaleString()}</div>
  //       </div>
  //     </div>
  //   </main>
  // );
}

export default InvoiceGenerator;
