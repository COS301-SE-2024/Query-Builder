import React from "react";
import { ScrollShadow, Divider } from "@nextui-org/react";
import ContextMenuCard from "../ContextMenuCard/ContextMenuCard";
import { createClient } from "./../../utils/supabase/client";

export default function ContextMenu() {


  interface ContextMenuCardProps {
    queryTitle: string,
    saved_at: string,
    parameters: any
  }

    // This function gets the token from local storage.
    // Supabase stores the token in local storage so we can access it from there.
    const getToken = async () => {

      const supabase = createClient();
      const token = (await supabase.auth.getSession()).data.session?.access_token
  
      console.log(token)
  
      return token;
  };

  async function getSavedQueries() {
    const response = await fetch("http://localhost:55555/query-management/get-queries", {
      credentials: "include",
      method: "GET",
      headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + await getToken()
      }
  });
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
