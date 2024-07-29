import React from "react";
import { ScrollShadow, Divider } from "@nextui-org/react";
import ContextMenuCard from "../ContextMenuCard/ContextMenuCard";

export default function App() {

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
      {savedQueries && savedQueries.map((queryData: ContextMenuCardProps, index: number) => (
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
