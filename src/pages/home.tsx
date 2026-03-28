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
import "../index.css";
import { useGetGDriveFiles } from "../hooks/GDriveHooks/GetGDriveFilesHook";
import { MemoBooks, type Book } from "../db/memory_db/memory_db";
import { GoogleLogin } from "../services/google_login.service";
import { useMemoBooks } from "../hooks/useMemoBooks";
import { ReadingContext, ReadingProvider } from "../contexts/reading_context";
import { useContext } from "react";
import DOMPurify from "dompurify";
export default function Manage() {
  return (
    <ReadingProvider>
      <Home />
    </ReadingProvider>
  );
}
function Home() {
  const { id, setId } = useContext(ReadingContext);
  return (
    <>
      {id ? (
        <ReadingScreen id={id} setId={setId} />
      ) : (
        <>
          <NavBar />
          <Gallery />
        </>
      )}
    </>
  );
}
function NavBar() {
  return (
    <Flex color="white" bg="gray.600" h="30px" alignItems="center">
      <div></div>
      <Square ml="auto" size="30px">
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
  console.log(memoBooks.books);
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

function ReadingScreen({
  id,
  setId,
}: {
  id: string | number | null;
  setId: (id: string | number | null) => void;
}) {
  console.log("im was here");
  const book = MemoBooks.books.get(id as string);
  console.log(book);
  return (
    <>
      <button onClick={() => setId(null)}>back</button> Reading {id}
      Reading {id}
      <div>
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
