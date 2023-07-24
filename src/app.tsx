import { useEffect, useState } from "react";
import {
  Box,
  Center,
  Text,
  Textarea,
  Container,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { Document, ActionBuilder } from "./Crdt";
import Client from "./Client";

let doc1: Document | null = null;
let doc2: Document | null = null;
let docAll: Document | null = null;

const onSync = (clientId: number) => {
  switch (clientId) {
    case 1: {
      doc1?.merge(doc2!);
      return doc1?.content();
    }
    case 2: {
      doc2?.merge(doc1!);
      return doc2?.content();
    }
  }
};

const App = () => {
  const [finalText, setFinalText] = useState("");

  useEffect(() => {
    doc1 = new Document(1);
    doc2 = new Document(2);
    docAll = new Document(3);
  }, []);

  const onActions = (clientId: number, actions: ActionBuilder[]) => {
    let doc: Document | null;
    switch (clientId) {
      case 1: {
        doc = doc1;
        break;
      }
      case 2: {
        doc = doc2;
        break;
      }
      default: {
        break;
      }
    }
    actions.forEach((action) => {
      doc?.addActionBuilder(
        new ActionBuilder(action.position, action.action, action.char),
      );
    });
    docAll?.merge(doc!);
    setFinalText(docAll?.content() || "");
  };

  return (
    <div className="app">
      <Container w="100%" h="100vh">
        <Center>
          <VStack spacing="50">
            <HStack spacing="200" pt="100">
              <Client />
              <Client />
            </HStack>
            <Box w="100%">
              <Center>
                <Text fontSize="3xl">Final Text:</Text>
              </Center>
              <Textarea value={finalText} h="300" resize="none" isDisabled />
            </Box>
          </VStack>
        </Center>
      </Container>
    </div>
  );
};

export default App;
