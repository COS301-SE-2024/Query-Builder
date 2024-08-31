"use client"
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
  subtitle: {
    fontSize: 14,
    color: 'grey',
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

interface ReportProps {
  data: JSON[];
  metadata: Metadata;
}

const tableCol = (numCols: number) => ({
  width: `${100 / numCols}%`,
  borderStyle: 'solid' as 'solid',
  borderWidth: 1,
  borderLeftWidth: 0,
  borderTopWidth: 0,
});

export default function Report(props: ReportProps) {
  const [chartsData, setChartsData] = useState<ChartData[]>([]);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    setChartsData([]);
    const headings = Object.keys(
      props.data[0],
    ) as (keyof (typeof props.data)[0])[]; // stores the headings of each column (can be used to reference)
    const numberColumns: boolean[] = Object.values(props.data[0]).map(
      (value) => typeof value === 'number',
    ); // stores the types of each column in the dataset

    let count = 0;
    for(let i in props.data[0]){
      console.log(`${i} : ${numberColumns[count++]}`)
    }

    const firstKey: string[] = props.data.map(
      (row) => row[headings[0]] as string,
    ); // getting all of the classes

    // We want to create a graph of every numeric value(y) against the first column(x)
    numberColumns.forEach((column, index) => {
      if (column) {
        const currentChart: ChartData = {
          labels: firstKey,
          datasets: [
            {
              label: String(headings[index]),
              data: props.data.map((item) => item[headings[index]]),
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

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <PDFViewer width="800" height="600" style={{ marginBottom: 20 }}>
        <MyDocument
          tableData={props.data}
          chartData={chartsData}
          metadata={props.metadata}
          date={date}
        />
      </PDFViewer>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ marginLeft: 20 }}>
          <PDFDownloadLink
            document={
              <MyDocument
                tableData={props.data}
                chartData={chartsData}
                metadata={props.metadata}
                date={date}
              />
            }
            fileName={`${props.metadata.title}_report_${date.toISOString()}.pdf`}
          >
            {({ loading }) => (
              <span
                className={
                  'z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 px-4 min-w-20 h-10 text-small gap-2 rounded-medium [&>svg]:max-w-[theme(spacing.8)] transition-transform-colors-opacity motion-reduce:transition-none bg-primary text-primary-foreground data-[hover=true]:opacity-hover'
                }
              >
                {loading ? 'Loading document...' : 'Download PDF'}
              </span>
            )}
          </PDFDownloadLink>
        </div>
      </div>
    </div>
  );
}

export interface Metadata {
  title: string;
}

type MyDocumentProps = {
  tableData: any[];
  chartData: ChartData[];
  metadata: Metadata;
  date: Date;
};

function MyDocument({ tableData, chartData, metadata, date }: MyDocumentProps) {
  const headers = Object.keys(tableData[0]) as (keyof (typeof tableData)[0])[];
  const numCols = headers.length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={styles.title}>{`Report on\n${metadata.title}`}</Text>
          <Text
            style={styles.subtitle}
          >{`Generated on ${date.toLocaleString('en-UK', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'UTC' })} UTC using QBee`}</Text>
        </View>
      </Page>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>Results</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              {headers.map((header, index) => (
                <View key={index} style={tableCol(numCols)}>
                  <Text style={styles.tableCell}>{String(header)}</Text>
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
      </Page>
    </Document>
  );
}
