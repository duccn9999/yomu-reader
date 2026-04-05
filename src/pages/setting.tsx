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
  Tooltip,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { ThemeContext } from "../contexts/theme_context";
import { useContext, useEffect, useState } from "react";
import { QuestionIcon } from "@chakra-ui/icons";
import { DbContext } from "../contexts/db_context";
import type { Theme } from "../models/theme";
import { addTheme, getThemes, updateTheme } from "../db/yomu_reader_db";

export default function Setting() {
  const { theme, setTheme } = useContext(ThemeContext);
  const { db } = useContext(DbContext)!;
  const [themes, setThemes] = useState<(Theme & { id: number })[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  if (!db) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    async function fetchThemes() {
      const themes = await getThemes(db as IDBDatabase);
      setThemes(themes as (Theme & { id: number })[]);
    }
    fetchThemes();
  }, []);

  async function SaveTheme() {
    const newTheme: Theme = {
      name: theme.name,
      txtColor: theme.txtColor,
      bgColor: theme.bgColor,
      txtAlign: theme.txtAlign,
      margin: theme.margin,
      padding: theme.padding,
      font: theme.font,
      fontSize: theme.fontSize,
    };
    await addTheme(db as IDBDatabase, newTheme)
      .then(() => {
        onClose();
        toast({
          title: "Theme saved.",
          description: "Your theme has been saved successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      })
      .catch((err) => {
        toast({
          title: "Error saving theme.",
          description: `An error occurred while saving the theme. ${err.message}`,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      });
    const themes = await getThemes(db as IDBDatabase);
    setThemes(themes as (Theme & { id: number })[]);
  }

  async function UpdateTheme() {
    if (!theme.id) return;
    await updateTheme(db as IDBDatabase, theme)
      .then(() => {
        onClose();
        toast({
          title: "Theme updated.",
          description: "Your theme has been updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      })
      .catch((err) => {
        toast({
          title: "Error updating theme.",
          description: `An error occurred while updating the theme. ${err.message}`,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      });
    const themes = await getThemes(db as IDBDatabase);
    setThemes(themes as (Theme & { id: number })[]);
  }
  return (
    <div style={{ margin: "0 5.5rem 0 5.5rem" }}>
      <Text fontSize="2xl" fontWeight="bold">
        Setting
      </Text>

      <Box p={4}>
        {themes.length > 0 && (
          <Select
            placeholder="Select theme"
            w="48"
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
              <option key={t.id} value={t.id} defaultValue={1}>
                {t.name}
              </option>
            ))}
          </Select>
        )}
      </Box>
      <Flex p={4} gridRow={4} align="center" justify="space-between">
        <Box>
          <InputGroup size="md">
            <InputLeftAddon>Background Color</InputLeftAddon>
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
              <NumberInputField
                width="20"
                onChange={(e) => {
                  setTheme({ ...theme, fontSize: parseInt(e.target.value) });
                }}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </InputGroup>
        </Box>
      </Flex>

      <Box>
        <Text fontSize="lg" fontWeight="bold" textAlign="left" pl={4}>
          Padding{" "}
          <Tooltip
            label="Space inside the text area. It keeps the text away from its own border or box, making it look less cramped."
            placement="top"
          >
            <QuestionIcon marginLeft={1.5} />
          </Tooltip>
        </Text>
        <Flex p={4} gridRow={4} align="center" justify="space-between">
          <Box>
            <InputGroup size="lg">
              <InputLeftAddon>Top</InputLeftAddon>
              <NumberInput defaultValue={theme.padding.top} size="lg">
                <NumberInputField
                  width="20"
                  onChange={(e) => {
                    setTheme({
                      ...theme,
                      padding: {
                        ...theme.padding,
                        top: parseInt(e.target.value),
                      },
                    });
                  }}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </InputGroup>
          </Box>
          <Box>
            <InputGroup size="lg">
              <InputLeftAddon>Right</InputLeftAddon>
              <NumberInput defaultValue={theme.padding.right} size="lg">
                <NumberInputField
                  width="20"
                  onChange={(e) => {
                    setTheme({
                      ...theme,
                      padding: {
                        ...theme.padding,
                        right: parseInt(e.target.value),
                      },
                    });
                  }}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </InputGroup>
          </Box>
          <Box>
            <InputGroup size="lg">
              <InputLeftAddon>Bottom</InputLeftAddon>
              <NumberInput defaultValue={theme.padding.bottom} size="lg">
                <NumberInputField
                  width="20"
                  onChange={(e) => {
                    setTheme({
                      ...theme,
                      padding: {
                        ...theme.padding,
                        bottom: parseInt(e.target.value),
                      },
                    });
                  }}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </InputGroup>
          </Box>
          <Box>
            <InputGroup size="lg">
              <InputLeftAddon>Left</InputLeftAddon>
              <NumberInput defaultValue={theme.padding.left} size="lg">
                <NumberInputField
                  width="20"
                  onChange={(e) => {
                    setTheme({
                      ...theme,
                      padding: {
                        ...theme.padding,
                        left: parseInt(e.target.value),
                      },
                    });
                  }}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </InputGroup>
          </Box>
        </Flex>
      </Box>

      <Box>
        <Text fontSize="lg" fontWeight="bold" textAlign="left" pl={4}>
          Margin{" "}
          <Tooltip
            label="Space around the text. It keeps text away from the edges so it’s easier to read."
            placement="top"
          >
            <QuestionIcon marginLeft={1.5} />
          </Tooltip>
        </Text>
        <Flex p={4} gridRow={4} align="center" justify="space-between">
          <Box>
            <InputGroup size="lg">
              <InputLeftAddon>Top</InputLeftAddon>
              <NumberInput defaultValue={theme.margin.top} size="lg">
                <NumberInputField
                  width="20"
                  onChange={(e) => {
                    setTheme({
                      ...theme,
                      margin: {
                        ...theme.margin,
                        top: parseInt(e.target.value),
                      },
                    });
                  }}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </InputGroup>
          </Box>
          <Box>
            <InputGroup size="lg">
              <InputLeftAddon>Right</InputLeftAddon>
              <NumberInput defaultValue={theme.margin.right} size="lg">
                <NumberInputField
                  width="20"
                  onChange={(e) => {
                    setTheme({
                      ...theme,
                      margin: {
                        ...theme.margin,
                        right: parseInt(e.target.value),
                      },
                    });
                  }}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </InputGroup>
          </Box>
          <Box>
            <InputGroup size="lg">
              <InputLeftAddon>Bottom</InputLeftAddon>
              <NumberInput defaultValue={theme.margin.bottom} size="lg">
                <NumberInputField
                  width="20"
                  onChange={(e) => {
                    setTheme({
                      ...theme,
                      margin: {
                        ...theme.margin,
                        bottom: parseInt(e.target.value),
                      },
                    });
                  }}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </InputGroup>
          </Box>
          <Box>
            <InputGroup size="lg">
              <InputLeftAddon>Left</InputLeftAddon>
              <NumberInput defaultValue={theme.margin.left} size="lg">
                <NumberInputField
                  width="20"
                  onChange={(e) => {
                    setTheme({
                      ...theme,
                      margin: {
                        ...theme.margin,
                        left: parseInt(e.target.value),
                      },
                    });
                  }}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </InputGroup>
          </Box>
        </Flex>
      </Box>
      <Box float="right" p={4}>
        {theme.id !== 1 && theme.id !== 2 && (
          <Button
            size="lg"
            onClick={() => {
              UpdateTheme();
            }}
          >
            Save
          </Button>
        )}
        <Button colorScheme="green" size="lg" onClick={onOpen}>
          Save As
        </Button>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Save as new theme</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                placeholder="Theme name"
                onChange={(e) => setTheme({ ...theme, name: e.target.value })}
              />
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
              <Button
                variant="ghost"
                bg="green.400"
                color="white"
                _hover={{ bg: "green.500" }}
                onClick={() => {
                  SaveTheme();
                }}
              >
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </div>
  );
}
