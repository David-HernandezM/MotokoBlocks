import { useEffect, useState } from 'react';
import './App.css';
import motokoLogo from './assets/motoko_moving.png';
import motokoShadowLogo from './assets/motoko_shadow.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import { backend } from './declarations/backend';

function App() {
  const [count, setCount] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  // Get the current counter value
  const fetchCount = async () => {
    try {
      setLoading(true);
      const count = await backend.get();
      setCount(+count.toString()); // Convert BigInt to number
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const increment = async () => {

    if (loading) return; // Cancel if waiting for a new count
    try {
      setLoading(true);
      await backend.inc(); // Increment the count by 1
      await fetchCount(); // Fetch the new count
    } finally {
      setLoading(false);
    }
  };

  const testFunc = async () => {
    console.log("Test function activated!!");
    
    try {
      let x = await backend.getArrTest();
      console.log(x);
      console.log("sending the message recibed");
      let y = await backend.getTest(x);
      console.log("Now a record test");
      let z = await backend.recordTest();
      console.log(z);
      
      
      console.log(y);
    } catch (error) {
      console.log(error);
    }
  }

  // let program_test = { // Inici actor
  //   variables: {
  //     counter: {
  //       stable: true,
  //       mutable: false,
  //       type: "Int",
  //       value: 0
  //     }
  //   },
  //   functions: {
  //     get: {
  //       public: true,
  //       handle: false,
  //       query: true,
  //       return: "Nat",
  //       lines: [
  //         "counter"
  //       ]
  //     },
  //     inc: {
  //       public: true,
  //       handle: false,
  //       query: false,
  //       return: "()",
  //       lines: [
  //         "counter += 1",
  //         {
  //           type: "if",
  //           conditional: "counter == 1",
  //           lines: [

  //           ]
  //         },
  //         {
  //           type: "if-else",

  //         }
  //       ]
  //     }
  //   }
  // }


  // import Types "./types";

  // actor class Backend() {
  //   stable var counter = 0;
  
  //   // Get the current count
  //   public query func get() : async Nat {
  //     counter;
  //   };
  
  //   // Increment the count by one
  //   public func inc() : async () {
  //     counter += 1;
  //   }; 420724
  
  //   // Add `n` to the current count
  //   public func add(n : Nat) : async () {
  //     counter += n;
  //     if (counter == 1) {
  //     };
  //    };
  
  //   public query func test() : async Types.Test {
  //     #Otro(#Otro(#Otro(#First("Holaaaa"))))
  //   };
  
  //   public func getTest(t : Types.Test) : async Types.Test {
  //     t
  //   };
  // };
  
    


  // Fetch the count on page load
  useEffect(() => {
    fetchCount();
  }, []);

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank" onClick={testFunc}>
          <img src={viteLogo} className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a
          href="https://internetcomputer.org/docs/current/developer-docs/build/cdks/motoko-dfinity/motoko/"
          target="_blank"
        >
          <span className="logo-stack">
            <img
              src={motokoShadowLogo}
              className="logo motoko-shadow"
              alt="Motoko logo"
            />
            <img src={motokoLogo} className="logo motoko" alt="Motoko logo" />
          </span>
        </a>
      </div>
      <h1 onClick={testFunc}>Vite + React + Motoko</h1>
      <div className="card">
        <button onClick={increment} style={{ opacity: loading ? 0.5 : 1 }}>
          count is {count}
        </button>
        <p>
          Edit <code>backend/Backend.mo</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs" onClick={testFunc}>
        Click on the Vite, React, and Motoko logos to learn more
      </p>
    </div>
  );
}

export default App;
