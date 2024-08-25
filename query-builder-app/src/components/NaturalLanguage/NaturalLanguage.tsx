import React, { useState } from 'react';
import {
  Textarea,
  Button,
  ButtonGroup,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Spacer,
} from '@nextui-org/react';
import TableResponse from '../TableResponse/TableResponse';
import { useParams } from 'next/navigation';
import { createClient } from './../../utils/supabase/client';
import { Query } from '@/interfaces/intermediateJSON';

export default function NaturalLanguage() {
  const [value, setValue] = useState('');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [queryLoaded, setQueryLoaded] = useState(false);
  const [query, setQuery] = useState<Query>();
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  // This function gets the token from local storage.
  // Supabase stores the token in local storage so we can access it from there.
  const getToken = async () => {
    const supabase = createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token;

    console.log(token);

    return token;
  };

  //React hook for URL params
  const { databaseServerID } = useParams<{ databaseServerID: string }>();

  async function getQuery() {
    setLoading(true);

    let response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/natural-language/query`,
      {
        credentials: 'include',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (await getToken()),
        },
        body: JSON.stringify({
          databaseServerID: databaseServerID[0],
          query: value,
        }),
      },
    );

    if (response.ok) {
      let query = await response.json();

      setShowError(false);
      setLoading(false);
      setQuery(query);
      setQueryLoaded(true);
    } else {
      setLoading(false);
      setShowError(true);
    }
  }

  return (
    <Card>
      <CardHeader>Type what you would like to query</CardHeader>
      <CardBody>
        <Textarea
          className="w-[100%] h-[100%] item-centered"
          placeholder="Type your query here"
          value={value}
          onChange={(newVal) => setValue(newVal.target.value)}
        />
      </CardBody>
      <CardFooter>
        <Button
          isDisabled={value.length <= 1}
          isLoading={loading}
          color="primary"
          onPress={() => {
            getQuery();
            onOpen();
          }}
        >
          Query
        </Button>
        <Spacer x={5} />
        {showError && <h2>This feature is still in Beta - try again?</h2>}
        <Modal
          isOpen={isOpen && queryLoaded}
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
                  query={query!}
                  metadata={{
                    title: `${query?.queryParams.databaseName}`,
                  }}
                />
              </>
            )}
          </ModalContent>
        </Modal>
      </CardFooter>
    </Card>
  );
}
