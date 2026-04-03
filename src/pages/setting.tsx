import {
  Flex,
  Input,
  InputGroup,
  InputLeftAddon,
  Select,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberIncrementStepper,
  Box,
  HStack,
  PinInput,
  PinInputField,
  Tooltip,
  Text,
} from "@chakra-ui/react";
import { ThemeContext } from "../contexts/theme_context";
import { useContext, useEffect, useState } from "react";
import { QuestionIcon } from "@chakra-ui/icons";
import { DbContext } from "../contexts/db_context";
import type { ReadingStyle } from "../models/reading_style";
import { getTheme, getThemes } from "../db/yomu_reader_db";

export default function Setting() {
  const { theme, setTheme } = useContext(ThemeContext);
  const { db } = useContext(DbContext)!;
  const [themes, setThemes] = useState<ReadingStyle[]>([]);
  if (!db) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    async function fetchThemes() {
      const themes = await getThemes(db as IDBDatabase);
      setThemes(themes);
    }
    fetchThemes();
  }, []);
  return (
    <div style={{ margin: "0 5.5rem 0 5.5rem" }}>
      <Text fontSize="2xl" fontWeight="bold">
        Setting
      </Text>
      {themes.length > 0 && (
        <Select
          placeholder="Select theme"
          w="36"
          value={theme.id}
          onChange={(e) => {
            const selectedTheme = themes.find(
              (t) => t.id === parseInt(e.target.value),
            );
            if (selectedTheme) {
              setTheme(selectedTheme);
            }
          }}
        >
          {themes.map((t) => (
            <option key={t.id} value={t.id}>
              Theme {t.id}
            </option>
          ))}
        </Select>
      )}
      <Flex p={4} gridRow={4} align="center" justify="space-between">
        <Box>
          <InputGroup size="md">
            <InputLeftAddon>Color</InputLeftAddon>
            <Input
              p={0}
              width="xm"
              type="color"
              value={theme.bgColor}
              onChange={(e) => setTheme({ ...theme, bgColor: e.target.value })}
            />
          </InputGroup>
        </Box>
        <Box>
          <InputGroup size="md">
            <InputLeftAddon>Text Color:</InputLeftAddon>
            <Input
              p={0}
              width="xm"
              type="color"
              value={theme.txtColor}
              onChange={(e) => setTheme({ ...theme, txtColor: e.target.value })}
            />
          </InputGroup>
        </Box>
        <Box>
          <InputGroup size="md">
            <InputLeftAddon>
              <Text fontSize="md">
                Text align{" "}
                <Tooltip label="Justify text" placement="top">
                  <QuestionIcon marginLeft={1.5} />
                </Tooltip>
              </Text>
            </InputLeftAddon>
            <Select
              p={0}
              width="xm"
              value={theme.txtAlign}
              onChange={(e) =>
                setTheme({ ...theme, txtAlign: e.target.value as any })
              }
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </Select>
          </InputGroup>
        </Box>
      </Flex>
      <Flex p={4} gridRow={4} align="center" justify="space-between">
        <Box>
          <InputGroup size="lg">
            <InputLeftAddon>Font Size</InputLeftAddon>
            <NumberInput defaultValue={theme.fontSize} size="lg">
              <NumberInputField width="20" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </InputGroup>
        </Box>
        <Box>
          <InputGroup size="lg">
            <InputLeftAddon>
              Padding{" "}
              <Tooltip label="Justify text" placement="top">
                <QuestionIcon marginLeft={1.5} />
              </Tooltip>
            </InputLeftAddon>
            null
            <HStack>
              <PinInput type="alphanumeric" size="lg">
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
              </PinInput>
            </HStack>
          </InputGroup>
        </Box>
        <Box>
          <InputGroup size="lg">
            <InputLeftAddon>Margin</InputLeftAddon>
            <HStack>
              <PinInput type="alphanumeric" size="lg">
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
              </PinInput>
            </HStack>
          </InputGroup>
        </Box>
      </Flex>
      <Box float="right" p={4}>
        <Button size="lg">Save</Button>
        <Button colorScheme="green" size="lg">
          Save As
        </Button>
      </Box>
    </div>
  );
}
