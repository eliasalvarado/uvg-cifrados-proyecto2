const JWT_SECRET = process.env.JWT_SECRET;

const registerUser = async (req, res) => {
    console.log('Register user');
}

const loginUser = async (req, res) => {
    console.log("Login user")
}

export {
    registerUser,
    loginUser,
}