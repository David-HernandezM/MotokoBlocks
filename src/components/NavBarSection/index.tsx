import './NavBarSection.scss';

interface Props {
    text: String;
}

const NavBarSection = ({ text } : Props) => {
    return (
        <p className="NavBarSection">{text}</p>
    );
};

export default NavBarSection;