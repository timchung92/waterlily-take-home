
import { useEffect, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import "./App.css";

const theme = createTheme({});

function App():JSX.Element {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverMessage, setServerMessage] = useState("");

  useEffect(() => {
    async function fetchFromServer():Promise<void> {
      // Add dispatch
      //try {
      //  setLoading(true);
      //  const response: Response = await fetch("/api/clients");
      //  const body: Body  = await response.json();
      //  setServerMessage(body.message);
      //} catch (error: any) {
      //  setError(error.message);
      //} finally {
      //  setLoading(false);
      //}
    }

    fetchFromServer();
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <h1>Waterlilly LTC Planning goes here</h1>
      </header>
      <ThemeProvider theme={theme}>
        <h2>
          {loading
            ? "Loading..."
            : error
            ? `Error: ${error}`
            : serverMessage
            ? serverMessage
            : "Waiting to make server call"}
        </h2>
      </ThemeProvider>
    </div>
  );
}

export default App;
