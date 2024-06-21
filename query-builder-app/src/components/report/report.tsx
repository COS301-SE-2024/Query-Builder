import React, { useRef, useEffect, useState } from "react";
import { Page, Text, View, Document, StyleSheet, PDFViewer, PDFDownloadLink, Image } from "@react-pdf/renderer";
import { Chart as ChartJS, LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend);

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
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  tableRow: {
    flexDirection: "row"
  },
  tableCol: (numCols) => ({
    width: `${100 / numCols}%`,
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0
  }),
  tableCell: {
    margin: 5,
    fontSize: 10
  },
  chart: {
    margin: "10px 0"
  }
});

const dummyData = [
  { companyName: "Tech Innovators", numberOfEmployees: 120, netWorth: 5000000, annualRevenue: 2000000, profitMargin: 0.4 },
  { companyName: "Creative Solutions", numberOfEmployees: 85, netWorth: 3500000, annualRevenue: 1500000, profitMargin: 0.3 },
  { companyName: "Future Enterprises", numberOfEmployees: 200, netWorth: 7500000, annualRevenue: 3000000, profitMargin: 0.35 },
  { companyName: "Smart Industries", numberOfEmployees: 150, netWorth: 6200000, annualRevenue: 2500000, profitMargin: 0.38 },
  { companyName: "Green Tech", numberOfEmployees: 95, netWorth: 4000000, annualRevenue: 1800000, profitMargin: 0.45 },
  { companyName: "NextGen Labs", numberOfEmployees: 170, netWorth: 6800000, annualRevenue: 2700000, profitMargin: 0.42 },
  { companyName: "Innovatech", numberOfEmployees: 110, netWorth: 5200000, annualRevenue: 2200000, profitMargin: 0.36 },
  { companyName: "Visionary Solutions", numberOfEmployees: 130, netWorth: 5700000, annualRevenue: 2400000, profitMargin: 0.39 },
  { companyName: "Digital Ventures", numberOfEmployees: 140, netWorth: 6000000, annualRevenue: 2600000, profitMargin: 0.41 },
  { companyName: "Eco Enterprises", numberOfEmployees: 90, netWorth: 3800000, annualRevenue: 1700000, profitMargin: 0.32 },
  { companyName: "Tech Pioneers", numberOfEmployees: 160, netWorth: 6500000, annualRevenue: 2800000, profitMargin: 0.37 },
  { companyName: "Smart Solutions", numberOfEmployees: 105, netWorth: 4900000, annualRevenue: 2100000, profitMargin: 0.34 },
  { companyName: "Green Ventures", numberOfEmployees: 80, netWorth: 3300000, annualRevenue: 1600000, profitMargin: 0.31 },
  { companyName: "Future Innovations", numberOfEmployees: 125, netWorth: 5400000, annualRevenue: 2300000, profitMargin: 0.33 }
];



const Report = () => {
  const [chartImages, setChartImages] = useState([]);
  const [chartsData, setChartsData] = useState([]);

  useEffect(() => {
    const headers = Object.keys(dummyData[0]);
    const integerColumns = headers.filter(header => 
      typeof dummyData[0][header] === 'number'
    );

    integerColumns.forEach((column, index) => {
      const firstKey = headers[0]; // Always take the first key dynamically
      const chartData = {
        labels: dummyData.map(item => item[firstKey]),
        datasets: [
          {
            label: column,
            data: dummyData.map(item => item[column]),
            backgroundColor: `rgba(${index * 50}, 162, 235, 0.2)`,
            borderColor: `rgba(${index * 50}, 162, 235, 1)`,
            borderWidth: 1
          }
        ]
      };

      setChartsData(prev => [...prev, { chartData, label: column }]);

      // Create a new chart and store its image in state
      setTimeout(() => {
        const chartRef = document.createElement('canvas');
        const chart = new ChartJS(chartRef, {
          type: 'bar',
          data: chartData,
          options: {
            plugins: {
              title: {
                display: true,
                text: column
              }
            },
            responsive: true,
            maintainAspectRatio: false
          }
        });

        setTimeout(() => {
          const image = chartRef.toDataURL();
          setChartImages(prev => [...prev, { image, label: column }]);
          chart.destroy();
        }, 500);
      }, 500);
    });
  }, []);

  const buttonStyle = {
    marginLeft: 10,
    backgroundColor: "blue",
    color: "white",
    padding: "8px 16px",
    border: "none",
    cursor: "pointer"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <PDFViewer width="800" height="600" style={{ marginBottom: 20 }}>
        <MyDocument tableData={dummyData} chartImages={chartImages} />
      </PDFViewer>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ marginLeft: 20 }}>
          <PDFDownloadLink document={<MyDocument tableData={dummyData} chartImages={chartImages} />} fileName="report.pdf">
            {({ loading }) => (
              <span style={{ ...buttonStyle, backgroundColor: loading ? "#999" : "blue" }}>
                {loading ? 'Loading document...' : 'Download PDF'}
              </span>
            )}
          </PDFDownloadLink>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", marginTop: 20 }}>
        {chartsData.map((chart, index) => (
          <div key={index} style={{ margin: 10 }}>
            <Bar data={chart.chartData} options={{ maintainAspectRatio: false, plugins: { title: { display: true, text: chart.label } } }} width={200} height={200} />
          </div>
        ))}
      </div>
    </div>
  );
};

const MyDocument = ({ tableData, chartImages }) => {
  const headers = Object.keys(tableData[0]);
  const numCols = headers.length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>QBEE INITIAL REPORT</Text>
          <Text>Employee financial data</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              {headers.map((header, index) => (
                <View key={index} style={styles.tableCol(numCols)}>
                  <Text style={styles.tableCell}>{header}</Text>
                </View>
              ))}
            </View>
            {tableData.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.tableRow}>
                {headers.map((header, cellIndex) => (
                  <View key={cellIndex} style={styles.tableCol(numCols)}>
                    <Text style={styles.tableCell}>{row[header]}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default Report;
