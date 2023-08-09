import { 
    Outlet 
} from "react-router";
import { 
    NavBar,
    NavBarSection,
    Button,
    ProfileImage
} from "../components";

import motokoLogo from '../assets/motoko_moving.png';


export default function Root() {
    let userIsLog = true;
    return (
      <>
        <NavBar>
          {
            !userIsLog ? (
              <>
                <NavBarSection text="Create "/>
                <NavBarSection text="Tutorial"/>
                <NavBarSection text="About us"/>
                <Button title="Login" color="white"/>
                <Button title="Register" color="purple"/>
              </>
            ) : (
              <>
                <NavBarSection text="Create"/>
                <NavBarSection text="Programs"/>
                <NavBarSection text="Account"/>
                <ProfileImage image={motokoLogo}/> 
              </>
            )
          }
        </NavBar>
        <div
            id="page_content"
        >
            <Outlet />
        </div>
      </>
    );
}
