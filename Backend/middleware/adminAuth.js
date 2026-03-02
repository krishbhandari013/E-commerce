import jwt from 'jsonwebtoken'
const adminAuth = async (req,res,next) =>{

    try{
        const {token } = req.headers
        if(!token){
            return res.json({success : false , message : "Not authorized Login Again "})
        }

        const token_decore = jwt.verify(token,process.env.JWT_SECRET)
        console.log(token_decore)
        if(token_decore !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
            return res.json({success: false, message : "Not Autorized Login Again"})
        }
        next()
    }catch(error){
        console.log(error);
        res.json ({success : false , message : error.message})
        
    }

}
export default adminAuth