export function generateToken(payload, expiresIn) {
  return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn });
}
