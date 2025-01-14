import express from "express";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import hashPassword from "./_utils/hash.js";
import compareObjectData from "./_utils/compare.js";
import bcrypt from "bcrypt";
import { checkUserToken, checkUserRoleToken } from "./middleware/auth.js";
import jwt from "jsonwebtoken";
const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const prisma = new PrismaClient();

// --------------- Gestion utilisateur -------------

app.post("/auth/signup", async (req, res) => {
  try {
    const passwordHashed = await hashPassword(req.body?.password);
    const newUser = await prisma.user.create({
      data: {
        email: req.body?.email,
        name: req.body?.name,
        password: passwordHashed,
        role: req.body?.role,
      },
    });
    res.status(200);
    res.send(newUser);
  } catch (error) {
    throw new Error(`Error during User creation : ${error.message}`);
  }
});

app.post("/auth/login", async (req, res) => {
  const user = await prisma.user.findFirst({
    where: {
      email: req.body.email,
    },
  });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isValidPassword = bcrypt.compare(req.body.password, user.password);
  if (!isValidPassword) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_TOKEN,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

// -------------- Session ---------------
app.post(
  "/sessions",
  checkUserRoleToken(["formateur", "Formateur"]),
  async (req, res) => {
    try {
      const newSession = await prisma.session.create({
        data: {
          title: req.body?.title,
          formateur_id: req.body?.formateur_id,
        },
      });
      res.send(newSession);
    } catch (error) {
      throw new Error(`Error during Session creation : ${error.message}`);
    }
  }
);

app.get("/sessions", checkUserToken, async (req, res) => {
  try {
    const sessions = await prisma.session.findMany();
    res.send(sessions);
  } catch (error) {
    throw new Error(`Error during Session get : ${error.message}`);
  }
});

app.get("/sessions/:id", checkUserToken, async (req, res) => {
  try {
    const session = await prisma.session.findFirst({
      where: {
        id: +req.params.id,
      },
    });
    res.send(session);
  } catch (error) {
    throw new Error(`Error during specific Session get : ${error.message}`);
  }
});

app.put(
  "/sessions/:id",
  checkUserRoleToken(["formateur", "Formateur"]),
  async (req, res) => {
    try {
      const newData = compareObjectData(req.body);
      const newSessionData = await prisma.session.update({
        where: {
          id: +req.params.id,
        },
        data: {
          formateur_id: newData?.formateur_id,
          date: newData?.data,
          title: newData?.title,
        },
      });
      res.send(newSessionData);
    } catch (error) {
      throw new Error(
        `Error during modify specific session : ${error.message}`
      );
    }
  }
);

app.delete(
  "/sessions/:id",
  checkUserRoleToken(["formateur", "Formateur"]),
  async (req, res) => {
    try {
      const test = await prisma.session.delete({
        where: {
          id: req.body?.id,
        },
      });
      res.send(test);
    } catch (error) {
      throw new Error(
        `Error during delete specific session : ${error.message}`
      );
    }
  }
);

// ------------- Gestion emargement ----------------
app.post(
  "/sessions/:id/emargement",
  checkUserRoleToken(["etudiant", "Etudiant"]),
  async (req, res) => {
    try {
      const newEmargement = await prisma.emargement.create({
        data: {
          session_id: +req.params.id,
          student_id: +req.body.student_id,
          status: req.body?.status,
        },
      });
      res.send(newEmargement);
    } catch (error) {
      throw new Error(
        `Error during modify specific session : ${error.message}`
      );
    }
  }
);

app.get(
  "/sessions/:id/emargement",
  checkUserRoleToken(["formateur", "Formateur"]),
  async (req, res) => {
    try {
      const emargement = await prisma.emargement.findFirst({
        where: {
          id: +req.params?.id,
        },
      });
      res.send(emargement);
    } catch (error) {
      throw new Error(
        `Error during delete specific session : ${error.message}`
      );
    }
  }
);

app.listen(port, () => {
  console.log("Server app listening on port " + port);
});
