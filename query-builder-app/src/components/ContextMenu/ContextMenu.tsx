import React from "react";
import { ScrollShadow, Divider } from "@nextui-org/react";
import ContextMenuCard from "../ContextMenuCard/ContextMenuCard";

export default function App() {
  


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
