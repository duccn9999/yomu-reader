import { Flex, Square } from "@chakra-ui/icons";
import { GoGear } from "react-icons/go";
import {
  MdOutlineDriveFolderUpload,
  MdOutlineFileUpload,
} from "react-icons/md";
import {
  IconButton,
  Card,
  CardBody,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  SlideFade,
  useDisclosure,
  Box,
  Button,
  Input,
  Icon,
  Spacer,
} from "@chakra-ui/react";
import { TbBrandGoogleDrive } from "react-icons/tb";
import { IoHomeOutline } from "react-icons/io5";
import "../index.css";
import { useGetGDriveFiles } from "../hooks/GDriveHooks/GetGDriveFilesHook";
import { cache, MemoBooks, type Book } from "../db/memory_db/memory_db";
import { GoogleLogin } from "../services/google_login.service";
import { useMemoBooks } from "../hooks/useMemoBooks";
import { ReadingContext, ReadingProvider } from "../contexts/reading_context";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { ThemeContext } from "../contexts/theme_context";
import Setting from "./setting";
import type { SelectedData } from "../models/selected_data";
import { GDriveService } from "../services/gdrive_service.service";
import type { Metadata } from "../models/metadata";
import { LuBookOpenText } from "react-icons/lu";
import { GrNotes } from "react-icons/gr";
import { ScreenContext } from "../contexts/screen_context";
export function Manage() {
  return (
    <ReadingProvider>
      <Home />
    </ReadingProvider>
  );
}

