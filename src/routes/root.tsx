import { 
    Outlet,
    useNavigate,
    redirect,
    Link
} from "react-router-dom";
import { 
    NavBar,
    NavBarSection,
    Button,
    ProfileImage,
} from "../components";

// Obtenemos tanto el id del  canister y la funcion para crear el canister 
// con los archivos generados por dfx generate
import { canisterId as backend_id } from '../declarations/backend';
import { canisterId as internet_identity_id } from '../declarations/internet_identity';
import { createActor } from '../declarations/backend';
import { HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { useState } from "react";

import motokoLogo from '../assets/motoko_moving.png';
import { Principal } from "@dfinity/principal";


export default function Root() {
  const navigate = useNavigate();
  const [isLoginID, setIsLoginID] = useState<boolean>(false);
  const [loginICPSuccess, setLoginICPSuccess] = useState(false);
  const [userAgent, setUserAgent] = useState<HttpAgent | null>(null);
  const [userPrincipal, setuserPrincipal] = useState<string>("");

  async function register() {
    setIsLoginID(true);
    let urlProvider: string;

    switch (process.env.DFX_NETWORK) {
        case ("ic"):
            urlProvider = `https://identity.ic0.app/`;
        default:
            urlProvider = `http://${internet_identity_id}.localhost:4943`;
    }

    const authClient = await AuthClient.create();

    await new Promise<void>((resolve) => {
        authClient.login({
            // identityProvider: urlProvider,
            onSuccess: resolve,
            onError: () => {
                setIsLoginID(false);
                alert("Error when trying to connect to internet identity");
                throw new Error("Error when trying to connect to internet identity");
            }
        });
    });

    const identity = authClient.getIdentity();
    const agent = new HttpAgent({ identity });

    // Uso de la funcion para crear el canister, solo se pasa el id
    // y el "agent",  no es necesario el IDL.
    const backend = createActor(backend_id, {
        agent
    });
    
    let result = await backend.register();

    if (!('ok' in result)) {
      setIsLoginID(false);
      alert("Account already exists");
      throw new Error("Account already exists");
    }

    result = await backend.login();

    if (!('ok' in result)) {
      setIsLoginID(false);
      alert("Error in server, user is login but account does not exists")
      throw new Error("Error in server, user is login but account does not exists");
    }

    setIsLoginID(false);
    setLoginICPSuccess(true);
    setUserAgent(agent);
    setuserPrincipal(identity.getPrincipal().toString());
    navigate(`/user/${identity.getPrincipal().toString()}`);
  }

  async function login() {
    setIsLoginID(true);

    let urlProvider: string;

    switch (process.env.DFX_NETWORK) {
        case ("ic"):
            urlProvider = `https://identity.ic0.app/`;
        default:
            urlProvider = `http://${internet_identity_id}.localhost:4943`;
    }

    const authClient = await AuthClient.create();

    await new Promise<void>((resolve) => {
        authClient.login({
            // identityProvider: urlProvider,
            onSuccess: resolve,
            onError: () => {
                setIsLoginID(false);
                alert("Error when trying to connect to internet identity");
                throw new Error("Error when trying to connect to internet identity");
            }
        });
    });

    const identity = authClient.getIdentity();
    const agent = new HttpAgent({ identity });

    // Uso de la funcion para crear el canister, solo se pasa el id
    // y el "agent",  no es necesario el IDL.
    const backend = createActor(backend_id, {
        agent
    });

    const userIsLogged = await backend.userIsLogged();

    if (userIsLogged) {
      setLoginICPSuccess(true);
      setIsLoginID(false);
      console.log("Cuenta esta loggeada");
      setuserPrincipal(identity.getPrincipal().toString());
      setUserAgent(agent); 
      navigate(`/user/${identity.getPrincipal().toString()}`);
      return;
    }

    console.log("Cuenta no estaba loggeada");
    
    const result = await backend.login();

    if (!('ok' in result)) {
      setIsLoginID(true);
      alert("Account already exists")
      throw new Error("Account already exists");
    }

    setIsLoginID(false);
    setLoginICPSuccess(true);
    setUserAgent(agent);
    setuserPrincipal(identity.getPrincipal().toString());
    navigate(`/user/${identity.getPrincipal().toString()}`);
  }

  async function logOut() {
    setIsLoginID(true);

    console.log("User is log out");
  
    if (!userAgent) {
      alert("Account is not logged");
      throw new Error("Account is not logged");
      return;
    }
    // Si tenemos almacenado el agent podemos usarlo
    const backend = createActor(backend_id, {
      agent: userAgent
    });

    console.log("Se creo el canister para logout");
    
    const result = await backend.logOut();

    if (!('ok' in result)) {
      setIsLoginID(false);
      alert("Account is not logged");
      throw new Error("Account is not logged");
    }

    console.log("User has log out");

    setIsLoginID(false);
    setLoginICPSuccess(false);
    setUserAgent(null);
    setuserPrincipal("");
    navigate("/");
  }

  return (
    <>
      <NavBar>
        {
          !loginICPSuccess ? (
            <>
              <NavBarSection text="Create "/>
              <NavBarSection text="Tutorial"/>
              <NavBarSection text="About us"/>
              <Button title="Login" color="white" isSubmit={true} handleClick={login} isActive={isLoginID} />
              <Button title="Register" color="purple" isSubmit={true} handleClick={register} isActive={isLoginID} />
            </>
          ) : (
            <>
              {/* Unico enlace para prueba, esta en proces por lo que algunas piezas pueden desaparecer */}
              <Link to={`/user/${userPrincipal}/edit`}>
                <NavBarSection text="Create"/>
              </Link>
              <NavBarSection text="Programs"/>
              <NavBarSection text="Account"/>
              <Button title={"Log Out"} color={"white"} isSubmit={true} handleClick={logOut} isActive={isLoginID} />
              <ProfileImage image={motokoLogo}/> 
            </>
          )
        }
      </NavBar>
      <div
        className="PageContent"
      >
        <Outlet />
      </div>
    </>
  );
}



