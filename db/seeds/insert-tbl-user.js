const bcrypt = require("bcryptjs");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
	// Deletes ALL existing entries
	await knex("usuarios").del();
	await knex("usuarios").insert([
		{
			id: 1,
			nome: "Usuário padrão",
			login: "user",
			email: "usuario@abc.com",
			senha: bcrypt.hashSync("1234", 8), // Senha hasheada para o banco
			roles: "USER",
		},
		{
			id: 2,
			nome: "Administrador do sistema",
			login: "admin",
			email: "admin@abc.com",
			senha: bcrypt.hashSync("1234", 8),
			roles: "USER;ADMIN",
		},
	]);
};
