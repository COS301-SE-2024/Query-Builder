//This implementation makes the assumption that all conditions are simply "ADDED" together

//----------------------------IMPORTS-----------------------------------//
import {
  ComparisonOperator,
  compoundCondition,
  condition,
  LogicalOperator,
  primitiveCondition,
  table,
} from '../../interfaces/intermediateJSON';
import {
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spacer,
} from '@nextui-org/react';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from './../../utils/supabase/client';
import FilterChip from '../FilterChip/FilterChip';
import React from 'react';
import { navigateToAuth } from '../../app/authentication/actions';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generation

//---------------------------INTERFACES---------------------------------//

interface FilterListProps {
  condition: compoundCondition | undefined;
  database: string;
  table: table;
  databaseServerID: string;
  language: string;
  onChange?: (condition: compoundCondition) => void;
  onRemove?: () => void;
}

interface PossibleCondition {
  tableName: string;
  column: string;
}

export default function FilterList(props: FilterListProps) {
  //----------------------------REACT HOOKS------------------------------------//

  const [condition, setCondition] = useState<compoundCondition>({
    conditions: [],
    operator: LogicalOperator.AND,
  });

  const [possibleConditions, setPossibleConditions] = useState<
    PossibleCondition[]
  >([]);

  useEffect(() => {
    if (props.condition) {
      setCondition(props.condition);
    }
  }, [props.condition]);

  //React hook to refetch possible conditions when table changes
  React.useEffect(() => {
    fetchPossibleConditions();
  }, [props.table]);

  useEffect(() => {
    if (props.onChange) {
      props.onChange(condition);
    }
  }, [condition, props.onChange]);

  // This function gets the token from local storage.
  // Supabase stores the token in local storage so we can access it from there.
  const getToken = async () => {
    const supabase = createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token;

    console.log(token);

    return token;
  };

  async function fetchPossibleConditions() {
    console.log('FETCHING POSSIBLE CONDITIONS');

    let tableRef: table = props.table;

   const newPossibleConditions: PossibleCondition[] = [];

    const fetchFields = async (tableName: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/fields`,
        {
          credentials: 'include',
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + (await getToken()),
          },
          body: JSON.stringify({
            databaseServerID: props.databaseServerID,
            database: props.database,
            table: tableName,
            language: props.language,
          }),
        },
      );

      const json = await response.json();

      if (!response.ok) {
        if (
          json.response &&
          json.response.message === 'You do not have a backend session'
        ) {
          navigateToAuth();
        }
        return [];
      }

      return json.data.map((item: any) => ({
        tableName,
        column: item.name,
      }));
    };

    newPossibleConditions.push(...(await fetchFields(tableRef.name)));

    while (tableRef.join) {
      tableRef = tableRef.join.table2;
      newPossibleConditions.push(...(await fetchFields(tableRef.name)));
    }

    setPossibleConditions(newPossibleConditions);
  }, [props.database, props.databaseServerID, props.language, props.table]);

  const handleFilterSelection = (key: string) => {
    const [tableName, columnName] = key.split(' - ');

    const newPrimitiveCondition: primitiveCondition = {
      tableName,
      column: columnName,
      operator: ComparisonOperator.EQUAL,
      value: 0,
      id: uuidv4(),
    };

    setCondition((prevCondition) => ({
      ...prevCondition,
      conditions: [...prevCondition.conditions, newPrimitiveCondition],
    }));
  };

  const renderFilterChips = (
    compoundCondition: compoundCondition,
  ): JSX.Element => (
    <>
      {compoundCondition.conditions
        .filter(
          (subCondition): subCondition is primitiveCondition =>
            'value' in subCondition &&
            'column' in subCondition &&
            'operator' in subCondition,
        )
        .map((subCondition: primitiveCondition) => (
          <FilterChip
            key={subCondition.id ?? uuidv4()}
            primitiveCondition={subCondition}
            onChange={updateCondition}
            onRemove={() => subCondition.id && removeCondition(subCondition.id)}
          />
        ))}
    </>
  );

  const removeCondition = (id: string) => {
    if (condition.conditions.length === 1 && props.onRemove) {
      props.onRemove();
    }

    const updatedConditions = condition.conditions.filter(
      (cond): cond is primitiveCondition => 'id' in cond && cond.id !== id,
    );

    setCondition((prevCondition) => ({
      ...prevCondition,
      conditions: updatedConditions,
    }));
  };

  const updateCondition = (updatedCondition: primitiveCondition) => {
    const updatedConditions = condition.conditions.map((cond) =>
      'id' in cond && cond.id === updatedCondition.id ? updatedCondition : cond,
    );

    setCondition((previousConditionState) => ({
      ...previousConditionState,
      conditions: updatedConditions,
    }));
  };

  return (
    <>
      <h2>Add filters:</h2>
      <Spacer y={2} />
      <Card className="w-full overflow-visible">
        <CardBody className="overflow-visible">
          <div className="flex items-center space-x-2">
            {renderFilterChips(condition)}
            <div className="flex justify-end flex-1">
              <Dropdown>
                <DropdownTrigger>
                  <Button aria-label="add filter" variant="bordered">
                    +
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  className="max-h-[50vh] overflow-y-auto"
                  items={possibleConditions}
                  onAction={(key) => handleFilterSelection(key as string)}
                >
                  {(item: any) => (
                    <DropdownItem key={item.tableName + ' - ' + item.column}>
                      {item.tableName + ' - ' + item.column}
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
