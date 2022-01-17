import Router from "@components/Router";
import axios from "@config/axios";
import { useState } from "react";

function App() {
  const [randomServerNumber, setRandomServerNumber] = useState(null);

  const sendRequest = async () => {
    let res = await axios.get("/api/random");
    setRandomServerNumber(res.data);
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100 flex-col">
      <Router />
      <button className="bg-green-500 text-white p-4 rounded-lg mt-10" onClick={sendRequest}>
        Click Me to Ping the API
      </button>
      {randomServerNumber && <div>The API responded with {randomServerNumber}</div>}
    </div>
  );
}

export default App;
