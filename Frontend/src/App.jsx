import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("http://localhost:3000/")
      .then((response) => response.json())
      .then((data) => console.log("Resposta do backend:", data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return <div>Teste</div>;
}

export default App;
