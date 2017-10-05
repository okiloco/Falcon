module.exports = function(req,res,next){
	if(!req.session.user_id){
		res.send(JSON.stringify({
			success:false,
			msg:"No existe usuario en la sessión."
		}));
	}else{
		console.log("No existe usuario en sesion.")
		next();
	}
}