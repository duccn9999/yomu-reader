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
} from "@chakra-ui/react";
import { TbBrandGoogleDrive } from "react-icons/tb";
import { IoHomeOutline } from "react-icons/io5";
import "../index.css";
import { useGetGDriveFiles } from "../hooks/GDriveHooks/GetGDriveFilesHook";
import { MemoBooks, type Book } from "../db/memory_db/memory_db";
import { GoogleLogin } from "../services/google_login.service";
import { useMemoBooks } from "../hooks/useMemoBooks";
import { ReadingContext, ReadingProvider } from "../contexts/reading_context";
import { useContext, useState } from "react";
import DOMPurify from "dompurify";
import { ThemeContext } from "../contexts/theme_context";
import Setting from "./setting";

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
      <div></div>
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
          onClick={() => {
            setScreen(1);
          }}
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

  if (memoBooks.books.size === 0)
    return <div style={{ textAlign: "center" }}>Loading....</div>;
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
  if (!book) return <div style={{ textAlign: "center" }}>Loading....</div>;
  return (
    <>
      <div
        id="reader"
        style={
          {
            "--txt-color": theme?.txtColor,
            "--bg-color": theme?.bgColor,
            "--txt-align": theme?.txtAlign,
            "--margin": theme?.margin,
            "--padding": theme?.padding,
            "--font": theme?.font,
            "--font-size": theme?.fontSize,
          } as React.CSSProperties
        }
      >
        {book?.content &&
          Array.from(book.content).map(([key, value]) => (
            <div key={key}>
              <strong>{key}:</strong>
              <div
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }}
              ></div>
            </div>
          ))}
      </div>
    </>
  );
}
