import './Button.scss';


interface Props {
    color: ButtonColor;
    title: String;
    isSubmit: boolean;
    handleClick: () => void;
    isActive?: boolean;
}

type ButtonColor = "purple" | "white" | "blue" ;

const Button = ({ title, color, isSubmit, handleClick, isActive } : Props) => {
    return isSubmit ? (
        <button 
        className={`Button button-color-${color}${isActive ? " userIsLoginICP" : ""}`}
        type='submit'
        onClick={handleClick}
        disabled={isActive}
        >
            {title}
        </button>
    ) : (
        <button 
            className={"Button button-color-" + color}
        >
            {title}
        </button>
    );
};

export default Button;