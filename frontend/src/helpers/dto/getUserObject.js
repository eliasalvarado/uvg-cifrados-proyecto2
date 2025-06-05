const getUserObject = ({userId, username, email, rsaPublicKey}) => ({
    userId,
    username,
    email,
    rsaPublicKey
});

export default getUserObject;