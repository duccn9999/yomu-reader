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
  Fade,
  ScaleFade,
  Slide,
  SlideFade,
  Collapse,
  useDisclosure,
  Box,
} from "@chakra-ui/react";
import { TbBrandGoogleDrive } from "react-icons/tb";
import "../index.css";
import { LoginWithGoogle } from "../services/LoginWithGoogle.service";
import { useGetGDriveFiles } from "../hooks/GDriveHooks/GetGDriveFilesHook";
import { GDriveFile } from "../models/GDriveFile";
import useGetFileData from "../hooks/EpubFiles/GetFileData";
export default function Home() {
  return (
    <>
      <NavBar />
      <Gallery />
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
              onClick={LoginWithGoogle}
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
function BookCard({ id }: { id: string }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [file, cover] = useGetFileData(
    "1naglNpRJE_xCYyFMjHHFgVPMc2RLUfU6",
    localStorage.getItem("gdrive_access_token")!,
  );
  if (!file) return <div className="book-card"></div>;
  const coverUrl = URL.createObjectURL(cover as Blob);
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
          <Text>{file.package.metadata.title}</Text>
        </Box>
      </SlideFade>
    </Card>
  );
}

function Gallery() {
  let accessToken = localStorage.getItem("gdrive_access_token");
  if (!accessToken) return <></>;
  const files = useGetGDriveFiles(accessToken);
  // duplicate x10 of files for testing
  const duplicatedFiles = files ? [...files, ...files, ...files] : [];
  if (duplicatedFiles.length === 0)
    return <div style={{ textAlign: "center" }}>Loading....</div>;
  return (
    <div id="gallery">
      <Flex alignItems="center" mb="20px" p="16px">
        {duplicatedFiles.map((file: GDriveFile, index: number) => (
          <BookCard key={index} id={file.id} />
        ))}
      </Flex>
    </div>
  );
}

function ReadingScreen() {}
