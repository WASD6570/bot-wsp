// Chequea si el toquen es el correcto, si no
// responde 401 unauthorized

export function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    // añadir metodos de encriptacion/desencriptacion
    if (token == "test") {
      next();
    } else {
      res.status(401).send({ message: "Invalid authorization" });
    }
  } catch (error) {
    res.status(401).send({ message: "Authorization header required" });
  }
}
