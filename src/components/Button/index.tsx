import './Button.scss';

interface Props {
    color: ButtonColor;
    title: String;
}

type ButtonColor = "purple" | "white" | "blue" ;

const Button = ({ title, color } : Props) => {
    return (
        <button 
            className={"Button button-color-" + color}>
            {title}
        </button>
    );
};

export default Button;