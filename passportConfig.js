const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const userModel = require("./src/models/user.model");



passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken,refreshToken,profile,done)=>{
    try{
        let user = await userModel.findOne({email:profile.emails[0].value});
        if(!user)
        {
            user = await userModel.create({
                username:profile.displayName,
                email:profile.emails[0].value,
                googleId:profile.id,
                avatar:profile.photos[0].value,
                authType:"google"
            });
            await user.save();
        }
        return done(null,user);
    }catch(err){
        return done(err,null);
    };
  }
  ));

    passport.serializeUser((user, done) => {
      done(null, user.id);
    });
    
    passport.deserializeUser(async(id, done) => {
        try{
            const user = await userModel.findById(id);
            done(null,user); 
        }catch(err){
            done(err,null);
        }
      
    });

    module.exports = passport;
