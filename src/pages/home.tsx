import {
  DeleteIcon,
  Flex,
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import { GoGear } from "react-icons/go";
import { MdOutlineFileUpload } from "react-icons/md";
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
  position,
} from "@chakra-ui/react";
import { TbBrandGoogleDrive } from "react-icons/tb";
import { IoHomeOutline } from "react-icons/io5";
import "../index.css";
import { useGetGDriveFiles } from "../hooks/GDriveHooks/useGetGDriveFiles";
import { cache } from "../db/memory_db/memory_db";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import Setting from "./setting";
import { GDriveService } from "../services/gdrive_service.service";
import { LuBookOpenText } from "react-icons/lu";
import { GrNotes } from "react-icons/gr";
import { useGoogleLogin } from "../services/google_login.service";
import useDeleteGDriveFile from "../hooks/GDriveHooks/useDeleteGDriveFile";
import { Book } from "../models/book";
import { ReadingProvider } from "../contexts/reading_context";
import { ReadingContext } from "../contexts/providers/reading_context.provider";
import { ScreenContext } from "../contexts/providers/screen_context_provider";
import { DbContext } from "../contexts/providers/db_context_provider";
import { Db } from "../db/yomu_reader_db";
import type { BookContent } from "../models/book_content";
import { GenerateDummyImage } from "../utils/dummy_image";
import { Observable } from "rxjs";
import DOMPurify from "dompurify";
import type { SelectedData } from "../models/selected_data";
import { useGetGDriveFile } from "../hooks/GDriveHooks/useGetGDriveFile";
import { FaSync } from "react-icons/fa";
export function Manage() {
  useEffect(() => {
    const checkTokenExpiry = () => {
      const accessToken = localStorage.getItem("gdrive_access_token");
      const expiresAt = localStorage.getItem("gdrive_expires_at");

      if (!accessToken || !expiresAt) return;

      if (Date.now() >= Number(expiresAt)) {
        localStorage.removeItem("gdrive_access_token");
        localStorage.removeItem("gdrive_expires_at");

        alert("Access token expired and removed.");
      }
    };

    // check immediately on mount
    checkTokenExpiry();

    // check every 10 minutes
    const interval = setInterval(checkTokenExpiry, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
  return (
    <ReadingProvider>
      <Home />
    </ReadingProvider>
  );
}

function Home() {
  const accessToken = localStorage.getItem("gdrive_access_token");
  const { id } = useContext(ReadingContext);
  const { db } = useContext(DbContext);
  const [books, setBooks] = useGetGDriveFiles(accessToken!, db!);
  const [booksContent, setBooksContent] = useState<BookContent[]>([]);
  /* gallery: home, 1: setting, 2: reading */
  const { screen, setScreen } = useContext(ScreenContext);

  const book = useMemo(() => books.get(id), [id]);
  useEffect(() => {
    if (!db) return;
    Db.getBooks(db).then((res) => setBooksContent(res));
  }, [id, db]);

  const booksContentMap = useMemo(
    () => Object.fromEntries(booksContent.map((c) => [c.id, c])),
    [booksContent],
  ) as Record<string, BookContent>;
  const renderScreen = () => {
    switch (screen) {
      case 0:
        return (
          <Gallery
            books={books}
            BookCardComponent={BookCard}
            setBooks={setBooks}
            db={db!}
          />
        );
      case 1:
        return <Setting />;
      case 2:
        return book ? (
          <ReadingScreen
            id={id}
            book={book}
            key={id}
            setBooksContent={setBooksContent}
          />
        ) : null;
      case 3:
        return (
          <Notes
            booksContent={booksContentMap}
            books={books}
            setBooksContent={setBooksContent}
            db={db!}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <NavBar setScreen={setScreen} setBooks={setBooks} db={db!} />
      {renderScreen()}
    </div>
  );
}

export function NavBar({
  setScreen,
  setBooks,
  db,
}: {
  setScreen: (screen: number) => void;
  setBooks: React.Dispatch<React.SetStateAction<Map<string, Book>>>;
  db: IDBDatabase;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const accessToken = localStorage.getItem("gdrive_access_token");
  const uploadBtnRef = useRef<HTMLButtonElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  }
  async function onUploadConfirm() {
    if (!selectedFile || !accessToken) return;
    if (uploadBtnRef.current) uploadBtnRef.current.disabled = true;
    const result = await GDriveService.UploadBook(
      accessToken,
      selectedFile,
      cache.root_folder_id,
    );
    if (!result) return;
    setSelectedFile(null);
    // append to state
    const { fileId, parentId } = result;
    const book = await useGetGDriveFile(accessToken, parentId, db);
    if (book) setBooks((prev) => new Map(prev).set(fileId, book));
  }

  return (
    <Flex
      bg="gray.700"
      h="44px"
      alignItems="center"
      px={2}
      gap={1}
      position="sticky"
      top={0}
      zIndex={10}
    >
      {/* left — nav */}
      <IconButton
        aria-label="home"
        icon={<IoHomeOutline />}
        variant="ghost"
        color="whiteAlpha.700"
        _hover={{ bg: "whiteAlpha.200", color: "white" }}
        size="sm"
        borderRadius="lg"
        onClick={() => setScreen(0)}
      />

      <IconButton
        aria-label="reading"
        icon={<LuBookOpenText />}
        variant="ghost"
        color="whiteAlpha.700"
        _hover={{ bg: "whiteAlpha.200", color: "white" }}
        size="sm"
        borderRadius="lg"
        onClick={() => setScreen(2)}
      />

      <Divider orientation="vertical" h="20px" borderColor="whiteAlpha.200" />

      <Spacer />

      {/* right — settings + notes */}
      {/* upload */}
      {accessToken && (
        <Box>
          <IconButton
            aria-label="reading"
            icon={<FaSync />}
            variant="ghost"
            color="whiteAlpha.700"
            _hover={{ bg: "whiteAlpha.200", color: "white" }}
            size="sm"
            borderRadius="lg"
            onClick={() => SyncMetaData(db)}
          />
          <label htmlFor="file-input">
            <IconButton
              as="span"
              aria-label="upload"
              icon={<MdOutlineFileUpload />}
              variant="outline"
              color="whiteAlpha.800"
              borderColor="whiteAlpha.300"
              _hover={{ bg: "whiteAlpha.200", color: "white" }}
              size="sm"
              borderRadius="lg"
              cursor="pointer"
            />
          </label>
          <Input
            type="file"
            accept=".epub"
            display="none"
            id="file-input"
            onChange={onFileChange}
          />
        </Box>
      )}
      <IconButton
        aria-label="settings"
        icon={<GoGear />}
        variant="ghost"
        color="whiteAlpha.700"
        _hover={{ bg: "whiteAlpha.200", color: "white" }}
        size="sm"
        borderRadius="lg"
        onClick={() => setScreen(1)}
      />

      <IconButton
        aria-label="notes"
        icon={<GrNotes />}
        variant="ghost"
        color="whiteAlpha.700"
        _hover={{ bg: "whiteAlpha.200", color: "white" }}
        size="sm"
        borderRadius="lg"
        onClick={() => setScreen(3)}
      />

      {/* confirm dialog */}
      {selectedFile && (
        <Flex
          position="fixed"
          bottom={4}
          left="50%"
          transform="translateX(-50%)"
          bg="gray.800"
          border="1px solid"
          borderColor="whiteAlpha.200"
          p={3}
          borderRadius="xl"
          gap={3}
          alignItems="center"
          zIndex={20}
        >
          <Text color="whiteAlpha.800" fontSize="sm" maxW="200px" noOfLines={1}>
            {selectedFile.name}
          </Text>
          <Button
            size="xs"
            colorScheme="blue"
            onClick={onUploadConfirm}
            ref={uploadBtnRef}
          >
            Upload
          </Button>
          <Button
            size="xs"
            variant="ghost"
            color="whiteAlpha.600"
            onClick={() => setSelectedFile(null)}
          >
            Cancel
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
const BookCard = React.memo(function BookCard({
  file,
  id,
  onDelete,
}: {
  file: Book;
  id: string;
  onDelete: (parent: string, id: string) => void;
}) {
  const { setId } = useContext(ReadingContext);
  const { setScreen } = useContext(ScreenContext);
  if (!file) return <div className="book-card"></div>;

  const [cover, setCover] = useState<string>();

  useEffect(() => {
    const coverUrl = URL.createObjectURL(file.cover!);
    if (coverUrl) setCover(coverUrl);

    return () => URL.revokeObjectURL(coverUrl);
  }, [file]);
  // BookCard
  return (
    <Card
      className="book-card"
      width="160px"
      position="relative"
      cursor="pointer"
      borderRadius="xl"
      overflow="hidden"
      border="0.5px solid"
      borderColor="gray.200"
      transition="transform 0.15s"
      _hover={{
        transform: "translateY(-3px)",
        "& .delete-btn": { opacity: 1 },
      }}
      onClick={() => {
        setId(id);
        setScreen(2);
      }}
    >
      <CardBody p={0}>
        <Image
          src={cover}
          alt="Book Cover"
          width="100%"
          height="220px"
          objectFit="cover"
          fallback={<Box w="100%" h="220px" bg="gray.100" />}
        />
        <IconButton
          className="delete-btn"
          icon={<DeleteIcon />}
          position="absolute"
          top={2}
          right={2}
          size="xs"
          borderRadius="lg"
          bg="blackAlpha.600"
          color="white"
          opacity={0}
          transition="opacity 0.15s"
          _hover={{ bg: "red.500" }}
          aria-label="Delete book"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(file.parents?.[0] as string, id);
          }}
        />
      </CardBody>
      <Box p={3}>
        <Text fontSize="sm" fontWeight={500} noOfLines={2} lineHeight="short">
          {file.title}
        </Text>
      </Box>
    </Card>
  );
});
function Gallery({
  books,
  BookCardComponent,
  setBooks,
  db,
}: {
  books: Map<string, Book>;
  BookCardComponent: React.ComponentType<{
    id: string;
    file: Book;
    onDelete: (parent: string, id: string) => void;
  }>;
  setBooks: React.Dispatch<React.SetStateAction<Map<string, Book>>>;
  db: IDBDatabase;
}) {
  const accessToken = localStorage.getItem("gdrive_access_token");
  const [, setIsLoggedIn] = useState(!!accessToken);
  const { login } = useGoogleLogin(() => {
    setIsLoggedIn(true);
    window.location.reload();
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { deleteFile } = useDeleteGDriveFile(accessToken!);

  const [deleteParent, setDeleteParent] = useState<string | null>(null);
  const [deleteId, setDeleteid] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filteredBooks, setFilteredBooks] = useState<Map<string, Book>>(
    new Map(),
  );

  useEffect(() => {
    if (!search) {
      setFilteredBooks(new Map(books)); // show all
      return;
    }

    const query = search.toLowerCase();

    const filtered = new Map(
      Array.from(books.entries()).filter(([_, book]) =>
        book.title.toLowerCase().includes(query),
      ),
    );

    setFilteredBooks(filtered);
  }, [search, books]);
  function handleDeleteClick(parent: string, id: string) {
    setDeleteParent(parent);
    setDeleteid(id);
    onOpen();
  }

  async function handleDeleteConfirm() {
    if (!deleteId || !deleteParent) return;

    setBooks((prev) => {
      const newBooks = new Map(prev);
      newBooks.delete(deleteId);
      return newBooks;
    });
    deleteFile(deleteParent);
    await Db.deleteBook(db, deleteId);
    onClose();
  }

  if (!accessToken) {
    return (
      <Flex
        justify="center"
        align="center"
        width="67%"
        height="100vh"
        margin="auto"
      >
        <Button
          leftIcon={<TbBrandGoogleDrive />}
          onClick={login}
          colorScheme="blue"
          size="lg"
        >
          Connect Google Drive
        </Button>
      </Flex>
    );
  }
  return (
    <>
      <Box
        position="sticky"
        top="44px" // ← below navbar
        zIndex={9}
        px={4}
        py={2}
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        <InputGroup maxW="400px" mx="auto">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            borderRadius="full"
            bg="gray.50"
            border="1px solid"
            borderColor="gray.200"
            _focus={{ borderColor: "gray.400", bg: "white" }}
          />
        </InputGroup>
      </Box>
      <Flex wrap="wrap" p={4} gap={4}>
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
            <Button colorScheme="red" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

/*
  Render reading screen
 */
const ReadingScreen = React.memo(function ReadingScreen({
  id,
  book,
  setBooksContent,
}: {
  id: string;
  book: Book;
  setBooksContent: React.Dispatch<React.SetStateAction<BookContent[]>>;
}) {
  const { db } = useContext(DbContext);
  const popoverRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<SelectedData | null>(null);
  const [bookContent, setBookContent] = useState<BookContent>();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const saveTimeoutRef = useRef<number | null>(null);
  function initDB() {
    if (!db || !id) return;
    console.log("init db");
    let isMounted = true;

    async function fetchBook() {
      const data = await Db.getBook(db!, id);

      if (isMounted) {
        setBookContent(data);
      }
    }
    fetchBook();

    return () => {
      isMounted = false;
    };
  }
  function initNotes() {
    const contentEl = contentRef.current;
    const popover = popoverRef.current;
    if (!contentEl || !bookContent) return;
    console.log("init notes");
    function onMouseUp() {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim() === "" || !contentEl)
        return;

      const text = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      selectionRef.current = {
        startPath: GetNodePath(range.startContainer, contentEl),
        startOffset: range.startOffset,
        endPath: GetNodePath(range.endContainer, contentEl),
        endOffset: range.endOffset,
        text,
        color: "yello",
        note: "",
      };

      if (popover) {
        popover.style.display = "block";
        popover.style.position = "fixed";
        const popoverHeight = popover.offsetHeight;
        const popoverWidth = popover.offsetWidth;
        const top =
          rect.top >= popoverHeight + 8
            ? rect.top - popoverHeight - 8
            : rect.bottom + 8;
        popover.style.top = `${top}px`;
        popover.style.left = `${rect.left + rect.width / 2 - popoverWidth / 2}px`;
      }
    }
    function onClose(e: MouseEvent) {
      if (popover && !popover.contains(e.target as Node)) {
        popover.style.display = "none";
      }
    }
    contentEl.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousedown", onClose);

    ApplyNotes();
    return () => {
      contentEl.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousedown", onClose);
    };
  }
  useEffect(() => {
    initDB();
  }, [db, id]);

  useEffect(() => {
    return initNotes();
  }, [bookContent, contentRef]);

  const renderedContent = useMemo(() => {
    if (!bookContent) return null;

    return FilterContent(book.refs, bookContent);
  }, [book.refs, bookContent]);

  /* notes config */
  function ResolveNodePath(path: number[], root: Node): Node {
    let current: Node = root;
    for (const i of path) {
      const currentNode = current.childNodes[i];

      if (currentNode) {
        current = currentNode;
      } else {
        break;
      }
    }
    return current;
  }
  function ApplyNotes(contentEl: HTMLDivElement = contentRef.current!) {
    const notes = bookContent?.metadata.metadataBody.notes;
    if (!notes || notes.length === 0) return;

    notes.forEach((note) => {
      try {
        const range = document.createRange();
        range.setStart(
          ResolveNodePath(note.startPath, contentEl!),
          note.startOffset,
        );
        range.setEnd(ResolveNodePath(note.endPath, contentEl!), note.endOffset);
        const span = document.createElement("span");
        span.style.backgroundColor = note.color;
        span.title = note.note;
        span.style.cursor = "pointer";
        span.dataset.note = note.note; // store note text

        span.addEventListener("click", (e) => {
          e.stopPropagation();

          // remove existing tooltip if any
          document.getElementById("note-tooltip")?.remove();

          if (!note.note) return; // no tooltip if note is empty

          const tooltip = document.createElement("div");
          tooltip.id = "note-tooltip";
          tooltip.textContent = note.note;
          tooltip.style.cssText = `
            position: fixed;
            background: white;
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 13px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 9999;
            max-width: 200px;
            pointer-events: none;
            top: ${e.clientY - 40}px;
            left: ${e.clientX}px;
    `;

          document.body.appendChild(tooltip);

          document.addEventListener("click", () => {
            document.getElementById("note-tooltip")?.remove();
          });
        });

        try {
          range.surroundContents(span);
        } catch {
          span.appendChild(range.extractContents());
          range.insertNode(span);
        }
      } catch (e) {
        console.warn("Failed to apply highlight:", e);
      }
    });
  }
  async function AddNote(note: string, color: string) {
    if (!selectionRef.current || !bookContent) return;

    const selection = selectionRef.current;

    let notes = bookContent.metadata.metadataBody.notes;
    selection.note = note;
    selection.color = color;
    if (!notes) {
      notes = [];
    }
    notes.push(selection);
    popoverRef.current!.style.display = "none";
    await Db.updateBook(db!, bookContent);
    setBooksContent((prev) =>
      prev.map((b) => (b.id === bookContent.id ? bookContent : b)),
    );
    ApplyNotes();
  }

  /* progress */

  function handleScroll() {
    const container = contentRef.current;
    if (!container) return;

    const progress =
      (container.scrollTop /
        (container.scrollHeight - container.clientHeight)) *
      100;

    progressRef.current = progress;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      localStorage.setItem(
        `book-progress-${id}`,
        progressRef.current.toString(),
      );
    }, 500);
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  return (
    <>
      <div ref={popoverRef} style={{ display: "none" }}>
        <Popover onSave={AddNote} />
      </div>
      <div
        id="reader"
        ref={contentRef}
        onScroll={handleScroll}
        style={{
          height: "100vh",
          overflowY: "auto",
        }}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(renderedContent!, {
            ALLOW_UNKNOWN_PROTOCOLS: true,
          }),
        }}
      />
    </>
  );
});

function Notes({
  booksContent,
  books,
  setBooksContent,
  db,
}: {
  booksContent: Record<string, BookContent>;
  books: Map<string, Book>;
  setBooksContent: React.Dispatch<React.SetStateAction<BookContent[]>>;
  db: IDBDatabase;
}) {
  const [noteText, setNoteText] = useState("");
  const [expandedBooks, setExpandedBooks] = useState(new Set());

  async function handleSave(bookContent: BookContent, index: number) {
    if (noteText && bookContent.metadata.metadataBody.notes[index]) {
      bookContent.metadata.metadataBody.notes[index].note = noteText;
      await Db.updateBook(db!, bookContent);
      setBooksContent((prev) =>
        prev.map((b) => (b.id === bookContent.id ? bookContent : b)),
      );
    }
  }

  const toggleBook = (bookId: number | string) => {
    setExpandedBooks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      return newSet;
    });
  };

  async function handleDelete(bookContent: BookContent, index: number) {
    const note = bookContent.metadata.metadataBody.notes[index];
    if (!note) return;
    bookContent.metadata.metadataBody.notes.splice(index, 1);
    await Db.updateBook(db!, bookContent);
    setBooksContent((prev) =>
      prev.map((b) => (b.id === bookContent.id ? bookContent : b)),
    );
  }

  return (
    <Box p={6}>
      {Array.from(books.entries()).map(([bookId, book]) => {
        const bookContent = booksContent[bookId];
        const metadataBody = bookContent?.metadata?.metadataBody ?? [];

        return (
          <Box key={bookId} mb={8}>
            <Flex
              align="center"
              justify="space-between"
              mb={3}
              p={3}
              bg="gray.50"
              borderRadius="md"
              cursor="pointer"
              onClick={() => toggleBook(bookId)}
              _hover={{ bg: "gray.100" }}
            >
              <Text fontStyle="italic" fontWeight={600}>
                {book.title}
              </Text>
              <Flex align="center" gap={2}>
                <Text fontSize="xs" color="gray.500">
                  {metadataBody.notes.length} notes{" "}
                  {/* ✅ was booksContent.metadata.notes.length */}
                </Text>
                {expandedBooks.has(bookId) ? (
                  <ChevronUpIcon boxSize={5} />
                ) : (
                  <ChevronDownIcon boxSize={5} />
                )}
              </Flex>
            </Flex>

            {expandedBooks.has(bookId) && (
              <Box pl={4}>
                {metadataBody.notes.map((note, index) => (
                  <Flex
                    key={index}
                    gap={3}
                    align="start"
                    mb={3}
                    p={3}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                  >
                    <Box
                      w="10px"
                      h="10px"
                      borderRadius="full"
                      bg={note.color}
                      mt={1}
                      flexShrink={0}
                    />
                    <Box flex={1}>
                      <Text
                        fontSize="xs"
                        color="gray.400"
                        mb={1}
                        fontFamily="mono"
                        borderLeft="2px solid"
                        borderColor="gray.200"
                        pl={2}
                      >
                        {note.text}
                      </Text>
                      <Input
                        size="sm"
                        variant="flushed"
                        value={note.note}
                        placeholder="Add a note..."
                        onChange={(e) => {
                          note.note = e.target.value;
                          setNoteText(e.target.value);
                        }}
                      />
                    </Box>
                    <Flex gap={2}>
                      <Button
                        size="xs"
                        colorScheme="green"
                        variant="outline"
                        onClick={() => handleSave(bookContent!, index)}
                      >
                        Save
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => handleDelete(bookContent!, index)}
                      >
                        Delete
                      </Button>
                    </Flex>
                  </Flex>
                ))}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

function FilterContent(refs: { idref: string }[], content: BookContent) {
  const blobs = content.blobs;
  const htmlContent = document.createElement("div");
  for (const ref of refs) {
    const chapter = content.chapters[ref["@_idref"]];
    const observable = ReplaceDummyUrlWithBlob(chapter, blobs);
    observable.subscribe((res) => {
      htmlContent.innerHTML += res;
    });
  }
  return htmlContent.innerHTML;
}
function ReplaceDummyUrlWithBlob(html: string, blobs: Record<string, Blob>) {
  const parser = new DOMParser();

  let htmlDom = parser.parseFromString(html, "application/xhtml+xml");

  // fallback if XHTML parsing failed
  const parserError = htmlDom.querySelector("parsererror");
  if (parserError) {
    htmlDom = parser.parseFromString(html, "text/html");
  }
  // remove svgs
  RemoveSVGs(htmlDom);
  let elementHtml: string;

  if (htmlDom.contentType === "application/xhtml+xml") {
    elementHtml = new XMLSerializer().serializeToString(htmlDom);
  } else {
    elementHtml = htmlDom.documentElement.outerHTML;
  }

  const objectUrls: string[] = [];

  return new Observable<string>((subcriber) => {
    for (const [key, value] of Object.entries(blobs)) {
      const dummyUrl = GenerateDummyImage(key);
      const realUrl = URL.createObjectURL(value);

      objectUrls.push(realUrl);

      elementHtml = elementHtml.replaceAll(dummyUrl, realUrl);
    }
    subcriber.next(elementHtml);
    subcriber.complete();
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      subcriber.unsubscribe();
    };
  });
}

function RemoveSVGs(content: Document) {
  const svgs = content.querySelectorAll("svg");
  svgs.forEach((svg) => svg.remove());
}

function GetNodePath(node: Node, root: Node): number[] {
  const path: number[] = [];
  let current = node;
  while (current !== root) {
    const parent = current.parentNode;
    if (!parent) break;
    path.unshift(Array.from(parent.childNodes).indexOf(current as ChildNode));
    current = parent;
  }
  return path;
}

function Popover({
  onSave,
}: {
  onSave: (note: string, color: string) => void;
}) {
  const [note, setNote] = useState<string>("");
  const [color, setColor] = useState<string>("yellow");

  const colors = ["yellow", "lightgreen", "lightblue", "lightsalmon"];

  return (
    <div
      style={{
        zIndex: 1000,
        padding: "0.75rem 1rem",
        borderRadius: "0.5rem",
        backgroundColor: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        minWidth: "220px",
      }}
    >
      <Input
        placeholder="Add note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        mb={2}
        size="sm"
      />

      <Flex gap={2} mb={2}>
        {colors.map((c) => (
          <Box
            key={c}
            onClick={() => setColor(c)}
            bg={c}
            w="20px"
            h="20px"
            borderRadius="50%"
            cursor="pointer"
            border={color === c ? "2px solid black" : "2px solid transparent"}
          />
        ))}
      </Flex>

      <Button
        size="sm"
        colorScheme="blue"
        w="100%"
        onClick={() => {
          onSave(note, color);
          setNote("");
          setColor("yellow");
        }}
      >
        Save
      </Button>
    </div>
  );
}

async function SyncMetaData(db: IDBDatabase) {
  const booksContent = await Db.getBooks(db);
  const accessToken = localStorage.getItem("gdrive_access_token");
  const metadatas = booksContent.map((x) => ({
    configFileId: x.metadata.metadataId,
    metadataBody: x.metadata.metadataBody,
  }));
  await Promise.all(
    metadatas.map((m) =>
      GDriveService.SyncMetadata(m.configFileId, accessToken!, m.metadataBody),
    ),
  );
}
