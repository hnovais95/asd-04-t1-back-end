var express = require("express");
var router = express.Router();

const knex = require("knex")(
	require("../knexfile.js")[process.env.NODE_ENV || "development"]
);
const { checkToken, isAdmin } = require("./apiSegRouter.js");

router.get("/produtos", checkToken, function (_, res) {
	knex("produtos")
		.select("*")
		.then((rows) => {
			console.log({ rows });
			res.status(200).json(rows);
		})
		.catch((err) =>
			res.status(500).json({
				message: `Erro ao obter produtos: ${err.message}.`,
			})
		);
});

router.get("/produtos/:id", checkToken, function (req, res) {
	let id = req.params.id;

	knex("produtos")
		.select("*")
		.where("id", id)
		.then((rows) => {
			const produto = rows[0];

			if (produto) {
				res.status(200).json(produto);
			} else {
				throw new Error(`Produto não encontrado`);
			}
		})
		.catch((err) => {
			const status = err.message === `Produto não encontrado` ? 404 : 500;

			res.status(status).json({
				message: `Erro ao obter produto: ${err.message}`,
			});
		});
});

router.post("/produtos", checkToken, isAdmin, function (req, res, next) {
	let produto = req.body;

	knex("produtos")
		.insert(produto)
		.returning("id")
		.then((ids) => {
			const newId = ids[0];
			res.status(201).json({
				message: `Produto inserido com sucesso`,
				data: { id: newId },
			});
		})
		.catch((err) => {
			res.status(500).json({
				message: `Erro ao adicionar produto: ${err.message}`,
			});
		});
});

router.delete("/produtos/:id", checkToken, isAdmin, function (req, res, next) {
	let id = req.params.id;

	knex("produtos")
		.where({ id: id })
		.del()
		.then((rows) => {
			if (rows > 0) {
				res.status(200).json({ message: `Produto excluído com sucesso` });
			} else {
				res.status(404).json({ message: `Produto não encontrado` });
			}
		})
		.catch((err) => {
			res.status(500).json({
				message: `Erro ao deletar produto: ${err.message}.`,
			});
		});
});

router.put("/produtos/:id", checkToken, isAdmin, function (req, res, next) {
	let id = req.params.id;
	let produto = req.body;

	knex("produtos")
		.where({ id: id })
		.update({
			descricao: produto.descricao,
			marca: produto.marca,
			valor: produto.valor,
		})
		.then((rows) => {
			if (rows > 0) {
				res.status(200).json({ message: `Produto alterado com sucesso` });
			} else {
				res.status(404).json({ message: `Produto não encontrado` });
			}
		})
		.catch((err) => {
			res.status(500).json({
				message: `Erro ao alterar produto: ${err.message}.`,
			});
		});
});

module.exports = router;
