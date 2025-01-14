import jwt from "jsonwebtoken";

export const checkUserToken = (req, res, next) => {
  const token =
    req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token found" });
  }

  jwt.verify(token, process.env.JWT_TOKEN, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  });
};

export const checkUserRoleToken = (userRole) => {
  return (req, res, next) => {
    const token =
      req.headers["authorization"] &&
      req.headers["authorization"].split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token found" });
    }

    jwt.verify(token, process.env.JWT_TOKEN, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }

      req.user = user;
      if (userRole.length > 0 && !userRole.includes(user.role)) {
        return res
          .status(403)
          .json({ message: "Acces denied, not enough permissions" });
      }
      next();
    });
  };
};
