import './ProfileImage.scss';

interface Props {
    image : string;
}

export default function ProfileImage({ image } : Props) {
    return (
        <div className="div-profile-picture">
            <img 
                className="profile-image"
                src={image} 
                alt="Profile Image"
            />
        </div>
    );
}