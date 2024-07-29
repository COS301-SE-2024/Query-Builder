import React from "react";
import { ScrollShadow, Divider } from "@nextui-org/react";
import ContextMenuCard from "../ContextMenuCard/ContextMenuCard";

export default function App() {
  const savedQueries = [
    {
      title: "Empty Condition String",
      date: "2024/07/28 09:15",
      query: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "test_table",
          columns: [{ name: "id", aggregation: null }]
        },
        condition: null
      }
    },
    {
      title: "Primitive Condition Conversion",
      date: "2024/07/28 09:20",
      query: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "users",
          columns: [
            { name: "name", aggregation: null }
          ]
        },
        condition: {
          column: "name",
          operator: "=",
          value: "value"
        }
      }
    },
    {
      title: "Compound Conditions Conversion",
      date: "2024/07/28 09:25",
      query: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "users",
          columns: [
            { name: "name", aggregation: null },
            { name: "age", aggregation: null }
          ]
        },
        condition: {
          conditions: [
            {
              column: "name",
              operator: "=",
              value: "value"
            },
            {
              column: "age",
              operator: ">",
              value: 18
            }
          ],
          operator: "AND"
        }
      }
    },
    {
      title: "Complex Compound Conditions",
      date: "2024/07/28 09:30",
      query: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "users",
          columns: [
            { name: "name", aggregation: null },
            { name: "age", aggregation: null },
            { name: "city", aggregation: null },
            { name: "status", aggregation: null }
          ]
        },
        condition: {
          conditions: [
            {
              column: "name",
              operator: "=",
              value: "value"
            },
            {
              column: "age",
              operator: ">",
              value: 18
            },
            {
              conditions: [
                {
                  column: "city",
                  operator: "=",
                  value: "New York"
                },
                {
                  column: "status",
                  operator: "!=",
                  value: "inactive"
                }
              ],
              operator: "OR"
            }
          ],
          operator: "AND"
        }
      }
    },
    {
      title: "Simple Aggregate Condition",
      date: "2024/07/28 09:35",
      query: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "employees",
          columns: [
            { name: "salary", aggregation: "SUM" }
          ]
        },
        condition: {
          aggregate: "SUM",
          column: "salary",
          operator: ">",
          value: 50000
        }
      }
    },
    {
      title: "Compound Aggregate Conditions",
      date: "2024/07/28 09:40",
      query: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "employees",
          columns: [
            { name: "salary", aggregation: "SUM" },
            { name: "id", aggregation: "COUNT" }
          ]
        },
        condition: {
          conditions: [
            {
              aggregate: "SUM",
              column: "salary",
              operator: ">",
              value: 50000
            },
            {
              aggregate: "COUNT",
              column: "id",
              operator: ">",
              value: 10
            }
          ],
          operator: "AND"
        }
      }
    },
    {
      title: "Group By without Aggregation",
      date: "2024/07/28 09:45",
      query: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "test_table",
          columns: [
            { name: "id", aggregation: null },
            { name: "name", aggregation: "COUNT" },
            { name: "age", aggregation: null }
          ]
        }
      }
    },
    {
      title: "No Columns Specified Error",
      date: "2024/07/28 09:50",
      query: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "users",
          columns: []
        }
      }
    }, {
      title: "Country Names Starting with B",
      date: "2024/02/22 18:55",
      query: {
        language: "sql",
        query_type: "select",
        databaseName: "sakila",
        table: {
          name: "country",
          columns: [{ name: "country" }]
        },
        condition: {
          column: "country",
          operator: "LIKE",
          value: "B%"
        }
      }
    },
    {
      title: "Empty Condition String",
      date: "2024/07/28 09:15",
      query: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "test_table",
          columns: [{ name: "id", aggregation: null }]
        },
        condition: null
      }
    },
    {
      title: "Primitive Condition Conversion",
      date: "2024/07/28 09:20",
      query: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "users",
          columns: [
            { name: "name", aggregation: null }
          ]
        },
        condition: {
          column: "name",
          operator: "=",
          value: "value"
        }
      }
    },
    {
      title: "Compound Conditions Conversion",
      date: "2024/07/28 09:25",
      query: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "users",
          columns: [
            { name: "name", aggregation: null },
            { name: "age", aggregation: null }
          ]
        },
        condition: {
          conditions: [
            {
              column: "name",
              operator: "=",
              value: "value"
            },
            {
              column: "age",
              operator: ">",
              value: 18
            }
          ],
          operator: "AND"
        }
      }
    },
    {
      title: "Complex Compound Conditions",
      date: "2024/07/28 09:30",
      query: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "users",
          columns: [
            { name: "name", aggregation: null },
            { name: "age", aggregation: null },
            { name: "city", aggregation: null },
            { name: "status", aggregation: null }
          ]
        },
        condition: {
          conditions: [
            {
              column: "name",
              operator: "=",
              value: "value"
            },
            {
              column: "age",
              operator: ">",
              value: 18
            },
            {
              conditions: [
                {
                  column: "city",
                  operator: "=",
                  value: "New York"
                },
                {
                  column: "status",
                  operator: "!=",
                  value: "inactive"
                }
              ],
              operator: "OR"
            }
          ],
          operator: "AND"
        }
      }
    },
    {
      title: "Simple Aggregate Condition",
      date: "2024/07/28 09:35",
      query: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "employees",
          columns: [
            { name: "salary", aggregation: "SUM" }
          ]
        },
        condition: {
          aggregate: "SUM",
          column: "salary",
          operator: ">",
          value: 50000
        }
      }
    },
    {
      title: "Compound Aggregate Conditions",
      date: "2024/07/28 09:40",
      query: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "employees",
          columns: [
            { name: "salary", aggregation: "SUM" },
            { name: "id", aggregation: "COUNT" }
          ]
        },
        condition: {
          conditions: [
            {
              aggregate: "SUM",
              column: "salary",
              operator: ">",
              value: 50000
            },
            {
              aggregate: "COUNT",
              column: "id",
              operator: ">",
              value: 10
            }
          ],
          operator: "AND"
        }
      }
    },
    {
      title: "Group By without Aggregation",
      date: "2024/07/28 09:45",
      query: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "test_table",
          columns: [
            { name: "id", aggregation: null },
            { name: "name", aggregation: "COUNT" },
            { name: "age", aggregation: null }
          ]
        }
      }
    },
    {
      title: "No Columns Specified Error",
      date: "2024/07/28 09:50",
      query: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "users",
          columns: []
        }
      }
    }, {
      title: "Country Names Starting with B",
      date: "2024/02/22 18:55",
      query: {
        language: "sql",
        query_type: "select",
        databaseName: "sakila",
        table: {
          name: "country",
          columns: [{ name: "country" }]
        },
        condition: {
          column: "country",
          operator: "LIKE",
          value: "B%"
        }
      }
    },
  ];


  return (
    <ScrollShadow className="w-[300px] h-[500px]">
  {savedQueries && savedQueries.map((queryData, index) => (
    <React.Fragment key={index}>
      <ContextMenuCard
        title={queryData.title}
        date={queryData.date}
        query={queryData.query}
      />
      <Divider className="my-1" key={`divider-${index}`} />
    </React.Fragment>
  ))}
</ScrollShadow>
  );
}
