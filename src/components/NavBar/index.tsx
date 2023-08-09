
import { ReactNode } from 'react';
import MotokoBlocksLogo from '../../assets/logo1.svg';
import './NavBar.scss';

interface Props {
    children: ReactNode
};

const NavBar = ({ children } : Props) => {
    return (
        <nav className="NavBar">
            <img
                className="NavBar__logo" 
                src={MotokoBlocksLogo} 
                alt="MotokoBlocks logo" 
            />
            <div className="NavBar__div">
                {children}
            </div>
        </nav>
    );
};

export default NavBar;