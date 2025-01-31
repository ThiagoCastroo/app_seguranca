const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models/mongodb/usuarios');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { nome, email, password } = req.body;

  if (!nome || !email || !password) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  try {
    // Verificar se o email já está cadastrado
    const usuarioExistente = await Usuario.findByEmail(email);
    if (usuarioExistente) {
      return res.status(400).send('Usuário já cadastrado.');
    }

    // Criptografar a senha
    const senhaCriptografada = await bcrypt.hash(password, 10);

    // Criar novo usuário
    await Usuario.create(nome, email, senhaCriptografada);

    // Redirecionar para a tela inicial após o registro bem-sucedido
    res.redirect('/TelaInicial.html');
  } catch (err) {
    console.error('Erro ao registrar usuário:', err);
    res.status(500).send('Erro no servidor.');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Por favor, forneça email e senha.');
  }

  try {
    // Buscar o usuário pelo email no MongoDB
    const usuario = await Usuario.findByEmail(email);
    
    if (!usuario) {
      console.log('Usuário não encontrado, redirecionando para a tela de cadastro.');
      return res.redirect('/TelaCadastro.html');
    }

    // Comparar a senha fornecida com o hash armazenado no banco de dados
    const isMatch = await bcrypt.compare(password, usuario.senha);

    if (!isMatch) {
      console.log('Senha incorreta.');
      return res.status(401).send('Credenciais inválidas. Senha incorreta.');
    }

    console.log('Login bem-sucedido, redirecionando para a tela inicial.');
    return res.redirect('/TelaInicial.html');
  } catch (err) {
    console.error('Erro ao realizar o login:', err);
    res.status(500).send('Erro no servidor.');
  }
});


module.exports = router;
