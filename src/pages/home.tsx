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
import { useEffect } from "react";
export default function Home() {
  return <NavBar />;
}

function NavBar() {
  function LoginWithGoogle() {
    const width = 500;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const clientId = import.meta.env.VITE_CLIENT_ID;
    const redirectUri = "http://localhost:5173/oauth2/callback";
    const scope = "https://www.googleapis.com/auth/drive.file";
    const authUrl = `${googleAuthUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;

    window.open(
      authUrl,
      "googleOAuth",
      `width=${width},height=${height},top=${top},left=${left}`,
    ); // Redirect to Google OAuth
  }
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
function Gallery() {
  useEffect(() => {
    // Fetch images from the backend API
    fetch("http://localhost:3000/api/images")
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Log the fetched data to the console
        // You can set the fetched data to state here if needed
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
      });
  }, []);
}
