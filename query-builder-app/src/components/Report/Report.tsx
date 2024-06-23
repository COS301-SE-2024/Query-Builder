import { useEffect, useState } from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
  PDFDownloadLink,
  Image,
} from '@react-pdf/renderer';
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 10,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    textAlign: 'left',
    marginBottom: 20,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  chart: {
    margin: '10px 0',
  },
});

interface ChartData {
  labels: any[];
  datasets: {
    label: string;
    data: any[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

const data = [
  {
    store: 'Woodridge,Australia',
    total_sales: 33726.77,
  },
  {
    store: 'Lethbridge,Canada',
    total_sales: 33679.79,
  },
];

const tableCol = (numCols: number) => ({
  width: `${100 / numCols}%`,
  borderStyle: 'solid' as 'solid',
  borderWidth: 1,
  borderLeftWidth: 0,
  borderTopWidth: 0,
});

export default function Report() {
  const [chartsData, setChartsData] = useState<ChartData[]>([]);

  useEffect(() => {
    const headings = Object.keys(data[0]) as (keyof (typeof data)[0])[]; // stores the headings of each column (can be used to reference)
    const numberColumns: boolean[] = Object.values(data[0]).map(
      (value) => typeof value === 'number',
    ); // stores the types of each column in the dataset
    const firstKey: string[] = data.map((row) => row[headings[0]] as string); // getting all of the classes

    // We want to create a graph of every numeric value(y) against the first column(x)
    numberColumns.forEach((column, index) => {
      if (column) {
        const currentChart: ChartData = {
          labels: firstKey,
          datasets: [
            {
              label: headings[index],
              data: data.map((item) => item[headings[index]]),
              backgroundColor: `rgba(${index * 50}, 162, 235, 0.2)`,
              borderColor: `rgba(${index * 50}, 162, 235, 1)`,
              borderWidth: 1,
            },
          ],
        };

        // adding the current chart to the chart array
        setChartsData((prev) => [...prev, currentChart]);
      }
    });
  }, []);

  const buttonStyle = {
    marginLeft: 10,
    backgroundColor: 'blue',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <PDFViewer width="800" height="600" style={{ marginBottom: 20 }}>
        <MyDocument tableData={data} chartData={chartsData}/>
      </PDFViewer>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ marginLeft: 20 }}>
          <PDFDownloadLink
            document={<MyDocument tableData={data} chartData={chartsData}/>}
            fileName="report.pdf"
          >
            {({ loading }) => (
              <span
                style={{
                  ...buttonStyle,
                  backgroundColor: loading ? '#999' : 'blue',
                }}
              >
                {loading ? 'Loading document...' : 'Download PDF'}
              </span>
            )}
          </PDFDownloadLink>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: 20,
        }}
      >
        {chartsData.map((chart, index) => (
          <div key={index} style={{ margin: 10 }}>
            <Bar
              data={chart}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: chart.datasets[0].label,
                  },
                },
              }}
              width={200}
              height={200}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

type MyDocumentProps = {
  tableData: any[];
  chartData: ChartData[];
};

function MyDocument({ tableData, chartData }: MyDocumentProps) {
  const headers = Object.keys(tableData[0]) as (keyof (typeof data)[0])[];
  const numCols = headers.length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.title}>QBEE INITIAL REPORT</Text>
          <View style={styles.section}>
            <Text style={styles.header}>Results</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                {headers.map((header, index) => (
                  <View key={index} style={tableCol(numCols)}>
                    <Text style={styles.tableCell}>{header}</Text>
                  </View>
                ))}
              </View>
              {tableData.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.tableRow}>
                  {headers.map((header, cellIndex) => (
                    <View key={cellIndex} style={tableCol(numCols)}>
                      <Text style={styles.tableCell}>{row[header]}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
          <View style={styles.section} break>
            <Text style={styles.header}>Graphs</Text>
            {chartData.map((data, index: number) => (
              <Image
                key={index}
                src={(async () => {
                  const ChartJsImage = require('chartjs-to-image');

                  const myChart = new ChartJsImage();
                  myChart.setConfig({
                    type: 'bar',
                    data: {
                      labels: data.labels,
                      datasets: data.datasets,
                    },
                  });

                  return await myChart.toDataUrl();
                })()}
                style={styles.chart}
              />
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}
