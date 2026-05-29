export const getEnv=(key,defaultVal)=>{
const value =process.env.key ?? defaultVal
if(!value) throw new Error("Msssing env variable:" + key)
return value
}