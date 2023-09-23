const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const express = require("express");
const apiSegRouter = express.Router();
const knex = require("knex")(
	require("../knexfile.js")[process.env.NODE_ENV || "development"]
);

apiSegRouter.use(express.json());

apiSegRouter.post("/login", (req, res) => {
	const { login, senha } = req.body;

	knex("usuarios")
		.where({ login })
		.then((usuarios) => {
			if (!usuarios.length) {
				res.status(401).json({ message: "Usuário ou senha incorretos" });
			} else {
				let usuario = usuarios[0];
				bcrypt.compare(senha, usuario.senha, (err, result) => {
					if (err) {
						res
							.status(500)
							.json({ message: `Erro ao comparar senhas: ${err.message}` });
					} else if (result) {
						jwt.sign(
							{ id: usuario.id, roles: usuario.roles },
							process.env.SECRET_KEY,
							{
								algorithm: "HS256",
								expiresIn: "1h",
							},
							(err, token) => {
								if (err) {
									res
										.status(500)
										.json({ message: `Erro ao gerar token: ${err.message}` });
								} else {
									res.status(200).json({ token, login: usuario.login });
								}
							}
						);
					} else {
						res.status(401).json({ message: "Usuário ou senha incorretos" });
					}
				});
			}
		});
});

apiSegRouter.checkToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		res.status(401).json({ message: "Token não informado" });
	} else {
		jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
			if (err) {
				res.status(401).json({ message: "Token inválido" });
			} else {
				req.userId = decoded.id;
				req.roles = decoded.roles;
				next();
			}
		});
	}
};

apiSegRouter.isAdmin = (req, res, next) => {
	if (!req.roles.includes("ADMIN")) {
		res.status(403).json({ message: "Permissão negada" });
	} else {
		next();
	}
};

module.exports = apiSegRouter;
