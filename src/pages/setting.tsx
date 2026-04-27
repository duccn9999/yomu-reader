import {
  Flex,
  Input,
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
  SimpleGrid,
  FormLabel,
  FormControl,
} from '@chakra-ui/react'
import { QuestionIcon } from '@chakra-ui/icons'
import { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../contexts/providers/theme_context_provider'
import type { Theme } from '../models/theme'
import { Db } from '../db/yomu_reader_db'
import { DbContext } from '../contexts/providers/db_context_provider'

export default function Setting() {
  const { theme, setTheme } = useContext(ThemeContext)
  const { db } = useContext(DbContext)!
  const [themes, setThemes] = useState<(Theme & { id: number })[]>([])
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  useEffect(() => {
    if (!db) return
    async function fetchThemes() {
      const themes = await Db.getThemes(db as IDBDatabase)
      setThemes(themes as (Theme & { id: number })[])
    }
    fetchThemes()
  }, [])

  if (!db) {
    return <div>Loading...</div>
  }
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
    }
    await Db.addTheme(db as IDBDatabase, newTheme)
      .then(() => {
        onClose()
        toast({
          title: 'Theme saved.',
          description: 'Your theme has been saved successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
          containerStyle: {
            marginTop: '40px', // ← push it below the navbar
          },
        })
      })
      .catch((err) => {
        toast({
          title: 'Error saving theme.',
          description: `An error occurred while saving the theme. ${err.message}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
          containerStyle: {
            marginTop: '40px', // ← push it below the navbar
          },
        })
      })
    const themes = await Db.getThemes(db as IDBDatabase)
    setThemes(themes as (Theme & { id: number })[])
  }

  async function UpdateTheme() {
    if (!theme.id) return
    await Db.updateTheme(db as IDBDatabase, theme)
      .then(() => {
        onClose()
        toast({
          title: 'Theme updated.',
          description: 'Your theme has been updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
          containerStyle: {
            marginTop: '40px',
          },
        })
      })
      .catch((err) => {
        toast({
          title: 'Error updating theme.',
          description: `An error occurred while updating the theme. ${err.message}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
          containerStyle: {
            marginTop: '40px',
          },
        })
      })
    const themes = await Db.getThemes(db as IDBDatabase)
    setThemes(themes as (Theme & { id: number })[])
  }
  return (
    <Box maxW='900px' p={{ base: 3, md: 5 }} margin='auto'>
      <Text
        fontSize='2xl'
        fontWeight='bold'
        mb={5}
        pb={3}
        borderBottom='1px solid'
        borderColor='gray.200'
      >
        Settings
      </Text>

      {/* Theme */}
      <Box mb={6}>
        <Text
          fontSize='xs'
          fontWeight={500}
          textTransform='uppercase'
          letterSpacing='wide'
          color='gray.500'
          mb={3}
        >
          Theme
        </Text>
        <Box p={4} border='1px solid' borderColor='gray.200' borderRadius='lg'>
          <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4}>
            {themes.length > 0 && (
              <FormControl>
                <FormLabel fontSize='sm'>Theme preset</FormLabel>
                <Select
                  size='sm'
                  value={theme.id}
                  onChange={(e) => {
                    const t = themes.find(
                      (t) => t.id === parseInt(e.target.value),
                    )
                    if (t) setTheme(t)
                  }}
                >
                  {themes.map((t) => (
                    <option key={t.id} value={t.id} selected={t.isSelected}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl>
              <FormLabel fontSize='sm'>Background</FormLabel>
              <Input
                p={0}
                type='color'
                size='sm'
                value={theme.bgColor}
                onChange={(e) =>
                  setTheme({ ...theme, bgColor: e.target.value })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize='sm'>Text color</FormLabel>
              <Input
                p={0}
                type='color'
                size='sm'
                value={theme.txtColor}
                onChange={(e) =>
                  setTheme({ ...theme, txtColor: e.target.value })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize='sm'>Text align</FormLabel>
              <Select
                size='sm'
                value={theme.txtAlign}
                onChange={(e) =>
                  setTheme({ ...theme, txtAlign: e.target.value })
                }
              >
                <option value='left'>Left</option>
                <option value='center'>Center</option>
                <option value='right'>Right</option>
                <option value='justify'>Justify</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize='sm'>Font size (px)</FormLabel>
              <NumberInput size='sm' defaultValue={theme.fontSize}>
                <NumberInputField
                  onChange={(e) =>
                    setTheme({ ...theme, fontSize: parseInt(e.target.value) })
                  }
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </SimpleGrid>
        </Box>
      </Box>

      {/* Padding */}
      <Box mb={6}>
        <Text
          fontSize='xs'
          fontWeight={500}
          textTransform='uppercase'
          letterSpacing='wide'
          color='gray.500'
          mb={3}
        >
          Padding{' '}
          <Tooltip label='Space inside the text area'>
            <QuestionIcon ml={1} />
          </Tooltip>
        </Text>
        <Box p={4} border='1px solid' borderColor='gray.200' borderRadius='lg'>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {['top', 'right', 'bottom', 'left'].map((side) => (
              <FormControl key={side}>
                <FormLabel fontSize='sm' textTransform='capitalize'>
                  {side}
                </FormLabel>
                <NumberInput
                  size='sm'
                  defaultValue={
                    theme.padding[side as keyof typeof theme.padding]
                  }
                >
                  <NumberInputField
                    onChange={(e) =>
                      setTheme({
                        ...theme,
                        padding: {
                          ...theme.padding,
                          [side]: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* Margin */}
      <Box mb={6}>
        <Text
          fontSize='xs'
          fontWeight={500}
          textTransform='uppercase'
          letterSpacing='wide'
          color='gray.500'
          mb={3}
        >
          Margin{' '}
          <Tooltip label='Space around the text area'>
            <QuestionIcon ml={1} />
          </Tooltip>
        </Text>
        <Box p={4} border='1px solid' borderColor='gray.200' borderRadius='lg'>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {['top', 'right', 'bottom', 'left'].map((side) => (
              <FormControl key={side}>
                <FormLabel fontSize='sm' textTransform='capitalize'>
                  {side}
                </FormLabel>
                <NumberInput
                  size='sm'
                  defaultValue={theme.margin[side as keyof typeof theme.margin]}
                >
                  <NumberInputField
                    onChange={(e) =>
                      setTheme({
                        ...theme,
                        margin: {
                          ...theme.margin,
                          [side]: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* Actions */}
      <Flex
        justify='flex-end'
        gap={2}
        pt={4}
        borderTop='1px solid'
        borderColor='gray.200'
      >
        {theme.id !== 1 && theme.id !== 2 && (
          <Button size='sm' onClick={UpdateTheme}>
            Save
          </Button>
        )}
        <Button size='sm' colorScheme='green' onClick={onOpen}>
          Save As
        </Button>
      </Flex>

      {/* Modal — unchanged */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save as new theme</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder='Theme name'
              onChange={(e) => setTheme({ ...theme, name: e.target.value })}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              variant='ghost'
              bg='green.400'
              color='white'
              _hover={{ bg: 'green.500' }}
              onClick={SaveTheme}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
