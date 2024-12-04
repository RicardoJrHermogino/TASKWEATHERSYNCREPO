import React, { useState } from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, Button, Box, styled } from "@mui/material";
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ThunderstormRoundedIcon from '@mui/icons-material/ThunderstormRounded';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/router';
import CheckTaskFeasibilityPage from '../checktask';

const StyledLink = styled(Link)`
  && {
    color: inherit;
    text-decoration: none;
  }
`;

const StickyAppBar = styled(AppBar)`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 70px;
  z-index: 1000;
  background-color: #f0f4ff; /* Set background color */
  border-radius: 40px;
`;

const FloatingButton = styled(Button)`
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #48ccb4;
  border-radius: 50%;
  width: 56px;
  height: 63px;
  z-index: 1001;

  &:hover {
    background-color: #303456;
  }
`;

const ActiveButton = styled(Button)`
  color: #48ccb4; /* Change the icon color to #48ccb4 for active state */
  display: flex; /* Center the icon */
  align-items: center; /* Center the icon vertically */
  justify-content: center; /* Center the icon horizontally */
  width: 64px; /* Set the width */
  height: 64px; /* Set the height */
  border-radius: 50%; /* Make it circular */

  &:hover {
    background-color: transparent; /* Remove any background color on hover */
  }

  & svg {
    color: #48ccb4; /* Icon color for active state */
  }
`;

const InactiveButton = styled(Button)`
  color: black;
  display: flex; /* Center the icon */
  align-items: center; /* Center the icon vertically */
  justify-content: center; /* Center the icon horizontally */
  width: 64px; /* Set the width */
  height: 64px; /* Set the height */
  border-radius: 50%; /* Make it circular */

  &:hover {
    background-color: #f0f4ff; /* Slight background color on hover */
  }

  & svg {
    color: inherit; /* Default icon color */
  }
`;

export default function Navbar() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false); // State for modal

  return (
    <>
      <Box sx={{ flexGrow: 1 }} />
      <StickyAppBar position="static">
        <Toolbar>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }} px={0}>
            {/* Align Home button to the left */}
            <StyledLink href="/dashboard" passHref>
              {router.pathname === '/dashboard' ? (
                <ActiveButton sx={{ mx: 1, ml: 1 }}> {/* Adjusted margins for Home button */}
                  <HomeRoundedIcon fontSize="large" />
                </ActiveButton>
              ) : (
                <InactiveButton sx={{ mx: 1, ml: 1 }}> {/* Adjusted margins for Home button */}
                  <HomeRoundedIcon fontSize="medium" />
                </InactiveButton>
              )}
            </StyledLink>

            {/* Align Weather button to the right */}
            <StyledLink href="/forecast" passHref>
              {router.pathname === '/forecast' ? (
                <ActiveButton sx={{ mx: 1 }}> {/* Adjusted margins for Weather button */}
                  <ThunderstormRoundedIcon fontSize="large" />
                </ActiveButton>
              ) : (
                <InactiveButton sx={{ mx: 1 }}> {/* Adjusted margins for Weather button */}
                  <ThunderstormRoundedIcon fontSize="medium" />
                </InactiveButton>
              )}
            </StyledLink>
          </Box>

          <StyledLink href="#" passHref>
            <FloatingButton onClick={() => setModalOpen(true)}>
              <AddIcon fontSize="large" sx={{ color: 'white' }} />
            </FloatingButton>
          </StyledLink>
        </Toolbar>
      </StickyAppBar>

      {/* Modal Component */}
      <CheckTaskFeasibilityPage open={modalOpen} handleClose={() => setModalOpen(false)} />
    </>
  );
}
