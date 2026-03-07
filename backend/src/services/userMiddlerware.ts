import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.jwt_secret as string;

const usermiddleware = (req: any, res: any, next: any) => {
    // const username=req.headers.username;
    // const password=req.headers.password;

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    // User.findOne({username:username}).then((user)=>{
    //     if(!user){
    //         return res.status(401).json({error:"Unauthorized: User not found"});
    //     }
    //     if(user.password !== password){
    //         return res.status(401).json({error:"Unauthorized: Incorrect password"});
    //     }
    //     next();
    // })
};

export default usermiddleware;
