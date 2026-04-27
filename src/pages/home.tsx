import {
  DeleteIcon,
  Flex,
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
} from '@chakra-ui/icons'
import { GoGear } from 'react-icons/go'
import { MdOutlineFileUpload } from 'react-icons/md'
import {
  IconButton,
  Card,
  CardBody,
  Text,
  Image,
  Box,
  Button,
  Input,
  Spacer,
  Divider,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react'
import { TbBrandGoogleDrive } from 'react-icons/tb'
import { IoHomeOutline } from 'react-icons/io5'
import '../index.css'
import { useGetGDriveFiles } from '../hooks/GDriveHooks/useGetGDriveFiles'
import { cache } from '../db/memory_db/memory_db'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import Setting from './setting'
import { GDriveService } from '../services/gdrive_service.service'
import { LuBookOpenText } from 'react-icons/lu'
import { GrNotes } from 'react-icons/gr'
import { useGoogleLogin } from '../services/google_login.service'
import useDeleteGDriveFile from '../hooks/GDriveHooks/useDeleteGDriveFile'
import { Book } from '../models/book'
import { ReadingProvider } from '../contexts/reading_context'
import { ReadingContext } from '../contexts/providers/reading_context.provider'
import { ScreenContext } from '../contexts/providers/screen_context_provider'
import { DbContext } from '../contexts/providers/db_context_provider'
import { Db } from '../db/yomu_reader_db'
import type { BookContent } from '../models/book_content'
import { GenerateDummyImage } from '../utils/dummy_image'
import { Observable } from 'rxjs'
import { redirectDocument } from 'react-router-dom'
export function Manage() {
  return (
    <ReadingProvider>
      <Home />
    </ReadingProvider>
  )
}

function Home() {
  const accessToken = localStorage.getItem('gdrive_access_token')
  const { id } = useContext(ReadingContext)
  const { db } = useContext(DbContext)
  const [books, setBooks] = useGetGDriveFiles(accessToken!, db!)
  /* gallery: home, 1: setting, 2: reading */
  const { screen, setScreen } = useContext(ScreenContext)
  const renderScreen = () => {
    switch (screen) {
      case 0:
        return (
          <Gallery
            books={books}
            BookCardComponent={BookCard}
            setBooks={setBooks}
          />
        )
      case 1:
        return <Setting />
      case 2:
        return <ReadingScreen id={id} book={books.get(id)} key={id} />
      case 3:
        return <Notes books={books} />
      default:
        return null
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <NavBar setScreen={setScreen} />
      {renderScreen()}
    </div>
  )
}

export function NavBar({ setScreen }: { setScreen: (screen: number) => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const accessToken = localStorage.getItem('gdrive_access_token')

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    console.log(file)
  }

  async function onUploadConfirm() {
    if (!selectedFile || !accessToken) return
    await GDriveService.UploadBook(
      accessToken,
      selectedFile,
      cache.root_folder_id,
    )
    setSelectedFile(null)
  }

  return (
    <Flex
      bg='gray.700'
      h='44px'
      alignItems='center'
      px={2}
      gap={1}
      position='sticky'
      top={0}
      zIndex={10}
    >
      {/* left — nav */}
      <IconButton
        aria-label='home'
        icon={<IoHomeOutline />}
        variant='ghost'
        color='whiteAlpha.700'
        _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
        size='sm'
        borderRadius='lg'
        onClick={() => setScreen(0)}
      />

      <IconButton
        aria-label='reading'
        icon={<LuBookOpenText />}
        variant='ghost'
        color='whiteAlpha.700'
        _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
        size='sm'
        borderRadius='lg'
        onClick={() => setScreen(2)}
      />

      <Divider orientation='vertical' h='20px' borderColor='whiteAlpha.200' />

      <Spacer />

      {/* right — settings + notes */}
      {/* upload */}
      {accessToken && (
        <Box>
          <label htmlFor='file-input'>
            <IconButton
              as='span'
              aria-label='upload'
              icon={<MdOutlineFileUpload />}
              variant='outline'
              color='whiteAlpha.800'
              borderColor='whiteAlpha.300'
              _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
              size='sm'
              borderRadius='lg'
              cursor='pointer'
            />
          </label>
          <Input
            type='file'
            accept='.epub'
            display='none'
            id='file-input'
            onChange={onFileChange}
          />
        </Box>
      )}
      <IconButton
        aria-label='settings'
        icon={<GoGear />}
        variant='ghost'
        color='whiteAlpha.700'
        _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
        size='sm'
        borderRadius='lg'
        onClick={() => setScreen(1)}
      />

      <IconButton
        aria-label='notes'
        icon={<GrNotes />}
        variant='ghost'
        color='whiteAlpha.700'
        _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
        size='sm'
        borderRadius='lg'
        onClick={() => setScreen(3)}
      />

      {/* confirm dialog */}
      {selectedFile && (
        <Flex
          position='fixed'
          bottom={4}
          left='50%'
          transform='translateX(-50%)'
          bg='gray.800'
          border='1px solid'
          borderColor='whiteAlpha.200'
          p={3}
          borderRadius='xl'
          gap={3}
          alignItems='center'
          zIndex={20}
        >
          <Text color='whiteAlpha.800' fontSize='sm' maxW='200px' noOfLines={1}>
            {selectedFile.name}
          </Text>
          <Button size='xs' colorScheme='blue' onClick={onUploadConfirm}>
            Upload
          </Button>
          <Button
            size='xs'
            variant='ghost'
            color='whiteAlpha.600'
            onClick={() => setSelectedFile(null)}
          >
            Cancel
          </Button>
        </Flex>
      )}
    </Flex>
  )
}
const BookCard = React.memo(function BookCard({
  file,
  id,
  onDelete,
}: {
  file: Book
  id: string
  onDelete: (parent: string, id: string) => void
}) {
  const { setId } = useContext(ReadingContext)
  const { setScreen } = useContext(ScreenContext)
  if (!file) return <div className='book-card'></div>
  const coverUrl = URL.createObjectURL(file.cover as Blob)
  // BookCard
  return (
    <Card
      className='book-card'
      width='160px'
      position='relative'
      cursor='pointer'
      borderRadius='xl'
      overflow='hidden'
      border='0.5px solid'
      borderColor='gray.200'
      transition='transform 0.15s'
      _hover={{
        transform: 'translateY(-3px)',
        '& .delete-btn': { opacity: 1 },
      }}
      onClick={() => {
        setId(id)
        setScreen(2)
      }}
    >
      <CardBody p={0}>
        <Image
          src={coverUrl}
          alt='Book Cover'
          width='100%'
          height='220px'
          objectFit='cover'
          fallback={<Box w='100%' h='220px' bg='gray.100' />}
        />
        <IconButton
          className='delete-btn'
          icon={<DeleteIcon />}
          position='absolute'
          top={2}
          right={2}
          size='xs'
          borderRadius='lg'
          bg='blackAlpha.600'
          color='white'
          opacity={0}
          transition='opacity 0.15s'
          _hover={{ bg: 'red.500' }}
          aria-label='Delete book'
          onClick={(e) => {
            e.stopPropagation()
            onDelete(file.parents?.[0] as string, id)
          }}
        />
      </CardBody>
      <Box p={3}>
        <Text fontSize='sm' fontWeight={500} noOfLines={2} lineHeight='short'>
          {file.title}
        </Text>
      </Box>
    </Card>
  )
})
function Gallery({
  books,
  BookCardComponent,
  setBooks,
}: {
  books: Map<string, Book>
  BookCardComponent: React.ComponentType<{
    id: string
    file: Book
    onDelete: (parent: string, id: string) => void
  }>
  setBooks: React.Dispatch<React.SetStateAction<Map<string, Book>>>
}) {
  const accessToken = localStorage.getItem('gdrive_access_token')
  const [, setIsLoggedIn] = useState(!!accessToken)
  const { login } = useGoogleLogin(() => {
    setIsLoggedIn(true)
    window.location.reload()
  })
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { deleteFile } = useDeleteGDriveFile(accessToken!)

  const [deleteParent, setDeleteParent] = useState<string | null>(null)
  const [deleteId, setDeleteid] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filteredBooks, setFilteredBooks] = useState<Map<string, Book>>(
    new Map(),
  )

  useEffect(() => {
    if (!search) {
      setFilteredBooks(new Map(books)) // show all
      return
    }

    const query = search.toLowerCase()

    const filtered = new Map(
      Array.from(books.entries()).filter(([_, book]) =>
        book.title.toLowerCase().includes(query),
      ),
    )

    setFilteredBooks(filtered)
  }, [search, books])
  function handleDeleteClick(parent: string, id: string) {
    setDeleteParent(parent)
    setDeleteid(id)
    onOpen()
  }

  function handleDeleteConfirm() {
    if (!deleteId || !deleteParent) return

    books.delete(deleteId)
    setBooks(books)
    deleteFile(deleteParent)
    onClose()
  }
  if (!accessToken) {
    return (
      <Flex
        justify='center'
        align='center'
        width='67%'
        height='100vh'
        margin='auto'
      >
        <Button
          leftIcon={<TbBrandGoogleDrive />}
          onClick={login}
          colorScheme='blue'
          size='lg'
        >
          Connect Google Drive
        </Button>
      </Flex>
    )
  }
  return (
    <>
      <Box
        position='sticky'
        top='44px' // ← below navbar
        zIndex={9}
        px={4}
        py={2}
        bg='white'
        borderBottom='1px solid'
        borderColor='gray.100'
      >
        <InputGroup maxW='400px' mx='auto'>
          <InputLeftElement pointerEvents='none'>
            <SearchIcon color='gray.400' />
          </InputLeftElement>
          <Input
            placeholder='Search books...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            borderRadius='full'
            bg='gray.50'
            border='1px solid'
            borderColor='gray.200'
            _focus={{ borderColor: 'gray.400', bg: 'white' }}
          />
        </InputGroup>
      </Box>
      <Flex wrap='wrap' p={4} gap={4}>
        {Array.from(filteredBooks.entries()).map(([id, file]) => (
          <BookCardComponent
            key={id}
            id={id}
            file={file}
            onDelete={handleDeleteClick}
          />
        ))}
      </Flex>

      {/* single modal for all cards */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete book</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this book?</Text>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='red' onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

function ReadingScreen({ id, book }: { id: string; book: Book }) {
  const { db } = useContext(DbContext)
  const [bookContent, setBookContent] = useState<BookContent>()
  useEffect(() => {
    if (!db || !id) return
    let isMounted = true
    async function fetchBook() {
      const data = await Db.getBook(db!, id)
      console.log(data)
      if (isMounted) {
        setBookContent(data as BookContent)
      }
    }
    fetchBook()
    return () => {
      isMounted = false
    }
  }, [id, db])
  const renderedContent = useMemo(() => {
    if (!bookContent) return null

    return FilterContent(book.refs, bookContent)
  }, [book.refs, bookContent])
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: renderedContent,
      }}
    />
  )
}

function Notes({ books }: { books: Map<string, Book> }) {
  const [noteText, setNoteText] = useState('')
  const [expandedBooks, setExpandedBooks] = useState(new Set())
  function handleSave(book: Book, index: number) {
    if (noteText && book.notes?.data?.[index]) {
      book.notes.data[index].note = noteText
    }
  }
  const toggleBook = (bookId: number | string) => {
    setExpandedBooks((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(bookId)) {
        newSet.delete(bookId)
      } else {
        newSet.add(bookId)
      }
      return newSet
    })
  }
  function handleDelete(book: Book, index: number) {
    const note = book.notes?.data[index]
    if (!note) return
    book.notes?.data.splice(index, 1)
  }

  return (
    <Box p={6}>
      {Array.from(books.entries()).map(([bookId, book]) => (
        <Box key={bookId} mb={8}>
          {/* Book header with dropdown toggle */}
          <Flex
            align='center'
            justify='space-between'
            mb={3}
            p={3}
            bg='gray.50'
            borderRadius='md'
            cursor='pointer'
            onClick={() => toggleBook(bookId)}
            _hover={{ bg: 'gray.100' }}
          >
            <Text fontStyle='italic' fontWeight={600}>
              {book.title}
            </Text>
            <Flex align='center' gap={2}>
              <Text fontSize='xs' color='gray.500'>
                {book.notes?.data?.length || 0} notes
              </Text>
              {expandedBooks.has(bookId) ? (
                <ChevronUpIcon boxSize={5} />
              ) : (
                <ChevronDownIcon boxSize={5} />
              )}
            </Flex>
          </Flex>

          {/* Collapsible notes section */}
          {expandedBooks.has(bookId) && (
            <Box pl={4}>
              {(book.notes?.data ?? []).map((note, index) => (
                <Flex
                  key={index}
                  gap={3}
                  align='start'
                  mb={3}
                  p={3}
                  border='1px solid'
                  borderColor='gray.200'
                  borderRadius='lg'
                >
                  <Box
                    w='10px'
                    h='10px'
                    borderRadius='full'
                    bg={note.color}
                    mt={1}
                    flexShrink={0}
                  />
                  <Box flex={1}>
                    <Text
                      fontSize='xs'
                      color='gray.400'
                      mb={1}
                      fontFamily='mono'
                      borderLeft='2px solid'
                      borderColor='gray.200'
                      pl={2}
                    >
                      {note.text}
                    </Text>
                    <Input
                      size='sm'
                      variant='flushed'
                      value={note.note}
                      placeholder='Add a note...'
                      onChange={(e) => {
                        note.note = e.target.value
                        setNoteText(e.target.value)
                      }}
                    />
                  </Box>
                  <Flex gap={2}>
                    <Button
                      size='xs'
                      colorScheme='green'
                      variant='outline'
                      onClick={() => handleSave(book, index)}
                    >
                      Save
                    </Button>
                    <Button
                      size='xs'
                      colorScheme='red'
                      variant='outline'
                      onClick={() => handleDelete(book, index)}
                    >
                      Delete
                    </Button>
                  </Flex>
                </Flex>
              ))}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  )
}

function FilterContent(
  refs: { ['@_idref']: string }[],
  content: BookContent,
): string {
  let result = ''

  const blobs = content.blobs

  for (const ref of refs) {
    const chapter = content.chapters[ref['@_idref']]

    if (!chapter) continue

    let updatedChapter = chapter

    for (const [key, value] of Object.entries(blobs)) {
      const dummyUrl = GenerateDummyImage(key)
      const realUrl = URL.createObjectURL(value)

      updatedChapter = updatedChapter.replaceAll(dummyUrl, realUrl)
    }

    result += updatedChapter
  }

  return result
}

function ReplaceDummyUrlWithBlob(html: string, blobs: Record<string, Blob>) {
  return new Observable<string>((subscriber) => {
    const parser = new DOMParser()

    let htmlDom = parser.parseFromString(html, 'application/xhtml+xml')

    // fallback if XHTML parsing failed
    const parserError = htmlDom.querySelector('parsererror')
    if (parserError) {
      htmlDom = parser.parseFromString(html, 'text/html')
    }

    let elementHtml: string

    if (htmlDom.contentType === 'application/xhtml+xml') {
      elementHtml = new XMLSerializer().serializeToString(htmlDom)
    } else {
      elementHtml = htmlDom.documentElement.outerHTML
    }

    const objectUrls: string[] = []

    for (const [key, value] of Object.entries(blobs)) {
      const dummyUrl = GenerateDummyImage(key)
      const realUrl = URL.createObjectURL(value)

      objectUrls.push(realUrl)

      elementHtml = elementHtml.replaceAll(dummyUrl, realUrl)
    }

    subscriber.next(elementHtml)
    subscriber.complete()

    // cleanup when unsubscribe happens
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  })
}
