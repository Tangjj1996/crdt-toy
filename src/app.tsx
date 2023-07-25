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

enum ClientID {
  FIRST = 1,
  SECOND,
  ALL,
}

/**
 * 强制同步消息
 * merge是根据actions生成多叉树
 * content是序列化
 */
const onSync = (clientId: number) => {
  switch (clientId) {
    case ClientID.FIRST: {
      doc1?.merge(doc2!);
      return doc1?.content();
    }
    case ClientID.SECOND: {
      doc2?.merge(doc1!);
      return doc2?.content();
    }
  }
  return "";
};

const App = () => {
  const [finalText, setFinalText] = useState("");

  useEffect(() => {
    doc1 = new Document(ClientID.FIRST);
    doc2 = new Document(ClientID.SECOND);
    docAll = new Document(ClientID.ALL);
  }, []);

  /**
   * 生成多叉树
   * 注意：这时候的多叉树没有进行序列化，比如编辑器client1完全是一个受控的输入框，与多叉树无关
   */
  const onActions = (clientId: number, actions: ActionBuilder[]) => {
    let doc: Document | null;
    switch (clientId) {
      case ClientID.FIRST: {
        doc = doc1;
        break;
      }
      case ClientID.SECOND: {
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
    // 编辑器client3进行了序列化
    docAll?.merge(doc!);
    setFinalText(docAll?.content() || "");
  };

  return (
    <div className="app">
      <Container w="100%" h="100vh">
        <Center>
          <VStack spacing="50">
            <HStack spacing="200" pt="100">
              <Client
                clinedId={ClientID.FIRST}
                onSync={onSync}
                onActions={onActions}
              />
              <Client
                clinedId={ClientID.SECOND}
                onSync={onSync}
                onActions={onActions}
              />
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
