import { Flex, Square } from "@chakra-ui/icons";
import { GoGear } from "react-icons/go";
import {
  MdOutlineDriveFolderUpload,
  MdOutlineFileUpload,
} from "react-icons/md";
import { FaUpload } from "react-icons/fa";
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
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Input,
  Select,
  Icon,
} from "@chakra-ui/react";
import { TbBrandGoogleDrive } from "react-icons/tb";
import { IoHomeOutline } from "react-icons/io5";
import "../index.css";
import { useGetGDriveFiles } from "../hooks/GDriveHooks/GetGDriveFilesHook";
import { MemoBooks, type Book } from "../db/memory_db/memory_db";
import { GoogleLogin } from "../services/google_login.service";
import { useMemoBooks } from "../hooks/useMemoBooks";
import { ReadingContext, ReadingProvider } from "../contexts/reading_context";
import { useContext, useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { ThemeContext } from "../contexts/theme_context";
import Setting from "./setting";
import type { SelectedData } from "../models/selected_data";

export function Manage() {
  return (
    <ReadingProvider>
      <Home />
    </ReadingProvider>
  );
}

function Home() {
  const { id } = useContext(ReadingContext);
  /* gallery: home, 1: setting */
  const [screen, setScreen] = useState<number>(0);

  return (
    <>
      <NavBar setScreen={setScreen} />

      {id ? (
        <ReadingScreen id={id} />
      ) : (
        <>{screen === 0 ? <Gallery /> : <Setting />}</>
      )}
    </>
  );
}
export function NavBar({
  setScreen,
}: {
  setScreen: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { setId } = useContext(ReadingContext);

  return (
    <Flex color="white" bg="gray.600" h="30px" alignItems="center" p={2}>
      <Square ml="auto" size="30px" style={{ float: "left" }}>
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
            onClick={() => {
              setId(null);
              setScreen(0);
            }}
          ></MenuButton>
        </Menu>
      </Square>
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
      <Square size="30px">
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
          onClick={() => setScreen(1)}
        />
      </Square>
    </Flex>
  );
}
function BookCard({ file, id }: { file: Book; id: string }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setId } = useContext(ReadingContext);

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
      onClick={() => setId(id)}
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
  let accessToken = localStorage.getItem("gdrive_access_token");
  const memoBooks = useMemoBooks();
  if (!accessToken) return <></>;
  useGetGDriveFiles(accessToken);

  if (!memoBooks.books)
    return <div style={{ textAlign: "center" }}>Loading....</div>;
  else if (memoBooks.books.size === 0)
    return (
      <div style={{ textAlign: "center", width: "100%", margin: "auto" }}>
        <Icon as={FaUpload} />
      </div>
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
  const book = MemoBooks.books.get(id as string);
  const { theme } = useContext(ThemeContext);
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedData, setSelectedData] = useState<SelectedData | null>(null);
  const [note, setNote] = useState<string>("");
  const [color, setColor] = useState<string>("yellow");
  if (!book) return <div style={{ textAlign: "center" }}>Loading....</div>;

  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;
    function onMouseUp() {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim() === "") return;

      const text = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedData({
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset,
        range,
        text,
        note,
        color,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }
    contentEl.addEventListener("mouseup", onMouseUp);
    return () => {
      contentEl.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  function applyHighlight() {
    if (!selectedData) return;

    cookieStore.set("highlight", JSON.stringify(selectedData));
    const highlight = document.createElement("mark");
    highlight.style.backgroundColor = color;
    highlight.title = note;

    setSelectedData(null);
    setNote("");
  }
  return (
    <>
      <Popover
        isOpen={!!selectedData}
        onClose={() => setSelectedData(null)}
        placement="top"
      >
        <PopoverTrigger>
          <Box
            position="fixed"
            w="1px"
            h="1px"
            top={selectedData?.y}
            left={selectedData?.x}
          />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton onClick={() => setSelectedData(null)} />
          <PopoverHeader>Confirmation!</PopoverHeader>
          <PopoverBody>
            <Input
              placeholder="Add note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              mb={2}
            />

            <Flex gap={2}>
              <Box
                as="button"
                onClick={() => setColor("yellow")}
                bg="yellow"
                w="20px"
                h="20px"
                borderRadius="50%"
                border={color === "yellow" ? "2px solid black" : "none"}
                cursor="pointer"
              />
              <Box
                as="button"
                onClick={() => setColor("lightgreen")}
                bg="lightgreen"
                w="20px"
                h="20px"
                borderRadius="50%"
                border={color === "lightgreen" ? "2px solid black" : "none"}
                cursor="pointer"
              />
              <Box
                as="button"
                onClick={() => setColor("lightblue")}
                bg="lightblue"
                w="20px"
                h="20px"
                borderRadius="50%"
                border={color === "lightblue" ? "2px solid black" : "none"}
                cursor="pointer"
              />
            </Flex>

            <Button mt={2} size="sm" onClick={applyHighlight}>
              Save
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
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
          {book?.content &&
            Array.from(book.content).map(([key, value]) => (
              <div key={key}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(value),
                  }}
                ></div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
