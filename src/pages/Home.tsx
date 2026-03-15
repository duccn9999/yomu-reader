import { Flex, Square } from "@chakra-ui/icons";
import { GoGear } from "react-icons/go";
import {
  MdOutlineDriveFolderUpload,
  MdOutlineFileUpload,
} from "react-icons/md";
import { IconButton } from "@chakra-ui/react";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { TbBrandGoogleDrive } from "react-icons/tb";
import "../index.css";
import { LoginWithGoogle } from "../services/LoginWithGoogle.service";
import { useGetGDriveFiles } from "../hooks/GDriveHooks/GetGDriveFilesHook";
import { GDriveFile } from "../models/GDriveFile";
import useGetGDriveFileContent from "../hooks/GDriveHooks/GetGriveFileContent";
import { EpubFile } from "../models/EpubFile";
import { Unzip } from "../services/epub_service.service";
import { useEffect, useState } from "react";
import type { UnzipStructure } from "../models/UnzipStructure";
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
  const [epubFile, setEpubFile] = useState<UnzipStructure | null>(null);
  const fileContent = useGetGDriveFileContent(
    "1naglNpRJE_xCYyFMjHHFgVPMc2RLUfU6",
    localStorage.getItem("gdrive_access_token")!,
  );
  if (fileContent) {
    Unzip(fileContent!).then((res) => {
      setEpubFile(res);
    });
  }
  return <div className="book-card">BookCard</div>;
}
function Gallery() {
  let accessToken = localStorage.getItem("gdrive_access_token");
  if (!accessToken) return <></>;
  const files = useGetGDriveFiles(accessToken);
  return (
    <div id="gallery">
      {files?.map((file: GDriveFile, index: number) => (
        <BookCard key={index} id={file.id} />
      ))}
    </div>
  );
}
