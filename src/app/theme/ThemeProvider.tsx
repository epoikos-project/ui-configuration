"use client";

import { useMemo } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  PaletteMode,
} from "@mui/material";

interface Props {
  children: React.ReactNode;
}

export default function MuiThemeProvider({ children }: Props) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? ("dark" as PaletteMode) : ("light" as PaletteMode),
        },
      }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}