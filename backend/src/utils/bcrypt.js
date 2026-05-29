const bcrypt = require("bcryptjs")
export const hashValue=async (password)=>{
return await bcrypt.hash(password,10)
}

export const compareValue =async (value,hashedValue)=>{
    return await bcrypt.compare(value,hashedValue)
}