import React, { useState } from "react";
import { Button, Textarea, Text, Flex } from "@chakra-ui/react";
import { diff } from "./diff";

interface IClientProps {
  clinedId: number;
  onSync: (cliendId: number) => string | undefined;
  onActions: (cliendId: number, actions: any[]) => void;
}

const Clinet: React.FC<IClientProps> = ({ clinedId, onSync, onActions }) => {
  const [isSync, setSync] = useState(false);
  const [text, setText] = useState("");

  const onClick = () => {
    setSync(true);
    setText(onSync(clinedId) as string);
    setSync(false);
  };

  const onChange = (e: any) => {
    if (!isSync) {
      const value = e.target.value;
      const actions = diff(text, value);
      onActions(clinedId, actions);
      setText(value);
    }
  };

  return (
    <Flex w="300px" h="300px" direction="column">
      <Text m="8px">Client: {clinedId}</Text>
      <Textarea
        value={text}
        onChange={onChange}
        flex="1"
        placeholder="Here is a sample placeholder"
        resize="none"
      />
      <Button onClick={onClick}>获取同步</Button>
    </Flex>
  );
};

export default Clinet;
