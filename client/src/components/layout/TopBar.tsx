import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useCurrentUser } from '../../hooks/useAuth';
import { SearchBar } from '../search/SearchBar';
import { useThemeMode } from '../../context/ThemeModeContext';

const DRAWER_WIDTH = 260;

interface TopBarProps {
  onMenuToggle?: () => void;
  onFolderNavigate: (folder: { id: string; name: string }) => void;
}

export function TopBar({ onMenuToggle, onFolderNavigate }: TopBarProps) {
  const { currentUser, logout } = useCurrentUser();
  const { mode, toggleThemeMode } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { sm: `${DRAWER_WIDTH}px` },
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        <IconButton edge="start" onClick={onMenuToggle} sx={{ mr: 1, display: { sm: 'none' } }}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, mr: 2 }}>
          File Manager
        </Typography>

        <SearchBar onFolderNavigate={onFolderNavigate} />

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={mode === 'light' ? 'Dark Mode' : 'Light Mode'}>
          <IconButton onClick={toggleThemeMode} color="inherit" sx={{ mr: 1 }}>
            {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title={currentUser?.name ?? 'Account'}>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: '0.75rem', fontWeight: 600 }}>
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem disabled sx={{ opacity: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {currentUser?.email}
            </Typography>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              logout();
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
