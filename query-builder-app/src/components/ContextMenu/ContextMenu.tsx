import React from "react";
import { ScrollShadow, Divider } from "@nextui-org/react";
import ContextMenuCard from "../ContextMenuCard/ContextMenuCard";

export default function ContextMenu() {

  let savedQueriesmock: ContextMenuCardProps[] = [
    {
      queryTitle: "Empty Condition String",
      saved_at: "2024/07/28 09:15",
      parameters: {
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
      queryTitle: "Primitive Condition Conversion",
      saved_at: "2024/07/28 09:20",
      parameters: {
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
      queryTitle: "Compound Conditions Conversion",
      saved_at: "2024/07/28 09:25",
      parameters: {
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
      queryTitle: "Complex Compound Conditions",
      saved_at: "2024/07/28 09:30",
      parameters: {
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
      queryTitle: "Simple Aggregate Condition",
      saved_at: "2024/07/28 09:35",
      parameters: {
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
      queryTitle: "Compound Aggregate Conditions",
      saved_at: "2024/07/28 09:40",
      parameters: {
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
      queryTitle: "Group By without Aggregation",
      saved_at: "2024/07/28 09:45",
      parameters: {
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
      queryTitle: "No Columns Specified Error",
      saved_at: "2024/07/28 09:50",
      parameters: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "users",
          columns: []
        }
      }
    }, {
      queryTitle: "Country Names Starting with B",
      saved_at: "2024/02/22 18:55",
      parameters: {
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
      queryTitle: "Empty Condition String",
      saved_at: "2024/07/28 09:15",
      parameters: {
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
      queryTitle: "Primitive Condition Conversion",
      saved_at: "2024/07/28 09:20",
      parameters: {
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
      queryTitle: "Compound Conditions Conversion",
      saved_at: "2024/07/28 09:25",
      parameters: {
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
      queryTitle: "Complex Compound Conditions",
      saved_at: "2024/07/28 09:30",
      parameters: {
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
      queryTitle: "Simple Aggregate Condition",
      saved_at: "2024/07/28 09:35",
      parameters: {
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
      queryTitle: "Compound Aggregate Conditions",
      saved_at: "2024/07/28 09:40",
      parameters: {
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
      queryTitle: "Group By without Aggregation",
      saved_at: "2024/07/28 09:45",
      parameters: {
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
      queryTitle: "No Columns Specified Error",
      saved_at: "2024/07/28 09:50",
      parameters: {
        language: "SQL",
        query_type: "SELECT",
        databaseName: "sakila",
        table: {
          name: "users",
          columns: []
        }
      }
    }, {
      queryTitle: "Country Names Starting with B",
      saved_at: "2024/02/22 18:55",
      parameters: {
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

  interface ContextMenuCardProps {
    queryTitle: string,
    saved_at: string,
    parameters: any
  }

  async function getSavedQueries() {
    const response = await fetch("http://localhost:3001/query-management/get-queries");
    console.log("response---------------------------------");
    console.log(response);
    const data = await response.json();
    setSavedQueries(data);
  }

  //React hook to hold the user's organisations
  const [savedQueries, setSavedQueries] = React.useState<ContextMenuCardProps[]>([]);

  //React hook to fetch the user's organisations upon rerender of the component
  React.useEffect(() => {
    console.log("useEffect-------------------------------");
    getSavedQueries();

  }, [])

  return (

    <ScrollShadow className="w-[300px] h-[500px]">
      {savedQueriesmock && savedQueriesmock.map((queryData: ContextMenuCardProps, index: number) => (
        <React.Fragment key={index}>
          <ContextMenuCard
            queryTitle={queryData.queryTitle}
            saved_at={queryData.saved_at}
            parameters={queryData.parameters}
          />
          <Divider className="my-1" key={`divider-${index}`} />
        </React.Fragment>
      ))}
    </ScrollShadow>
  );
}
