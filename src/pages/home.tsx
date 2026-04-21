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
} from "@chakra-ui/react";
import { TbBrandGoogleDrive } from "react-icons/tb";
import { IoHomeOutline } from "react-icons/io5";
import "../index.css";
import { useGetGDriveFiles } from "../hooks/GDriveHooks/useGetGDriveFiles";
import { cache, type Book } from "../db/memory_db/memory_db";
import { ReadingContext, ReadingProvider } from "../contexts/reading_context";
import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type SetStateAction,
} from "react";
import DOMPurify from "dompurify";
import { ThemeContext } from "../contexts/theme_context";
import Setting from "./setting";
import type { SelectedData } from "../models/selected_data";
import { GDriveService } from "../services/gdrive_service.service";
import type { Metadata } from "../models/metadata";
import { LuBookOpenText } from "react-icons/lu";
import { GrNotes } from "react-icons/gr";
import { ScreenContext } from "../contexts/screen_context";
import { SignalContext } from "../contexts/signal_context";
import { useGoogleLogin } from "../services/google_login.service";
import useDeleteGDriveFile from "../hooks/GDriveHooks/useDeleteGDriveFile";

export function Manage() {
  return (
    <ReadingProvider>
      <Home />
    </ReadingProvider>
  );
}

function Home() {
  const accessToken = localStorage.getItem("gdrive_access_token");
  const { id } = useContext(ReadingContext);
  const { gdriveFiles } = useGetGDriveFiles(accessToken!);
  const [books, setBooks] = useState<Map<string, Book>>(new Map());

  useEffect(() => {
    if (!gdriveFiles) return;

    setBooks(gdriveFiles);
  }, [gdriveFiles]);
  /* gallery: home, 1: setting, 2: reading */
  const { screen, setScreen } = useContext(ScreenContext);
  const renderScreen = () => {
    switch (screen) {
      case 0:
        return (
          <Gallery
            books={books}
            BookCardComponent={BookCard}
            setBooks={setBooks}
          />
        );
      case 1:
        return <Setting />;
      case 2:
        return <ReadingScreen id={id} books={books} />;
      case 3:
        return <Notes books={books} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <NavBar setScreen={setScreen} />
      {renderScreen()}
    </div>
  );
}

export function NavBar({ setScreen }: { setScreen: (screen: number) => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const accessToken = localStorage.getItem("gdrive_access_token");

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  }

  async function onUploadConfirm() {
    if (!selectedFile || !accessToken) return;
    await GDriveService.UploadBook(
      accessToken,
      selectedFile,
      cache.root_folder_id,
    );
    setSelectedFile(null);
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
          <Button size="xs" colorScheme="blue" onClick={onUploadConfirm}>
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
function BookCard({
  file,
  id,
  onDelete,
}: {
  file: Book;
  id: string;
  onDelete: (id: string) => void;
}) {
  const { setId } = useContext(ReadingContext);
  const { setScreen } = useContext(ScreenContext);
  if (!file) return <div className="book-card"></div>;

  const coverUrl = URL.createObjectURL(file.cover as Blob);
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
          src={coverUrl}
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
            onDelete(file.parents?.[0] as string);
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
}

function Gallery({
  books,
  BookCardComponent,
  setBooks,
}: {
  books: Map<string, Book>;
  BookCardComponent: React.ComponentType<{
    id: string;
    file: Book;
    onDelete: (id: string) => void;
  }>;
  setBooks: React.Dispatch<React.SetStateAction<Map<string, Book>>>;
}) {
  const accessToken = localStorage.getItem("gdrive_access_token");
  const [, setIsLoggedIn] = useState(!!accessToken);
  const { login } = useGoogleLogin(() => {
    setIsLoggedIn(true);
    window.location.reload();
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { deleteFile } = useDeleteGDriveFile(accessToken!);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
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

  function handleDeleteClick(id: string) {
    setDeleteId(id);
    onOpen();
  }

  function handleDeleteConfirm() {
    if (!deleteId) return;

    setBooks(
      (prev) =>
        new Map(Array.from(prev.entries()).filter(([id]) => id !== deleteId)),
    );

    deleteFile(deleteId); // your API call
    onClose();
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
        {Array.from(books.entries()).map(([id, file]) => (
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
function ReadingScreen({
  id,
  books,
}: {
  id: string | number | null;
  books: Map<string, Book>;
}) {
  const book = books.get(id as string) as Book;
  const { theme } = useContext(ThemeContext);
  const contentRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<SelectedData | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [note, setNote] = useState<string>("");
  const [color, setColor] = useState<string>("yellow");
  let accessToken = localStorage.getItem("gdrive_access_token");
  const ctx = useContext(SignalContext);
  if (!ctx) throw new Error("SignalContext not found");
  const { trigger } = ctx;
  if (!book) return <div style={{ textAlign: "center" }}>Loading....</div>;
  function getNodePath(node: Node, root: Node): number[] {
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

  function resolveNodePath(path: number[], root: Node): Node {
    let current: Node = root;
    for (const i of path) {
      current = current.childNodes[i];
    }
    return current;
  }

  function applyNotes(contentEl: HTMLDivElement = contentRef.current!) {
    const notes = book.notes;
    if (!notes || notes.data.length === 0) return;

    notes.data.forEach((note) => {
      try {
        const range = document.createRange();
        range.setStart(
          resolveNodePath(note.startPath, contentEl!),
          note.startOffset,
        );
        range.setEnd(resolveNodePath(note.endPath, contentEl!), note.endOffset);

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

  useEffect(() => {
    const contentEl = contentRef.current;
    const popover = popoverRef.current;
    if (!contentEl) return;

    function onMouseUp() {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim() === "" || !contentEl)
        return;

      const text = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      selectionRef.current = {
        startPath: getNodePath(range.startContainer, contentEl),
        startOffset: range.startOffset,
        endPath: getNodePath(range.endContainer, contentEl!),
        endOffset: range.endOffset,
        text,
        color,
        note,
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
        setNote("");
        setColor("yellow");
        selectionRef.current = null;
      }
    }

    contentEl.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousedown", onClose);
    applyNotes();

    return () => {
      contentEl.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousedown", onClose);
    };
  }, [id]);

  const renderedContent = useMemo(() => {
    if (!book.content) return null;
    return Array.from(book.content)
      .map(([key, value]) => {
        if (value.startsWith("blob:")) return null;

        const bodyMatch = value.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1].trim() : value.trim();

        if (!bodyContent || bodyContent.replace(/<[^>]*>/g, "").trim() === "")
          return null;
        return (
          <div key={key} data-key={key} id={key}>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(bodyContent, {
                  ALLOWED_URI_REGEXP:
                    /^(?:(?:blob|https?|ftp|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
                }),
              }}
            />
          </div>
        );
      })
      .filter(Boolean);
  }, [book.content]); // ← depend on content not id

  function addNote() {
    if (!selectionRef.current || !popoverRef.current) return;
    const selection = selectionRef.current;
    selection.note = note;
    selection.color = color;

    const highlightSpan = document.createElement("span");
    highlightSpan.style.backgroundColor = color;
    book.notes.data.push(selection);
    popoverRef.current.style.display = "none";
    selectionRef.current = null;
    applyNotes();
    setColor("yellow");
    setNote("");
    trigger();
  }

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const syncTimer = setInterval(
      async () => {
        await GDriveService.SyncMetadata(
          book.notes.noteId,
          accessToken as string,
          {
            lastRead: new Date(),
            progress: 0,
            notes: book.notes.data,
          } as Metadata,
        )
          .then(() => console.log("Sync successful!"))
          .catch((err) => console.error("Sync failed: ", err));
      },
      3 * 60 * 1000,
    ); // 10 minutes

    return () => clearInterval(syncTimer);
  }, [id, book.notes]);
  return (
    <>
      <div
        ref={popoverRef}
        style={{
          display: "none",
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
          {["yellow", "lightgreen", "lightblue", "lightsalmon"].map((c) => (
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

        <Button size="sm" colorScheme="blue" w="100%" onClick={addNote}>
          Save
        </Button>
      </div>
      <div
        id="reader"
        style={
          {
            "--txt-color": theme?.txtColor,
            "--bg-color": theme?.bgColor,
            "--txt-align": theme?.txtAlign,
            "--margin-top": `${theme?.margin.top}px`,
            "--margin-right": `${theme?.margin.right}px`,
            "--margin-bottom": `${theme?.margin.bottom}px`,
            "--margin-left": `${theme?.margin.left}px`,
            "--padding-top": `${theme?.padding.top}px`,
            "--padding-right": `${theme?.padding.right}px`,
            "--padding-bottom": `${theme?.padding.bottom}px`,
            "--padding-left": `${theme?.padding.left}px`,
            "--font": theme?.font,
            "--font-size": `${theme?.fontSize}px`,
          } as React.CSSProperties
        }
      >
        <div id="content" ref={contentRef}>
          {book?.content && renderedContent}
        </div>
      </div>
    </>
  );
}

function Notes({ books }: { books: Map<string, Book> }) {
  const [noteText, setNoteText] = useState("");
  const [expandedBooks, setExpandedBooks] = useState(new Set());
  function handleSave(book: Book, index: number) {
    if (noteText && book.notes?.data?.[index]) {
      book.notes.data[index].note = noteText;
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
  function handleDelete(book: Book, index: number) {
    const note = book.notes?.data[index];
    if (!note) return;
    book.notes?.data.splice(index, 1);
  }

  return (
    <Box p={6}>
      {Array.from(books.entries()).map(([bookId, book]) => (
        <Box key={bookId} mb={8}>
          {/* Book header with dropdown toggle */}
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
                      onClick={() => handleSave(book, index)}
                    >
                      Save
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="red"
                      variant="outline"
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
  );
}
