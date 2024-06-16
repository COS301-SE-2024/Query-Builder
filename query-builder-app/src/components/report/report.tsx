import React from "react";
import { Page, Text, View, Document, StyleSheet, PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 10
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20
  }
});

const MyDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>My First Document</Text>
        <Text>Hello World!</Text>
      </View>
    </Page>
  </Document>
);

const Report = () => {
  return (
    <div>
      <PDFViewer width="1000" height="600">
        <MyDocument />
      </PDFViewer>
      <div>
        <PDFDownloadLink document={<MyDocument />} fileName="report.pdf">
          {({ blob, url, loading, error }) => (loading ? 'Loading document...' : 'Download now!')}
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default Report;

