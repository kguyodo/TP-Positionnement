import bcrypt from "bcrypt";

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
  return await bcrypt.hash(password, salt);
}

export default hashPassword;