function Home() {
  const { id } = useContext(ReadingContext);
  /* gallery: home, 1: setting, 2: reading */
  const { screen, setScreen } = useContext(ScreenContext);
  const renderScreen = () => {
    switch (screen) {
      case 0:
        return <Gallery />;
      case 1:
        return <Setting />;
      case 2:
        return <ReadingScreen id={id} />;
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
  return (
    <Flex
      color="white"
      bg="gray.600"
      h="30px"
      alignItems="center"
      p={2}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Square
        ml="auto"
        size="30px"
        style={{ float: "left" }}
        onClick={() => {
          setScreen(0);
        }}
      >
        <Menu>
          <MenuButton
            as={IconButton}
            _hover={{
              bg: "gray.500",
              color: "white",
            }}
            icon={<IoHomeOutline />}
            size="sm"
            w="100%"
            h="100%"
            colorScheme="grey.600"
          ></MenuButton>
        </Menu>
      </Square>
      <Spacer />

      <Square
        ml="auto"
        size="30px"
        style={{ float: "left" }}
        onClick={() => setScreen(2)}
      >
        <Menu>
          <MenuButton
            as={IconButton}
            _hover={{
              bg: "gray.500",
              color: "white",
            }}
            icon={<LuBookOpenText />}
            size="sm"
            w="100%"
            h="100%"
            colorScheme="grey.600"
          ></MenuButton>
        </Menu>
      </Square>
      <Spacer />

      <Square size="30px">
        <Menu>
          <MenuButton
            as={IconButton}
            _hover={{
              bg: "gray.500",
              color: "white",
            }}
            icon={<MdOutlineDriveFolderUpload />}
            size="sm"
            w="100%"
            h="100%"
            colorScheme="grey.600"
          ></MenuButton>
          <MenuList bg="gray.600" color="white" w="75px">
            <MenuItem
              icon={<TbBrandGoogleDrive />}
              _hover={{ bg: "gray.500" }}
              bg="gray.600"
              color="gray.200"
              onClick={GoogleLogin}
            >
              Google Drive
            </MenuItem>
            <MenuItem
              icon={<MdOutlineFileUpload />}
              _hover={{ bg: "gray.500" }}
              bg="gray.600"
              color="gray.200"
            >
              Upload from devices
            </MenuItem>
          </MenuList>
        </Menu>
      </Square>
      <Square size="30px" onClick={() => setScreen(1)}>
        <IconButton
          variant="solid"
          aria-label="setting"
          colorScheme="gray.400"
          icon={<GoGear />}
          size="sm"
          _hover={{
            bg: "gray.500",
            color: "white",
          }}
          w="100%"
          h="100%"
        />
      </Square>
      <Square size="30px">
        <IconButton
          variant="solid"
          aria-label="setting"
          colorScheme="gray.400"
          icon={<GrNotes />}
          size="sm"
          _hover={{
            bg: "gray.500",
            color: "white",
          }}
          w="100%"
          h="100%"
        />
      </Square>
    </Flex>
  );
}
function BookCard({ file, id }: { file: Book; id: string }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setId } = useContext(ReadingContext);
  const { setScreen } = useContext(ScreenContext);
  if (!file) return <div className="book-card"></div>;

  const coverUrl = URL.createObjectURL(file.cover as Blob);

  return (
    <Card
      className="book-card"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      width="150px"
      minW="120px"
      height="200px"
      position="relative"
      style={{ cursor: "pointer" }}
      m={8}
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
          height="100%"
          borderRadius="sm"
        />
      </CardBody>
      <SlideFade in={isOpen} offsetY="20px">
        <Box
          position="absolute"
          bottom="0"
          left="0"
          width="100%"
          bg="rgba(143, 141, 141, 0.8)"
          color="white"
          p={2}
          borderBottomRadius="sm"
        >
          <Text>{file.title}</Text>
        </Box>
      </SlideFade>
    </Card>
  );
}

function Gallery() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  let accessToken = localStorage.getItem("gdrive_access_token");
  const memoBooks = useMemoBooks();
  if (!accessToken) return <></>;
  useGetGDriveFiles(accessToken);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  }

  async function onUploadConfirm() {
    if (!selectedFile) return;
    await UploadBook(selectedFile);
    setSelectedFile(null);
  }

  async function UploadBook(file: File) {
    await GDriveService.UploadBook(
      accessToken as string,
      file,
      cache.root_folder_id,
    );
  }

  if (!memoBooks.books)
    return <div style={{ textAlign: "center" }}>Loading....</div>;
  else if (memoBooks.books.size === 0)
    return (
      <Flex
        justify="center"
        align="center"
        width="67%"
        height="100vh"
        margin="auto"
      >
        <label htmlFor="file-input">
          <Icon as={MdOutlineFileUpload} boxSize={20} mr={2} cursor="pointer" />
        </label>
        <Input
          type="file"
          accept=".epub"
          display="none"
          id="file-input"
          onChange={onFileChange}
        />
        {selectedFile && (
          <Box mt={4} textAlign="center">
            <Text mb={2}>{selectedFile.name}</Text>
            <Button onClick={onUploadConfirm} mr={2}>
              Upload
            </Button>
            <Button variant="ghost" onClick={() => setSelectedFile(null)}>
              Cancel
            </Button>
          </Box>
        )}
      </Flex>
    );
  return (
    <div id="gallery">
      <Flex alignItems="center" mb="20px" p="16px">
        {Array.from(memoBooks.books.entries()).map(([key, file]) => (
          <BookCard key={key} file={file} id={key} />
        ))}
      </Flex>
    </div>
  );
}

function ReadingScreen({ id }: { id: string | number | null }) {
  const book = MemoBooks.books.get(id as string) as Book;
  const { theme } = useContext(ThemeContext);
  const contentRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<SelectedData | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [note, setNote] = useState<string>("");
  const [color, setColor] = useState<string>("yellow");
  let accessToken = localStorage.getItem("gdrive_access_token");

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
      if (!selection || selection.toString().trim() === "") return;

      const text = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      selectionRef.current = {
        startPath: getNodePath(range.startContainer, contentEl),
        startOffset: range.startOffset,
        endPath: getNodePath(range.endContainer, contentEl!),
        endOffset: range.endOffset,
        text,
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
    return Array.from(book.content).map(([key, value]) => (
      <div key={key} data-key={key} id={key}>
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }} />
      </div>
    ));
  }, [id, book.content]);

  function addNote() {
    if (!selectionRef.current || !popoverRef.current) return;
    applyNotes();
    const selection = selectionRef.current;
    selection.note = note;
    selection.color = color;

    const highlightSpan = document.createElement("span");
    highlightSpan.style.backgroundColor = color;
    book.notes.data.push(selection);
    popoverRef.current.style.display = "none";
    selectionRef.current = null;
    setColor("yellow");
    setNote("");
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
