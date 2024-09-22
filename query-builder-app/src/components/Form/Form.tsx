'use client';

//----------------------------IMPORTS------------------------------------//

import '../../app/globals.css';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Button,
  Spacer,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  useDisclosure,
  ModalContent,
  Modal,
  ModalHeader,
  Tooltip,
} from '@nextui-org/react';
import TableResponse from '../TableResponse/TableResponse';
import { createClient } from './../../utils/supabase/client';
import { compoundCondition, Query, table } from '@/interfaces/intermediateJSON';
import TableList from '../TableList/TableList';
import FilterList from '../FilterList/FilterList';
import { navigateToAuth } from '../../app/authentication/actions';
import SaveQueryModal from '../SaveQueryModal/SaveQueryModal';

//----------------------------INTERFACES------------------------------------//

interface Database {
  database: string;
}

export default function Form() {
  //----------------------------REACT HOOKS------------------------------------//

  //React hook for URL params
  const { databaseServerID } = useParams<{ databaseServerID: string }>();

  //React hook for results modal
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  //React hook for all the databases in the database server
  const [databases, setDatabases] = useState<Database[]>([]);

  //React hook containing the Query the user is busy building
  const [query, setQuery] = useState<Query>({
    databaseServerID: databaseServerID[0],
    queryParams: {
      language: 'mysql',
      query_type: 'select',
      databaseName: '',
      table: {
        name: '',
        columns: [],
      },
    },
  });

  //Separate React hook for the Query's condition
  const [condition, setCondition] = useState<compoundCondition>();


  //React hook to fetch the database server's databases upon rerender of the Form
  useEffect(() => {
    if (databaseServerID.length > 1) {
      getQuery();
    }
  }, [databaseServerID]);

  //React hook to fetch the database server's databases upon rerender of the Form
  useEffect(() => {
    fetchDatabases();
  }, []);

  //----------------------------HELPER FUNCTIONS------------------------------------//

  // This function gets the token from local storage.
  // Supabase stores the token in local storage so we can access it from there.
  const getToken = async () => {
    const supabase = createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token;

    console.log(token);

    return token;
  };

  //callback function for TableList
  const updateTable = useCallback((updatedTable: table) => {
    setQuery((previousQueryState) => ({
      ...previousQueryState,
      queryParams: {
        ...previousQueryState.queryParams,
        table: updatedTable,
      },
    }));
  }, []);

  //callback function for FilterList
  const updateCondition = useCallback((updatedCondition: compoundCondition) => {
    if (updatedCondition.conditions.length > 0) {
      setCondition(updatedCondition);
    }
  }, []);

  const removeAllCondition = useCallback(() => {
    setCondition(undefined);
  }, []);

  //merges query and condition
  const getMergedQuery = useCallback(() => {
    if (condition != null) {
      return {
        ...query,
        queryParams: {
          ...query.queryParams,
          condition: condition,
        },
      };
    } else {
      return query;
    }
  }, [condition, query]);

  const getQuery = useCallback(async () => {
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query-management/get-single-query`,
      {
        credentials: 'include',
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (await getToken()),
        },
        body: JSON.stringify({
          query_id: databaseServerID[1],
        }),
      },
    );

    let json = await response.json();

    const newQueryParams = json.parameters;

    setQuery((previousQueryState) => ({
      ...previousQueryState,
      queryParams: {
        ...previousQueryState.queryParams,
        databaseName: newQueryParams.databaseName,
        language: newQueryParams.language,
        query_type: newQueryParams.query_type,
        table: newQueryParams.table,
      },
    }));

    setCondition(newQueryParams.condition);
  }, [databaseServerID]);

  //async function to fetch the database server's databases
  const fetchDatabases = useCallback(async () => {
    //first get the database type
    let typeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/get-db-type`,
      {
        credentials: 'include',
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (await getToken()),
        },
        body: JSON.stringify({
          db_id: databaseServerID[0],
        }),
      },
    );

    if (typeResponse.ok) {
      const languageType = (await typeResponse.json()).type;

      setQuery((previousQueryState) => ({
        ...previousQueryState,
        queryParams: {
          ...previousQueryState.queryParams,
          language: languageType,
        },
      }));

      let response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/databases`,
        {
          credentials: 'include',
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + (await getToken()),
          },
          body: JSON.stringify({
            databaseServerID: databaseServerID[0],
            language: languageType,
          }),
        },
      );

      let json = await response.json();

      if (response.ok) {
        //set the databases hook
        setDatabases(json.data);
      } else {
        if (
          json.response &&
          json.response.message == 'You do not have a backend session'
        ) {
          navigateToAuth();
        }
      }
    }
  }, [databaseServerID]);

  const handleDatabaseSelection = useCallback((key: any) => {
    setQuery((previousQueryState) => ({
      ...previousQueryState,
      queryParams: {
        ...previousQueryState.queryParams,
        databaseName: key,
      },
    }));
  }, []);

  return (
    <>
      <div className="app overflow-visible">
        <Card className="overflow-visible">
          <CardHeader>
            <div className="flex">
              <h1>Create a query</h1>
            </div>
          </CardHeader>
          <CardBody className="overflow-visible">
            {/* Select a database */}
            <h2>
              Select a database: <span style={{ color: 'red' }}>*</span>
            </h2>
            <Spacer y={2} />
            <Card className="w-full">
              <CardBody className="flex flex-row items-center space-x-2">
                {
                  //div for the name
                  <div className="flex flex-1">
                    {query.queryParams.databaseName}
                  </div>
                }

                {
                  //include the add button if no database is selected yet
                  query.queryParams.databaseName === '' && (
                    <Dropdown>
                      <DropdownTrigger>
                        <Button variant="bordered">+</Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        className="max-h-[50vh] overflow-y-auto"
                        emptyContent="Loading databases..."
                        items={databases}
                        onAction={(key) => handleDatabaseSelection(key)}
                      >
                        {databases.map((item: any) => (
                          <DropdownItem key={item.database}>
                            {item.database}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  )
                }
              </CardBody>
            </Card>

            <Spacer y={2} />

            {/* Select tables */}
            {query.queryParams.databaseName != '' && (
              <TableList
                databaseServerID={databaseServerID[0]}
                databaseName={query.queryParams.databaseName}
                table={query.queryParams.table}
                language={query.queryParams.language}
                onChange={updateTable}
              />
            )}

            <Spacer y={2} />

            {/* Add filters */}
            {query.queryParams.table.name != '' && (
              <FilterList
                condition={condition as compoundCondition}
                database={query.queryParams.databaseName}
                table={query.queryParams.table}
                databaseServerID={databaseServerID[0]}
                language={query.queryParams.language}
                onChange={updateCondition}
                onRemove={removeAllCondition}
              />
            )}
          </CardBody>
          <CardFooter>
            <>
              <div style={{ display: 'flex', gap: '3px' }}>
                <div style={{ display: 'inline-block' }}>
                  <Tooltip
                    content="Oops! Maybe you forgot to select something, press the [+] icon to select required fields"
                    placement="top"
                    isDisabled={query.queryParams.table.columns.length !== 0}
                  >
                    <div>
                      <Button
                        onPress={() => {
                          onOpen();
                        }}
                        color="primary"
                        isDisabled={
                          query.queryParams.table.columns.length === 0
                        }
                      >
                        Query
                      </Button>
                    </div>
                  </Tooltip>
                </div>
                <SaveQueryModal query={getMergedQuery()} />
                <Button
                  color="primary"
                  onClick={() => {
                    setQuery({
                      databaseServerID: databaseServerID[0],
                      queryParams: {
                        language: query.queryParams.language,
                        query_type: 'select',
                        databaseName: '',
                        table: {
                          name: '',
                          columns: [],
                        },
                      },
                    });
                    setCondition(undefined);
                  }}
                >
                  Clear Form
                </Button>
                {/* {JSON.stringify(getMergedQuery(), null, 2)}  */}
              </div>
              <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="top-center"
                className="text-black h-100vh"
                size="full"
              >
                <ModalContent>
                  {(onClose: any) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Query Results
                      </ModalHeader>
                      <TableResponse
                        query={getMergedQuery()}
                        metadata={{
                          title: `Report on ${query?.queryParams.databaseName}`,
                        }}
                      />
                    </>
                  )}
                </ModalContent>
              </Modal>
            </>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
