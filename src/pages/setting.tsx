import { Stack, Input, InputGroup, InputLeftAddon } from "@chakra-ui/react";
import { ThemeContext } from "../contexts/theme_context";
import { useContext, useState } from "react";
import { ReadingStyle } from "../models/reading_style";

export default function Setting() {
  const { theme } = useContext(ThemeContext);
  const [newTheme, setNewTheme] = useState<ReadingStyle>(theme);
  return (
    <Stack p={4}>
      <h2>Setting</h2>
      <InputGroup size="md">
        <InputLeftAddon>Color:</InputLeftAddon>
        <Input
          p={0}
          width="xm"
          type="color"
          value={newTheme.bgColor}
          onChange={(e) =>
            setNewTheme({ ...newTheme, bgColor: e.target.value })
          }
        />
      </InputGroup>
      <InputGroup size="md">
        <InputLeftAddon>Text Color:</InputLeftAddon>
        <Input
          p={0}
          width="xm"
          type="color"
          value={newTheme.txtColor}
          onChange={(e) =>
            setNewTheme({ ...newTheme, txtColor: e.target.value })
          }
        />
      </InputGroup>
      <InputGroup size="md">
        <InputLeftAddon>Text align:</InputLeftAddon>
        <Input
          p={0}
          width="xm"
          type="select"
          value={newTheme.txtAlign}
          onChange={(e) =>
            setNewTheme({ ...newTheme, txtAlign: e.target.value as any })
          }
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Input>
      </InputGroup>
    </Stack>
  );
}
